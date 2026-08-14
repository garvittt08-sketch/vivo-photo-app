package com.vivo.photomanager.data

import com.google.gson.Gson
import com.vivo.photomanager.domain.MediaItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.InputStream
import java.security.MessageDigest
import java.util.concurrent.TimeUnit

class TransferClient(private val serverIp: String, private val port: Int = 5000) {

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .build()

    private val gson = Gson()
    private val baseUrl = "http://$serverIp:$port/api"

    suspend fun transferFile(
        item: MediaItem,
        inputStream: InputStream,
        onChunkTransferred: (bytesTransferred: Long, totalBytes: Long) -> Unit
    ): Boolean = withContext(Dispatchers.IO) {
        try {
            val contentBytes = inputStream.readBytes()
            val sha256 = computeSha256(contentBytes)

            // Step 1: Start/Resume Session
            val startPayload = mapOf(
                "mediaItemId" to item.id,
                "fileName" to item.fileName,
                "totalBytes" to contentBytes.size,
                "sourceSha256" to sha256
            )

            val startRequest = Request.Builder()
                .url("$baseUrl/transfers/start")
                .post(gson.toJson(startPayload).toRequestBody("application/json".toMediaType()))
                .build()

            val startResponse = client.newCall(startRequest).execute()
            if (!startResponse.isSuccessful) return@withContext false

            val sessionJson = startResponse.body?.string() ?: return@withContext false
            val sessionObj = gson.fromJson(sessionJson, Map::class.java)
            val sessionId = sessionObj["id"].toString()

            // Step 2: Upload Chunks (64KB chunks)
            val chunkSize = 64 * 1024
            var offset = 0L
            val totalBytes = contentBytes.size.toLong()

            while (offset < totalBytes) {
                val currentChunkSize = Math.min(chunkSize.toLong(), totalBytes - offset).toInt()
                val chunkBytes = ByteArray(currentChunkSize)
                System.arraycopy(contentBytes, offset.toInt(), chunkBytes, 0, currentChunkSize)

                val body = MultipartBody.Builder()
                    .setType(MultipartBody.FORM)
                    .addFormDataPart(
                        "file", item.fileName,
                        chunkBytes.toRequestBody("application/octet-stream".toMediaType())
                    )
                    .build()

                val chunkRequest = Request.Builder()
                    .url("$baseUrl/transfers/chunk")
                    .addHeader("X-Session-Id", sessionId)
                    .addHeader("X-Chunk-Offset", offset.toString())
                    .post(body)
                    .build()

                val chunkResponse = client.newCall(chunkRequest).execute()
                if (!chunkResponse.isSuccessful) return@withContext false

                offset += currentChunkSize
                onChunkTransferred(offset, totalBytes)
            }

            // Step 3: Verify Integrity
            val verifyRequest = Request.Builder()
                .url("$baseUrl/transfers/verify")
                .addHeader("X-Session-Id", sessionId)
                .post("".toRequestBody())
                .build()

            val verifyResponse = client.newCall(verifyRequest).execute()
            verifyResponse.isSuccessful
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    private fun computeSha256(data: ByteArray): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val hash = digest.digest(data)
        return hash.joinToString("") { "%02x".format(it) }
    }
}
