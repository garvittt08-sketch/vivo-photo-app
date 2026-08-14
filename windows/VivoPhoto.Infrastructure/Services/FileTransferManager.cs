using System;
using System.Collections.Concurrent;
using System.IO;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using VivoPhoto.Core.Interfaces;
using VivoPhoto.Core.Models;

namespace VivoPhoto.Infrastructure.Services
{
    public class FileTransferManager : ITransferManager
    {
        private readonly ConcurrentDictionary<string, TransferSessionInternal> _activeSessions = new();
        private string _destinationFolder;

        public FileTransferManager(string destinationFolder = @"E:\Vivo Photo")
        {
            _destinationFolder = destinationFolder;
            EnsureDestinationExists();
        }

        private void EnsureDestinationExists()
        {
            try
            {
                if (!Directory.Exists(_destinationFolder))
                {
                    Directory.CreateDirectory(_destinationFolder);
                }
            }
            catch
            {
                // Fallback to C:\Vivo Photo if E:\ drive is not available
                _destinationFolder = @"C:\Vivo Photo";
                if (!Directory.Exists(_destinationFolder))
                {
                    Directory.CreateDirectory(_destinationFolder);
                }
            }
        }

        private class TransferSessionInternal
        {
            public TransferSession Session { get; set; } = null!;
            public MemoryStream MemoryBuffer { get; set; } = new();
        }

        public Task<TransferSession> StartOrResumeSessionAsync(string mediaItemId, string fileName, long totalBytes, string sourceSha256)
        {
            EnsureDestinationExists();
            string sessionId = Guid.NewGuid().ToString();

            var session = new TransferSession
            {
                Id = sessionId,
                MediaItemId = mediaItemId,
                FileName = fileName,
                TotalBytes = totalBytes,
                BytesTransferred = 0,
                SourceSha256 = sourceSha256,
                Status = "InProgress",
                StartedAt = DateTime.UtcNow
            };

            var wrapper = new TransferSessionInternal
            {
                Session = session,
                MemoryBuffer = new MemoryStream((int)Math.Min(totalBytes, 50_000_000))
            };

            _activeSessions[sessionId] = wrapper;
            return Task.FromResult(session);
        }

        public Task<TransferSession> ReceiveChunkAsync(string sessionId, long offset, byte[] chunkData, CancellationToken cancellationToken = default)
        {
            if (!_activeSessions.TryGetValue(sessionId, out var wrapper))
            {
                throw new InvalidOperationException($"Transfer session '{sessionId}' not found.");
            }

            lock (wrapper.MemoryBuffer)
            {
                wrapper.MemoryBuffer.Seek(offset, SeekOrigin.Begin);
                wrapper.MemoryBuffer.Write(chunkData, 0, chunkData.Length);
                wrapper.Session.BytesTransferred = Math.Max(wrapper.Session.BytesTransferred, wrapper.MemoryBuffer.Length);
            }

            return Task.FromResult(wrapper.Session);
        }

        public async Task<bool> VerifyAndFinalizeAsync(string sessionId, CancellationToken cancellationToken = default)
        {
            if (!_activeSessions.TryGetValue(sessionId, out var wrapper))
            {
                return false;
            }

            EnsureDestinationExists();
            byte[] fileBytes = wrapper.MemoryBuffer.ToArray();

            // Calculate destination SHA-256
            using var sha256 = SHA256.Create();
            byte[] hashBytes = sha256.ComputeHash(fileBytes);
            string destinationHash = BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();

            wrapper.Session.DestinationSha256 = destinationHash;

            // Bitwise match verification
            bool matches = string.Equals(wrapper.Session.SourceSha256, destinationHash, StringComparison.OrdinalIgnoreCase);

            if (matches)
            {
                wrapper.Session.Status = "Completed";
                wrapper.Session.CompletedAt = DateTime.UtcNow;

                string targetPath = Path.Combine(_destinationFolder, wrapper.Session.FileName);
                await File.WriteAllBytesAsync(targetPath, fileBytes, cancellationToken);
            }
            else
            {
                wrapper.Session.Status = "Failed";
                wrapper.Session.ErrorMessage = $"Bitwise SHA-256 hash mismatch! Source: {wrapper.Session.SourceSha256}, Received: {destinationHash}";
            }

            return matches;
        }

        public Task CancelSessionAsync(string sessionId)
        {
            if (_activeSessions.TryRemove(sessionId, out var wrapper))
            {
                wrapper.Session.Status = "Failed";
                wrapper.Session.ErrorMessage = "Session cancelled by user.";
                wrapper.MemoryBuffer.Dispose();
            }
            return Task.CompletedTask;
        }

        public TransferSession? GetSession(string sessionId)
        {
            return _activeSessions.TryGetValue(sessionId, out var wrapper) ? wrapper.Session : null;
        }
    }
}
