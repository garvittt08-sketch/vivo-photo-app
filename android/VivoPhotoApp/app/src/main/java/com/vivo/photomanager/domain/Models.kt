package com.vivo.photomanager.domain

data class MediaItem(
    val id: String,
    val androidMediaId: String,
    val fileName: String,
    val uriString: String,
    val sizeBytes: Long,
    val mimeType: String,
    val width: Int,
    val height: Int,
    val dateTaken: Long,
    val isVideo: Boolean = false,
    var sha256Hash: String? = null,
    var isSelectedAsBest: Boolean = true,
    var duplicateGroupId: String? = null,
    var score: Int = 85
)

data class DuplicateGroup(
    val id: String,
    val groupType: String, // "ExactDuplicate" or "SimilarPhoto"
    val confidenceScore: Double,
    val recommendedBestId: String,
    var selectedMediaId: String,
    val items: List<MediaItem>
)

data class ScanSummary(
    val totalPhotos: Int,
    val totalVideos: Int,
    val exactDuplicatesCount: Int,
    val similarGroupsCount: Int,
    val uniqueBestCount: Int,
    val needsReviewCount: Int
)

data class TransferState(
    val currentFileName: String = "",
    val filesCompleted: Int = 0,
    val totalFiles: Int = 0,
    val bytesTransferred: Long = 0L,
    val totalBytes: Long = 0L,
    val speedMBps: Double = 0.0,
    val isTransferring: Boolean = false,
    val isPaused: Boolean = false,
    val statusMessage: String = "Ready"
)
