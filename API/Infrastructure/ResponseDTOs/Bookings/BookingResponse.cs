using Common.Enums;

namespace API.Infrastructure.ResponseDTOs.Bookings
{
    public class BookingResponse
    {
        public int Id { get; set; }       
        public int UserId { get; set; }
        public int SessionId { get; set; }

        public string Username { get; set; }
        public string UserFullName { get; set; }

        public string SessionName { get; set; }
        public string ActivityName { get; set; }
        public string StudioName { get; set; }

        public BookingStatus Status { get; set; }
        public string StatusName => Status.ToString();
    }
}
