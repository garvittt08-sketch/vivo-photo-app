using System;

namespace VivoPhoto.Core.Models
{
    public class AnalysisResult
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string MediaItemId { get; set; } = string.Empty;

        // Individual metric scores (0 - 100)
        public double SharpnessScore { get; set; }
        public double ExposureScore { get; set; }
        public double ResolutionScore { get; set; }
        public double NoiseScore { get; set; }
        public double CompressionScore { get; set; }

        // Combined normalized overall score (0 - 100)
        public double OverallScore { get; set; }

        // Selection Confidence (0 - 100)
        public double ConfidenceScore { get; set; }

        // Concise reason list for selection summary
        public string PrimaryReasons { get; set; } = string.Empty;

        public DateTime AnalyzedAt { get; set; } = DateTime.UtcNow;
    }
}
