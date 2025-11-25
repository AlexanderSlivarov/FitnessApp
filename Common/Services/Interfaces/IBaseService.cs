using Common.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Common.Services.Interfaces
{
    public interface IBaseService<T> where T : BaseEntity
    {
        Task<List<T>> GetAllAsync(Expression<Func<T, bool>>? filter = null, string? orderBy = null, bool sortAsc = false, int page = 1, int pageSize = int.MaxValue);
        Task<T> GetByIdAsync(int id);
        Task SaveAsync(T item);
        Task DeleteAsync(T item);
    }
}
