using Microsoft.EntityFrameworkCore;
using VivoPhoto.Core.Models;

namespace VivoPhoto.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Device> Devices { get; set; } = null!;
        public DbSet<MediaItem> MediaItems { get; set; } = null!;
        public DbSet<AnalysisResult> AnalysisResults { get; set; } = null!;
        public DbSet<DuplicateGroup> DuplicateGroups { get; set; } = null!;
        public DbSet<TransferSession> TransferSessions { get; set; } = null!;
        public DbSet<SystemSettings> Settings { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Device>().HasKey(d => d.Id);
            modelBuilder.Entity<MediaItem>().HasKey(m => m.Id);
            modelBuilder.Entity<AnalysisResult>().HasKey(a => a.Id);
            modelBuilder.Entity<DuplicateGroup>().HasKey(g => g.Id);
            modelBuilder.Entity<TransferSession>().HasKey(t => t.Id);
            modelBuilder.Entity<SystemSettings>().HasKey(s => s.Id);

            modelBuilder.Entity<MediaItem>()
                .HasOne(m => m.Analysis)
                .WithOne()
                .HasForeignKey<AnalysisResult>(a => a.MediaItemId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DuplicateGroup>()
                .HasMany(g => g.Items)
                .WithOne()
                .HasForeignKey(m => m.DuplicateGroupId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
