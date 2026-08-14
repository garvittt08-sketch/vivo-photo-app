import React, { useState } from 'react';
import { ArrowRightLeft, ShieldCheck, Play, Pause, RefreshCw, CheckCircle2 } from 'lucide-react';

export const TransfersPage: React.FC = () => {
  const [isTransferring, setIsTransferring] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [completedCount, setCompletedCount] = useState(1482);
  const totalCount = 4824;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const transferLogs = [
    { id: '1', name: 'IMG_20260814_104500.jpg', size: '3.8 MB', hash: 'a8f9c2d1...', speed: '28.4 MB/s', status: 'Verified Bitwise Hash' },
    { id: '2', name: 'IMG_20260814_104501.jpg', size: '4.1 MB', hash: 'b7e4f1a0...', speed: '31.2 MB/s', status: 'Verified Bitwise Hash' },
    { id: '3', name: 'IMG_20260814_104502.jpg', size: '3.6 MB', hash: 'c9d2e3f4...', speed: '26.8 MB/s', status: 'Verified Bitwise Hash' },
    { id: '4', name: 'VID_20260814_104612.mp4', size: '45.2 MB', hash: 'd0e1f2a3...', speed: '29.5 MB/s', status: 'Verified Bitwise Hash' },
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <ArrowRightLeft className="w-4 h-4" />
          <span>Local Streaming Wi-Fi Engine</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Transfer Status & Verification</h1>
        <p className="text-xs text-gray-400">Target Folder: <code className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-400">E:\Vivo Photo</code></p>
      </div>

      {/* Progress Box */}
      <div className="p-8 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-3xl font-extrabold text-white">{completedCount.toLocaleString()} / {totalCount.toLocaleString()}</span>
            <span className="text-sm font-semibold text-emerald-400 ml-3">({progressPercent}%) Photos Transferred</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-all flex items-center gap-2"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Resume Transfer' : 'Pause'}</span>
            </button>
            <div className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Bitwise SHA-256 Verified</span>
            </div>
          </div>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-gray-400">Current Transfer Speed:</span>
            <p className="text-lg font-bold text-sky-400">28.4 MB/s</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-gray-400">Estimated Remaining:</span>
            <p className="text-lg font-bold text-gray-200">~12 minutes</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-gray-400">Network Interface:</span>
            <p className="text-lg font-bold text-emerald-400">Wi-Fi Direct (5 GHz)</p>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
        <h3 className="text-base font-bold text-white">Recent Integrity Verified Log</h3>
        <div className="divide-y divide-slate-800">
          {transferLogs.map((log) => (
            <div key={log.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="font-semibold text-gray-200">{log.name}</p>
                  <p className="text-[11px] text-gray-500 font-mono">SHA-256 Match: {log.hash}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-gray-400">{log.size}</span>
                <span className="text-sky-400 font-mono">{log.speed}</span>
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-semibold">{log.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
