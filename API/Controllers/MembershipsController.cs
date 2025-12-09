using API.Infrastructure.RequestDTOs.Memberships;
using API.Infrastructure.RequestDTOs.Shared;
using API.Infrastructure.ResponseDTOs.Instructors;
using API.Infrastructure.ResponseDTOs.Memberships;
using API.Infrastructure.ResponseDTOs.Shared;
using API.Services;
using Azure;
using Common;
using Common.Entities;
using Common.Services.Implementations;
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
        public async Task<IActionResult> Get([FromQuery] MembershipGetRequest model)
        {
            model.Pager ??= new PagerRequest();
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

            MembershipGetResponse response = new MembershipGetResponse();

            response.Pager = new PagerResponse();
            response.Pager.Page = model.Pager.Page;
            response.Pager.PageSize = model.Pager.PageSize;

            response.OrderBy = model.OrderBy;
            response.SortAsc = model.SortAsc;

            response.Filter = model.Filter;

            response.Pager.Count = _membershipService.Count(filter);

            List<Membership> memberships = await _membershipService.GetAllAsync(
                                                                  filter,
                                                                  model.OrderBy,
                                                                  model.SortAsc,
                                                                  model.Pager.Page,
                                                                  model.Pager.PageSize);

            if (memberships is null || !memberships.Any())
            {
                return NotFound("No memberships found matching the given criteria.");
            }

            response.Items = memberships
                .Select(m => new MembershipResponse
                {
                    Id = m.Id,
                    Name = m.Name,
                    Price = m.Price,
                    Duration = m.Duration,
                    DurationType = m.DurationType,
                    Description = m.Description
                })
                .ToList();

            return Ok(ServiceResult<MembershipGetResponse>.Success(response));
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

            return Ok(ServiceResult<Membership>.Success(membership));
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] MembershipRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }

            Membership newMembership = new Membership
            {
                Name = model.Name,
                Price = model.Price,
                Duration = model.Duration,
                DurationType = model.DurationType,
                Description = model.Description
            };

            await _membershipService.SaveAsync(newMembership);

            return Ok(ServiceResult<Membership>.Success(newMembership));
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

            return Ok(ServiceResult<Membership>.Success(membershipForUpdate));
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

            return Ok(ServiceResult<Membership>.Success(membershipForDelete));
        }
    }
}
