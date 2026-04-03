using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration; 
using GameCenterApi.Models;

namespace GameCenterApi.Services;

public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;

    public AuthService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string CreateToken(Player player)
    {
        var claims = new List<Claim> 
        {
            new Claim(ClaimTypes.Name, player.Name),
            new Claim(ClaimTypes.NameIdentifier, player.Id.ToString())
        };

        // This pulls the secret key you set in Render or appsettings.json
        var tokenKey = _configuration.GetSection("AppSettings:Token").Value;
        
        if (string.IsNullOrEmpty(tokenKey))
            throw new Exception("JWT Token Key is missing! Check your environment variables.");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var tokenDescriptor = new SecurityTokenDescriptor 
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(1), 
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    public string HashPassword(string password) => BCrypt.Net.BCrypt.HashPassword(password);
    public bool VerifyPassword(string password, string hash) => BCrypt.Net.BCrypt.Verify(password, hash);
}