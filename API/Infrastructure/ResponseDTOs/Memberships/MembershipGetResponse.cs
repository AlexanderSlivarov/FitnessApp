using API.Infrastructure.RequestDTOs.Memberships;
using API.Infrastructure.ResponseDTOs.Shared;
using Common.Entities;

namespace API.Infrastructure.ResponseDTOs.Memberships
{
    public class MembershipGetResponse : BaseGetResponse<MembershipResponse>
    {
        public MembershipGetFilterRequest Filter { get; set; }
    }
}
