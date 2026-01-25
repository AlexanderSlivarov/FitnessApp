using Common.Entities;
using Common.Persistance;
using Common.Services.Interfaces;

namespace Common.Services.Implementations
{
    public class BookingServices : BaseService<Booking>, IBookingServices
    {
        public BookingServices(FitnessAppDbContext context) : base(context) { }
    }
}
