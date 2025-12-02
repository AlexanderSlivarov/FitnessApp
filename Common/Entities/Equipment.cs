using Common.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Entities
{
    public class Equipment : BaseEntity
    {
        public int StudioId { get; set; }

        public string? Name { get; set; }
        public int Quantity { get; set; }
        public EquipmentCondition Condition { get; set; }

        public virtual Studio Studio { get; set; }
    }
}
