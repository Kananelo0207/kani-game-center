namespace GameCenterApi.Models;

public class HighScore
{
    public int Id { get; set; }
    public int PlayerId { get; set; } 
    public string PlayerName { get; set; } = string.Empty;
    public int Points { get; set; }
    public DateTime DateSubmitted { get; set; } = DateTime.UtcNow; 
}