using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using GameCenterApi.Data;
using GameCenterApi.Models;
using Microsoft.EntityFrameworkCore;
using GameCenterApi.DTOs; 

namespace GameCenterApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] 
public class GameController : ControllerBase
{
    private readonly GameContext _context;

    public GameController(GameContext context)
    {
        _context = context;
    }

    [HttpGet("me")]
    public IActionResult GetMyProfile()
    {
        var userName = User.Identity?.Name;
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return Ok(new { 
            message = $"Welcome back, {userName}!",
            id = userId 
        });
    }

    [HttpPost("submit-score")]
    public async Task<IActionResult> SubmitScore([FromBody] ScoreDto scoreDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var userName = User.Identity?.Name;

        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var score = new HighScore
        {
            PlayerId = int.Parse(userId), 
            PlayerName = userName!,
            Points = scoreDto.Points,
            DateSubmitted = DateTime.UtcNow
        };

        _context.HighScores.Add(score);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Score of {scoreDto.Points} saved for {userName}!" });
    }

    [HttpGet("leaderboard")]
    [AllowAnonymous] 
    public async Task<IActionResult> GetLeaderboard()
    {
        // This query groups by name so each player only appears once with their total career points
        var leaderboard = await _context.HighScores
            .GroupBy(s => s.PlayerName)
            .Select(g => new 
            { 
                PlayerName = g.Key, 
                TotalPoints = g.Sum(s => s.Points) 
            })
            .OrderByDescending(s => s.TotalPoints)
            .Take(200) // CHANGED: Now supporting a massive Top 200 Hall of Fame!
            .ToListAsync();

        return Ok(leaderboard);
    }
}