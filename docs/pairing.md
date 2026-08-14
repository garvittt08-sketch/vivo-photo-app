# Device Pairing & Network Discovery

## Network Discovery Flow
1. **UDP Broadcast Probe**: The Android application broadcasts a `VIVO_PHOTO_DISCOVER` packet over port 8888 on the local Wi-Fi subnet.
2. **Server Response**: `UdpDiscoveryServer` on the Windows PC receives the packet and returns a JSON payload containing:
   - `ServerName`: Windows PC Hostname
   - `IpAddress`: Local Wi-Fi IPv4 Address
   - `HttpPort`: 5000
3. **Manual Fallback**: If UDP broadcast is disabled by local network AP isolation, users can manually enter the PC IP address and port (e.g. `192.168.1.10:5000`).

## Pairing Handshake
1. Android app sends `POST /api/devices/pair` with `deviceName` and `model`.
2. Windows server generates a 256-bit cryptographically random `AuthToken`.
3. Token is stored in SQLite and returned to the Android client for session headers.
