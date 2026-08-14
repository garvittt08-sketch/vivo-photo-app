import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { PhotosPage } from './pages/PhotosPage';
import { DuplicateGroupsPage } from './pages/DuplicateGroupsPage';
import { SimilarPhotosPage } from './pages/SimilarPhotosPage';
import { ReviewPage } from './pages/ReviewPage';
import { TransfersPage } from './pages/TransfersPage';
import { SettingsPage } from './pages/SettingsPage';
import { MediaItem, DuplicateGroup, SystemStats } from './types';
import { fetchStats, fetchMedia, fetchDuplicateGroups, selectBestPhotoInGroup } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [stats, setStats] = useState<SystemStats>({
    totalScanned: 0,
    totalPhotos: 0,
    totalVideos: 0,
    selectedCount: 0,
    exactDuplicates: 0,
    similarGroups: 0,
    needsReview: 0,
  });

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRealData = async () => {
    setLoading(true);
    const [realStats, realMedia, realGroups] = await Promise.all([
      fetchStats(),
      fetchMedia(),
      fetchDuplicateGroups(),
    ]);

    setStats(realStats);
    setMediaItems(realMedia);
    setGroups(realGroups);
    setLoading(false);
  };

  useEffect(() => {
    loadRealData();
    const interval = setInterval(loadRealData, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSelectBest = async (groupId: string, mediaId: string) => {
    const success = await selectBestPhotoInGroup(groupId, mediaId);
    if (success) {
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, selectedMediaId: mediaId } : g))
      );
      loadRealData();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage stats={stats} onNavigate={setActiveTab} />;
      case 'photos':
        return <PhotosPage items={mediaItems} />;
      case 'duplicates':
        return <DuplicateGroupsPage groups={groups} onSelectBest={handleSelectBest} />;
      case 'similar':
        return <SimilarPhotosPage groups={groups} onSelectBest={handleSelectBest} />;
      case 'review':
        return <ReviewPage groups={groups} onSelectBest={handleSelectBest} onNavigate={setActiveTab} />;
      case 'transfers':
      case 'storage':
        return <TransfersPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage stats={stats} onNavigate={setActiveTab} />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'System Dashboard (Live PC Backend)';
      case 'photos': return 'Scanned Media Catalog';
      case 'duplicates': return 'Exact Duplicate Groups';
      case 'similar': return 'Similar Photo Clusters';
      case 'review': return 'Best Photo Selection Review';
      case 'transfers': return 'Streaming Wi-Fi Transfer Engine';
      case 'storage': return 'Target Windows Storage';
      case 'settings': return 'System Configuration';
      default: return 'Vivo Photo Cleaner';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F19]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} needsReviewCount={stats.needsReview} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={getTitle()} />
        <main className="flex-1 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
};
