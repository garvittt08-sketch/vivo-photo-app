using System.Collections.Generic;
using VivoPhoto.Core.Models;

namespace VivoPhoto.Core.Interfaces
{
    public interface ISimilarityEngine
    {
        double CalculateSimilarity(ulong hash1, ulong hash2);
        List<DuplicateGroup> GroupExactDuplicates(List<MediaItem> items);
        List<DuplicateGroup> GroupSimilarPhotos(List<MediaItem> items, double similarityThresholdPercentage);
    }
}
