using Common.Entities;
using Common.Persistance;
using Common.Services.Interfaces;

namespace Common.Services.Implementations
{
    public class MembershipServices : BaseService<Membership>, IMembershipServices
    {
        public MembershipServices(FitnessAppDbContext context) : base(context)
        { }
    }
}
