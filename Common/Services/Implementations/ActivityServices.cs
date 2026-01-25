using Common.Entities;
using Common.Persistance;
using Common.Services.Interfaces;

namespace Common.Services.Implementations
{
    public class ActivityServices : BaseService<Activity>, IActivityServices
    {       
        public ActivityServices(FitnessAppDbContext context) : base(context)
        { }     
    }
}
