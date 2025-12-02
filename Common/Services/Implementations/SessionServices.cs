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
    public class SessionServices : BaseService<Session>, ISessionServices
    {
        public SessionServices(FitnessAppDbContext context) : base(context)
        { }
    }
}
