using API.Infrastructure.RequestDTOs.Shared;

namespace API.Infrastructure.ResponseDTOs.Shared
{
    public class PagerResponse : PagerRequest
    {
        public int Count { get; set; }
    }
}
