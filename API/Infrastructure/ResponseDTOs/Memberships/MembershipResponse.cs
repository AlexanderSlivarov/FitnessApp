using Common.Enums;

namespace API.Infrastructure.ResponseDTOs.Memberships
{
    public class MembershipResponse
    {
        public int Id { get; set; }

        public string Name { get; set; }
        public double Price { get; set; }

        public int Duration { get; set; }
        public DurationType DurationType { get; set; }
        public string DurationTypeName => DurationType.ToString();

        public string Description { get; set; }
    }
}
