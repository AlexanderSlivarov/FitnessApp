using API.Infrastructure.RequestDTOs.Shared;

namespace API.Infrastructure.RequestDTOs.Studios
{
    public class StudioGetRequest : BaseGetRequest
    {
        public StudioGetFilterRequest Filter { get; set; }
    }
}
