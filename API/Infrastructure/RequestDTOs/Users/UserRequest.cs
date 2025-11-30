using Common.Enums;

namespace API.Infrastructure.RequestDTOs.Users
{
    public class UserRequest
    {
        public string? Username { get; set; }
        public string? Password { get; set; }   
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PhoneNumber { get; set; }

        public UserGender? Gender { get; set; }
        public UserRole? Role { get; set; }
    }
}
