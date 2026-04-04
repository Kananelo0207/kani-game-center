using System.ComponentModel.DataAnnotations.Schema;

namespace GameCenterApi.Models;

public class HighScore
{
    public int Id { get; set; } // Database ID
    public int PlayerId { get; set; } // The ID the controller is looking for!
    public string PlayerName { get; set; } = string.Empty;
    public int Points { get; set; }
    
    [Column(TypeName = "timestamp without time zone")]
    public DateTime DateSubmitted { get; set; } = DateTime.UtcNow;
}