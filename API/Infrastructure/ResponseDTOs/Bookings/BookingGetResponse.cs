using API.Infrastructure.RequestDTOs.Bookings;
using API.Infrastructure.ResponseDTOs.Shared;
using Common.Entities;

namespace API.Infrastructure.ResponseDTOs.Bookings
{
    public class BookingGetResponse : BaseGetResponse<BookingResponse, BookingGetFilterRequest>
    { }
}
