using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GameCenterApi.Data;
using GameCenterApi.Models;
using GameCenterApi.DTOs;
using GameCenterApi.Services;
using BCrypt.Net;

namespace GameCenterApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly GameContext _context;
    private readonly IAuthService _authService;

    public AuthController(GameContext context, IAuthService authService)
    {
        _context = context;
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserAuthDto request)
    {
        // Simple validation check
        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
            return BadRequest("Password must be at least 6 characters long.");

        if (await _context.Players.AnyAsync(p => p.Name == request.Name))
            return BadRequest("Player already exists.");

        var newPlayer = new Player 
        { 
            Name = request.Name, 
            PasswordHash = _authService.HashPassword(request.Password) 
        };

        _context.Players.Add(newPlayer);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Player registered successfully!" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserAuthDto request)
    {
        var player = await _context.Players.FirstOrDefaultAsync(p => p.Name == request.Name);
        
        if (player == null || !_authService.VerifyPassword(request.Password, player.PasswordHash))
        {
            return BadRequest("Invalid credentials."); 
        }

        return Ok(new { token = _authService.CreateToken(player) });
    }
}