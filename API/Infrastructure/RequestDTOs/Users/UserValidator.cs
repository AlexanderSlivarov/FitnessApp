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
            
            RuleSet("Create", () =>
            {
                RuleFor(i => i.Password)
                    .NotEmpty().WithMessage("Password is required.")
                    .MinimumLength(5).WithMessage("Password must be atleast 5 characters long.");
            });
          
            RuleSet("Update", () =>
            {
                RuleFor(i => i.Password)
                    .MinimumLength(5).When(i => !string.IsNullOrEmpty(i.Password))
                    .WithMessage("Password must be atleast 5 characters long when provided.");
            });

            RuleFor(i => i.FirstName)
                .NotEmpty().WithMessage("First name is required.");

            RuleFor(i => i.LastName)
                .NotEmpty().WithMessage("Last name is required.");

            RuleFor(i => i.PhoneNumber)
                .NotEmpty().WithMessage("Phone number is required.")
                .Matches(@"^\+?[0-9]\d{1,14}$").WithMessage("Invalid phone number format.");

            RuleFor(i => i.Gender)
                .IsInEnum()               
                .WithMessage("Gender is invalid.");
        }
    }
}
