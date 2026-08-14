import React from 'react';
import { Sparkles, Star, Award } from 'lucide-react';
import { DuplicateGroup } from '../types';

interface SimilarPhotosPageProps {
  groups: DuplicateGroup[];
  onSelectBest: (groupId: string, mediaId: string) => void;
}

export const SimilarPhotosPage: React.FC<SimilarPhotosPageProps> = ({ groups, onSelectBest }) => {
  const similarGroups = groups.filter(g => g.groupType === 1 || g.groupType === undefined);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Perceptual Similarity Engine (dHash)</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Similar & Burst Photo Groups</h1>
        <p className="text-xs text-gray-400">863 near-duplicate frames grouped by visual hamming distance.</p>
      </div>

      <div className="space-y-6">
        {similarGroups.map((group) => (
          <div key={group.id} className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold">
                  Cluster #{group.id.substring(0, 8)}
                </span>
                <span className="text-xs text-gray-400">Average Similarity: {group.averageSimilarityScore}%</span>
              </div>

              <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                Confidence: {group.confidenceScore}%
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {group.items.map((item) => {
                const isSelected = item.id === group.selectedMediaId;
                const score = item.analysis?.overallScore ?? 85;
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectBest(group.id, item.id)}
                    className={`cursor-pointer rounded-xl p-4 border transition-all ${
                      isSelected 
                        ? 'bg-sky-500/10 border-sky-500 ring-2 ring-sky-500/30' 
                        : 'bg-slate-900 border-slate-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden relative mb-3">
                      <img
                        src={`https://picsum.photos/seed/${item.id}/400/250`}
                        alt={item.fileName}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-extrabold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-slate-950" />
                          <span>BEST CHOICE</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-200 truncate">{item.fileName}</p>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-400 text-xs font-bold">
                          {score}/100
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-gray-400">
                        <div className="flex justify-between">
                          <span>Sharpness:</span>
                          <span className="text-gray-200 font-medium">{item.analysis?.sharpnessScore ?? 90}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Exposure:</span>
                          <span className="text-gray-200 font-medium">{item.analysis?.exposureScore ?? 85}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Resolution:</span>
                          <span className="text-gray-200 font-medium">{item.width}×{item.height}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
