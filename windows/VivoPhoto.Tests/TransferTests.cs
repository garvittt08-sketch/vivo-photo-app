using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using VivoPhoto.Core.Algorithms;
using VivoPhoto.Infrastructure.Storage;
using VivoPhoto.Infrastructure.Transfer;
using Xunit;

namespace VivoPhoto.Tests
{
    public class TransferTests
    {
        [Fact]
        public void SanitizeFileName_PathTraversalAttack_RemovesDangerousCharacters()
        {
            string malicious = @"..\..\..\Windows\System32\cmd.exe";
            string sanitized = FileStorageManager.SanitizeFileName(malicious);

            Assert.DoesNotContain("..", sanitized);
            Assert.Equal("cmd.exe", sanitized);
        }

        [Fact]
        public async Task ChunkedTransfer_ValidChunksAndHash_CompletesSuccessfully()
        {
            string testDir = Path.Combine(Path.GetTempPath(), "VivoTestStorage_" + Guid.NewGuid().ToString("N"));
            var storageManager = new FileStorageManager(testDir);
            var receiver = new ChunkedTransferReceiver(storageManager);

            byte[] data = Encoding.UTF8.GetBytes("Testing chunked streaming transfer and hash verification.");
            string hash = Sha256Hasher.ComputeHash(data);

            var session = await receiver.StartOrResumeSessionAsync("media-123", "test_photo.jpg", data.Length, hash);
            Assert.NotNull(session);

            await receiver.ReceiveChunkAsync(session.Id, 0, data);
            bool verified = await receiver.VerifyAndFinalizeAsync(session.Id);

            Assert.True(verified);

            // Cleanup test directory
            if (Directory.Exists(testDir))
            {
                Directory.Delete(testDir, recursive: true);
            }
        }
    }
}
