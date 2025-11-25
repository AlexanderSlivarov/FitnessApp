using Common.Entities;
using Common.Persistance;
using Common.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Services.Implementations
{
    public class UserServices : BaseService<User>, IUserServices 
    {
        public UserServices(FitnessAppDbContext context) : base(context) { }
    }
}
