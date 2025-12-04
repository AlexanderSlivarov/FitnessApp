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
    public class BaseService<T> : IBaseService<T> where T : BaseEntity
    {
        protected DbContext _context;
        protected DbSet<T> _items;

        public BaseService(FitnessAppDbContext context)
        {
            _context = context;
            _items = _context.Set<T>();

        }
        public async Task<List<T>> GetAllAsync(Expression<Func<T, bool>>? filter = null, string? orderBy = null, bool sortAsc = false, int page = 1, int pageSize = int.MaxValue)
        {
            var query = _items.AsQueryable();

            if (filter is not null)
            {
                query = query.Where(filter);
            }

            if (!string.IsNullOrEmpty(orderBy))
            {
                if (sortAsc)
                {
                    query = query.OrderBy(e => EF.Property<object>(e, orderBy));
                }
                else
                {
                    query = query.OrderByDescending(e => EF.Property<object>(e, orderBy));
                }
            }

            query = query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize);

            return await query.ToListAsync();
        }
        public int Count(Expression<Func<T, bool>> filter = null)
        {
            var query = _items.AsQueryable();

            if (filter != null)
            {
                query = query.Where(filter);
            }

            return query.Count();
        }
        public async Task<T> GetByIdAsync(int id)
        {
            return await _items.FirstOrDefaultAsync(u => u.Id == id);
        }
        public async Task SaveAsync(T item)
        {            

            if (item.Id > 0)
            {
                _items.Update(item);
            }
            else
            {
                _items.Add(item);
            }

           await _context.SaveChangesAsync();
        }
        public async Task DeleteAsync(T item)
        {            
            _items.Remove(item);
            await _context.SaveChangesAsync();
        }

        public virtual IQueryable<T> Query()
        {
            return _items.AsQueryable();
        }        
    }
}
