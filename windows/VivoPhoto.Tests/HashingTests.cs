using System.Text;
using VivoPhoto.Core.Algorithms;
using Xunit;

namespace VivoPhoto.Tests
{
    public class HashingTests
    {
        [Fact]
        public void ComputeSha256_ValidBytes_ReturnsExpectedHexHash()
        {
            byte[] data = Encoding.UTF8.GetBytes("Hello Vivo Photo Manager");
            string hash = Sha256Hasher.ComputeHash(data);

            Assert.NotNull(hash);
            Assert.Equal(64, hash.Length); // 256 bits = 64 hex characters
        }

        [Fact]
        public void CalculateSimilarityPercentage_IdenticalHashes_Returns100Percent()
        {
            ulong hash1 = 0x123456789ABCDEF0;
            ulong hash2 = 0x123456789ABCDEF0;

            double similarity = PerceptualHasher.CalculateSimilarityPercentage(hash1, hash2);
            Assert.Equal(100.0, similarity);
        }

        [Fact]
        public void CalculateHammingDistance_SingleBitDiff_ReturnsOne()
        {
            ulong hash1 = 0b0001;
            ulong hash2 = 0b0000;

            int distance = PerceptualHasher.CalculateHammingDistance(hash1, hash2);
            Assert.Equal(1, distance);
        }
    }
}
