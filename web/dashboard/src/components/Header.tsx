import React, { useState } from 'react';
import { Wifi, Laptop, Search } from 'lucide-react';
import { NetworkScannerModal } from './NetworkScannerModal';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-[#1F2937] bg-[#111827]/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold text-white tracking-wide">{title}</h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-semibold transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Scan Network Devices</span>
          </button>

          {/* Connection Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Wifi className="w-3.5 h-3.5 animate-pulse" />
            <span>Wi-Fi Online</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-gray-300 text-xs font-medium">
            <Laptop className="w-3.5 h-3.5 text-sky-400" />
            <span>Vivo V29 Pro (192.168.29.45)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1"></span>
          </div>
        </div>
      </header>

      <NetworkScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </>
  );
};
