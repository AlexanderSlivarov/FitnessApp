using API.Infrastructure.RequestDTOs.Equipments;
using API.Infrastructure.ResponseDTOs.Shared;
using Common.Entities;

namespace API.Infrastructure.ResponseDTOs.Equipments
{
    public class EquipmentGetResponse : BaseGetResponse<EquipmentResponse>
    {
        public EquipmentGetFilterRequest Filter { get; set; }
    }
}
