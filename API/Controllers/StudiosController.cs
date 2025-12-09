using API.Infrastructure.RequestDTOs.Shared;
using API.Infrastructure.RequestDTOs.Studios;
using API.Infrastructure.ResponseDTOs.Sessions;
using API.Infrastructure.ResponseDTOs.Shared;
using API.Infrastructure.ResponseDTOs.Studios;
using API.Services;
using Azure;
using Common;
using Common.Entities;
using Common.Services.Implementations;
using Common.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Linq.Expressions;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StudiosController : ControllerBase
    {
        private readonly IStudioServices _studioService;

        public StudiosController(IStudioServices studioServices)
        {
            _studioService = studioServices;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] StudioGetRequest model)
        {
            model.Pager ??= new PagerRequest();
            model.Pager.Page = model.Pager.Page <= 0
                                          ? 1
                                          : model.Pager.Page;
            model.Pager.PageSize = model.Pager.PageSize <= 0
                                        ? 10
                                        : model.Pager.PageSize;

            model.OrderBy ??= "Id";
            model.OrderBy = typeof(Studio).GetProperty(model.OrderBy) != null
                                ? model.OrderBy
                                : "Id";

            model.Filter ??= new StudioGetFilterRequest();

            Expression<Func<Studio, bool>> filter =
            s =>
                (string.IsNullOrEmpty(model.Filter.Name) || s.Name.Contains(model.Filter.Name)) &&
                (string.IsNullOrEmpty(model.Filter.Location) || s.Location.Contains(model.Filter.Location)) &&
                (!model.Filter.Capacity.HasValue || s.Capacity.Equals(model.Filter.Capacity));

            StudioGetResponse response = new StudioGetResponse();

            response.Pager = new PagerResponse();
            response.Pager.Page = model.Pager.Page;
            response.Pager.PageSize = model.Pager.PageSize;

            response.OrderBy = model.OrderBy;
            response.SortAsc = model.SortAsc;

            response.Filter = model.Filter;

            response.Pager.Count = _studioService.Count(filter);

            List<Studio> studios = await _studioService.GetAllAsync(
                                                                  filter,
                                                                  model.OrderBy,
                                                                  model.SortAsc,
                                                                  model.Pager.Page,
                                                                  model.Pager.PageSize);

            if (studios is null || !studios.Any())
            {
                return NotFound("No studios found matching the given criteria.");
            }

            response.Items = studios
                .Select(s => new StudioResponse
                {
                    Id = s.Id,
                    Name = s.Name,
                    Location = s.Location,
                    Capacity = s.Capacity
                })
                .ToList();

            return Ok(ServiceResult<StudioGetResponse>.Success(response));
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> Get([FromRoute] int id)
        {
            Studio studio = await _studioService.GetByIdAsync(id);

            if (studio is null)
            {
                return NotFound("Studio not found.");
            }

            return Ok(ServiceResult<Studio>.Success(studio));
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] StudioRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }

            Studio newStudio = new Studio
            {
                Name = model.Name,
                Location = model.Location,
                Capacity = model.Capacity
            };

            await _studioService.SaveAsync(newStudio);

            return Ok(ServiceResult<Studio>.Success(newStudio));
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> Put([FromRoute] int id, [FromBody] StudioRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }

            Studio studioForUpdate = await _studioService.GetByIdAsync(id);

            if (studioForUpdate is null)
            {
                return NotFound("Studio not found.");
            }

            studioForUpdate.Name = model.Name;
            studioForUpdate.Location = model.Location;
            studioForUpdate.Capacity = model.Capacity;

            await _studioService.SaveAsync(studioForUpdate);

            return Ok(ServiceResult<Studio>.Success(studioForUpdate));
        }

        [HttpDelete]
        [Route("{id}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            Studio studioForDelete = await _studioService.GetByIdAsync(id);

            if (studioForDelete is null)
            {
                return NotFound("Studio not found.");
            }

            await _studioService.DeleteAsync(studioForDelete);

            return Ok(ServiceResult<Studio>.Success(studioForDelete));
        }
    }
}
