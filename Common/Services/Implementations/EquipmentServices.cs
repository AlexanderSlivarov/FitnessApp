using Common.Entities;
using Common.Persistance;
using Common.Services.Interfaces;

namespace Common.Services.Implementations
{
    public class EquipmentServices : BaseService<Equipment>, IEquipmentServices
    {
        public EquipmentServices(FitnessAppDbContext context) : base(context) 
        { }
    }
}
