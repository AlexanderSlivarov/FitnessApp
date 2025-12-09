using Common.Enums;

namespace API.Infrastructure.ResponseDTOs.Equipments
{
    public class EquipmentResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Quantity { get; set; }
        public EquipmentCondition Condition { get; set; }

        public int StudioId { get; set; }
        public string StudioName { get; set; }
    }
}
