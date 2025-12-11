using API.Infrastructure.RequestDTOs.Shared;
using Common.Entities;

namespace API.Infrastructure.RequestDTOs.Activities
{
    public class ActivityGetRequest : BaseGetRequest
    { 
        public ActivityGetFilterRequest Filter { get; set; }
    }
}
