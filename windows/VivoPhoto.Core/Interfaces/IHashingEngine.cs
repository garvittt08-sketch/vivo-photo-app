using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace VivoPhoto.Core.Interfaces
{
    public interface IHashingEngine
    {
        string ComputeSha256(byte[] data);
        Task<string> ComputeSha256Async(Stream stream, CancellationToken cancellationToken = default);
        Task<string> ComputeFileSha256Async(string filePath, CancellationToken cancellationToken = default);
        ulong ComputeDHash(byte[] imageBytes);
        ulong ComputeDHash(Stream imageStream);
    }
}
