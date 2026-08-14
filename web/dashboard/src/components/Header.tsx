import React, { useState, useEffect } from 'react';
import { Wifi, RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { NetworkScannerModal } from './NetworkScannerModal';
import axios from 'axios';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedDeviceIp, setSelectedDeviceIp] = useState('192.168.29.45');
  const [selectedDeviceName, setSelectedDeviceName] = useState('Vivo Mobile Phone');
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  const checkBackendHealth = async () => {
    try {
      await axios.get('http://localhost:5000/api/media/stats', { timeout: 2000 });
      setIsBackendOnline(true);
    } catch {
      setIsBackendOnline(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="h-16 border-b border-slate-800 bg-[#0B0F19]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-extrabold text-white tracking-tight">{title}</h1>
          
          {/* Live Server Connection Indicator */}
          {isBackendOnline ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>PC Backend Online (Port 5000)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>PC Backend Offline</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Active Target Device Button */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 text-xs transition-all group"
          >
            <div className="p-1 rounded-lg bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
              <Wifi className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <p className="text-[10px] text-gray-400 font-semibold leading-none">Target Wi-Fi Device</p>
              <p className="text-xs font-bold text-gray-200 leading-tight mt-0.5">{selectedDeviceName}</p>
            </div>
          </button>
        </div>
      </header>

      {/* Backend Offline Warning Bar */}
      {!isBackendOnline && (
        <div className="bg-red-500/15 border-b border-red-500/30 px-6 py-2 flex items-center justify-between text-xs text-red-200">
          <div className="flex items-center gap-2 font-medium">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>Cannot reach ASP.NET Core server at <strong>http://localhost:5000</strong>. Run <code>dotnet run --project windows/VivoPhoto.Server/VivoPhoto.Server.csproj</code> in terminal to start server.</span>
          </div>
          <button onClick={checkBackendHealth} className="px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 font-bold text-red-300">
            Retry Connection
          </button>
        </div>
      )}

      {/* Network Scanner Modal */}
      <NetworkScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        selectedDeviceIp={selectedDeviceIp}
        onSelectDevice={(device) => {
          setSelectedDeviceIp(device.ipAddress);
          setSelectedDeviceName(device.hostname);
        }}
      />
    </>
  );
};
