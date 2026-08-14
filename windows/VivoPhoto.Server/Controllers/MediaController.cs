using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VivoPhoto.Core.Interfaces;
using VivoPhoto.Core.Models;
using VivoPhoto.Infrastructure.Data;
using VivoPhoto.Infrastructure.Services;

namespace VivoPhoto.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MediaController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ISimilarityEngine _similarityEngine;

        public MediaController(AppDbContext db, ISimilarityEngine similarityEngine)
        {
            _db = db;
            _similarityEngine = similarityEngine;
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
            int totalPhotos = await _db.MediaItems.CountAsync(m => !m.IsVideo);
            int totalVideos = await _db.MediaItems.CountAsync(m => m.IsVideo);
            int selectedCount = await _db.MediaItems.CountAsync(m => m.IsSelectedAsBest);
            int exactDuplicates = await _db.DuplicateGroups.CountAsync(g => g.GroupType == GroupType.ExactDuplicate);
            int similarGroups = await _db.DuplicateGroups.CountAsync(g => g.GroupType == GroupType.SimilarPhoto);
            int needsReview = await _db.DuplicateGroups.CountAsync(g => g.ConfidenceScore < 70.0);

            // Returns EXACT real database counts (0 if brand new database)
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

            string clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";
            if (clientIp.StartsWith("::ffff:")) clientIp = clientIp.Substring(7);
            if (!string.IsNullOrEmpty(clientIp) && !string.IsNullOrEmpty(items[0].DeviceId))
            {
                NetworkScanner.RegisterDeviceModel(clientIp, items[0].DeviceId);
            }

            foreach (var item in items)
            {
                var existing = await _db.MediaItems.FirstOrDefaultAsync(m => m.AndroidMediaId == item.AndroidMediaId);
                if (existing == null)
                {
                    _db.MediaItems.Add(item);
                }
            }

            await _db.SaveChangesAsync();

            // Run exact & similarity grouping
            var allItems = await _db.MediaItems.ToListAsync();
            var exactGroups = _similarityEngine.GroupExactDuplicates(allItems);
            foreach (var grp in exactGroups)
            {
                if (!await _db.DuplicateGroups.AnyAsync(g => g.Id == grp.Id))
                {
                    _db.DuplicateGroups.Add(grp);
                }
            }
            await _db.SaveChangesAsync();

            return Ok(new { success = true, ingested = items.Count });
        }
    }
}
