using API.Infrastructure.ResponseDTOs.Instructor;
using Common.Entities;

namespace API.Infrastructure.Mappers
{
    public static class InstructorMapper
    {
        public static InstructorResponse ToResponse(Instructor i)
        {
            if (i == null) return null;

            return new InstructorResponse
            {
                Id = i.Id,
                Bio = i.Bio,
                ExperienceYears = i.ExperienceYears,
                FullName = i.User != null
                    ? $"{i.User.FirstName} {i.User.LastName}"
                    : null
            };
        }

        public static List<InstructorResponse> ToResponseList(List<Instructor> list)
        {
            return list.Select(ToResponse).ToList();
        }
    }
}
