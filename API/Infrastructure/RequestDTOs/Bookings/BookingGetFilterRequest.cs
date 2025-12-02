using Common.Enums;

namespace API.Infrastructure.RequestDTOs.Bookings
{
    public class BookingGetFilterRequest
    {
        public int? UserId { get; set; }
        public int? SessionId { get; set; }
        public BookingStatus? Status { get; set; }
    }
}
