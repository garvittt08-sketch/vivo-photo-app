package com.vivo.photomanager.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun ScanScreen(
    scannedCount: Int,
    totalCount: Int,
    currentFileName: String
) {
    val progress = if (totalCount > 0) scannedCount.toFloat() / totalCount.toFloat() else 0f

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        CircularProgressIndicator(
            progress = progress,
            modifier = Modifier.size(120.dp),
            color = Color(0xFF38BDF8),
            trackColor = Color(0xFF334155),
            strokeWidth = 10.dp
        )

        Spacer(modifier = Modifier.height(32.dp))

        Text(
            text = "Scanning & Analyzing Media...",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "$scannedCount / $totalCount items processed",
            fontSize = 15.sp,
            color = Color(0xFF94A3B8)
        )

        Spacer(modifier = Modifier.height(16.dp))

        LinearProgressIndicator(
            progress = progress,
            modifier = Modifier.fillMaxWidth().height(8.dp),
            color = Color(0xFF10B981),
            trackColor = Color(0xFF1E293B)
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = currentFileName,
            fontSize = 13.sp,
            color = Color(0xFF64748B)
        )
    }
}
