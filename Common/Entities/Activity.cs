using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Entities
{
    public class Activity : BaseEntity
    {
        public string? Name { get; set; }
        public string? Description { get; set; }

        public virtual List<Session> Sessions { get; set; }
    }
}
