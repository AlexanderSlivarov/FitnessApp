using Common.Enums;

namespace API.Infrastructure.RequestDTOs.Equipments
{
    public class EquipmentRequest
    {
        public int StudioId { get; set; }

        public string Name { get; set; }
        public int Quantity { get; set; }
        public EquipmentCondition Condition { get; set; }
    }
}
