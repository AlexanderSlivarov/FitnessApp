using API.Infrastructure.RequestDTOs.Shared;
using API.Infrastructure.RequestDTOs.Subscriptions;
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
    public class SubscriptionsController : ControllerBase
    {
        private readonly ISubscriptionServices _subscriptionService;

        public SubscriptionsController(ISubscriptionServices subscriptionServices)
        {
            _subscriptionService = subscriptionServices;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromBody] SubscriptionGetRequest model)
        {
            model.Pager ??= new PagerRequest();
            model.Pager.Page = model.Pager.Page <= 0 
                                    ? 1 
                                    : model.Pager.Page;
            model.Pager.PageSize = model.Pager.PageSize <= 0 
                                        ? 10 
                                        : model.Pager.PageSize;

            model.OrderBy ??= "Id";
            model.OrderBy = typeof(Subscription).GetProperty(model.OrderBy) != null
                                ? model.OrderBy
                                : "Id";

            model.Filter ??= new SubscriptionGetFilterRequest();

            Expression<Func<Subscription, bool>> filter =
            s =>
                (!model.Filter.UserId.HasValue || s.UserId.Equals(model.Filter.UserId)) &&
                (!model.Filter.MembershipId.HasValue || s.MembershipId.Equals(model.Filter.MembershipId)) &&              
                (!model.Filter.Status.HasValue || s.Status.Equals(model.Filter.Status));

            List<Subscription> subscriptions = await _subscriptionService
                .GetAllAsync(filter, model.OrderBy, model.SortAsc, model.Pager.Page, model.Pager.PageSize);

            if (subscriptions is null || !subscriptions.Any())
            {
                return NotFound("No subscriptions found matching the given criteria.");
            }                

            return Ok(subscriptions);
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> Get([FromRoute] int id)
        {
            Subscription subscription = await _subscriptionService.GetByIdAsync(id);

            if (subscription is null)
            {
                return NotFound("Subscription not found.");
            }                

            return Ok(subscription);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] SubscriptionRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }               

            Subscription subscription = new Subscription
            {
                UserId = model.UserId,
                MembershipId = model.MembershipId,
                StartDate = model.StartDate,
                EndDate = model.EndDate,
                Status = model.Status,                
            };

            await _subscriptionService.SaveAsync(subscription);

            return CreatedAtAction(nameof(Get), new { Id = subscription.Id }, subscription);
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> Put([FromRoute] int id, [FromBody] SubscriptionRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }             

            Subscription subscription = await _subscriptionService.GetByIdAsync(id);

            if (subscription is null)
            {
                return NotFound("Subscription not found.");
            }                

            subscription.UserId = model.UserId;
            subscription.MembershipId = model.MembershipId;
            subscription.StartDate = model.StartDate;
            subscription.EndDate = model.EndDate;
            subscription.Status = model.Status;

            await _subscriptionService.SaveAsync(subscription);

            return NoContent();
        }

        [HttpDelete]
        [Route("{id}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            Subscription subscription = await _subscriptionService.GetByIdAsync(id);

            if (subscription is null)
            {
                return NotFound("Subscription not found.");
            }               

            await _subscriptionService.DeleteAsync(subscription);

            return NoContent();
        }
    }
}
