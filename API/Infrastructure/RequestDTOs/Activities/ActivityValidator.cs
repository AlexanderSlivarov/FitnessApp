using FluentValidation;

namespace API.Infrastructure.RequestDTOs.Activities
{
    public class ActivityValidator : AbstractValidator<ActivityRequest>
    {
        public ActivityValidator()
        {
            RuleFor(i => i.Name)
                .NotEmpty().WithMessage("Activity name is required.");

            RuleFor(i => i.Description)
                .NotEmpty().WithMessage("Activity description is required.")
                .MinimumLength(10).WithMessage("Activity description must be atleast 10 characters long");                
        }
    }
}
