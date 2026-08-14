package com.vivo.photomanager.data

import android.content.ContentResolver
import android.content.Context
import android.provider.MediaStore
import com.vivo.photomanager.domain.MediaItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.UUID

class MediaStoreScanner(private val context: Context) {

    suspend fun scanLocalMedia(onProgress: (scanned: Int, total: Int) -> Unit): List<MediaItem> = withContext(Dispatchers.IO) {
        val itemList = mutableListOf<MediaItem>()
        val contentResolver: ContentResolver = context.contentResolver

        val projection = arrayOf(
            MediaStore.Images.Media._ID,
            MediaStore.Images.Media.DISPLAY_NAME,
            MediaStore.Images.Media.SIZE,
            MediaStore.Images.Media.MIME_TYPE,
            MediaStore.Images.Media.WIDTH,
            MediaStore.Images.Media.HEIGHT,
            MediaStore.Images.Media.DATE_TAKEN
        )

        val sortOrder = "${MediaStore.Images.Media.DATE_TAKEN} DESC"

        contentResolver.query(
            MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
            projection,
            null,
            null,
            sortOrder
        )?.use { cursor ->
            val idColumn = cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID)
            val nameColumn = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DISPLAY_NAME)
            val sizeColumn = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.SIZE)
            val mimeColumn = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.MIME_TYPE)
            val widthColumn = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.WIDTH)
            val heightColumn = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.HEIGHT)
            val dateColumn = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATE_TAKEN)

            val totalCount = cursor.count
            var currentIndex = 0

            while (cursor.moveToNext()) {
                val id = cursor.getLong(idColumn)
                val name = cursor.getString(nameColumn) ?: "IMG_$id.jpg"
                val size = cursor.getLong(sizeColumn)
                val mime = cursor.getString(mimeColumn) ?: "image/jpeg"
                val width = cursor.getInt(widthColumn)
                val height = cursor.getInt(heightColumn)
                val dateTaken = cursor.getLong(dateColumn)

                val uri = "${MediaStore.Images.Media.EXTERNAL_CONTENT_URI}/$id"

                itemList.add(
                    MediaItem(
                        id = UUID.randomUUID().toString(),
                        androidMediaId = id.toString(),
                        fileName = name,
                        uriString = uri,
                        sizeBytes = size,
                        mimeType = mime,
                        width = if (width > 0) width else 4000,
                        height = if (height > 0) height else 3000,
                        dateTaken = dateTaken,
                        isVideo = false
                    )
                )

                currentIndex++
                if (currentIndex % 100 == 0 || currentIndex == totalCount) {
                    onProgress(currentIndex, totalCount)
                }
            }
        }

        itemList
    }
}
