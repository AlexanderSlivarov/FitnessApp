using API.Infrastructure.RequestDTOs.Auth;
using API.Services;
using API.Services.Interfaces;
using Common;
using Common.Entities;
using Common.Enums;
using Common.Security;
using Common.Services.Implementations;
using Common.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserServices _userService;
        private readonly ITokenServices _tokenService;

        public AuthController(IUserServices userService, ITokenServices tokenService)
        {
            _userService = userService;
            _tokenService = tokenService;
        }

        [HttpPost]
        [Route("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromForm] RegisterUserRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }
            
            var existingUser = await _userService.GetByUsernameAsync(model.Username);
            if (existingUser != null)
            {
                ModelState.AddModelError("Global", "Username already exists.");
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }
            
            var (hash, salt) = PasswordHasher.HashPassword(model.Password);

            var user = new User
            {
                Username = model.Username,
                PasswordHash = hash,
                PasswordSalt = salt,

                FirstName = model.FirstName,
                LastName = model.LastName,
                PhoneNumber = model.PhoneNumber,
                Gender = model.Gender,

                Role = UserRole.Member,              
            };

            await _userService.SaveAsync(user);

            return Ok(new
            {
                message = "User registered successfully."
            });
        }


        [HttpPost]
        [Route("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromForm] AuthTokenRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }

            User loggedUser = await _userService.GetByUsernameAsync(model.Username);

            if (loggedUser is null)
            {
                ModelState.AddModelError("Global", "Invalid username or password.");
                return Unauthorized(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }

            bool valid = PasswordHasher.VerifyPassword(
                model.Password, 
                loggedUser.PasswordHash, 
                loggedUser.PasswordSalt
            );

            if (!valid)
            {
                ModelState.AddModelError("Global", "Invalid username or password.");
                return Unauthorized(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }

            string token = _tokenService.CreateToken(loggedUser);

            return Ok(new
            {
                token = token
            });
        }
    }
}
