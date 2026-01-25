using Common.Entities;
using Common.Persistance;
using Common.Services.Interfaces;

namespace Common.Services.Implementations
{
    public class SessionServices : BaseService<Session>, ISessionServices
    {
        public SessionServices(FitnessAppDbContext context) : base(context)
        { }
    }
}
