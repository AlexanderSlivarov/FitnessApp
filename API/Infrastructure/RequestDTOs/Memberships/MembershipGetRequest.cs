using API.Infrastructure.RequestDTOs.Shared;

namespace API.Infrastructure.RequestDTOs.Memberships
{
    public class MembershipGetRequest : BaseGetRequest
    {
        public MembershipGetFilterRequest Filter { get; set; }
    }
}
