namespace API.Infrastructure.ResponseDTOs.Sessions
{
    public class SessionResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public string InstructorName { get; set; }
        public string StudioName { get; set; }
        public string ActivityName { get; set; }

        public string StartTime { get; set; }
        public int Duration { get; set; }
        public string Date { get; set; }

        public int MinParticipants { get; set; }
        public string Difficulty { get; set; }
    }
}
