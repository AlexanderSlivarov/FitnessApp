using API.Infrastructure.Mappers;
using API.Infrastructure.RequestDTOs.Sessions;
using API.Infrastructure.RequestDTOs.Shared;
using API.Infrastructure.ResponseDTOs.Sessions;
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
    public class SessionsController : ControllerBase
    {
        private readonly ISessionServices _sessionService;

        public SessionsController(ISessionServices sessionServices)
        {
            _sessionService = sessionServices;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromBody] SessionGetRequest model)
        {
            model.Pager = model.Pager ?? new PagerRequest();
            model.Pager.Page = model.Pager.Page <= 0
                                    ? 1
                                    : model.Pager.Page;
            model.Pager.PageSize = model.Pager.PageSize <= 0
                                        ? 10
                                        : model.Pager.PageSize;

            model.OrderBy ??= "Id";
            model.OrderBy = typeof(Session).GetProperty(model.OrderBy) != null
                                ? model.OrderBy
                                : "Id";

            model.Filter ??= new SessionGetFilterRequest();

            Expression<Func<Session, bool>> filter =
            s =>
                (!model.Filter.InstructorId.HasValue || s.InstructorId.Equals(model.Filter.InstructorId)) &&
                (!model.Filter.StudioId.HasValue || s.StudioId.Equals(model.Filter.StudioId)) &&
                (!model.Filter.ActivityId.HasValue || s.ActivityId.Equals(model.Filter.ActivityId)) &&
                (string.IsNullOrEmpty(model.Filter.Name) || s.Name.Contains(model.Filter.Name)) &&
                (!model.Filter.Date.HasValue || s.Date.Equals(model.Filter.Date)) &&
                (!model.Filter.Difficulty.HasValue || s.Difficulty.Equals(model.Filter.Difficulty));

            List<Session> sessions = await _sessionService.GetAllAsync(filter, model.OrderBy, model.SortAsc, model.Pager.Page, model.Pager.PageSize);

            if (sessions is null || !sessions.Any())
            {
                return NotFound("No sessions found matching the given criteria.");
            }            

            return Ok(SessionMapper.ToResponseList(sessions));
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> Get([FromRoute] int id)
        {
            Session session = await _sessionService.GetByIdAsync(id);

            if (session is null)
            {
                return NotFound("Session not found.");
            }            

            return Ok(SessionMapper.ToResponse(session));
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] SessionRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }

            Session newSession = new Session
            {
                InstructorId = model.InstructorId,
                StudioId = model.StudioId,
                ActivityId = model.ActivityId,
                Name = model.Name,
                StartTime = model.StartTime,
                Duration = model.Duration,
                Date = model.Date,
                MinParticipants = model.MinParticipants,
                Difficulty = model.Difficulty
            };

            await _sessionService.SaveAsync(newSession);

            return CreatedAtAction(nameof(Get), new { Id = newSession.Id }, newSession);
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> Put([FromRoute] int id, [FromBody] SessionRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }

            Session sessionForUpdate = await _sessionService.GetByIdAsync(id);

            if (sessionForUpdate is null)
            {
                return NotFound("Session not found.");
            }

            sessionForUpdate.InstructorId = model.InstructorId;
            sessionForUpdate.StudioId = model.StudioId;
            sessionForUpdate.ActivityId = model.ActivityId;
            sessionForUpdate.Name = model.Name;
            sessionForUpdate.StartTime = model.StartTime;
            sessionForUpdate.Duration = model.Duration;
            sessionForUpdate.Date = model.Date;
            sessionForUpdate.MinParticipants = model.MinParticipants;
            sessionForUpdate.Difficulty = model.Difficulty;

            await _sessionService.SaveAsync(sessionForUpdate);

            return NoContent();
        }

        [HttpDelete]
        [Route("{id}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            Session sessionForDelete = await _sessionService.GetByIdAsync(id);

            if (sessionForDelete is null)
            {
                return NotFound("Session not found.");
            }

            await _sessionService.DeleteAsync(sessionForDelete);

            return NoContent();
        }
    }
}
