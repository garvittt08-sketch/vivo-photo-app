using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Threading.Tasks;
using VivoPhoto.Core.Interfaces;

namespace VivoPhoto.Infrastructure.Services
{
    public class NetworkScanner : INetworkScanner
    {
        public async Task<List<NetworkDeviceInfo>> ScanSubnetAsync()
        {
            var results = new List<NetworkDeviceInfo>();
            string localIp = GetLocalIpAddress();
            if (string.IsNullOrEmpty(localIp)) return results;

            string subnetPrefix = localIp.Substring(0, localIp.LastIndexOf('.'));

            var tasks = Enumerable.Range(1, 254).Select(async i =>
            {
                string targetIp = $"{subnetPrefix}.{i}";
                using var ping = new Ping();
                try
                {
                    var reply = await ping.SendPingAsync(targetIp, 250);
                    if (reply.Status == IPStatus.Success)
                    {
                        string hostName = "Unknown Device";
                        try
                        {
                            var hostEntry = await Dns.GetHostEntryAsync(targetIp);
                            hostName = hostEntry.HostName;
                        }
                        catch { }

                        return new NetworkDeviceInfo
                        {
                            IpAddress = targetIp,
                            Hostname = targetIp == localIp ? $"{Environment.MachineName} (This Laptop Server)" : hostName,
                            IsAlive = true,
                            IsServerHost = targetIp == localIp,
                            ResponseTimeMs = (int)reply.RoundtripTime
                        };
                    }
                }
                catch { }
                return null;
            });

            var scanned = await Task.WhenAll(tasks);
            results.AddRange(scanned.Where(x => x != null)!);
            return results.OrderBy(x => x.IpAddress).ToList();
        }

        private string GetLocalIpAddress()
        {
            try
            {
                using var socket = new Socket(AddressFamily.InterNetwork, SocketType.Dgram, 0);
                socket.Connect("8.8.8.8", 65530);
                var endPoint = socket.LocalEndPoint as IPEndPoint;
                return endPoint?.Address.ToString() ?? "192.168.1.10";
            }
            catch
            {
                return "192.168.1.10";
            }
        }
    }
}
