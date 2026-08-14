using System;

namespace VivoPhoto.Core.Models
{
    public enum MediaType
    {
        Photo,
        Video
    }

    public enum TransferStatus
    {
        Pending,
        InProgress,
        Completed,
        Failed,
        Skipped
    }

    public class MediaItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string AndroidMediaId { get; set; } = string.Empty;
        public string DeviceId { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string OriginalUri { get; set; } = string.Empty;
        public long FileSizeBytes { get; set; }
        public string MimeType { get; set; } = "image/jpeg";
        public int Width { get; set; }
        public int Height { get; set; }
        public DateTime DateTaken { get; set; } = DateTime.UtcNow;
        public MediaType MediaType { get; set; } = MediaType.Photo;

        // Content integrity
        public string? Sha256Hash { get; set; }
        public ulong? PerceptualHash { get; set; }

        // Duplication & Selection state
        public bool IsSelectedAsBest { get; set; } = true;
        public string? DuplicateGroupId { get; set; }
        public string? ReviewStatus { get; set; } // "AutoSelected", "ManualSelected", "NeedsReview", "Excluded"

        // Transfer tracking
        public TransferStatus TransferStatus { get; set; } = TransferStatus.Pending;
        public string? DestinationPath { get; set; }
        public DateTime? TransferredAt { get; set; }

        // Analysis reference
        public AnalysisResult? Analysis { get; set; }
    }
}
