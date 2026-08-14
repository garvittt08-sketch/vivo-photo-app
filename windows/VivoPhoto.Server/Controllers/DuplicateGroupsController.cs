using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using VivoPhoto.Core.Models;
using VivoPhoto.Infrastructure.Data;

namespace VivoPhoto.Server.Controllers
{
    [ApiController]
    [Route("api/duplicate-groups")]
    public class DuplicateGroupsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public DuplicateGroupsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetGroups([FromQuery] GroupType? type)
        {
            var query = _db.DuplicateGroups.Include(g => g.Items).ThenInclude(i => i.Analysis).AsQueryable();
            if (type.HasValue)
            {
                query = query.Where(g => g.GroupType == type.Value);
            }

            var groups = await query.ToListAsync();
            return Ok(groups);
        }

        public record SelectBestRequest(string GroupId, string MediaItemId);

        [HttpPost("select-best")]
        public async Task<IActionResult> SelectBestPhoto([FromBody] SelectBestRequest req)
        {
            var group = await _db.DuplicateGroups.Include(g => g.Items).FirstOrDefaultAsync(g => g.Id == req.GroupId);
            if (group == null) return NotFound(new { error = "Group not found" });

            foreach (var item in group.Items)
            {
                item.IsSelectedAsBest = (item.Id == req.MediaItemId);
                item.ReviewStatus = item.IsSelectedAsBest ? "ManualSelected" : "Candidate";
            }

            group.SelectedMediaId = req.MediaItemId;
            group.IsUserReviewed = true;

            await _db.SaveChangesAsync();
            return Ok(new { success = true, selectedId = req.MediaItemId });
        }
    }
}
