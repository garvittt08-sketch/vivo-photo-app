using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VivoPhoto.Core.Models;
using VivoPhoto.Infrastructure.Data;

namespace VivoPhoto.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MediaController : ControllerBase
    {
        private readonly AppDbContext _db;

        public MediaController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetMedia([FromQuery] string? status, [FromQuery] bool? onlySelected)
        {
            var query = _db.MediaItems.Include(m => m.Analysis).AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(m => m.ReviewStatus == status);
            }

            if (onlySelected.HasValue && onlySelected.Value)
            {
                query = query.Where(m => m.IsSelectedAsBest);
            }

            var items = await query.ToListAsync();
            return Ok(items);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            int totalScanned = await _db.MediaItems.CountAsync();
            int totalPhotos = await _db.MediaItems.CountAsync(m => m.MediaType == MediaType.Photo);
            int totalVideos = await _db.MediaItems.CountAsync(m => m.MediaType == MediaType.Video);
            int selectedCount = await _db.MediaItems.CountAsync(m => m.IsSelectedAsBest);
            int exactDuplicates = await _db.DuplicateGroups.CountAsync(g => g.GroupType == GroupType.ExactDuplicate);
            int similarGroups = await _db.DuplicateGroups.CountAsync(g => g.GroupType == GroupType.SimilarPhoto);
            int needsReview = await _db.DuplicateGroups.CountAsync(g => g.ConfidenceScore < 70.0);

            return Ok(new
            {
                totalScanned,
                totalPhotos,
                totalVideos,
                selectedCount,
                exactDuplicates,
                similarGroups,
                needsReview
            });
        }

        [HttpPost("batch")]
        public async Task<IActionResult> IngestBatch([FromBody] List<MediaItem> items)
        {
            if (items == null || items.Count == 0)
                return BadRequest(new { error = "Empty batch" });

            foreach (var item in items)
            {
                var existing = await _db.MediaItems.FirstOrDefaultAsync(m => m.AndroidMediaId == item.AndroidMediaId);
                if (existing == null)
                {
                    _db.MediaItems.Add(item);
                }
            }

            await _db.SaveChangesAsync();
            return Ok(new { success = true, ingested = items.Count });
        }
    }
}
