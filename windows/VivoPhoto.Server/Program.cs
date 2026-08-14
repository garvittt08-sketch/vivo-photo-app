using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using VivoPhoto.Core.Interfaces;
using VivoPhoto.Infrastructure.Data;
using VivoPhoto.Infrastructure.Discovery;
using VivoPhoto.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// SQLite Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=vivophoto.db"));

// Core Infrastructure Services
builder.Services.AddSingleton<ITransferManager, FileTransferManager>();
builder.Services.AddScoped<ISimilarityEngine, SimilarityEngine>();
builder.Services.AddSingleton<INetworkScanner, NetworkScanner>();

// Hosted background UDP discovery service
builder.Services.AddHostedService<UdpDiscoveryServer>();

// CORS policy for Web Dashboard & Android App
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllLocal", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Ensure Database Schema is Created
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.UseCors("AllowAllLocal");
app.UseAuthorization();

// Root & API landing endpoints for clean browser health checks
app.MapGet("/", () => Results.Ok(new
{
    status = "Online",
    server = "Vivo Photo Server",
    version = "1.0.0",
    time = DateTime.UtcNow
}));

app.MapGet("/api", () => Results.Ok(new
{
    status = "Online",
    endpoints = new[]
    {
        "/api/media/stats",
        "/api/media",
        "/api/network/devices",
        "/api/pairing/pending"
    }
}));

app.MapControllers();

// Listen on HTTP Port 5000 across all local interfaces (0.0.0.0)
app.Run("http://0.0.0.0:5000");
