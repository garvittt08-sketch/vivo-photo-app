using System;
using System.Collections.Concurrent;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using VivoPhoto.Core.Algorithms;
using VivoPhoto.Core.Interfaces;
using VivoPhoto.Core.Models;
using VivoPhoto.Infrastructure.Storage;

namespace VivoPhoto.Infrastructure.Transfer
{
    public class ChunkedTransferReceiver : ITransferManager
    {
        private readonly ConcurrentDictionary<string, TransferSession> _activeSessions = new();
        private readonly FileStorageManager _storageManager;

        public ChunkedTransferReceiver(FileStorageManager storageManager)
        {
            _storageManager = storageManager;
        }

        public Task<TransferSession> StartOrResumeSessionAsync(string mediaItemId, string fileName, long totalBytes, string sourceSha256)
        {
            string sessionId = $"{mediaItemId}_{sourceSha256[..Math.Min(8, sourceSha256.Length)]}";

            var session = _activeSessions.GetOrAdd(sessionId, id => new TransferSession
            {
                Id = id,
                MediaItemId = mediaItemId,
                FileName = fileName,
                TotalBytes = totalBytes,
                BytesTransferred = 0,
                SourceSha256 = sourceSha256,
                Status = "InProgress",
                StartedAt = DateTime.UtcNow
            });

            // Check if temp file already exists to compute existing resumed bytes
            string tempPath = _storageManager.GetTempFilePath(sessionId);
            if (File.Exists(tempPath))
            {
                var fileInfo = new FileInfo(tempPath);
                session.BytesTransferred = fileInfo.Length;
                session.Status = "Resumed";
            }

            return Task.FromResult(session);
        }

        public async Task<TransferSession> ReceiveChunkAsync(string sessionId, long chunkOffset, byte[] chunkData, CancellationToken cancellationToken = default)
        {
            if (!_activeSessions.TryGetValue(sessionId, out var session))
            {
                throw new KeyNotFoundException($"Transfer session '{sessionId}' not found");
            }

            string tempPath = _storageManager.GetTempFilePath(sessionId);

            using (var stream = new FileStream(tempPath, FileMode.OpenOrCreate, FileAccess.Write, FileShare.ReadWrite, 8192, true))
            {
                stream.Seek(chunkOffset, SeekOrigin.Begin);
                await stream.WriteAsync(chunkData, cancellationToken);
            }

            var fileInfo = new FileInfo(tempPath);
            session.BytesTransferred = fileInfo.Length;
            session.Status = session.BytesTransferred >= session.TotalBytes ? "Verifying" : "InProgress";

            return session;
        }

        public async Task<bool> VerifyAndFinalizeAsync(string sessionId, CancellationToken cancellationToken = default)
        {
            if (!_activeSessions.TryGetValue(sessionId, out var session))
            {
                return false;
            }

            string tempPath = _storageManager.GetTempFilePath(sessionId);
            if (!File.Exists(tempPath))
            {
                session.Status = "Failed";
                session.ErrorMessage = "Temp chunk file missing";
                return false;
            }

            // Calculate destination SHA-256 hash
            string destinationHash = await Sha256Hasher.ComputeFileHashAsync(tempPath, cancellationToken);
            session.DestinationSha256 = destinationHash;

            if (!string.Equals(session.SourceSha256, destinationHash, StringComparison.OrdinalIgnoreCase))
            {
                session.Status = "Failed";
                session.ErrorMessage = $"SHA-256 hash mismatch! Source: {session.SourceSha256}, Dest: {destinationHash}";
                session.IsVerified = false;
                session.RetryCount++;
                return false;
            }

            // Hash verified bitwise identical! Finalize file to destination path
            string targetPath = _storageManager.ResolveDestinationPath(session.FileName, DateTime.UtcNow);
            _storageManager.FinalizeFile(tempPath, targetPath);

            session.Status = "Completed";
            session.IsVerified = true;
            session.CompletedAt = DateTime.UtcNow;

            return true;
        }

        public Task CancelSessionAsync(string sessionId)
        {
            if (_activeSessions.TryRemove(sessionId, out var session))
            {
                session.Status = "Cancelled";
                string tempPath = _storageManager.GetTempFilePath(sessionId);
                if (File.Exists(tempPath))
                {
                    try { File.Delete(tempPath); } catch { }
                }
            }
            return Task.CompletedTask;
        }

        public TransferSession? GetSession(string sessionId)
        {
            _activeSessions.TryGetValue(sessionId, out var session);
            return session;
        }
    }
}
