using API.Infrastructure.RequestDTOs.Memberships;
using API.Infrastructure.RequestDTOs.Shared;
using API.Services;
using Common;
using Common.Entities;
using Common.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Linq.Expressions;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MembershipsController : ControllerBase
    {
        private readonly IMembershipServices _membershipService;

        public MembershipsController(IMembershipServices membershipServices)
        {
            _membershipService = membershipServices;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromBody] MembershipGetRequest model)
        {
            model.Pager = model.Pager ?? new PagerRequest();
            model.Pager.Page = model.Pager.Page <= 0
                                    ? 1
                                    : model.Pager.Page;
            model.Pager.PageSize = model.Pager.PageSize <= 0
                                        ? 10
                                        : model.Pager.PageSize;

            model.OrderBy ??= "Id";
            model.OrderBy = typeof(Membership).GetProperty(model.OrderBy) != null
                                ? model.OrderBy
                                : "Id";

            model.Filter ??= new MembershipGetFilterRequest();

            Expression<Func<Membership, bool>> filter =
            m =>
                (string.IsNullOrEmpty(model.Filter.Name) || m.Name.Contains(model.Filter.Name)) &&
                (!model.Filter.Price.HasValue || m.Price.Equals(model.Filter.Price)) &&
                (!model.Filter.DurationType.HasValue || !model.Filter.DurationType.HasValue ||
                (m.DurationType == model.Filter.DurationType.Value &&
                 m.DurationType == model.Filter.DurationType.Value));

            List<Membership> memberships = await _membershipService.GetAllAsync(filter, model.OrderBy, model.SortAsc, model.Pager.Page, model.Pager.PageSize);

            if (memberships is null || !memberships.Any())
            {
                return NotFound("No memberships found matching the given criteria.");
            }

            return Ok(memberships);
        }

        [HttpGet]
        [Route("{id}")]

        public async Task<IActionResult> Get([FromRoute] int id)
        {
            Membership membership = await _membershipService.GetByIdAsync(id);

            if (membership is null)
            {
                return NotFound("Membership not found.");
            }

            return Ok(membership);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] MembershipRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }

            Membership membership = new Membership
            {
                Name = model.Name,
                Price = model.Price,
                Duration = model.Duration,
                DurationType = model.DurationType,
                Description = model.Description
            };

            await _membershipService.SaveAsync(membership);

            return CreatedAtAction(nameof(Get), new { Id = membership.Id }, membership);
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> Put([FromRoute] int id, [FromBody] MembershipRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }

            Membership membershipForUpdate = await _membershipService.GetByIdAsync(id);

            if (membershipForUpdate is null)
            {
                return NotFound("Membership not found.");
            }

            membershipForUpdate.Name = model.Name;
            membershipForUpdate.Price = model.Price;
            membershipForUpdate.Duration = model.Duration;
            membershipForUpdate.DurationType = model.DurationType;
            membershipForUpdate.Description = model.Description;

            await _membershipService.SaveAsync(membershipForUpdate);

            return NoContent();
        }

        [HttpDelete]
        [Route("{id}")]

        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            Membership membershipForDelete = await _membershipService.GetByIdAsync(id);

            if (membershipForDelete is null)
            {
                return NotFound("Membership not found.");
            }

            await _membershipService.DeleteAsync(membershipForDelete);

            return NoContent();
        }

    }
}
