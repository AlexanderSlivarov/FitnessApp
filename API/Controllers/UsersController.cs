using API.Infrastructure.RequestDTOs.Shared;
using API.Infrastructure.RequestDTOs.Users;
using API.Infrastructure.ResponseDTOs.Shared;
using API.Infrastructure.ResponseDTOs.Users;
using API.Services;
using Common;
using Common.Entities;
using Common.Enums;
using Common.Security;
using Common.Services.Implementations;
using Common.Services.Interfaces;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : BaseCrudController<
        User, 
        IUserServices, 
        UserRequest, 
        UserGetRequest, 
        UserResponse, 
        UserGetResponse>
    {
        public UsersController(IUserServices userService) : base(userService) { }

        protected override void PopulateEntity(User user, UserRequest model, out string error)
        {
            error = null;

            user.Username = model.Username;
            user.FirstName = model.FirstName;
            user.LastName = model.LastName;
            user.PhoneNumber = model.PhoneNumber;
            user.Gender = model.Gender;

            if (!string.IsNullOrEmpty(model.Password))
            {
                var (hash, salt) = PasswordHasher.HashPassword(model.Password);
                user.PasswordHash = hash;
                user.PasswordSalt = salt;
            }

           user.Role = model.Role ?? UserRole.Member;
        }
        protected override Expression<Func<User, bool>> GetFilter(UserGetRequest model)
        {
            model.Filter ??= new UserGetFilterRequest();

            return u =>
                (string.IsNullOrEmpty(model.Filter.Username) || 
                    (u.Username != null && u.Username.Contains(model.Filter.Username))) &&

                (string.IsNullOrEmpty(model.Filter.FirstName) || 
                    (u.FirstName != null && u.FirstName.Contains(model.Filter.FirstName))) &&

                (string.IsNullOrEmpty(model.Filter.LastName) || 
                    (u.LastName != null && u.LastName.Contains(model.Filter.LastName))) &&

                (string.IsNullOrEmpty(model.Filter.PhoneNumber) || 
                    (u.PhoneNumber != null && u.PhoneNumber.Contains(model.Filter.PhoneNumber))) &&

                (!model.Filter.Role.HasValue || 
                    (u.Role.HasValue && u.Role.Value == model.Filter.Role.Value) &&

                (!model.Filter.Gender.HasValue || 
                    (u.Gender.HasValue && u.Gender.Value == model.Filter.Gender.Value)));
        }
        protected override void PopulageGetResponse(UserGetRequest request, UserGetResponse response)
        {
            response.Filter = request.Filter;
        }

        protected override UserResponse ToResponse(User user)
        {
            return new UserResponse
            {
                Id = user.Id,
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                Gender = user.Gender,
                Role = user.Role
            };
        }
    }
}
