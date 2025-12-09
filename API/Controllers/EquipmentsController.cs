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
    public class EquipmentsController : ControllerBase
    {
        private readonly IEquipmentServices _equipmentService;

        public EquipmentsController(IEquipmentServices equipmentServices)
        {
            _equipmentService = equipmentServices;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] EquipmentGetRequest model)
        {
            model.Pager ??= new PagerRequest();
            model.Pager.Page = model.Pager.Page <= 0
                                    ? 1
                                    : model.Pager.Page;
            model.Pager.PageSize = model.Pager.PageSize <= 0
                                        ? 10
                                        : model.Pager.PageSize;

            model.OrderBy ??= "Id";
            model.OrderBy = typeof(Equipment).GetProperty(model.OrderBy) != null
                                ? model.OrderBy
                                : "Id";

            model.Filter ??= new EquipmentGetFilterRequest();

            Expression<Func<Equipment, bool>> filter =
            e =>
                (string.IsNullOrEmpty(model.Filter.Name) || e.Name.Contains(model.Filter.Name)) &&
                (!model.Filter.Condition.HasValue || e.Condition.Equals(model.Filter.Condition)) &&
                (!model.Filter.StudioId.HasValue || e.StudioId.Equals(model.Filter.StudioId));

            EquipmentGetResponse response = new EquipmentGetResponse();

            response.Pager = new PagerResponse();
            response.Pager.Page = model.Pager.Page;
            response.Pager.PageSize = model.Pager.PageSize;

            response.OrderBy = model.OrderBy;
            response.SortAsc = model.SortAsc;

            response.Filter = model.Filter;

            response.Pager.Count = _equipmentService.Count(filter);

            List<Equipment> equipments = await _equipmentService.GetAllAsync(
                                                                  filter,
                                                                  model.OrderBy,
                                                                  model.SortAsc,
                                                                  model.Pager.Page,
                                                                  model.Pager.PageSize);

            if (equipments is null || !equipments.Any())
            {
                return NotFound("No equipments found matching the given criteria.");
            }

            response.Items = equipments
                .Select(e => new EquipmentResponse
                {
                    Id = e.Id,
                    Name = e.Name,
                    Quantity = e.Quantity,
                    Condition = e.Condition,
                    StudioId = e.StudioId,
                    StudioName = e.Studio.Name
                })
                .ToList();

            return Ok(ServiceResult<EquipmentGetResponse>.Success(response));
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> Get([FromRoute] int id)
        {
            Equipment equipment = await _equipmentService.GetByIdAsync(id);

            if (equipment is null)
            {
                return NotFound("Equipment not found.");
            }

            return Ok(ServiceResult<Equipment>.Success(equipment));
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] EquipmentRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }

            Equipment newEquipment = new Equipment
            {
                StudioId = model.StudioId,
                Name = model.Name,
                Quantity = model.Quantity,
                Condition = model.Condition
            };

            await _equipmentService.SaveAsync(newEquipment);

            return Ok(ServiceResult<Equipment>.Success(newEquipment));
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> Put([FromRoute] int id, [FromBody] EquipmentRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }

            Equipment equipmentForUpdate = await _equipmentService.GetByIdAsync(id);

            if (equipmentForUpdate is null)
            {
                return NotFound("Equipment not found.");
            }

            equipmentForUpdate.StudioId = model.StudioId;
            equipmentForUpdate.Name = model.Name;
            equipmentForUpdate.Quantity = model.Quantity;
            equipmentForUpdate.Condition = model.Condition;

            await _equipmentService.SaveAsync(equipmentForUpdate);

            return Ok(ServiceResult<Equipment>.Success(equipmentForUpdate));
        }

        [HttpDelete]
        [Route("{id}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            Equipment equipmentForDelete = await _equipmentService.GetByIdAsync(id);

            if (equipmentForDelete is null)
            {
                return NotFound("Equipment not found.");
            }

            await _equipmentService.DeleteAsync(equipmentForDelete);

            return Ok(ServiceResult<Equipment>.Success(equipmentForDelete));
        }
    }
}
