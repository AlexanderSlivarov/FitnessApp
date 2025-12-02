using API.Infrastructure.RequestDTOs.Equipments;
using API.Infrastructure.RequestDTOs.Shared;
using API.Services;
using Common;
using Common.Entities;
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
        public async Task<IActionResult> Get([FromBody] EquipmentGetRequest model)
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

            List<Equipment> equipments = await _equipmentService.GetAllAsync(filter, model.OrderBy, model.SortAsc, model.Pager.Page, model.Pager.PageSize);

            if (equipments is null || !equipments.Any())
            {
                return NotFound("No equipments found matching the given criteria.");
            }

            return Ok(equipments);
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

            return Ok(equipment);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] EquipmentRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }

            Equipment equipment = new Equipment
            {
                StudioId = model.StudioId,
                Name = model.Name,
                Quantity = model.Quantity,
                Condition = model.Condition
            };

            await _equipmentService.SaveAsync(equipment);

            return CreatedAtAction(nameof(Get), new { Id = equipment.Id }, equipment);
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

            return NoContent();
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

            return NoContent();
        }
    }
}
