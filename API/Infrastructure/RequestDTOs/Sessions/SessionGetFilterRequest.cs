using Common.Enums;

namespace API.Infrastructure.RequestDTOs.Sessions
{
    public class SessionGetFilterRequest
    {
        public int? InstructorId { get; set; }
        public int? StudioId { get; set; }
        public int? ActivityId { get; set; }

        public string? Name { get; set; }

        public DateOnly? Date { get; set; }       
    }
}
