using API.Infrastructure.RequestDTOs.Shared;

namespace API.Infrastructure.RequestDTOs.Sessions
{
    public class SessionGetRequest : BaseGetRequest
    { 
        public SessionGetFilterRequest Filter { get; set; }
    }
}
