using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace VivoPhoto.Core.Algorithms
{
    public static class Sha256Hasher
    {
        public static string ComputeHash(byte[] data)
        {
            using var sha256 = SHA256.Create();
            byte[] hashBytes = sha256.ComputeHash(data);
            return BytesToHexString(hashBytes);
        }

        public static async Task<string> ComputeHashAsync(Stream stream, CancellationToken cancellationToken = default)
        {
            using var sha256 = SHA256.Create();
            byte[] hashBytes = await sha256.ComputeHashAsync(stream, cancellationToken);
            return BytesToHexString(hashBytes);
        }

        public static async Task<string> ComputeFileHashAsync(string filePath, CancellationToken cancellationToken = default)
        {
            if (!File.Exists(filePath))
                throw new FileNotFoundException("File not found for hash calculation", filePath);

            using var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read, 8192, true);
            return await ComputeHashAsync(stream, cancellationToken);
        }

        private static string BytesToHexString(byte[] bytes)
        {
            var sb = new StringBuilder(bytes.Length * 2);
            foreach (byte b in bytes)
            {
                sb.Append(b.ToString("x2"));
            }
            return sb.ToString();
        }
    }
}
