using System;

namespace VivoPhoto.Core.Models
{
    public class TransferSession
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string MediaItemId { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public long TotalBytes { get; set; }
        public long BytesTransferred { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Transferring, Verifying, Completed, Failed, Paused
        public string SourceSha256 { get; set; } = string.Empty;
        public string? DestinationSha256 { get; set; }
        public bool IsVerified { get; set; } = false;
        public int RetryCount { get; set; } = 0;
        public string? ErrorMessage { get; set; }
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
    }
}
