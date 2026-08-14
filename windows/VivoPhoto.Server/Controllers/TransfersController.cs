using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Threading.Tasks;
using VivoPhoto.Core.Interfaces;
using VivoPhoto.Core.Models;
using VivoPhoto.Infrastructure.Data;

namespace VivoPhoto.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransfersController : ControllerBase
    {
        private readonly ITransferManager _transferManager;
        private readonly AppDbContext _db;

        public TransfersController(ITransferManager transferManager, AppDbContext db)
        {
            _transferManager = transferManager;
            _db = db;
        }

        public record StartSessionRequest(string MediaItemId, string FileName, long TotalBytes, string SourceSha256);

        [HttpPost("start")]
        public async Task<IActionResult> StartSession([FromBody] StartSessionRequest req)
        {
            if (string.IsNullOrEmpty(req.MediaItemId) || string.IsNullOrEmpty(req.SourceSha256))
            {
                return BadRequest(new { error = "Invalid session request parameters" });
            }

            var session = await _transferManager.StartOrResumeSessionAsync(
                req.MediaItemId, req.FileName, req.TotalBytes, req.SourceSha256);

            return Ok(session);
        }

        [HttpPost("chunk")]
        public async Task<IActionResult> UploadChunk(
            [FromHeader(Name = "X-Session-Id")] string sessionId,
            [FromHeader(Name = "X-Chunk-Offset")] long offset,
            IFormFile file)
        {
            if (string.IsNullOrEmpty(sessionId) || file == null)
            {
                return BadRequest(new { error = "Missing session ID or chunk payload" });
            }

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            byte[] chunkData = ms.ToArray();

            var session = await _transferManager.ReceiveChunkAsync(sessionId, offset, chunkData);
            return Ok(session);
        }

        [HttpPost("verify")]
        public async Task<IActionResult> VerifySession([FromHeader(Name = "X-Session-Id")] string sessionId)
        {
            if (string.IsNullOrEmpty(sessionId)) return BadRequest(new { error = "Session ID missing" });

            bool verified = await _transferManager.VerifyAndFinalizeAsync(sessionId);
            var session = _transferManager.GetSession(sessionId);

            if (!verified)
            {
                return BadRequest(new
                {
                    success = false,
                    verified = false,
                    error = session?.ErrorMessage ?? "Verification failed"
                });
            }

            if (session != null && !string.IsNullOrEmpty(session.MediaItemId))
            {
                var item = await _db.MediaItems.FirstOrDefaultAsync(m => m.Id == session.MediaItemId || m.AndroidMediaId == session.MediaItemId);
                if (item != null)
                {
                    item.TransferStatus = TransferStatus.Completed;
                    item.Sha256Hash = session.DestinationSha256;
                    await _db.SaveChangesAsync();
                }
            }

            return Ok(new
            {
                success = true,
                verified = true,
                status = session?.Status,
                destinationSha256 = session?.DestinationSha256
            });
        }
    }
}
