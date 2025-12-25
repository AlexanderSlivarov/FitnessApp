using API.Infrastructure.RequestDTOs.Instructors;
using API.Infrastructure.RequestDTOs.Shared;
using API.Infrastructure.ResponseDTOs.Equipments;
using API.Infrastructure.ResponseDTOs.Instructors;
using API.Infrastructure.ResponseDTOs.Shared;
using API.Services;
using Azure;
using Common;
using Common.Entities;
using Common.Enums;
using Common.Services.Implementations;
using Common.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InstructorsController : BaseCrudController<
        Instructor,
        IInstructorServices,
        InstructorRequest,
        InstructorGetRequest,
        InstructorResponse,
        InstructorGetResponse>
    {
        private readonly IUserServices _userService;
        public InstructorsController(IInstructorServices instructorService, IUserServices userService) : base(instructorService) 
        {
            _userService = userService;
        }

        protected override void PopulateEntity(Instructor instructor, InstructorRequest model, out string error)
        {
            error = null;

            instructor.UserId = model.UserId;
            instructor.Bio = model.Bio;
            instructor.ExperienceYears = model.ExperienceYears;             
        }

        protected override Expression<Func<Instructor, bool>> GetFilter(InstructorGetRequest model)
        {
            model.Filter ??= new InstructorGetFilterRequest();

            return i =>
                (!model.Filter.ExperienceYears.HasValue || 
                    i.ExperienceYears == model.Filter.ExperienceYears.Value);
        }

        protected override void PopulageGetResponse(InstructorGetRequest request, InstructorGetResponse response)
        {
            response.Filter = request.Filter;
        }

        protected override InstructorResponse ToResponse(Instructor instructor)
        {
            return new InstructorResponse
            {
                Id = instructor.Id,
                UserId = instructor.UserId,
                Username = instructor.User?.Username,
                FullName = $"{instructor.User?.FirstName} {instructor.User?.LastName}",
                Bio = instructor.Bio,
                ExperienceYears = instructor.ExperienceYears
            };
        }     
    }
}
