using API.Infrastructure.RequestDTOs.Users;
using API.Infrastructure.ResponseDTOs.Shared;
using Common.Entities;

namespace API.Infrastructure.ResponseDTOs.Users
{
    public class UserGetResponse : BaseGetResponse<UserResponse, UserGetFilterRequest>
    { }
}
