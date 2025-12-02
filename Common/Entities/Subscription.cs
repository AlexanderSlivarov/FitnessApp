using Common.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Entities
{
    public class Subscription : BaseEntity
    {
        public int UserId { get; set; }
        public int MembershipId { get; set; }

        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public DateTime PurchasedAt { get; set; }

        public SubscriptionStatus Status { get; set; }        

        public virtual User User { get; set; }
        public virtual Membership Membership { get; set; }
    }
}
