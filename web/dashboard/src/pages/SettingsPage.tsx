import React, { useState } from 'react';
import { Settings as SettingsIcon, Folder, Shield, Network, Save, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [destinationPath, setDestinationPath] = useState('E:\\Vivo Photo');
  const [organizationMode, setOrganizationMode] = useState('Original');
  const [similarityThreshold, setSimilarityThreshold] = useState(85);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
          <SettingsIcon className="w-4 h-4" />
          <span>System & Preferences</span>
        </div>
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
        <p className="text-xs text-gray-400">Configure photo storage path, algorithm thresholds, and network binding.</p>
      </div>

      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-6">
        {/* Photo Destination Path */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-200 flex items-center gap-2">
            <Folder className="w-4 h-4 text-sky-400" />
            <span>Windows Destination Directory</span>
          </label>
          <input
            type="text"
            value={destinationPath}
            onChange={(e) => setDestinationPath(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-gray-100 font-mono focus:outline-none focus:border-sky-500"
          />
          <p className="text-xs text-gray-500">
            Selected photos will be streamed and verified inside this folder.
          </p>
        </div>

        {/* File Organization Mode */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-200">File Organization Structure</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'Original', label: 'Original Filenames', desc: 'E:\\Vivo Photo\\IMG_1001.jpg' },
              { id: 'YearMonth', label: 'Year / Month', desc: 'E:\\Vivo Photo\\2026\\08\\IMG_1001.jpg' },
              { id: 'Date', label: 'Date Folder', desc: 'E:\\Vivo Photo\\2026-08-14\\IMG_1001.jpg' },
            ].map((mode) => (
              <div
                key={mode.id}
                onClick={() => setOrganizationMode(mode.id)}
                className={`cursor-pointer p-4 rounded-xl border text-xs transition-all ${
                  organizationMode === mode.id
                    ? 'bg-sky-500/10 border-sky-500 text-white font-semibold'
                    : 'bg-slate-900 border-slate-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <p className="font-bold text-sm mb-1">{mode.label}</p>
                <p className="text-[11px] text-gray-500 font-mono">{mode.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Similarity Threshold */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-gray-200">Perceptual Similarity Threshold</label>
            <span className="text-sm font-bold text-sky-400 font-mono">{similarityThreshold}% Similarity</span>
          </div>
          <input
            type="range"
            min="60"
            max="98"
            value={similarityThreshold}
            onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
            className="w-full accent-sky-500"
          />
          <p className="text-xs text-gray-500">
            Higher values require near-exact visual matches before creating a similar photo cluster.
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-sky-500/20"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Settings Saved!' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
