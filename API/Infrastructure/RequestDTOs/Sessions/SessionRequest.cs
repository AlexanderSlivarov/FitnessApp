using Common.Enums;

namespace API.Infrastructure.RequestDTOs.Sessions
{
    public class SessionRequest
    {
        public int InstructorId { get; set; }
        public int StudioId { get; set; }
        public int ActivityId { get; set; }

        public string Name { get; set; }

        public TimeOnly StartTime { get; set; }
        public int Duration { get; set; }
        public DateOnly Date { get; set; }

        public int MinParticipants { get; set; }

        public SessionDifficulty Difficulty { get; set; }
    }
}
