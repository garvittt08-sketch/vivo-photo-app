import React, { useState } from 'react';
import { Star, CheckCircle, Search } from 'lucide-react';
import { MediaItem } from '../types';

interface PhotosPageProps {
  items: MediaItem[];
}

export const PhotosPage: React.FC<PhotosPageProps> = ({ items }) => {
  const [filter, setFilter] = useState<'all' | 'selected' | 'candidates'>('all');
  const [search, setSearch] = useState('');

  const filtered = items.filter(item => {
    if (filter === 'selected' && !item.isSelectedAsBest) return false;
    if (filter === 'candidates' && item.isSelectedAsBest) return false;
    if (search && !item.fileName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Scanned Photo Catalog</h1>
          <p className="text-xs text-gray-400">Showing {filtered.length} of {items.length} media items</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-gray-200 focus:outline-none focus:border-sky-500 w-60"
            />
          </div>

          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-gray-400 hover:text-white'}`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilter('selected')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'selected' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-gray-400 hover:text-white'}`}
            >
              Selected Best
            </button>
            <button
              onClick={() => setFilter('candidates')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'candidates' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-gray-400 hover:text-white'}`}
            >
              Candidates
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filtered.map((item) => (
          <div 
            key={item.id}
            className={`group relative rounded-xl overflow-hidden bg-slate-900 border transition-all hover:scale-[1.02] ${
              item.isSelectedAsBest ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' : 'border-slate-800 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="aspect-square bg-slate-800 flex items-center justify-center relative">
              <img
                src={`https://picsum.photos/seed/${item.id}/300/300`}
                alt={item.fileName}
                className="w-full h-full object-cover"
              />
              {item.isSelectedAsBest && (
                <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                  <Star className="w-3 h-3 fill-slate-950" />
                  <span>BEST</span>
                </div>
              )}
            </div>

            <div className="p-3 space-y-1">
              <p className="text-xs font-semibold text-gray-200 truncate">{item.fileName}</p>
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>{item.width}×{item.height}</span>
                <span className="font-mono text-sky-400">{item.analysis?.overallScore ?? 85}/100</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
