using API.Infrastructure.RequestDTOs.Shared;
using API.Infrastructure.RequestDTOs.Studios;
using API.Infrastructure.ResponseDTOs.Sessions;
using API.Infrastructure.ResponseDTOs.Shared;
using API.Infrastructure.ResponseDTOs.Studios;
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

    public class StudiosController : BaseCrudController<
        Studio,
        IStudioServices,
        StudioRequest,
        StudioGetRequest,
        StudioResponse,
        StudioGetResponse>
    {
        public StudiosController(IStudioServices studioService) : base(studioService) { }

        protected override void PopulateEntity(Studio studio, StudioRequest model, out string error)
        {
            error = null;

            studio.Name = model.Name;
            studio.Location = model.Location;
            studio.Capacity = model.Capacity;
        }

        protected override Expression<Func<Studio, bool>> GetFilter(StudioGetRequest model)
        {
            model.Filter ??= new StudioGetFilterRequest();

            return s =>
                (string.IsNullOrEmpty(model.Filter.Name) || 
                    (s.Name != null && s.Name.Contains(model.Filter.Name))) &&

                (string.IsNullOrEmpty(model.Filter.Location) || 
                    (s.Location != null && s.Location.Contains(model.Filter.Location))) &&

                (!model.Filter.Capacity.HasValue || 
                    s.Capacity == model.Filter.Capacity.Value);
        }

        protected override void PopulageGetResponse(StudioGetRequest request, StudioGetResponse response)
        {
            response.Filter = request.Filter;
        }

        protected override StudioResponse ToResponse(Studio studio)
        {
            return new StudioResponse
            {
                Id = studio.Id,
                Name = studio.Name,
                Location = studio.Location,
                Capacity = studio.Capacity
            };
        }
    }
}
