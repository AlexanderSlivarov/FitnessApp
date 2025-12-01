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
        private readonly FitnessAppDbContext _context;
        public SessionServices(FitnessAppDbContext context) : base(context) 
        {
            _context = context;
        }

        public async Task<List<Session>> GetSessionsAsync(Expression<Func<Session, bool>> filter)
        {
            return await _context.Sessions
                .Include(s => s.Instructor)
                    .ThenInclude(i => i.User)
                .Include(s => s.Activity)
                .Include(s => s.Studio)
                .Where(filter)
                .ToListAsync();
        }
    }
}
