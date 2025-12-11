using API.Infrastructure.RequestDTOs.Shared;
using API.Infrastructure.RequestDTOs.Subscriptions;
using API.Infrastructure.ResponseDTOs.Shared;
using API.Infrastructure.ResponseDTOs.Studios;
using API.Infrastructure.ResponseDTOs.Subscriptions;
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
    public class SubscriptionsController : BaseCrudController<
        Subscription,
        ISubscriptionServices,
        SubscriptionRequest,
        SubscriptionGetRequest,
        SubscriptionResponse,
        SubscriptionGetResponse>
    {
        public SubscriptionsController(ISubscriptionServices subscriptionService) : base(subscriptionService) { }

        protected override void PopulateEntity(Subscription subscription, SubscriptionRequest model, out string error)
        {
            error = null;

            subscription.UserId = model.UserId;
            subscription.MembershipId = model.MembershipId;
            subscription.StartDate = model.StartDate;
            subscription.EndDate = model.EndDate;
            subscription.Status = model.Status;
        }

        protected override Expression<Func<Subscription, bool>> GetFilter(SubscriptionGetRequest model)
        {
            model.Filter ??= new SubscriptionGetFilterRequest();

            return s =>
                (!model.Filter.UserId.HasValue || 
                    s.UserId == model.Filter.UserId.Value) &&

                (!model.Filter.MembershipId.HasValue || 
                    s.MembershipId == model.Filter.MembershipId.Value) &&

                (!model.Filter.Status.HasValue || 
                    s.Status == model.Filter.Status.Value);
        }

        protected override void PopulageGetResponse(SubscriptionGetRequest request, SubscriptionGetResponse response)
        {
            response.Filter = request.Filter;
        }

        protected override SubscriptionResponse ToResponse(Subscription subscription)
        {
            return new SubscriptionResponse
            {
                Id = subscription.Id,
                UserId = subscription.UserId,
                MembershipId = subscription.MembershipId,
                Username = subscription.User?.Username,
                MembershipName = subscription.Membership?.Name,
                StartDate = subscription.StartDate,
                EndDate = subscription.EndDate,
                Status = subscription.Status
            };
        }
    }
}
