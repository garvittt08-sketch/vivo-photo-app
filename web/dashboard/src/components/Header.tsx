import React, { useState } from 'react';
import { Wifi, Laptop, Search, Smartphone } from 'lucide-react';
import { NetworkScannerModal } from './NetworkScannerModal';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState({
    hostname: 'Vivo V29 Pro',
    ipAddress: '192.168.29.45',
  });

  return (
    <>
      <header className="h-16 border-b border-[#1F2937] bg-[#111827]/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold text-white tracking-wide">{title}</h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-bold transition-all shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Select Device ({selectedDevice.hostname})</span>
          </button>

          {/* Connection Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Wifi className="w-3.5 h-3.5 animate-pulse" />
            <span>Wi-Fi Online</span>
          </div>

          <div
            onClick={() => setIsScannerOpen(true)}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-200 text-xs font-medium transition-all"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>{selectedDevice.hostname} ({selectedDevice.ipAddress})</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1"></span>
          </div>
        </div>
      </header>

      <NetworkScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        selectedDeviceIp={selectedDevice.ipAddress}
        onSelectDevice={(device) => {
          setSelectedDevice({
            hostname: device.hostname,
            ipAddress: device.ipAddress,
          });
        }}
      />
    </>
  );
};
