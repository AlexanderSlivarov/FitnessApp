using API.Services.Interfaces;
using Common.Entities;
using Common.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace API.Services.Implementations
{
    public class TokenServices : ITokenServices
    {
        public string CreateToken(User user)
        {
            Claim[] claims = new Claim[]
            {
                new Claim("loggedUserId", user.Id.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes("!AsdPasswordAsd998001!AsdPasswordAsd998001!AsdPasswordAsd998001"));
            var cred = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            JwtSecurityToken token = new JwtSecurityToken(
                issuer: "FitnessApp",
                audience: "FitnessApp",
                claims: claims,
                expires: DateTime.Now.AddHours(10),
                signingCredentials: cred
                );

            string tokenData = new JwtSecurityTokenHandler().WriteToken(token);

            return tokenData;
        }
    }
}
