using API.Infrastructure.RequestDTOs.Shared;
using Common.Enums;

namespace API.Infrastructure.RequestDTOs.Subscriptions
{
    public class SubscriptionGetFilterRequest 
    {
        public int? UserId { get; set; }
        public int? MembershipId { get; set; }

        public SubscriptionStatus? Status { get; set; }
    }
}
