using API.Infrastructure.ResponseDTOs.Activity;
using API.Infrastructure.ResponseDTOs.Instructor;
using API.Infrastructure.ResponseDTOs.Studios;

namespace API.Infrastructure.ResponseDTOs.Sessions
{
    public class SessionResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public InstructorResponse Instructor { get; set; }
        public StudioResponse Studio { get; set; }
        public ActivityResponse Activity { get; set; }

        public string StartTime { get; set; }
        public int Duration { get; set; }
        public string Date { get; set; }

        public int MinParticipants { get; set; }
        public string Difficulty { get; set; }
    }
}
