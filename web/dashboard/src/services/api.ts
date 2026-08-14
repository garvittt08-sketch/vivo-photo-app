import axios from 'axios';
import { MediaItem, DuplicateGroup, SystemStats } from '../types';

const API_BASE = 'http://localhost:5000/api';

export const fetchStats = async (): Promise<SystemStats> => {
  try {
    const res = await axios.get(`${API_BASE}/media/stats`);
    return res.data;
  } catch (e) {
    console.error("Failed to fetch live stats", e);
    return {
      totalScanned: 0,
      totalPhotos: 0,
      totalVideos: 0,
      selectedCount: 0,
      exactDuplicates: 0,
      similarGroups: 0,
      needsReview: 0,
    };
  }
};

export const fetchMedia = async (onlySelected = false): Promise<MediaItem[]> => {
  try {
    const res = await axios.get(`${API_BASE}/media`, {
      params: { onlySelected }
    });
    return res.data;
  } catch (e) {
    console.error("Failed to fetch media catalog", e);
    return [];
  }
};

export const fetchDuplicateGroups = async (groupType?: number): Promise<DuplicateGroup[]> => {
  try {
    const res = await axios.get(`${API_BASE}/duplicate-groups`, {
      params: { type: groupType }
    });
    return res.data;
  } catch (e) {
    console.error("Failed to fetch duplicate groups", e);
    return [];
  }
};

export const selectBestPhotoInGroup = async (groupId: string, mediaItemId: string): Promise<boolean> => {
  try {
    const res = await axios.post(`${API_BASE}/duplicate-groups/select-best`, {
      groupId,
      mediaItemId
    });
    return res.data.success;
  } catch (e) {
    console.error("Failed to update best photo selection", e);
    return false;
  }
};

export const fetchSettings = async () => {
  try {
    const res = await axios.get(`${API_BASE}/settings`);
    return res.data;
  } catch (e) {
    return { photoDestinationPath: 'E:\\Vivo Photo', fileOrganizationMode: 'Original', similarityThreshold: 85 };
  }
};

export const updateSettings = async (settings: any) => {
  try {
    const res = await axios.put(`${API_BASE}/settings`, settings);
    return res.data;
  } catch (e) {
    console.error("Failed to update settings", e);
  }
};
