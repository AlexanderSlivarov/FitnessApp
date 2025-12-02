using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Entities
{
    public class Studio : BaseEntity
    {
        public string? Name { get; set; }
        public string? Location { get; set; }
        public int Capacity { get; set; }        
    }
}
