using API.Infrastructure.RequestDTOs.Bookings;
using API.Infrastructure.RequestDTOs.Shared;
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
    public class BookingsController : ControllerBase
    {
        private readonly IBookingServices _bookingService;

        public BookingsController(IBookingServices bookingServices)
        {
            _bookingService = bookingServices;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromBody] BookingGetRequest model)
        {
            model.Pager ??= new PagerRequest();
            model.Pager.Page = model.Pager.Page <= 0 
                                    ? 1 
                                    : model.Pager.Page;
            model.Pager.PageSize = model.Pager.PageSize <= 0 
                                        ? 10 
                                        : model.Pager.PageSize;

            model.OrderBy ??= "Id";
            model.OrderBy = typeof(Booking).GetProperty(model.OrderBy) != null
                                ? model.OrderBy
                                : "Id";

            model.Filter ??= new BookingGetFilterRequest();

            Expression<Func<Booking, bool>> filter =
            b =>
                (!model.Filter.UserId.HasValue || b.UserId.Equals(model.Filter.UserId)) &&
                (!model.Filter.SessionId.HasValue || b.SessionId.Equals(model.Filter.SessionId)) &&
                (!model.Filter.Status.HasValue || b.Status.Equals(model.Filter.Status));

            List<Booking> bookings = await _bookingService.GetAllAsync(filter, model.OrderBy, model.SortAsc, model.Pager.Page, model.Pager.PageSize);

            if (bookings is null || !bookings.Any())
            {
                return NotFound("No bookings found matching the given criteria.");
            }                

            return Ok(bookings);
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> Get([FromRoute] int id)
        {
            Booking booking = await _bookingService.GetByIdAsync(id);

            if (booking is null)
            {
                return NotFound("Booking not found.");
            }               

            return Ok(booking);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] BookingRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }                

            Booking newBooking = new Booking
            {
                UserId = model.UserId,
                SessionId = model.SessionId,
                Status = model.Status,                
            };

            await _bookingService.SaveAsync(newBooking);

            return CreatedAtAction(nameof(Get), new { Id = newBooking.Id }, newBooking);
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> Put([FromRoute] int id, [FromBody] BookingRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }                

            Booking booking = await _bookingService.GetByIdAsync(id);

            if (booking is null)
            {
                return NotFound("Booking not found.");
            }                

            booking.UserId = model.UserId;
            booking.SessionId = model.SessionId;
            booking.Status = model.Status;

            await _bookingService.SaveAsync(booking);

            return NoContent();
        }

        [HttpDelete]
        [Route("{id}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            Booking booking = await _bookingService.GetByIdAsync(id);

            if (booking is null)
            {
                return NotFound("Booking not found.");
            }

            await _bookingService.DeleteAsync(booking);

            return NoContent();
        }
    }
}
