using FluentValidation;

namespace API.Infrastructure.RequestDTOs.Memberships
{
    public class MembershipValidator : AbstractValidator<MembershipRequest>
    {
        public MembershipValidator()
        {
            RuleFor(i => i.Name)
                .NotEmpty().WithMessage("Membership name is required.")
                .MinimumLength(2).WithMessage("Membership name must be atleast 2 characters long.");

            RuleFor(i => i.Price)
                .NotEmpty().WithMessage("Membership price is required.")
                .GreaterThanOrEqualTo(0).WithMessage("Membership price must be greater or equal to zero.");

            RuleFor(i => i.Duration)
                .NotEmpty().WithMessage("Membership duration is required.")
                .GreaterThan(0).WithMessage("Membership duration must be greater than zero.");

            RuleFor(i => i.Description)
                .NotEmpty().WithMessage("Membership description is required.")
                .MinimumLength(10).WithMessage("Membership description must be atleast 10 characters long.");

            RuleFor(i => i.DurationType)
                .IsInEnum()
                .WithMessage("DurationType value is invalid.");
        }
    }
}
