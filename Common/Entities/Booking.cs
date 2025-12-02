using Common.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Entities
{
    public class Booking : BaseEntity
    {
        public int UserId { get; set; }
        public int SessionId { get; set; }

        public BookingStatus Status { get; set; }        

        public DateTime BookedAt { get; set; }

        public virtual User User { get; set; }
        public virtual Session Session { get; set; }
    }
}
