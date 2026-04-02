using System.Text.Json.Serialization;

public class LoginRequest
{
    [JsonPropertyName("name")] 
    public string Name { get; set; }

    [JsonPropertyName("password")] 
    public string Password { get; set; }
}