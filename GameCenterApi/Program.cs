using Microsoft.EntityFrameworkCore;
using GameCenterApi.Services;
using GameCenterApi.Models;
using GameCenterApi.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer; 
using Microsoft.IdentityModel.Tokens;               
using System.Text;                                    

var builder = WebApplication.CreateBuilder(args);

// 1. DATABASE CONNECTION (Now using Absolute Path for Cloud)
// This ensures Render finds the database file no matter what folder it starts in.
var dbPath = Path.Combine(AppContext.BaseDirectory, "GameCenterLive.db");
builder.Services.AddDbContext<GameContext>(options =>
    options.UseSqlite($"Data Source={dbPath}")); 

// 2. REGISTER YOUR AUTH SERVICE
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

// 4. CORS POLICY
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

// 5. AUTO-MIGRATION (The "Table Builder")
// This runs every time the app starts to ensure the 'Players' table exists.
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<GameContext>();
    context.Database.EnsureCreated();
}

// 6. CONFIGURE PIPELINE
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// NOTE: UseHttpsRedirection is commented out for Render compatibility
// app.UseHttpsRedirection();

app.UseDefaultFiles(); 
app.UseStaticFiles();  
app.UseCors("AllowAll"); 

app.UseAuthentication(); 
app.UseAuthorization();  

app.MapControllers();

app.Run();