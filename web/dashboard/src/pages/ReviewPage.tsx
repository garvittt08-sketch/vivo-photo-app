import React from 'react';
import { CheckSquare, Star, ArrowRight, CheckCircle2 } from 'lucide-react';
import { DuplicateGroup } from '../types';

interface ReviewPageProps {
  groups: DuplicateGroup[];
  onSelectBest: (groupId: string, mediaId: string) => void;
  onNavigate: (tab: string) => void;
}

export const ReviewPage: React.FC<ReviewPageProps> = ({ groups, onSelectBest, onNavigate }) => {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
            <CheckSquare className="w-4 h-4" />
            <span>Pre-Transfer Approval Inspector</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Best-Photo Review & Confirmation</h1>
          <p className="text-xs text-gray-400">Review recommendations before launching transfer to E:\Vivo Photo.</p>
        </div>

        <button
          onClick={() => onNavigate('transfers')}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
        >
          <span>Approve & Clean Transfer</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.id} className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white">Group #{group.id.substring(0, 8)}</span>
                <span className="text-xs text-gray-400 ml-3">
                  {group.groupType === 0 ? 'Exact Duplicate' : 'Similar Photo Cluster'}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                Confidence: {group.confidenceScore}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {group.items.map((item) => {
                const isSelected = item.id === group.selectedMediaId;
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectBest(group.id, item.id)}
                    className={`cursor-pointer rounded-xl p-4 border transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden relative mb-2">
                      <img
                        src={`https://picsum.photos/seed/${item.id}/400/250`}
                        alt={item.fileName}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 px-2 py-1 rounded bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>SELECTED FOR TRANSFER</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-gray-200 truncate">{item.fileName}</p>
                    <p className="text-[11px] text-gray-400">{item.width}×{item.height} • Score: {item.analysis?.overallScore ?? 85}/100</p>
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
