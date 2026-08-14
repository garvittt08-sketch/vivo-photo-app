using System;

namespace VivoPhoto.Core.Models
{
    public class Device
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string DeviceName { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public string AuthToken { get; set; } = string.Empty;
        public bool IsPaired { get; set; } = false;
        public DateTime FirstPairedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastSeenAt { get; set; } = DateTime.UtcNow;
    }
}
