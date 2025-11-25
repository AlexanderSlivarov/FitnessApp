using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Entities
{
    public class User : BaseEntity
    {      
        public string? Username { get; set; }
        public string? PasswordHash { get; set; }      
        public string? FirstName { get; set; }
        public string? LastName { get; set; }        
        public string? PhoneNumber { get; set; }

        //public Role Role { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;     
    }
}
