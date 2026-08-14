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
                    var reply = await ping.SendPingAsync(targetIp, 300);
                    if (reply.Status == IPStatus.Success)
                    {
                        string hostName = GetActualHostName(targetIp, localIp);
                        return new NetworkDeviceInfo
                        {
                            IpAddress = targetIp,
                            Hostname = hostName,
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

        private string GetActualHostName(string targetIp, string localIp)
        {
            if (targetIp == localIp)
            {
                return $"{Environment.MachineName} (This Laptop Server)";
            }

            if (targetIp.EndsWith(".1"))
            {
                return "Wi-Fi Router / Gateway";
            }

            try
            {
                var hostEntry = Dns.GetHostEntry(targetIp);
                if (!string.IsNullOrEmpty(hostEntry.HostName) && hostEntry.HostName != targetIp)
                {
                    // Format mDNS domain names cleanly (e.g. DESKTOP-BL3JUMF.local -> DESKTOP-BL3JUMF)
                    string clean = hostEntry.HostName;
                    if (clean.EndsWith(".local", StringComparison.OrdinalIgnoreCase))
                    {
                        clean = clean.Substring(0, clean.Length - 6);
                    }
                    if (clean.EndsWith(".home", StringComparison.OrdinalIgnoreCase))
                    {
                        clean = clean.Substring(0, clean.Length - 5);
                    }
                    return clean;
                }
            }
            catch { }

            // Accurate generic fallback based on IP address
            return $"Wi-Fi Device ({targetIp})";
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
