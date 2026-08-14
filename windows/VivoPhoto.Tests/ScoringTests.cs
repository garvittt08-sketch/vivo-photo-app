using System.Collections.Generic;
using VivoPhoto.Core.Algorithms;
using VivoPhoto.Core.Models;
using Xunit;

namespace VivoPhoto.Tests
{
    public class ScoringTests
    {
        [Fact]
        public void SelectBestFromGroup_HigherScoreItem_IsSelectedWithHighConfidence()
        {
            var item1 = new MediaItem
            {
                Id = "item-1",
                FileName = "IMG_001.jpg",
                Analysis = new AnalysisResult { OverallScore = 75.0 }
            };

            var item2 = new MediaItem
            {
                Id = "item-2",
                FileName = "IMG_002.jpg",
                Analysis = new AnalysisResult { OverallScore = 92.0 } // Crisp, sharp photo
            };

            var list = new List<MediaItem> { item1, item2 };
            var (best, confidence) = BestPhotoScorer.SelectBestFromGroup(list);

            Assert.Equal("item-2", best.Id);
            Assert.True(confidence >= 80.0);
        }
    }
}
