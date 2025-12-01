using API.Infrastructure.ResponseDTOs.Sessions;
using Common.Entities;

namespace API.Infrastructure.Mappers
{
    public static class SessionMapper
    {
        public static SessionResponse ToResponse(Session s)
        {
            if (s == null) return null;

            return new SessionResponse
            {
                Id = s.Id,
                Name = s.Name,
                InstructorName = s.Instructor?.User != null
                    ? $"{s.Instructor.User.FirstName} {s.Instructor.User.LastName}"
                    : null,
                StudioName = s.Studio?.Name,
                ActivityName = s.Activity?.Name,
                StartTime = s.StartTime.ToString("HH:mm"),
                Duration = s.Duration,
                Date = s.Date.ToString("yyyy-MM-dd"),
                MinParticipants = s.MinParticipants,
                Difficulty = s.Difficulty.ToString()
            };
        }

        public static List<SessionResponse> ToResponseList(List<Session> list)
        {
            return list.Select(ToResponse).ToList();
        }
    }
}
