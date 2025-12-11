using API.Infrastructure.RequestDTOs.Shared;

namespace API.Infrastructure.RequestDTOs.Equipments
{
    public class EquipmentGetRequest : BaseGetRequest
    {
        public EquipmentGetFilterRequest Filter { get; set; }
    }    
}
