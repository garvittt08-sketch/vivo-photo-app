using System;
using System.Collections.Generic;

namespace VivoPhoto.Core.Models
{
    public enum GroupType
    {
        ExactDuplicate,
        SimilarPhoto
    }

    public enum ConfidenceLevel
    {
        High,   // 95-100%
        Medium, // 70-94%
        Low     // Below 70%
    }

    public class DuplicateGroup
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public GroupType GroupType { get; set; } = GroupType.ExactDuplicate;
        public double AverageSimilarityScore { get; set; } = 100.0;
        
        public string? RecommendedBestMediaId { get; set; }
        public string? SelectedMediaId { get; set; }
        
        public double ConfidenceScore { get; set; } = 100.0;
        public ConfidenceLevel ConfidenceLevel
        {
            get
            {
                if (ConfidenceScore >= 95.0) return ConfidenceLevel.High;
                if (ConfidenceScore >= 70.0) return ConfidenceLevel.Medium;
                return ConfidenceLevel.Low;
            }
        }

        public bool IsUserReviewed { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<MediaItem> Items { get; set; } = new List<MediaItem>();
    }
}
