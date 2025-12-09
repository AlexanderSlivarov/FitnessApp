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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using FluentValidation.AspNetCore;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserServices _userService;      
        public UsersController(IUserServices userService)
        {
            _userService = userService;         
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] UserGetRequest model)
        {
            model.Pager ??= new PagerRequest();
            model.Pager.Page = model.Pager.Page <= 0
                                    ? 1
                                    : model.Pager.Page;
            model.Pager.PageSize = model.Pager.PageSize <= 0
                                        ? 10
                                        : model.Pager.PageSize;
            model.OrderBy ??= "Id";
            model.OrderBy = typeof(User).GetProperty(model.OrderBy) != null
                                ? model.OrderBy
                                : "Id";

            model.Filter ??= new UserGetFilterRequest();

            Expression<Func<User, bool>> filter =
            u =>
                (string.IsNullOrEmpty(model.Filter.Username) || (u.Username != null && u.Username.Contains(model.Filter.Username))) &&
                (string.IsNullOrEmpty(model.Filter.FirstName) || (u.FirstName != null && u.FirstName.Contains(model.Filter.FirstName))) &&
                (string.IsNullOrEmpty(model.Filter.LastName) || (u.LastName != null && u.LastName.Contains(model.Filter.LastName))) &&
                (string.IsNullOrEmpty(model.Filter.PhoneNumber) || (u.PhoneNumber != null && u.PhoneNumber.Contains(model.Filter.PhoneNumber))) &&
                (!model.Filter.Role.HasValue || u.Role.Equals(model.Filter.Role)) &&
                (!model.Filter.Gender.HasValue || (u.Gender.HasValue && u.Gender.Value.Equals(model.Filter.Gender.Value)));

            UserGetResponse response = new UserGetResponse();

            response.Pager = new PagerResponse();
            response.Pager.Page = model.Pager.Page;
            response.Pager.PageSize = model.Pager.PageSize;

            response.OrderBy = model.OrderBy;
            response.SortAsc = model.SortAsc;

            response.Filter = model.Filter;

            response.Pager.Count = _userService.Count(filter);

            List<User> users = await _userService.GetAllAsync(
                                                     filter,
                                                     model.OrderBy,
                                                     model.SortAsc,
                                                     model.Pager.Page,
                                                     model.Pager.PageSize);

            if (users is null || !users.Any())
            {
                return NotFound("No activities found matching the given criteria.");
            }

            response.Items = users
                .Select(u => new UserResponse
                {
                    Id = u.Id,
                    Username = u.Username,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    PhoneNumber = u.PhoneNumber,
                    Gender = u.Gender,
                    Role = u.Role
                })
                .ToList();

            return Ok(ServiceResult<UserGetResponse>.Success(response));
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> Get([FromRoute] int id)
        {
            User user = await _userService.GetByIdAsync(id);

            if (user is null)
            {
                return NotFound("User not found.");
            }

            return Ok(ServiceResult<User>.Success(user));
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody][CustomizeValidator(RuleSet = "Create")] UserRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }

            var (hash, salt) = PasswordHasher.HashPassword(model.Password);

            User newUser = new User
            {
                Username = model.Username,
                PasswordHash = hash,
                PasswordSalt = salt,
                FirstName = model.FirstName,
                LastName = model.LastName,
                PhoneNumber = model.PhoneNumber,
                Gender = model.Gender,
                Role = UserRole.Member
            };

            await _userService.SaveAsync(newUser);

            return Ok(ServiceResult<User>.Success(newUser));
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> Put([FromRoute] int id, [FromBody][CustomizeValidator(RuleSet = "Update")] UserRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }

            User userForUpdate = await _userService.GetByIdAsync(id);

            if (userForUpdate is null)
            {
                return NotFound("User not found.");
            }

            userForUpdate.Username = model.Username;
            userForUpdate.FirstName = model.FirstName;
            userForUpdate.LastName = model.LastName;
            userForUpdate.PhoneNumber = model.PhoneNumber;
            userForUpdate.Gender = model.Gender;

            if (!string.IsNullOrEmpty(model.Password))
            {
                var (hash, salt) = PasswordHasher.HashPassword(model.Password);
                userForUpdate.PasswordHash = hash;
                userForUpdate.PasswordSalt = salt;
            }          

            await _userService.SaveAsync(userForUpdate);

            return Ok(ServiceResult<User>.Success(userForUpdate));
        }

        [HttpDelete]
        [Route("{id}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            User userForDelete = await _userService.GetByIdAsync(id);

            if (userForDelete is null)
            {
                return NotFound("User not found.");
            }

            await _userService.DeleteAsync(userForDelete);

            return Ok(ServiceResult<User>.Success(userForDelete));
        }
    }
}
