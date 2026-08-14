using System.Collections.Generic;
using System.IO;
using VivoPhoto.Core.Models;

namespace VivoPhoto.Core.Interfaces
{
    public interface IBestPhotoEngine
    {
        AnalysisResult ScoreMedia(Stream imageStream, int width, int height, long fileSizeBytes);
        (MediaItem BestItem, double Confidence) SelectBestItem(List<MediaItem> items);
    }
}
