using API.Infrastructure.RequestDTOs.Activities;
using API.Infrastructure.RequestDTOs.Shared;
using API.Infrastructure.RequestDTOs.Users;
using API.Infrastructure.ResponseDTOs.Activities;
using API.Infrastructure.ResponseDTOs.Shared;
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
    public class ActivitiesController : BaseCrudController<
        Activity,
        IActivityServices,
        ActivityRequest,
        ActivityGetRequest,
        ActivityResponse,
        ActivityGetResponse>
    {
        public ActivitiesController(IActivityServices activityService) : base(activityService) { }

        protected override void PopulateEntity(Activity activity, ActivityRequest model, out string error)
        {
            error = null;

            activity.Name = model.Name;
            activity.Description = model.Description;
        }

        protected override Expression<Func<Activity, bool>> GetFilter(ActivityGetRequest model)
        {
            model.Filter ??= new ActivityGetFilterRequest();            

            return a =>
                (string.IsNullOrEmpty(model.Filter.Name) || 
                    (a.Name != null && a.Name.Contains(model.Filter.Name)));
        }

        protected override void PopulageGetResponse(ActivityGetRequest request, ActivityGetResponse response)
        {
            response.Filter = request.Filter;
        }

        protected override ActivityResponse ToResponse(Activity activity)
        {
            return new ActivityResponse 
            {
                Id = activity.Id,
                Name = activity.Name,
                Description = activity.Description
            };
        }
    }
}
