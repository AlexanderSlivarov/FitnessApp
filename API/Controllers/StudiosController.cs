using API.Infrastructure.RequestDTOs.Shared;
using API.Infrastructure.RequestDTOs.Studios;
using API.Infrastructure.ResponseDTOs.Studios;
using API.Services;
using Common;
using Common.Entities;
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
        public async Task<IActionResult> Get([FromBody] StudioGetRequest model)
        {
            model.Pager = model.Pager ?? new PagerRequest();
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

            List<Studio> studios = await _studioService.GetAllAsync(filter, model.OrderBy, model.SortAsc, model.Pager.Page, model.Pager.PageSize);

            if (studios is null || !studios.Any())
            {
                return NotFound("No studios found matching the given criteria.");
            }            

            return Ok(studios);
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

            return Ok(studio);
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

            return CreatedAtAction(nameof(Get), new { Id = newStudio.Id }, newStudio);
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

            return NoContent();
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

            return NoContent();
        }
    }
}
