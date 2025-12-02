using Common.Enums;

namespace API.Infrastructure.RequestDTOs.Memberships
{
    public class MembershipGetFilterRequest
    {
        public string? Name { get; set; }
        public double? Price { get; set; }

        public int? Duration { get; set; }
        public DurationType? DurationType { get; set; }
    }
}
