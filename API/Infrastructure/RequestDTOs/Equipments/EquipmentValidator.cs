using FluentValidation;

namespace API.Infrastructure.RequestDTOs.Equipments
{
    public class EquipmentValidator : AbstractValidator<EquipmentRequest>
    {
        public EquipmentValidator()
        {
            RuleFor(i => i.StudioId)
                .GreaterThan(0)
                .WithMessage("StudioId must be a positive integer.");

            RuleFor(i =>i.Name)
                .NotEmpty().WithMessage("Name is required.")
                .MinimumLength(2).WithMessage("Name must be at least 2 characters.");

            RuleFor(e => e.Quantity)
                .GreaterThan(0)
                .WithMessage("Quantity must be greater than 0.");

            RuleFor(e => e.Condition)
                .IsInEnum()
                .WithMessage("Condition value is invalid.");
        }
    }
}
