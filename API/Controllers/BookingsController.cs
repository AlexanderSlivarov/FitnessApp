using API.Infrastructure.RequestDTOs.Bookings;
using API.Infrastructure.RequestDTOs.Shared;
using API.Infrastructure.ResponseDTOs.Bookings;
using API.Infrastructure.ResponseDTOs.Shared;
using API.Services;
using Common;
using Common.Entities;
using Common.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq.Expressions;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BookingsController : BaseCrudController<
        Booking,
        IBookingServices,
        BookingRequest,
        BookingGetRequest,
        BookingResponse,
        BookingGetResponse>
    {
        public BookingsController(IBookingServices bookingService) : base(bookingService) { }

        protected override void PopulateEntity(Booking booking, BookingRequest model, out string error)
        {
            error = null;

            booking.UserId = model.UserId;
            booking.SessionId = model.SessionId;
            booking.Status = model.Status;
        }

        protected override Expression<Func<Booking, bool>> GetFilter(BookingGetRequest model)
        {
            model.Filter ??= new BookingGetFilterRequest();

            return b =>
                 (!model.Filter.UserId.HasValue || 
                    b.UserId == model.Filter.UserId.Value) &&

                 (!model.Filter.SessionId.HasValue || 
                    b.SessionId == model.Filter.SessionId.Value) &&

                 (!model.Filter.Status.HasValue || 
                    b.Status == model.Filter.Status.Value);
        }

        protected override void PopulageGetResponse(BookingGetRequest request, BookingGetResponse response)
        {
            response.Filter = request.Filter;
        }

        protected override BookingResponse ToResponse(Booking booking)
        {
            return new BookingResponse
            {
                Id = booking.Id,
                UserId = booking.UserId,
                SessionId = booking.SessionId,
                Username = booking.User?.Username,
                UserFullName = $"{booking.User?.FirstName} {booking.User?.LastName}",
                SessionName = booking.Session?.Name,
                ActivityName = booking.Session?.Activity?.Name,
                StudioName = booking.Session?.Studio?.Name,
                Status = booking.Status
            };
        }
    }
}
