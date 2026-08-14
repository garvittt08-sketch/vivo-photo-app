import React from 'react';
import { Copy, ShieldCheck, Check } from 'lucide-react';
import { DuplicateGroup } from '../types';

interface DuplicateGroupsPageProps {
  groups: DuplicateGroup[];
  onSelectBest: (groupId: string, mediaId: string) => void;
}

export const DuplicateGroupsPage: React.FC<DuplicateGroupsPageProps> = ({ groups, onSelectBest }) => {
  const exactGroups = groups.filter(g => g.groupType === 0 || g.groupType === undefined);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <Copy className="w-4 h-4" />
          <span>Exact Bitwise Duplicates (SHA-256)</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Exact Duplicate Groups</h1>
        <p className="text-xs text-gray-400">1,142 exact file matches detected across {exactGroups.length} duplicate sets.</p>
      </div>

      <div className="space-y-6">
        {exactGroups.map((group) => (
          <div key={group.id} className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
                  Group #{group.id.substring(0, 8)}
                </span>
                <span className="text-xs text-gray-400">{group.items.length} identical file contents</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Auto-Selected Representative</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {group.items.map((item) => {
                const isSelected = item.id === group.selectedMediaId;
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectBest(group.id, item.id)}
                    className={`cursor-pointer rounded-xl p-3 border transition-all ${
                      isSelected 
                        ? 'bg-sky-500/10 border-sky-500 ring-2 ring-sky-500/30' 
                        : 'bg-slate-900 border-slate-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden relative mb-2">
                      <img
                        src={`https://picsum.photos/seed/${item.id}/400/250`}
                        alt={item.fileName}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 p-1 rounded-full bg-emerald-500 text-slate-950">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-gray-200 truncate">{item.fileName}</p>
                    <p className="text-[11px] text-gray-500 font-mono">SHA-256: {item.sha256Hash?.substring(0, 12) ?? '8aef91c3...'}...</p>
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
