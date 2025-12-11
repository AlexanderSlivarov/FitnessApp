using Common.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Common.Entities
{
    public class User : BaseEntity
    {      
        public string? Username { get; set; }
        public string? PasswordHash { get; set; }    
        public string? PasswordSalt { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }        
        public string? PhoneNumber { get; set; }

        public UserGender? Gender { get; set; }
        public UserRole? Role { get; set; } 

        public DateTime CreatedAt { get; set; }

        [JsonIgnore]
        public virtual List<Booking> Bookings { get; set; }
    }
}
