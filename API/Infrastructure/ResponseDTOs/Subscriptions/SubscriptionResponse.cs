using Common.Enums;

namespace API.Infrastructure.ResponseDTOs.Subscriptions
{
    public class SubscriptionResponse
    {
        public int Id { get; set; }               
        public int UserId { get; set; }
        public int MembershipId { get; set; }
       
        public string Username { get; set; }
        public string MembershipName { get; set; }

        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }

        public SubscriptionStatus Status { get; set; }
        public string StatusName => Status.ToString();
    }
}
