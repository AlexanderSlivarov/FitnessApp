using Common.Enums;

namespace API.Infrastructure.RequestDTOs.Equipments
{
    public class EquipmentGetFilterRequest
    {
        public string? Name { get; set; }
        public EquipmentCondition? Condition { get; set; }
        public int? StudioId { get; set; }
    }
}
