using FluentValidation;

namespace API.Infrastructure.RequestDTOs.Studios
{
    public class StudioValidator : AbstractValidator<StudioRequest>
    {
        public StudioValidator()
        {
            RuleFor(i => i.Name)
                .NotEmpty().WithMessage("Studio name is required.")
                .MinimumLength(3).WithMessage("Studio name must be atleast 3 characters long.");

            RuleFor(i => i.Location)
                .NotEmpty().WithMessage("Location is required.")
                .MinimumLength(4).WithMessage("Location must be atleast 4 characters long.");

            RuleFor(i => i.Capacity)
                .NotEmpty().WithMessage("Capacity is required.")
                .LessThan(1000).WithMessage("Capacity must be less than 1000 people.")
                .GreaterThanOrEqualTo(1).WithMessage("Capacity must be atleast 1 person.");
        }
    }
}
