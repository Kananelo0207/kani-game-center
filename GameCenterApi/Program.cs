using Microsoft.EntityFrameworkCore;
using GameCenterApi.Services;
using GameCenterApi.Models;
using GameCenterApi.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer; 
using Microsoft.IdentityModel.Tokens;               
using System.Text;                                    

var builder = WebApplication.CreateBuilder(args);

// 1. DATABASE CONNECTION
builder.Services.AddDbContext<GameContext>(options =>
    options.UseSqlite("Data Source=game.db")); 

// 2. REGISTER YOUR AUTH SERVICE (The Missing Link)
builder.Services.AddScoped<IAuthService, AuthService>();

// 3. JWT AUTHENTICATION
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

// 4. CORS POLICY (Updated to Allow All for easier testing)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin() 
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddOpenApi();

var app = builder.Build();

// 5. CONFIGURE PIPELINE
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Order matters here!
app.UseHttpsRedirection();
app.UseDefaultFiles(); 
app.UseStaticFiles();  
app.UseCors("AllowAll"); 

app.UseAuthentication(); 
app.UseAuthorization();  

app.MapControllers();
app.Run();