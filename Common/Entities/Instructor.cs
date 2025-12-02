using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Entities
{
    public class Instructor : BaseEntity
    {
        public int UserId { get; set; }
        public string? Bio { get; set; }
        public int ExperienceYears { get; set; }

        public virtual User User { get; set; }       
    }
}
