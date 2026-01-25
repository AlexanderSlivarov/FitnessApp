using Common.Entities;
using Common.Persistance;
using Common.Services.Interfaces;

namespace Common.Services.Implementations
{
    public class SubscriptionServices : BaseService<Subscription>, ISubscriptionServices
    {
        public SubscriptionServices(FitnessAppDbContext context) : base(context) { }
    }
}
