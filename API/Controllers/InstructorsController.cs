using API.Infrastructure.RequestDTOs.Instructors;
using API.Infrastructure.RequestDTOs.Shared;
using API.Infrastructure.ResponseDTOs.Instructor;
using API.Services;
using Common;
using Common.Entities;
using Common.Enums;
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
    public class InstructorsController : ControllerBase
    {
        private readonly IInstructorServices _instructorService;
        private readonly IUserServices _userService;

        public InstructorsController(IInstructorServices instructorService, IUserServices userService)
        {
            _instructorService = instructorService;
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromBody] InstructorGetRequest model)
        {
            model.Pager ??= new PagerRequest();
            model.Pager.Page = model.Pager.Page <= 0
                                    ? 1
                                    : model.Pager.Page;
            model.Pager.PageSize = model.Pager.PageSize <= 0
                                        ? 10
                                        : model.Pager.PageSize;

            model.OrderBy ??= "Id";
            model.OrderBy = typeof(Instructor).GetProperty(model.OrderBy) != null
                                ? model.OrderBy
                                : "Id";

            model.Filter = new InstructorGetFilterRequest();

            Expression<Func<Instructor, bool>> filter =
            i =>
                ((!model.Filter.ExperienceYears.HasValue) || i.ExperienceYears.Equals(model.
                Filter.ExperienceYears));

            List<Instructor> instructors = await _instructorService.GetAllAsync(filter, model.OrderBy, model.SortAsc, model.Pager.Page, model.Pager.PageSize);

            if (instructors is null || !instructors.Any())
            {
                return NotFound("No instructors found matching the given criteria.");
            }          

            return Ok(instructors);
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> Get([FromRoute] int id)
        {
            Instructor instructor = await _instructorService.GetByIdAsync(id);

            if (instructor is null)
            {
                return NotFound("Instructor not found.");
            }            

            return Ok(instructor);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] InstructorRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }

            Instructor newInstructor = new Instructor
            {
                UserId = model.UserId,
                Bio = model.Bio,
                ExperienceYears = model.ExperienceYears,
            };

            await _instructorService.SaveAsync(newInstructor);

            User user = await _userService.GetByIdAsync(model.UserId);

            if (user is not null)
            {
                user.Role = UserRole.Instructor;
                await _userService.SaveAsync(user);
            }

            return CreatedAtAction(nameof(Get), new { Id = newInstructor.Id }, newInstructor);
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> Put([FromRoute] int id, [FromBody] InstructorRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }

            Instructor instructorForUpdate = await _instructorService.GetByIdAsync(id);

            if (instructorForUpdate is null)
            {
                return NotFound("Instructor not found.");
            }
            
            instructorForUpdate.Bio = model.Bio;
            instructorForUpdate.ExperienceYears = model.ExperienceYears;

            await _instructorService.SaveAsync(instructorForUpdate);

            return NoContent();
        }

        [HttpDelete]
        [Route("{id}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            Instructor instructorForDelete = await _instructorService.GetByIdAsync(id);

            if (instructorForDelete is null)
            {
                return NotFound("Instructor not found.");
            }

            await _instructorService.DeleteAsync(instructorForDelete);

            return NoContent();
        }
    }
}
