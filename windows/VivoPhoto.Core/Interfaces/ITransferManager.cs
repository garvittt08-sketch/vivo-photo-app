using System.IO;
using System.Threading;
using System.Threading.Tasks;
using VivoPhoto.Core.Models;

namespace VivoPhoto.Core.Interfaces
{
    public interface ITransferManager
    {
        Task<TransferSession> StartOrResumeSessionAsync(string mediaItemId, string fileName, long totalBytes, string sourceSha256);
        Task<TransferSession> ReceiveChunkAsync(string sessionId, long chunkOffset, byte[] chunkData, CancellationToken cancellationToken = default);
        Task<bool> VerifyAndFinalizeAsync(string sessionId, CancellationToken cancellationToken = default);
        Task CancelSessionAsync(string sessionId);
        TransferSession? GetSession(string sessionId);
    }
}
