using System;
using System.Text.Json.Serialization;

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
        [JsonPropertyName("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [JsonPropertyName("androidMediaId")]
        public string AndroidMediaId { get; set; } = string.Empty;

        [JsonPropertyName("deviceId")]
        public string DeviceId { get; set; } = string.Empty;

        [JsonPropertyName("fileName")]
        public string FileName { get; set; } = string.Empty;

        [JsonPropertyName("uriString")]
        public string OriginalUri { get; set; } = string.Empty;

        [JsonPropertyName("sizeBytes")]
        public long FileSizeBytes { get; set; }

        [JsonPropertyName("mimeType")]
        public string MimeType { get; set; } = "image/jpeg";

        [JsonPropertyName("width")]
        public int Width { get; set; }

        [JsonPropertyName("height")]
        public int Height { get; set; }

        [JsonPropertyName("dateTaken")]
        public long DateTakenMillis { get; set; }

        [JsonIgnore]
        public DateTime DateTaken => DateTimeOffset.FromUnixTimeMilliseconds(DateTakenMillis > 0 ? DateTakenMillis : DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()).DateTime;

        [JsonPropertyName("isVideo")]
        public bool IsVideo { get; set; }

        public MediaType MediaType => IsVideo ? MediaType.Video : MediaType.Photo;

        // Content integrity
        [JsonPropertyName("sha256Hash")]
        public string? Sha256Hash { get; set; }

        [JsonPropertyName("perceptualHash")]
        public ulong? PerceptualHash { get; set; }

        // Duplication & Selection state
        [JsonPropertyName("isSelectedAsBest")]
        public bool IsSelectedAsBest { get; set; } = true;

        [JsonPropertyName("duplicateGroupId")]
        public string? DuplicateGroupId { get; set; }

        [JsonPropertyName("reviewStatus")]
        public string? ReviewStatus { get; set; } // "AutoSelected", "ManualSelected", "NeedsReview", "Excluded"

        // Transfer tracking
        [JsonPropertyName("transferStatus")]
        public TransferStatus TransferStatus { get; set; } = TransferStatus.Pending;

        [JsonPropertyName("destinationPath")]
        public string? DestinationPath { get; set; }

        [JsonPropertyName("transferredAt")]
        public DateTime? TransferredAt { get; set; }

        // Analysis reference
        public AnalysisResult? Analysis { get; set; }
    }
}
