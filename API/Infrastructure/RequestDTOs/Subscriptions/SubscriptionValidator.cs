using FluentValidation;

namespace API.Infrastructure.RequestDTOs.Subscriptions
{
    public class SubscriptionValidator : AbstractValidator<SubscriptionRequest>
    {
        public SubscriptionValidator()
        {
            RuleFor(s => s.UserId)
                .GreaterThan(0)
                .WithMessage("UserId must be a positive integer.");

            RuleFor(s => s.MembershipId)
                .GreaterThan(0)
                .WithMessage("MembershipId must be a positive integer.");

            RuleFor(s => s.StartDate).NotEmpty();
            RuleFor(s => s.EndDate).NotEmpty();
            RuleFor(s => s)
                .Must(s => s.EndDate > s.StartDate)
                .WithMessage("EndDate must be after StartDate.");

            RuleFor(s => s.Status)
                .IsInEnum()
                .WithMessage("Status value is invalid.");
        }
    }

}
