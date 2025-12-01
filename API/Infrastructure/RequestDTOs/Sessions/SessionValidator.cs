using FluentValidation;

namespace API.Infrastructure.RequestDTOs.Sessions
{
    public class SessionValidator : AbstractValidator<SessionRequest>
    {
        public SessionValidator()
        {
            RuleFor(i => i.InstructorId)
                .GreaterThan(0)
                .WithMessage("InstructorId must be a positive integer.");

            RuleFor(i => i.StudioId)
                .GreaterThan(0)
                .WithMessage("StudioId must be a positive integer.");

            RuleFor(i => i.ActivityId)
                .GreaterThan(0)
                .WithMessage("ActivityId must be a positive integer.");

            RuleFor(i => i.Name)
                .NotEmpty().WithMessage("Session name is required.")
                .MinimumLength(3).WithMessage("Name must be at least 3 characters long.");

            RuleFor(i => i.StartTime)
                .NotEmpty().WithMessage("Start time is required.");

            RuleFor(i => i.Duration)
                .GreaterThan(0).WithMessage("Duration must be greater than 0 minutes.");

            RuleFor(i => i.Date)
                .NotEmpty().WithMessage("Date is required.");

            RuleFor(i => i.MinParticipants)
                .GreaterThanOrEqualTo(0)
                .WithMessage("MinParticipants must be 0 or greater.");

            RuleFor(i => i.Difficulty)
                .IsInEnum()             
                .WithMessage("Difficulty value is invalid.");
        }
    }
}
