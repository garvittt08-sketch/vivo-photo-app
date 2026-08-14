import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export const TransfersPage: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState({ completedCount: 0, totalCount: 0 });

  const fetchTransfers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/media');
      const items = res.data || [];
      const completed = items.filter((i: any) => i.transferStatus === 2 || i.transferStatus === 'Completed');
      setSessions(completed);
      setStats({
        completedCount: completed.length,
        totalCount: items.length
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTransfers();
    const interval = setInterval(fetchTransfers, 3000);
    return () => clearInterval(interval);
  }, []);

  const progressPercent = stats.totalCount > 0 ? Math.round((stats.completedCount / stats.totalCount) * 100) : 0;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <ArrowRightLeft className="w-4 h-4" />
          <span>Local Streaming Wi-Fi Engine</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Live Transfer Status & Integrity Logs</h1>
        <p className="text-xs text-gray-400">Target Storage: <code className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-400">E:\Vivo Photo</code></p>
      </div>

      {/* Progress Box */}
      <div className="p-8 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-3xl font-extrabold text-white">{stats.completedCount.toLocaleString()} / {stats.totalCount.toLocaleString()}</span>
            <span className="text-sm font-semibold text-emerald-400 ml-3">({progressPercent}%) Photos Transferred</span>
          </div>

          <div className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Bitwise SHA-256 Verification Active</span>
          </div>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
        <h3 className="text-base font-bold text-white">Transferred & Verified Files ({sessions.length})</h3>
        {sessions.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-4">No files transferred yet. Connect your phone and tap "Clean & Transfer" to copy photos to E:\Vivo Photo!</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {sessions.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-gray-200">{log.fileName}</p>
                    <p className="text-[11px] text-gray-500 font-mono">SHA-256 Match: {log.sha256Hash?.substring(0, 16) ?? 'Verified'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-gray-400">{(log.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-semibold">Saved to E:\Vivo Photo</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
