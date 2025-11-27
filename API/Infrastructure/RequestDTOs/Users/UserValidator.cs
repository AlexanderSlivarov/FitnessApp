using FluentValidation;

namespace API.Infrastructure.RequestDTOs.Users
{
    public class UserValidator : AbstractValidator<UserRequest>
    {
        public UserValidator()
        {
            RuleFor(i => i.Username)
                .NotEmpty().WithMessage("Username is required.")
                .MinimumLength(3).WithMessage("Username must be atleast 3 characters long.");

            RuleFor(i => i.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(5).WithMessage("Password must be atleast 5 characters long.");            

            RuleFor(i => i.FirstName)
                .NotEmpty().WithMessage("First name is required.");

            RuleFor(i => i.LastName)
                .NotEmpty().WithMessage("Last name is required.");

            RuleFor(i => i.PhoneNumber)
                .NotEmpty().WithMessage("Phone number is required.")
                .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Invalid phone number format.");            
        }
    }
}
