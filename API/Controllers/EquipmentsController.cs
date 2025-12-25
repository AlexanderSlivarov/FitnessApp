using API.Infrastructure.RequestDTOs.Equipments;
using API.Infrastructure.RequestDTOs.Shared;
using API.Infrastructure.ResponseDTOs.Activities;
using API.Infrastructure.ResponseDTOs.Equipments;
using API.Infrastructure.ResponseDTOs.Shared;
using API.Services;
using Azure;
using Common;
using Common.Entities;
using Common.Services.Implementations;
using Common.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq.Expressions;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EquipmentsController : BaseCrudController<
        Equipment,
        IEquipmentServices,
        EquipmentRequest,
        EquipmentGetRequest,
        EquipmentResponse,
        EquipmentGetResponse>
    {
        public EquipmentsController(IEquipmentServices equipmentService) : base(equipmentService) { }

        protected override void PopulateEntity(Equipment equipment, EquipmentRequest model, out string error)
        {
            error = null;

            equipment.StudioId = model.StudioId;
            equipment.Name = model.Name;
            equipment.Quantity = model.Quantity;
            equipment.Condition = model.Condition;
        }

        protected override Expression<Func<Equipment, bool>> GetFilter(EquipmentGetRequest model)
        {
            model.Filter ??= new EquipmentGetFilterRequest();

            return e =>
                (string.IsNullOrEmpty(model.Filter.Name) || 
                    (e.Name != null && e.Name.Contains(model.Filter.Name))) &&

                (!model.Filter.Condition.HasValue || 
                    e.Condition == model.Filter.Condition.Value) &&

                (!model.Filter.StudioId.HasValue || 
                    e.StudioId == model.Filter.StudioId.Value);
        }

        protected override void PopulageGetResponse(EquipmentGetRequest request, EquipmentGetResponse response)
        {
            response.Filter = request.Filter;
        }

        protected override EquipmentResponse ToResponse(Equipment equipment)
        {
            return new EquipmentResponse
            {
                Id = equipment.Id,
                Name = equipment.Name,
                Quantity = equipment.Quantity,
                Condition = equipment.Condition,
                StudioId = equipment.StudioId,
                StudioName = equipment.Studio?.Name
            };
        }
    }
}
