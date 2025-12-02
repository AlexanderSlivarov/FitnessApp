using Common.Enums;

namespace API.Infrastructure.RequestDTOs.Subscriptions
{
    public class SubscriptionRequest
    {
        public int UserId { get; set; }
        public int MembershipId { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public SubscriptionStatus Status { get; set; }
    }
}
