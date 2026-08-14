import React, { useState, useEffect } from 'react';
import { Wifi, AlertTriangle, Smartphone, Radio } from 'lucide-react';
import { NetworkScannerModal } from './NetworkScannerModal';
import axios from 'axios';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedDeviceIp, setSelectedDeviceIp] = useState('');
  const [selectedDeviceName, setSelectedDeviceName] = useState('');
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  const checkBackendHealth = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/media/stats', { timeout: 2000 });
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
              <span>PC Server Ready (Port 5000)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>PC Backend Offline</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Wi-Fi Device Connection / Subnet Scanner Button */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 text-xs transition-all group"
          >
            <div className={`p-1.5 rounded-lg transition-transform group-hover:scale-110 ${
              selectedDeviceIp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-sky-500/10 text-sky-400'
            }`}>
              {selectedDeviceIp ? <Smartphone className="w-4 h-4" /> : <Radio className="w-4 h-4 animate-pulse" />}
            </div>
            <div className="text-left">
              <p className="text-[10px] text-gray-400 font-semibold leading-none">
                {selectedDeviceIp ? 'Paired Mobile Phone' : 'Wi-Fi Discovery Mode'}
              </p>
              <p className="text-xs font-bold text-gray-200 leading-tight mt-0.5">
                {selectedDeviceIp ? `${selectedDeviceName} (${selectedDeviceIp})` : 'Listening on Port 8888'}
              </p>
            </div>
          </button>
        </div>
      </header>

      {/* Backend Offline Warning Bar */}
      {!isBackendOnline && (
        <div className="bg-red-500/15 border-b border-red-500/30 px-6 py-2 flex items-center justify-between text-xs text-red-200">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
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
