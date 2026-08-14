using System;
using System.IO;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

namespace VivoPhoto.Core.Algorithms
{
    public static class PerceptualHasher
    {
        /// <summary>
        /// Calculates a 64-bit dHash (Difference Hash) for an image stream.
        /// </summary>
        public static ulong ComputeDHash(Stream imageStream)
        {
            imageStream.Position = 0;
            using var image = Image.Load<L8>(imageStream);
            
            // Resize to 9x8 for horizontal difference computation
            image.Mutate(x => x.Resize(9, 8));

            ulong hash = 0;
            for (int y = 0; y < 8; y++)
            {
                for (int x = 0; x < 8; x++)
                {
                    byte leftPixel = image[x, y].PackedValue;
                    byte rightPixel = image[x + 1, y].PackedValue;

                    if (leftPixel > rightPixel)
                    {
                        int bitIndex = (y * 8) + x;
                        hash |= (1UL << bitIndex);
                    }
                }
            }

            return hash;
        }

        public static ulong ComputeDHash(byte[] imageBytes)
        {
            using var ms = new MemoryStream(imageBytes);
            return ComputeDHash(ms);
        }

        /// <summary>
        /// Calculates the Hamming distance (number of differing bits) between two 64-bit hashes.
        /// </summary>
        public static int CalculateHammingDistance(ulong hash1, ulong hash2)
        {
            ulong diff = hash1 ^ hash2;
            int distance = 0;
            while (diff != 0)
            {
                distance++;
                diff &= (diff - 1); // clears the lowest set bit
            }
            return distance;
        }

        /// <summary>
        /// Calculates percentage similarity (100% = identical, 0% = maximum bit difference).
        /// </summary>
        public static double CalculateSimilarityPercentage(ulong hash1, ulong hash2)
        {
            int distance = CalculateHammingDistance(hash1, hash2);
            double similarity = (64.0 - distance) / 64.0 * 100.0;
            return Math.Max(0.0, Math.Min(100.0, similarity));
        }
    }
}
