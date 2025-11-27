using FluentValidation;

namespace API.Infrastructure.RequestDTOs.Auth
{
    public class AuthTokenValidator : AbstractValidator<AuthTokenRequest>
    {
        public AuthTokenValidator()
        {
            RuleFor(i => i.Username)
                .NotEmpty().WithMessage("Username is required.")
                .MinimumLength(3).WithMessage("Username must be atleast 3 characters long.");

            RuleFor(i => i.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(5).WithMessage("Password must be atleast 5 characters long.");
        }
    }
}
