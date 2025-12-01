using API.Infrastructure.Mappers;
using API.Infrastructure.RequestDTOs.Activities;
using API.Infrastructure.RequestDTOs.Shared;
using API.Infrastructure.RequestDTOs.Users;
using API.Infrastructure.ResponseDTOs.Activity;
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
            model.Pager = model.Pager ?? new PagerRequest();
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

            List<Activity> activities = await _activityService.GetAllAsync(filter, model.OrderBy, model.SortAsc, model.Pager.Page, model.Pager.PageSize);

            if (activities is null || !activities.Any())
            {
                return NotFound("No activities found matching the given criteria.");
            }            

           return Ok(ActivityMapper.ToResponseList(activities));            
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

            return Ok(ActivityMapper.ToResponse(activity));
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

            return CreatedAtAction(nameof(Get), new { Id = newActivity.Id }, newActivity);
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

            return NoContent();
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

            return NoContent();
        }
    }
}
