using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Cryptography;
using System.Threading.Tasks;
using VivoPhoto.Core.Models;
using VivoPhoto.Infrastructure.Data;

namespace VivoPhoto.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DevicesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public DevicesController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetDevices()
        {
            var devices = await _db.Devices.ToListAsync();
            return Ok(devices);
        }

        public record PairRequest(string DeviceName, string Model, string IpAddress, string PairCode);

        [HttpPost("pair")]
        public async Task<IActionResult> PairDevice([FromBody] PairRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.DeviceName))
            {
                return BadRequest(new { error = "Device name is required" });
            }

            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
            var device = new Device
            {
                DeviceName = req.DeviceName,
                Model = req.Model ?? "Vivo Device",
                IpAddress = req.IpAddress ?? HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
                AuthToken = token,
                IsPaired = true,
                FirstPairedAt = DateTime.UtcNow,
                LastSeenAt = DateTime.UtcNow
            };

            _db.Devices.Add(device);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                deviceId = device.Id,
                authToken = token,
                deviceName = device.DeviceName,
                message = "Device paired successfully"
            });
        }
    }
}
