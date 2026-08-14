namespace VivoPhoto.Core.Models
{
    public class SystemSettings
    {
        public int Id { get; set; } = 1;
        public string PhotoDestinationPath { get; set; } = @"E:\Vivo Photo";
        public string FileOrganizationMode { get; set; } = "Original"; // "Original", "YearMonth", "Date"
        public double SimilarityThreshold { get; set; } = 85.0; // Similarity percentage for dHash/pHash
        public bool AutoSelectBestPhoto { get; set; } = true;
        public bool WifiOnly { get; set; } = true;
        public int DiscoveryPort { get; set; } = 8888;
        public int HttpPort { get; set; } = 5000;
    }
}
