using API.Infrastructure.RequestDTOs.Subscriptions;
using API.Infrastructure.ResponseDTOs.Shared;
using Common.Entities;

namespace API.Infrastructure.ResponseDTOs.Subscriptions
{
    public class SubscriptionGetResponse : BaseGetResponse<Subscription, SubscriptionGetFilterRequest>
    { }
}
