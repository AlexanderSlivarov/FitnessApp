using Common.Entities;
using Common.Enums;
using Common.Persistance;
using Common.Services.Interfaces;

namespace Common.Services.Implementations
{
    public class InstructorServices : BaseService<Instructor>, IInstructorServices
    {
        public InstructorServices(FitnessAppDbContext context) : base(context)
        { }       
    }
}
