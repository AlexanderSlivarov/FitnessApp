using Common.Entities;
using Common.Persistance;
using Common.Services.Interfaces;

namespace Common.Services.Implementations
{
    public class StudioServices : BaseService<Studio>, IStudioServices
    {
        public StudioServices(FitnessAppDbContext context) : base(context)
        { }
    }
}
