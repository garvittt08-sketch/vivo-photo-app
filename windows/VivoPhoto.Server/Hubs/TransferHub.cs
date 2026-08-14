using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace VivoPhoto.Server.Hubs
{
    public class TransferHub : Hub
    {
        public async Task SendTransferProgress(string sessionId, long bytesTransferred, long totalBytes, double speedMBps)
        {
            await Clients.All.SendAsync("ReceiveTransferProgress", sessionId, bytesTransferred, totalBytes, speedMBps);
        }

        public async Task SendScanProgress(int processed, int total, string currentFileName)
        {
            await Clients.All.SendAsync("ReceiveScanProgress", processed, total, currentFileName);
        }
    }
}
