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
    public class StudioServices : BaseService<Studio>, IStudioServices
    {
        public readonly FitnessAppDbContext _context;
        public StudioServices(FitnessAppDbContext context) : base(context) 
        {
            _context = context;
        }

        public async Task<List<Studio>> GetStudiosAsync(Expression<Func<Studio, bool>> filter)
        {
            return await _context.Studios
                .Where(filter)
                .ToListAsync();
        }
    }
}
