export interface MediaItem {
  id: string;
  androidMediaId: string;
  fileName: string;
  originalUri: string;
  fileSizeBytes: number;
  mimeType: string;
  width: number;
  height: number;
  dateTaken: string;
  mediaType: number; // 0 = Photo, 1 = Video
  sha256Hash?: string;
  isSelectedAsBest: boolean;
  duplicateGroupId?: string;
  reviewStatus?: string;
  transferStatus: number;
  analysis?: {
    sharpnessScore: number;
    exposureScore: number;
    resolutionScore: number;
    overallScore: number;
    confidenceScore: number;
    primaryReasons: string;
  };
}

export interface DuplicateGroup {
  id: string;
  groupType: number; // 0 = ExactDuplicate, 1 = SimilarPhoto
  averageSimilarityScore: number;
  recommendedBestMediaId: string;
  selectedMediaId: string;
  confidenceScore: number;
  confidenceLevel: number;
  isUserReviewed: boolean;
  items: MediaItem[];
}

export interface SystemStats {
  totalScanned: number;
  totalPhotos: number;
  totalVideos: number;
  selectedCount: number;
  exactDuplicates: number;
  similarGroups: number;
  needsReview: number;
}
