using Common.Entities;
using Common.Enums;
using Common.Persistance;
using Common.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Common.Services.Implementations
{
    public class InstructorServices : BaseService<Instructor>, IInstructorServices
    {
        public InstructorServices(FitnessAppDbContext context) : base(context)
        { }       
    }
}
