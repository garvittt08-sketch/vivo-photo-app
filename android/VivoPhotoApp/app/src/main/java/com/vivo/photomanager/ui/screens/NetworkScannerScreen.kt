package com.vivo.photomanager.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Computer
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Smartphone
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request

data class NetworkDevice(
    val ipAddress: String,
    val hostname: String,
    val isAlive: Boolean,
    val isServerHost: Boolean,
    val responseTimeMs: Int
)

data class NetworkDevicesResponse(
    val totalDevices: Int,
    val devices: List<NetworkDevice>
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NetworkScannerScreen(
    pcIp: String,
    onBack: () -> Unit
) {
    val scope = rememberCoroutineScope()
    var devices by remember { mutableStateOf<List<NetworkDevice>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }

    fun scanDevices() {
        isLoading = true
        scope.launch {
            withContext(Dispatchers.IO) {
                try {
                    val client = OkHttpClient()
                    val request = Request.Builder()
                        .url("http://$pcIp:5000/api/network/devices")
                        .build()
                    val response = client.newCall(request).execute()
                    val json = response.body?.string()
                    if (json != null) {
                        val parsed = Gson().fromJson(json, NetworkDevicesResponse::class.java)
                        devices = parsed.devices
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                } finally {
                    isLoading = false
                }
            }
        }
    }

    LaunchedEffect(Unit) {
        scanDevices()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Wi-Fi Network Scanner", color = Color.White, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                actions = {
                    IconButton(onClick = { scanDevices() }, enabled = !isLoading) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = Color(0xFF38BDF8))
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF111827))
            )
        },
        containerColor = Color(0xFF0B0F19)
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Icon(Icons.Default.Wifi, contentDescription = null, tint = Color(0xFF10B981), modifier = Modifier.size(28.dp))
                    Column {
                        Text("Active Connected Devices (${devices.size})", color = Color.White, fontWeight = FontWeight.Bold)
                        Text("Scanning local IP range on your Wi-Fi router", color = Color(0xFF9CA3AF), fontSize = 12.sp)
                    }
                }
            }

            if (isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        CircularProgressIndicator(color = Color(0xFF38BDF8))
                        Text("Probing Wi-Fi IP range...", color = Color.Gray, fontSize = 14.sp)
                    }
                }
            } else if (devices.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No response from subnet scanner. Ensure laptop server is running.", color = Color.Gray)
                }
            } else {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    items(devices) { dev ->
                        Card(
                            colors = CardDefaults.cardColors(
                                containerColor = if (dev.isServerHost) Color(0xFF1E293B) else Color(0xFF111827)
                            ),
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    Icon(
                                        imageVector = if (dev.isServerHost) Icons.Default.Computer else Icons.Default.Smartphone,
                                        contentDescription = null,
                                        tint = if (dev.isServerHost) Color(0xFF38BDF8) else Color(0xFF10B981)
                                    )
                                    Column {
                                        Text(dev.hostname, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                        Text("IP: ${dev.ipAddress} • ${dev.responseTimeMs} ms", color = Color.Gray, fontSize = 12.sp)
                                    }
                                }

                                if (dev.isServerHost) {
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = Color(0xFF0284C7)
                                    ) {
                                        Text(
                                            "Laptop Server",
                                            color = Color.White,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
