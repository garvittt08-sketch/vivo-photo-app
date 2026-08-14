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

    data class StartSessionRequest(
        val mediaItemId: String,
        val fileName: String,
        val totalBytes: Long,
        val sourceSha256: String
    )

    data class SessionResponse(
        val sessionId: String,
        val mediaItemId: String,
        val status: String
    )

    suspend fun transferFile(
        item: MediaItem,
        inputStream: InputStream,
        onProgress: (bytesTransferred: Long, totalBytes: Long) -> Unit
    ): Boolean = withContext(Dispatchers.IO) {
        try {
            val bytes = inputStream.readBytes()
            val totalBytes = bytes.size.toLong()

            val digest = MessageDigest.getInstance("SHA-256")
            val hashBytes = digest.digest(bytes)
            val sha256 = hashBytes.joinToString("") { "%02x".format(it) }

            // 1. Start Session
            val startReq = StartSessionRequest(item.id, item.fileName, totalBytes, sha256)
            val startBody = gson.toJson(startReq).toRequestBody("application/json".toMediaType())
            val startHttpResponse = client.newCall(
                Request.Builder()
                    .url("http://$serverIp:$port/api/transfers/start")
                    .post(startBody)
                    .build()
            ).execute()

            if (!startHttpResponse.isSuccessful) return@withContext false
            val responseText = startHttpResponse.body?.string() ?: return@withContext false
            val sessionResp = gson.fromJson(responseText, SessionResponse::class.java)
            val sessionId = sessionResp.sessionId

            // 2. Upload File Chunk
            val chunkBody = MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart(
                    "file",
                    item.fileName,
                    bytes.toRequestBody("application/octet-stream".toMediaType())
                )
                .build()

            val chunkHttpResponse = client.newCall(
                Request.Builder()
                    .url("http://$serverIp:$port/api/transfers/chunk")
                    .addHeader("X-Session-Id", sessionId)
                    .addHeader("X-Chunk-Offset", "0")
                    .post(chunkBody)
                    .build()
            ).execute()

            if (!chunkHttpResponse.isSuccessful) return@withContext false

            onProgress(totalBytes, totalBytes)

            // 3. Verify Session & Write File to E:\Vivo Photo
            val verifyHttpResponse = client.newCall(
                Request.Builder()
                    .url("http://$serverIp:$port/api/transfers/verify")
                    .addHeader("X-Session-Id", sessionId)
                    .post("".toRequestBody())
                    .build()
            ).execute()

            return@withContext verifyHttpResponse.isSuccessful
        } catch (e: Exception) {
            e.printStackTrace()
            return@withContext false
        }
    }
}
