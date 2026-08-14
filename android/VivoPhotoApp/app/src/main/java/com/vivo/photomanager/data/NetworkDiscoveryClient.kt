package com.vivo.photomanager.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress

data class DiscoveredServer(
    val serverName: String,
    val ipAddress: String,
    val httpPort: Int
)

class NetworkDiscoveryClient {

    suspend fun discoverServer(timeoutMs: Int = 3000): DiscoveredServer? = withContext(Dispatchers.IO) {
        var socket: DatagramSocket? = null
        try {
            socket = DatagramSocket()
            socket.broadcast = true
            socket.soTimeout = timeoutMs

            val messageBytes = "VIVO_PHOTO_DISCOVER".toByteArray()
            val broadcastAddr = InetAddress.getByName("255.255.255.255")
            val packet = DatagramPacket(messageBytes, messageBytes.size, broadcastAddr, 8888)

            socket.send(packet)

            val receiveBuffer = ByteArray(2048)
            val receivePacket = DatagramPacket(receiveBuffer, receiveBuffer.size)
            socket.receive(receivePacket)

            val responseString = String(receivePacket.data, 0, receivePacket.length)
            val json = JSONObject(responseString)

            DiscoveredServer(
                serverName = json.optString("ServerName", "Windows PC"),
                ipAddress = json.optString("IpAddress", receivePacket.address.hostAddress ?: "127.0.0.1"),
                httpPort = json.optInt("HttpPort", 5000)
            )
        } catch (e: Exception) {
            e.printStackTrace()
            null
        } finally {
            socket?.close()
        }
    }
}
