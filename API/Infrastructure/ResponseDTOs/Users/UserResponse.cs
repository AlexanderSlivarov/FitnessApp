using Common.Enums;

namespace API.Infrastructure.ResponseDTOs.Users
{
    public class UserResponse
    {
        public int Id { get; set; }

        public string Username { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }

        public UserGender? Gender { get; set; }
        public string GenderName => Gender?.ToString();

        public UserRole Role { get; set; }
        public string RoleName => Role.ToString();
    }
}
