import React from 'react';
import { 
  Image, 
  Copy, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck 
} from 'lucide-react';
import { SystemStats } from '../types';

interface DashboardPageProps {
  stats: SystemStats;
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ stats, onNavigate }) => {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-900/40 via-indigo-900/30 to-slate-900 border border-sky-500/20 p-8">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Strictly Non-Destructive • Local Wi-Fi Direct
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Vivo Smart Photo Cleaner & Selector
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed">
            Automatically group exact duplicates and near-identical photos, pick the crispest & best-exposed frame, and transfer selected media safely to <code className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 text-xs">E:\Vivo Photo</code>. Original files on your Vivo phone remain 100% untouched.
          </p>
          <div className="pt-2 flex items-center gap-4">
            <button 
              onClick={() => onNavigate('review')}
              className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-sky-500/25 flex items-center gap-2"
            >
              <span>Review Selected Photos ({stats.selectedCount})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onNavigate('transfers')}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
            >
              <span>Clean & Transfer Now</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium">Total Scanned</span>
            <Image className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{stats.totalScanned.toLocaleString()}</p>
          <p className="text-xs text-gray-500">{stats.totalPhotos} Photos • {stats.totalVideos} Videos</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium">Best Photos Selected</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400">{stats.selectedCount.toLocaleString()}</p>
          <p className="text-xs text-emerald-500/80 font-medium">Ready to transfer to PC</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium">Exact Duplicates</span>
            <Copy className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-amber-400">{stats.exactDuplicates.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Bitwise SHA-256 Identical</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium">Similar Groups</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-purple-400">{stats.similarGroups.toLocaleString()}</p>
          <p className="text-xs text-gray-500">dHash Perceptual Clusters</p>
        </div>
      </div>

      {/* Review Banner */}
      {stats.needsReview > 0 && (
        <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-200">{stats.needsReview} candidate groups recommended for user review</p>
              <p className="text-xs text-amber-400/80">These similarity groups have close score margins between top candidates.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('review')}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all"
          >
            Review Now
          </button>
        </div>
      )}
    </div>
  );
};
