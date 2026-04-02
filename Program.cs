using Microsoft.EntityFrameworkCore;
using GameCenterApi.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer; 
using Microsoft.IdentityModel.Tokens;              
using System.Text;                                  

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<GameContext>(options =>
    options.UseSqlite("Data Source=game.db")); 

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8
                .GetBytes(builder.Configuration.GetSection("AppSettings:Token").Value!)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowGitHubPages", policy =>
    {
        
        policy.WithOrigins("https://YOUR-GITHUB-USERNAME.github.io") 
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); 
    });
});
builder.Services.AddOpenApi();
builder.Services.AddScoped<IAuthService, AuthService>();
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseDefaultFiles(); 

app.UseStaticFiles();  
app.UseCors("AllowGitHubPages");

app.UseAuthentication(); 
app.UseAuthorization();  

app.MapControllers();
app.Run();