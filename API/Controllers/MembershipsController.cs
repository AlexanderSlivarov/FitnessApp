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
    public class MembershipsController : BaseCrudController<
        Membership,
        IMembershipServices,
        MembershipRequest,
        MembershipGetRequest,
        MembershipResponse,
        MembershipGetResponse>
    {
        public MembershipsController(IMembershipServices membershipService) : base(membershipService) { }

        protected override void PopulateEntity(Membership membership, MembershipRequest model, out string error)
        {
            error = null;

            membership.Name = model.Name;
            membership.Price = model.Price;
            membership.Duration = model.Duration;
            membership.DurationType = model.DurationType;
            membership.Description = model.Description;
        }

        protected override Expression<Func<Membership, bool>> GetFilter(MembershipGetRequest model)
        {
            model.Filter ??= new MembershipGetFilterRequest();

            return m =>
                (string.IsNullOrEmpty(model.Filter.Name) || 
                    (m.Name != null && m.Name.Contains(model.Filter.Name))) &&

                (!model.Filter.Price.HasValue || 
                    m.Price == model.Filter.Price.Value) &&

                (!model.Filter.DurationType.HasValue || 
                    m.DurationType == model.Filter.DurationType.Value);
        }

        protected override void PopulageGetResponse(MembershipGetRequest request, MembershipGetResponse response)
        {
            response.Filter = request.Filter;
        }

        protected override MembershipResponse ToResponse(Membership membership)
        {
            return new MembershipResponse
            {
                Id = membership.Id,
                Name = membership.Name,
                Price = membership.Price,
                Duration = membership.Duration,
                DurationType = membership.DurationType,
                Description = membership.Description
            };
        }
    }
}
