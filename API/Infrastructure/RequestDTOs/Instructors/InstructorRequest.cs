namespace API.Infrastructure.RequestDTOs.Instructors
{
    public class InstructorRequest
    {
        public int UserId { get; set; }
        public string? Bio { get; set; }
        public int ExperienceYears { get; set; }
    }
}
