using API.Infrastructure.RequestDTOs.Shared;
using API.Infrastructure.RequestDTOs.Users;
using Common.Entities;
using Common.Enums;
using Common.Services.Implementations;
using Common.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserServices _userService;
        private readonly PasswordHasher<User> _passwordHasher;
        public UsersController(IUserServices userService)
        {
            _userService = userService;
            _passwordHasher = new PasswordHasher<User>();
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromBody] UserGetRequest model)
        {            
            model.Pager = model.Pager ?? new PagerRequest();
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
                (string.IsNullOrEmpty(model.Filter.Username) || u.Username.Contains(model.Filter.Username)) &&
                (string.IsNullOrEmpty(model.Filter.FirstName) || u.FirstName.Contains(model.Filter.FirstName)) &&
                (string.IsNullOrEmpty(model.Filter.LastName) || u.LastName.Contains(model.Filter.LastName)) &&
                (string.IsNullOrEmpty(model.Filter.PhoneNumber) || u.PhoneNumber.Contains(model.Filter.PhoneNumber)) &&
                (!model.Filter.Role.HasValue || u.Role.Equals(model.Filter.Role.Value));

            List<User> users = await _userService.GetAllAsync(filter, model.OrderBy, model.SortAsc, model.Pager.Page, model.Pager.PageSize);

            if (users == null || !users.Any())
            {
                return NotFound("No users found matching the given criteria.");
            }

            return Ok(users);
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> Get([FromRoute] int id)
        {
            User user = await _userService.GetByIdAsync(id);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            return Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] UserRequest model)
        {
            var hashedPassword = _passwordHasher.HashPassword(null, model.Password);

            var newUser = new User
            {
                Username = model.Username,
                PasswordHash = hashedPassword,
                FirstName = model.FirstName,
                LastName = model.LastName,
                PhoneNumber = model.PhoneNumber,
                Role = model.Role ?? UserRole.Member
            };

            await _userService.SaveAsync(newUser);

            return CreatedAtAction(nameof(Get), new { Id = newUser.Id, }, newUser);
        }

        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> Put([FromRoute] int id, [FromBody] UserRequest model)
        {
            User userForUpdate = await _userService.GetByIdAsync(id);

            if (userForUpdate == null)
            {
                return NotFound("User not found.");
            }

            userForUpdate.Username = model.Username;
            userForUpdate.FirstName = model.FirstName;
            userForUpdate.LastName = model.LastName;
            userForUpdate.PhoneNumber = model.PhoneNumber;

            if (!string.IsNullOrEmpty(model.Password))
            {
                userForUpdate.PasswordHash = _passwordHasher.HashPassword(userForUpdate, model.Password);
            }
            if (model.Role.HasValue)
            {
                userForUpdate.Role = model.Role.Value;
            }

            await _userService.SaveAsync(userForUpdate);

            return NoContent();
        }

        [HttpDelete]
        [Route("{id}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            User userForDelete = await _userService.GetByIdAsync(id);

            if (userForDelete == null)
            {
                return NotFound("User not found.");
            }

            await _userService.DeleteAsync(userForDelete);

            return NoContent();
        }
    }
}
