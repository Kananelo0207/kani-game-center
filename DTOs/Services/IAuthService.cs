using GameCenterApi.Models;

namespace GameCenterApi.Services;

public interface IAuthService
{
    string CreateToken(Player player);
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}