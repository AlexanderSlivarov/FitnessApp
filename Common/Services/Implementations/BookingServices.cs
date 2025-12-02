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
    public class BookingServices : BaseService<Booking>, IBookingServices
    {
        public BookingServices(FitnessAppDbContext context) : base(context) { }
    }
}
