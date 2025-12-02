using FluentValidation;

namespace API.Infrastructure.RequestDTOs.Bookings
{
    public class BookingValidator : AbstractValidator<BookingRequest>
    {
        public BookingValidator()
        {
            RuleFor(b => b.UserId)
                .GreaterThan(0)
                .WithMessage("UserId must be a positive integer.");

            RuleFor(b => b.SessionId)
                .GreaterThan(0)
                .WithMessage("SessionId must be a positive integer.");

            RuleFor(b => b.Status)
                .IsInEnum()
                .WithMessage("Status value is invalid.");
        }
    }
}
