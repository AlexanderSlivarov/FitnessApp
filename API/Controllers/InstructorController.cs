using API.Infrastructure.RequestDTOs.Instructors;
using API.Infrastructure.RequestDTOs.Shared;
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
    public class InstructorController : ControllerBase
    {
        private readonly IInstructorServices _instructorService;

        public InstructorController(IInstructorServices instructorService)
        {
            _instructorService = instructorService;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromBody] InstructorGetRequest model)
        {
            model.Pager = model.Pager ?? new PagerRequest();
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
                Filter.ExperienceYears.Value));

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
            Instructor newInstructor = new Instructor
            {
                UserId = model.UserId,
                Bio = model.Bio,
                ExperienceYears = model.ExperienceYears
            };

            await _instructorService.SaveAsync(newInstructor);

            return CreatedAtAction(nameof(Get), new { Id = newInstructor.Id }, newInstructor);
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> Put([FromRoute] int id, [FromBody] InstructorRequest model)
        {
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
