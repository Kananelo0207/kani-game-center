using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GameCenterApi.Data;
using GameCenterApi.Models;
using GameCenterApi.DTOs;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace GameCenterApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly GameContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(GameContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserAuthDto request)
    {
        if (await _context.Players.AnyAsync(p => p.Name == request.Name))
        {
            return BadRequest("Player already exists.");
        }

        string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var newPlayer = new Player 
        { 
            Name = request.Name, 
            PasswordHash = passwordHash 
        };

        _context.Players.Add(newPlayer);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Player registered successfully!" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserAuthDto request)
    {
        var player = await _context.Players.FirstOrDefaultAsync(p => p.Name == request.Name);
        
        if (player == null || !BCrypt.Net.BCrypt.Verify(request.Password, player.PasswordHash))
        {
            return BadRequest("Invalid credentials."); 
        }

        string token = CreateToken(player);
        
        return Ok(new { token });
    }

    private string CreateToken(Player player)
    {
        var claims = new List<Claim> {
            new Claim(ClaimTypes.Name, player.Name),
            new Claim(ClaimTypes.NameIdentifier, player.Id.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _configuration.GetSection("AppSettings:Token").Value!));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var tokenDescriptor = new SecurityTokenDescriptor {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.Now.AddDays(1), 
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}