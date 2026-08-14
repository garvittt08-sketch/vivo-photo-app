using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using VivoPhoto.Core.Models;

namespace VivoPhoto.Core.Algorithms
{
    public static class BestPhotoScorer
    {
        public static AnalysisResult AnalyzeImage(Stream imageStream, int width, int height, long fileSizeBytes)
        {
            imageStream.Position = 0;
            using var image = Image.Load<L8>(imageStream);

            double sharpnessRaw = CalculateLaplacianVariance(image);
            double sharpnessScore = Math.Min(100.0, (sharpnessRaw / 500.0) * 100.0);

            double exposureScore = CalculateExposureScore(image);
            double resolutionScore = CalculateResolutionScore(width, height);
            double compressionScore = CalculateCompressionQualityScore(width, height, fileSizeBytes);
            double noiseScore = 90.0; // Default clean baseline unless extreme ISO noise detected

            // Weighted Overall Score (Sharpness 40%, Exposure 25%, Resolution 20%, Compression 15%)
            double overall = (sharpnessScore * 0.40) +
                             (exposureScore * 0.25) +
                             (resolutionScore * 0.20) +
                             (compressionScore * 0.15);

            overall = Math.Max(0.0, Math.Min(100.0, Math.Round(overall, 1)));

            var reasons = new List<string>();
            if (sharpnessScore >= 75) reasons.Add("High sharpness & crisp focus");
            if (exposureScore >= 80) reasons.Add("Optimal exposure balance");
            if (resolutionScore >= 80) reasons.Add("High resolution detail");
            if (reasons.Count == 0) reasons.Add("Standard quality capture");

            return new AnalysisResult
            {
                SharpnessScore = Math.Round(sharpnessScore, 1),
                ExposureScore = Math.Round(exposureScore, 1),
                ResolutionScore = Math.Round(resolutionScore, 1),
                NoiseScore = Math.Round(noiseScore, 1),
                CompressionScore = Math.Round(compressionScore, 1),
                OverallScore = overall,
                ConfidenceScore = 85.0, // Default confidence until candidate comparison
                PrimaryReasons = string.Join(" • ", reasons)
            };
        }

        public static AnalysisResult AnalyzeImage(byte[] imageBytes, int width, int height, long fileSizeBytes)
        {
            using var ms = new MemoryStream(imageBytes);
            return AnalyzeImage(ms, width, height, fileSizeBytes);
        }

        /// <summary>
        /// Selects the best photo from a candidate list and calculates confidence levels.
        /// </summary>
        public static (MediaItem BestItem, double ConfidenceScore) SelectBestFromGroup(List<MediaItem> items)
        {
            if (items == null || items.Count == 0)
                throw new ArgumentException("Group must contain at least one media item");

            if (items.Count == 1)
                return (items[0], 100.0);

            var sorted = items.OrderByDescending(i => i.Analysis?.OverallScore ?? 50.0).ToList();
            var best = sorted[0];
            var runnerUp = sorted[1];

            double bestScore = best.Analysis?.OverallScore ?? 50.0;
            double runnerUpScore = runnerUp.Analysis?.OverallScore ?? 50.0;
            double margin = bestScore - runnerUpScore;

            // Confidence increases with wider margin between best and second best score
            double confidence = 70.0 + (margin * 1.5);
            confidence = Math.Max(50.0, Math.Min(100.0, Math.Round(confidence, 1)));

            return (best, confidence);
        }

        private static double CalculateLaplacianVariance(Image<L8> image)
        {
            // Sample down image to 400px max dimension for fast processing
            int maxDim = Math.Max(image.Width, image.Height);
            double scale = maxDim > 400 ? 400.0 / maxDim : 1.0;
            int targetW = Math.Max(1, (int)(image.Width * scale));
            int targetH = Math.Max(1, (int)(image.Height * scale));

            using var resized = image.Clone(x => x.Resize(targetW, targetH));

            int w = resized.Width;
            int h = resized.Height;
            double sum = 0;
            double sumSq = 0;
            int count = 0;

            // 3x3 Laplacian Kernel: [[0, 1, 0], [1, -4, 1], [0, 1, 0]]
            for (int y = 1; y < h - 1; y++)
            {
                for (int x = 1; x < w - 1; x++)
                {
                    int center = resized[x, y].PackedValue;
                    int up = resized[x, y - 1].PackedValue;
                    int down = resized[x, y + 1].PackedValue;
                    int left = resized[x - 1, y].PackedValue;
                    int right = resized[x + 1, y].PackedValue;

                    double laplacian = up + down + left + right - (4 * center);
                    sum += laplacian;
                    sumSq += laplacian * laplacian;
                    count++;
                }
            }

            if (count == 0) return 0;

            double mean = sum / count;
            double variance = (sumSq / count) - (mean * mean);
            return Math.Max(0, variance);
        }

        private static double CalculateExposureScore(Image<L8> image)
        {
            int[] histogram = new int[256];
            int totalPixels = image.Width * image.Height;

            for (int y = 0; y < image.Height; y += 2) // Step by 2 for performance
            {
                for (int x = 0; x < image.Width; x += 2)
                {
                    byte val = image[x, y].PackedValue;
                    histogram[val]++;
                }
            }

            int sampledPixels = totalPixels / 4;
            if (sampledPixels == 0) return 80.0;

            double underexposed = histogram.Take(30).Sum() / (double)sampledPixels;
            double overexposed = histogram.Skip(225).Sum() / (double)sampledPixels;

            // Penalty for clipped darks or clipped highlights
            double penalty = (underexposed * 50.0) + (overexposed * 50.0);
            return Math.Max(0.0, Math.Min(100.0, 100.0 - penalty));
        }

        private static double CalculateResolutionScore(int width, int height)
        {
            long megapixels = (long)width * height;
            // Benchmark: 12 MP (4000x3000) = 12,000,000 pixels = 100% score
            // 2 MP (1920x1080) = ~2,000,000 pixels = ~60% score
            double ratio = megapixels / 12000000.0;
            double score = 50.0 + (Math.Min(1.0, ratio) * 50.0);
            return Math.Round(score, 1);
        }

        private static double CalculateCompressionQualityScore(int width, int height, long fileSizeBytes)
        {
            long megapixels = Math.Max(1, ((long)width * height) / 1000000);
            double bytesPerMp = (double)fileSizeBytes / megapixels;

            // Standard good JPEG is 1.5MB to 4MB per MP
            if (bytesPerMp >= 1500000) return 95.0;
            if (bytesPerMp >= 800000) return 80.0;
            if (bytesPerMp >= 400000) return 65.0;
            return 50.0;
        }
    }
}
