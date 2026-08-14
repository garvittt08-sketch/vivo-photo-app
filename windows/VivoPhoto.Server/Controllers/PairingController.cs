using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace VivoPhoto.Server.Controllers
{
    public class PairingRequest
    {
        public string RequestId { get; set; } = Guid.NewGuid().ToString();
        public string DeviceName { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public string SecurityPin { get; set; } = string.Empty;
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public bool IsApproved { get; set; }
        public bool IsRejected { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class PairingController : ControllerBase
    {
        public static readonly ConcurrentDictionary<string, PairingRequest> PendingRequests = new();
        public static readonly ConcurrentDictionary<string, bool> ApprovedDevices = new();

        [HttpPost("request")]
        public IActionResult RequestPairing([FromBody] PairingRequest req)
        {
            if (string.IsNullOrEmpty(req.IpAddress))
            {
                req.IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
                if (req.IpAddress.StartsWith("::ffff:")) req.IpAddress = req.IpAddress.Substring(7);
            }

            // Generate 6-digit security PIN if not provided
            if (string.IsNullOrEmpty(req.SecurityPin))
            {
                req.SecurityPin = new Random().Next(100000, 999999).ToString();
            }

            req.RequestedAt = DateTime.UtcNow;
            PendingRequests[req.RequestId] = req;

            return Ok(req);
        }

        [HttpGet("pending")]
        public IActionResult GetPendingRequests()
        {
            var active = PendingRequests.Values
                .Where(r => !r.IsApproved && !r.IsRejected && (DateTime.UtcNow - r.RequestedAt).TotalMinutes < 5)
                .OrderByDescending(r => r.RequestedAt)
                .ToList();

            return Ok(active);
        }

        [HttpGet("status/{requestId}")]
        public IActionResult GetStatus(string requestId)
        {
            if (PendingRequests.TryGetValue(requestId, out var req))
            {
                return Ok(new
                {
                    requestId = req.RequestId,
                    isApproved = req.IsApproved,
                    isRejected = req.IsRejected,
                    securityPin = req.SecurityPin
                });
            }
            return NotFound();
        }

        [HttpPost("approve/{requestId}")]
        public IActionResult ApprovePairing(string requestId)
        {
            if (PendingRequests.TryGetValue(requestId, out var req))
            {
                req.IsApproved = true;
                ApprovedDevices[req.IpAddress] = true;
                return Ok(new { success = true, approved = true, ipAddress = req.IpAddress });
            }
            return NotFound();
        }

        [HttpPost("reject/{requestId}")]
        public IActionResult RejectPairing(string requestId)
        {
            if (PendingRequests.TryGetValue(requestId, out var req))
            {
                req.IsRejected = true;
                return Ok(new { success = true, rejected = true });
            }
            return NotFound();
        }
    }
}
