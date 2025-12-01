using Common.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Common.Services.Interfaces
{
    public interface IStudioServices : IBaseService<Studio> 
    {
        Task<List<Studio>> GetStudiosAsync(Expression<Func<Studio, bool>> filter);
    }    
}
