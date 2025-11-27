using API.Infrastructure.RequestDTOs.Auth;
using API.Services;
using API.Services.Interfaces;
using Common;
using Common.Entities;
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
        [Route("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromForm] AuthTokenRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ServiceResultExtentions<List<Error>>.Failure(null, ModelState));
            }

            User loggedUser = await _userService.GetByUsernameAsync(model.Username);

            if (loggedUser == null)
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
