using Common.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Common.Entities
{
    public class Membership : BaseEntity
    {
        public string? Name { get; set; }
        public double Price { get; set; }

        public int Duration { get; set; }
        public DurationType DurationType { get; set; }

        public string? Description { get; set; }

        [JsonIgnore]
        public virtual List<Subscription> Subscriptions { get; set; } = new();
    }
}
