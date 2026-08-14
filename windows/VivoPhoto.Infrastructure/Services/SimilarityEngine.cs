using System.Collections.Generic;
using System.Linq;
using VivoPhoto.Core.Algorithms;
using VivoPhoto.Core.Interfaces;
using VivoPhoto.Core.Models;

namespace VivoPhoto.Infrastructure.Services
{
    public class SimilarityEngine : ISimilarityEngine
    {
        public double CalculateSimilarity(ulong hash1, ulong hash2)
        {
            return PerceptualHasher.CalculateSimilarityPercentage(hash1, hash2);
        }

        public List<DuplicateGroup> GroupExactDuplicates(List<MediaItem> items)
        {
            var groups = new List<DuplicateGroup>();

            var duplicateHashGroups = items
                .Where(i => !string.IsNullOrEmpty(i.Sha256Hash))
                .GroupBy(i => i.Sha256Hash)
                .Where(g => g.Count() > 1);

            foreach (var hashGroup in duplicateHashGroups)
            {
                var groupItemList = hashGroup.ToList();
                var (bestItem, confidence) = BestPhotoScorer.SelectBestFromGroup(groupItemList);

                foreach (var item in groupItemList)
                {
                    item.IsSelectedAsBest = (item.Id == bestItem.Id);
                    item.ReviewStatus = item.IsSelectedAsBest ? "AutoSelected" : "DuplicateCandidate";
                }

                var group = new DuplicateGroup
                {
                    GroupType = GroupType.ExactDuplicate,
                    AverageSimilarityScore = 100.0,
                    RecommendedBestMediaId = bestItem.Id,
                    SelectedMediaId = bestItem.Id,
                    ConfidenceScore = 100.0,
                    Items = groupItemList
                };

                foreach (var item in groupItemList)
                {
                    item.DuplicateGroupId = group.Id;
                }

                groups.Add(group);
            }

            return groups;
        }

        public List<DuplicateGroup> GroupSimilarPhotos(List<MediaItem> items, double similarityThresholdPercentage)
        {
            var groups = new List<DuplicateGroup>();
            var visited = new HashSet<string>();

            var itemsWithHash = items.Where(i => i.PerceptualHash.HasValue).ToList();

            for (int i = 0; i < itemsWithHash.Count; i++)
            {
                var current = itemsWithHash[i];
                if (visited.Contains(current.Id)) continue;

                var cluster = new List<MediaItem> { current };

                for (int j = i + 1; j < itemsWithHash.Count; j++)
                {
                    var candidate = itemsWithHash[j];
                    if (visited.Contains(candidate.Id)) continue;

                    double similarity = CalculateSimilarity(current.PerceptualHash!.Value, candidate.PerceptualHash!.Value);
                    if (similarity >= similarityThresholdPercentage)
                    {
                        cluster.Add(candidate);
                    }
                }

                if (cluster.Count > 1)
                {
                    foreach (var item in cluster)
                    {
                        visited.Add(item.Id);
                    }

                    var (bestItem, confidence) = BestPhotoScorer.SelectBestFromGroup(cluster);

                    foreach (var item in cluster)
                    {
                        item.IsSelectedAsBest = (item.Id == bestItem.Id);
                        item.ReviewStatus = item.IsSelectedAsBest ? "AutoSelected" : "SimilarCandidate";
                    }

                    var group = new DuplicateGroup
                    {
                        GroupType = GroupType.SimilarPhoto,
                        AverageSimilarityScore = similarityThresholdPercentage,
                        RecommendedBestMediaId = bestItem.Id,
                        SelectedMediaId = bestItem.Id,
                        ConfidenceScore = confidence,
                        Items = cluster
                    };

                    foreach (var item in cluster)
                    {
                        item.DuplicateGroupId = group.Id;
                    }

                    groups.Add(group);
                }
            }

            return groups;
        }
    }
}
