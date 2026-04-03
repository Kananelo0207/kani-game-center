using Microsoft.EntityFrameworkCore;
using GameCenterApi.Models;

namespace GameCenterApi.Data;

public class GameContext : DbContext
{
    public GameContext(DbContextOptions<GameContext> options) : base(options) { }

    public DbSet<Player> Players { get; set; }
    
    // This tells the database to create a table for High Scores
    public DbSet<HighScore> HighScores => Set<HighScore>();
}