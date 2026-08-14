using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.IO;
using VivoPhoto.Core.Interfaces;
using VivoPhoto.Infrastructure.Data;
using VivoPhoto.Infrastructure.Discovery;
using VivoPhoto.Infrastructure.Services;
using VivoPhoto.Infrastructure.Storage;
using VivoPhoto.Infrastructure.Transfer;
using VivoPhoto.Server.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add Controllers and SignalR
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();

// SQLite EF Core
string dbPath = Path.Combine(builder.Environment.ContentRootPath, "vivophoto.db");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

// Singletons & Services
builder.Services.AddSingleton<FileStorageManager>(sp => new FileStorageManager(@"E:\Vivo Photo"));
builder.Services.AddSingleton<ITransferManager, ChunkedTransferReceiver>();
builder.Services.AddTransient<ISimilarityEngine, SimilarityEngine>();
builder.Services.AddHostedService<UdpDiscoveryServer>();

// CORS configuration for local dashboard & phone connection
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllLocal", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Ensure DB is created
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.UseCors("AllowAllLocal");
app.UseAuthorization();

app.MapControllers();
app.MapHub<TransferHub>("/hubs/transfer");

app.Run("http://0.0.0.0:5000");
