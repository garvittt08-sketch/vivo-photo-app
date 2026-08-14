using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VivoPhoto.Core.Interfaces;

namespace VivoPhoto.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NetworkController : ControllerBase
    {
        private readonly INetworkScanner _networkScanner;

        public NetworkController(INetworkScanner networkScanner)
        {
            _networkScanner = networkScanner;
        }

        [HttpGet("devices")]
        public async Task<IActionResult> GetConnectedDevices()
        {
            var devices = await _networkScanner.ScanSubnetAsync();
            return Ok(new
            {
                totalDevices = devices.Count,
                devices
            });
        }
    }
}
