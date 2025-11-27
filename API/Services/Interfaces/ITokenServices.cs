using Common.Entities;

namespace API.Services.Interfaces
{
    public interface ITokenServices
    {
        string CreateToken(User user);
    }
}
