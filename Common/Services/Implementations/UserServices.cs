using Common.Entities;
using Common.Persistance;
using Common.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Common.Services.Implementations
{
    public class UserServices : BaseService<User>, IUserServices 
    {
        public UserServices(FitnessAppDbContext context) : base(context) { }

        public async Task<User> GetByUsernameAsync(string username)
        {
            return await _items.FirstOrDefaultAsync(u => u.Username == username);
        }
    }
}
