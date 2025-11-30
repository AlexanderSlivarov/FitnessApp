using FluentValidation;

namespace API.Infrastructure.RequestDTOs.Instructors
{
    public class InstructorValidator : AbstractValidator<InstructorRequest>
    {
        public InstructorValidator()
        {
            RuleFor(i => i.Bio)
                .NotEmpty().WithMessage("Bio is required.")
                .MinimumLength(10).WithMessage("Instructor bio must be atleast 10 characters long");

            RuleFor(i => i.ExperienceYears)
                .NotEmpty().WithMessage("ExperienceYears is required.");
        }
    }
}
