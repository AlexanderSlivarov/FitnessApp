using Common.Entities;
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
    public class ActivityServices : BaseService<Activity>, IActivityServices
    {       
        public ActivityServices(FitnessAppDbContext context) : base(context)
        { }     
    }
}
