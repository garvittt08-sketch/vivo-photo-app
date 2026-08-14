using System.Collections.Generic;
using System.Threading.Tasks;

namespace VivoPhoto.Core.Interfaces
{
    public class NetworkDeviceInfo
    {
        public string IpAddress { get; set; } = string.Empty;
        public string Hostname { get; set; } = string.Empty;
        public bool IsAlive { get; set; }
        public bool IsServerHost { get; set; }
        public int ResponseTimeMs { get; set; }
    }

    public interface INetworkScanner
    {
        Task<List<NetworkDeviceInfo>> ScanSubnetAsync();
    }
}
