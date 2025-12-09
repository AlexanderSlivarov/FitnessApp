using API.Infrastructure.RequestDTOs.Instructors;
using API.Infrastructure.ResponseDTOs.Shared;
using Common.Entities;

namespace API.Infrastructure.ResponseDTOs.Instructors
{
    public class InstructorGetResponse : BaseGetResponse<InstructorResponse, InstructorGetFilterRequest>
    { }
}
