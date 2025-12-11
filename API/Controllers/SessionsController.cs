using API.Infrastructure.RequestDTOs.Sessions;
using API.Infrastructure.RequestDTOs.Shared;
using API.Infrastructure.ResponseDTOs.Memberships;
using API.Infrastructure.ResponseDTOs.Sessions;
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
    
    public class SessionsController : BaseCrudController<
        Session,
        ISessionServices,
        SessionRequest,
        SessionGetRequest,
        SessionResponse,
        SessionGetResponse>
    {
        public SessionsController(ISessionServices sessionService) : base(sessionService) { }

        protected override void PopulateEntity(Session session, SessionRequest model, out string error)
        {
            error = null;

            session.InstructorId = model.InstructorId;
            session.StudioId = model.StudioId;
            session.ActivityId = model.ActivityId;
            session.Name = model.Name;
            session.StartTime = model.StartTime;
            session.Duration = model.Duration;
            session.Date = model.Date;
            session.MinParticipants = model.MinParticipants;
            session.Difficulty = model.Difficulty;
        }

        protected override Expression<Func<Session, bool>> GetFilter(SessionGetRequest model)
        {
            model.Filter ??= new SessionGetFilterRequest();

            return s =>
                 (!model.Filter.InstructorId.HasValue || 
                    s.InstructorId == model.Filter.InstructorId.Value) &&

                 (!model.Filter.StudioId.HasValue || 
                    s.StudioId == model.Filter.StudioId.Value) &&

                 (!model.Filter.ActivityId.HasValue || 
                    s.ActivityId == model.Filter.ActivityId.Value) &&

                 (string.IsNullOrEmpty(model.Filter.Name) || 
                    (s.Name != null && s.Name.Contains(model.Filter.Name))) &&

                 (!model.Filter.Date.HasValue || 
                    s.Date == model.Filter.Date.Value);
        }

        protected override void PopulageGetResponse(SessionGetRequest request, SessionGetResponse response)
        {
            response.Filter = request.Filter;
        }

        protected override SessionResponse ToResponse(Session session)
        {
            return new SessionResponse
            {
                Id = session.Id,
                InstructorId = session.InstructorId,
                StudioId = session.StudioId,
                ActivityId = session.ActivityId,
                InstructorName = session.Instructor.User.FirstName + " " + session.Instructor.User.LastName,
                StudioName = session.Studio?.Name,
                ActivityName = session.Activity?.Name,
                Name = session.Name,
                StartTime = session.StartTime,
                Duration = session.Duration,
                Date = session.Date,
                MinParticipants = session.MinParticipants,
                Difficulty = session.Difficulty
            };
        }
    }
}
