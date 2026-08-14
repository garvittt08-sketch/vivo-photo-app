using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using VivoPhoto.Infrastructure.Services;

namespace VivoPhoto.Infrastructure.Discovery
{
    public class UdpDiscoveryServer : BackgroundService
    {
        private readonly ILogger<UdpDiscoveryServer> _logger;
        private readonly int _listenPort;

        public UdpDiscoveryServer(ILogger<UdpDiscoveryServer> logger, int listenPort = 8888)
        {
            _logger = logger;
            _listenPort = listenPort;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using var udpClient = new UdpClient();
            udpClient.Client.SetSocketOption(SocketOptionLevel.Socket, SocketOptionName.ReuseAddress, true);
            udpClient.Client.Bind(new IPEndPoint(IPAddress.Any, _listenPort));

            _logger.LogInformation("UDP Discovery listener started on port {Port}", _listenPort);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var result = await udpClient.ReceiveAsync(stoppingToken);
                    string message = Encoding.UTF8.GetString(result.Buffer);
                    string senderIp = result.RemoteEndPoint.Address.ToString();

                    // Register device model if provided in UDP probe payload (e.g. VIVO_PHOTO_DISCOVER|Samsung Galaxy S23)
                    if (message.Contains('|'))
                    {
                        var parts = message.Split('|');
                        if (parts.Length > 1 && !string.IsNullOrWhiteSpace(parts[1]))
                        {
                            NetworkScanner.RegisterDeviceModel(senderIp, parts[1].Trim());
                        }
                    }

                    if (message.Trim().StartsWith("VIVO_PHOTO_DISCOVER", StringComparison.OrdinalIgnoreCase))
                    {
                        _logger.LogInformation("Received discovery probe from {Endpoint}", result.RemoteEndPoint);

                        var responsePayload = new
                        {
                            ServerName = Environment.MachineName,
                            IpAddress = GetLocalIpAddress(),
                            HttpPort = 5000,
                            Version = "1.0.0"
                        };

                        byte[] responseBytes = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(responsePayload));
                        await udpClient.SendAsync(responseBytes, responseBytes.Length, result.RemoteEndPoint);
                    }
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in UDP Discovery loop");
                }
            }
        }

        private static string GetLocalIpAddress()
        {
            try
            {
                using var socket = new Socket(AddressFamily.InterNetwork, SocketType.Dgram, 0);
                socket.Connect("8.8.8.8", 65530);
                var endPoint = socket.LocalEndPoint as IPEndPoint;
                return endPoint?.Address.ToString() ?? "127.0.0.1";
            }
            catch
            {
                return "127.0.0.1";
            }
        }
    }
}
