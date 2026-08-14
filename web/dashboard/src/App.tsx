import React, { useState } from 'react';
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

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [stats, setStats] = useState<SystemStats>({
    totalScanned: 6247,
    totalPhotos: 5905,
    totalVideos: 342,
    selectedCount: 4824,
    exactDuplicates: 1142,
    similarGroups: 863,
    needsReview: 83,
  });

  const demoItems: MediaItem[] = Array.from({ length: 24 }).map((_, i) => ({
    id: `item-${i + 1}`,
    androidMediaId: `${i + 1}`,
    fileName: `IMG_20260814_${1000 + i}.jpg`,
    originalUri: `content://media/external/images/media/${i + 1}`,
    fileSizeBytes: 3800000,
    mimeType: 'image/jpeg',
    width: 4000,
    height: 3000,
    dateTaken: '2026-08-14T10:45:00Z',
    mediaType: 0,
    sha256Hash: 'a8f9c2d1e4b5a6f7890123456789abcdef0123456789abcdef0123456789abcd',
    isSelectedAsBest: i % 2 === 0,
    transferStatus: 0,
    analysis: {
      sharpnessScore: 92 - (i % 5) * 3,
      exposureScore: 88,
      resolutionScore: 95,
      overallScore: 94 - (i % 4) * 4,
      confidenceScore: 90,
      primaryReasons: 'Crisp focus • Optimal exposure • High resolution',
    },
  }));

  const [groups, setGroups] = useState<DuplicateGroup[]>([
    {
      id: 'grp-101',
      groupType: 0,
      averageSimilarityScore: 100,
      recommendedBestMediaId: 'item-1',
      selectedMediaId: 'item-1',
      confidenceScore: 100,
      confidenceLevel: 0,
      isUserReviewed: false,
      items: [demoItems[0], demoItems[1]],
    },
    {
      id: 'grp-102',
      groupType: 1,
      averageSimilarityScore: 92,
      recommendedBestMediaId: 'item-3',
      selectedMediaId: 'item-3',
      confidenceScore: 88,
      confidenceLevel: 1,
      isUserReviewed: false,
      items: [demoItems[2], demoItems[3], demoItems[4]],
    },
  ]);

  const handleSelectBest = (groupId: string, mediaId: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, selectedMediaId: mediaId } : g))
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage stats={stats} onNavigate={setActiveTab} />;
      case 'photos':
        return <PhotosPage items={demoItems} />;
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
      case 'dashboard': return 'System Dashboard';
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
