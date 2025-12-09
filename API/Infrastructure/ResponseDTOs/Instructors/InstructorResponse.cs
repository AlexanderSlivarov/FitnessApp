namespace API.Infrastructure.ResponseDTOs.Instructors
{
    public class InstructorResponse
    {
        public int Id { get; set; }        
        public int UserId { get; set; }
        
        public string Username { get; set; }
        public string FullName { get; set; }
        
        public string Bio { get; set; }
        public int ExperienceYears { get; set; }
    }
}
