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
public class GameController : ControllerBase
{
    private readonly GameContext _context;

    public GameController(GameContext context)
    {
        _context = context;
    }

    [HttpGet("me"), Authorize]
    public IActionResult GetMyProfile()
    {
        var userName = User.FindFirstValue(ClaimTypes.Name);
        return Ok(new { message = $"Welcome back, {userName}!" });
    }

    [HttpPost("submit-score"), Authorize]
    public async Task<IActionResult> SubmitScore([FromBody] ScoreDto scoreDto) // Use the DTO here
    {
        var userName = User.FindFirstValue(ClaimTypes.Name);

        var score = new HighScore
        {
            PlayerName = userName!,
            Points = scoreDto.Points // Pull the points from the DTO
        };

        _context.HighScores.Add(score);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Score of {scoreDto.Points} saved for {userName}!" });
    }

    [HttpGet("leaderboard")]
    public async Task<IActionResult> GetLeaderboard()
    {
        var leaderboard = await _context.HighScores
            .GroupBy(s => s.PlayerName)
            .Select(g => new 
            { 
                PlayerName = g.Key, 
                TotalPoints = g.Sum(s => s.Points) 
            })
            .OrderByDescending(s => s.TotalPoints)
            .Take(10)
            .ToListAsync();

        return Ok(leaderboard);
    }
}