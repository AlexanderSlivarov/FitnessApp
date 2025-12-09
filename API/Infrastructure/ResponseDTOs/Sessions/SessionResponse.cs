using Common.Enums;

namespace API.Infrastructure.ResponseDTOs.Sessions
{
    public class SessionResponse
    {
        public int Id { get; set; }      
        public int InstructorId { get; set; }
        public int StudioId { get; set; }
        public int ActivityId { get; set; }
        
        public string InstructorName { get; set; }
        public string StudioName { get; set; }
        public string ActivityName { get; set; }

        public string Name { get; set; }
        
        public TimeOnly StartTime { get; set; }
        public int Duration { get; set; }
        public DateOnly Date { get; set; }

        public int MinParticipants { get; set; }

        public SessionDifficulty Difficulty { get; set; }
        public string DifficultyName => Difficulty.ToString();
    }
}
