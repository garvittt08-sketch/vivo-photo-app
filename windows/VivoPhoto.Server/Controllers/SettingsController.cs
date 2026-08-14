using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using VivoPhoto.Core.Models;
using VivoPhoto.Infrastructure.Data;
using VivoPhoto.Infrastructure.Storage;

namespace VivoPhoto.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SettingsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly FileStorageManager _storageManager;

        public SettingsController(AppDbContext db, FileStorageManager storageManager)
        {
            _db = db;
            _storageManager = storageManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            var settings = await _db.Settings.FirstOrDefaultAsync();
            if (settings == null)
            {
                settings = new SystemSettings
                {
                    PhotoDestinationPath = _storageManager.BaseDirectory
                };
                _db.Settings.Add(settings);
                await _db.SaveChangesAsync();
            }

            return Ok(settings);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateSettings([FromBody] SystemSettings updated)
        {
            var settings = await _db.Settings.FirstOrDefaultAsync();
            if (settings == null)
            {
                settings = new SystemSettings();
                _db.Settings.Add(settings);
            }

            settings.PhotoDestinationPath = updated.PhotoDestinationPath;
            settings.FileOrganizationMode = updated.FileOrganizationMode;
            settings.SimilarityThreshold = updated.SimilarityThreshold;
            settings.WifiOnly = updated.WifiOnly;

            await _db.SaveChangesAsync();
            return Ok(settings);
        }
    }
}
