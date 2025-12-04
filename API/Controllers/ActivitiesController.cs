using API.Infrastructure.RequestDTOs.Activities;
using API.Infrastructure.RequestDTOs.Shared;
using API.Infrastructure.RequestDTOs.Users;
using API.Infrastructure.ResponseDTOs.Activities;
using API.Infrastructure.ResponseDTOs.Shared;
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
    public class ActivitiesController : ControllerBase
    {
        private readonly IActivityServices _activityService;

        public ActivitiesController(IActivityServices activityServices)
        {
            _activityService = activityServices;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromBody] ActivityGetRequest model)
        {
            model.Pager ??= new PagerRequest();
            model.Pager.Page = model.Pager.Page <= 0
                                    ? 1
                                    : model.Pager.Page;
            model.Pager.PageSize = model.Pager.Page <= 0
                                        ? 10
                                        : model.Pager.PageSize;

            model.OrderBy ??= "Id";
            model.OrderBy = typeof(Activity).GetProperty(model.OrderBy) != null
                                ? model.OrderBy
                                : "Id";

            model.Filter ??= new ActivityGetFilterRequest();

            Expression<Func<Activity, bool>> filter =
            a =>
                (string.IsNullOrEmpty(model.Filter.Name) || a.Name.Contains(model.Filter.Name));

            ActivityGetResponse response = new ActivityGetResponse();

            response.Pager = new PagerResponse();
            response.Pager.Page = model.Pager.Page;
            response.Pager.PageSize = model.Pager.PageSize;

            response.OrderBy = model.OrderBy;
            response.SortAsc = model.SortAsc;

            response.Filter = model.Filter;

            response.Pager.Count = _activityService.Count(filter);

            List<Activity> activities = await _activityService.GetAllAsync(
                                                                  filter, 
                                                                  model.OrderBy, 
                                                                  model.SortAsc, 
                                                                  model.Pager.Page, 
                                                                  model.Pager.PageSize);

            if (activities is null || !activities.Any())
            {
                return NotFound("No activities found matching the given criteria.");
            }

            response.Items = activities;

            return Ok(ServiceResult<ActivityGetResponse>.Success(response));            
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> Get([FromRoute] int id)
        {
            Activity activity = await _activityService.GetByIdAsync(id);

            if (activity is null)
            {
                return NotFound("Activity not found.");
            }           

            return Ok(ServiceResult<Activity>.Success(activity));
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ActivityRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }

            Activity newActivity = new Activity
            {
                Name = model.Name,
                Description = model.Description
            };

            await _activityService.SaveAsync(newActivity);

            return Ok(ServiceResult<Activity>.Success(newActivity));
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> Put([FromRoute] int id, [FromBody] ActivityRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }

            Activity activityForUpdate = await _activityService.GetByIdAsync(id);

            if (activityForUpdate is null)
            {
                return NotFound("Activity not found.");
            }

            activityForUpdate.Name = model.Name;
            activityForUpdate.Description = model.Description;

            await _activityService.SaveAsync(activityForUpdate);

            return Ok(ServiceResult<Activity>.Success(activityForUpdate));
        }

        [HttpDelete]
        [Route("{id}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            Activity activityForDelete = await _activityService.GetByIdAsync(id);

            if (activityForDelete is null)
            {
                return NotFound("Activity not found.");
            }

            await _activityService.DeleteAsync(activityForDelete);

            return Ok(ServiceResult<Activity>.Success(activityForDelete));
        }
    }
}
