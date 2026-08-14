import React, { useState } from 'react';
import { Wifi, Laptop, Smartphone, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

interface NetworkDevice {
  ipAddress: string;
  hostname: string;
  isAlive: boolean;
  isServerHost: boolean;
  responseTimeMs: number;
}

interface NetworkScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NetworkScannerModal: React.FC<NetworkScannerModalProps> = ({ isOpen, onClose }) => {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [loading, setLoading] = useState(false);

  const runSubnetScan = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/network/devices');
      setDevices(res.data.devices || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (isOpen) {
      runSubnetScan();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Active Wi-Fi Subnet Scanner</h2>
              <p className="text-xs text-gray-400">Scanning local subnet for connected devices</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-gray-400 pb-2 border-b border-slate-800/50">
            <span>Found {devices.length} active network devices</span>
            <button
              onClick={runSubnetScan}
              disabled={loading}
              className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-semibold disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Rescan Network</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-gray-300">Probing local Wi-Fi IP range (192.168.x.1–254)...</p>
            </div>
          ) : devices.length === 0 ? (
            <p className="text-xs text-gray-500 italic py-8 text-center">Click Rescan Network to probe connected devices.</p>
          ) : (
            <div className="space-y-2">
              {devices.map((device) => (
                <div
                  key={device.ipAddress}
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    device.isServerHost
                      ? 'bg-sky-500/10 border-sky-500/40 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {device.isServerHost ? (
                      <Laptop className="w-5 h-5 text-sky-400" />
                    ) : (
                      <Smartphone className="w-5 h-5 text-emerald-400" />
                    )}
                    <div>
                      <p className="font-bold text-sm text-gray-100">{device.hostname}</p>
                      <p className="text-[11px] text-gray-500 font-mono">IP: {device.ipAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-400 font-mono">{device.responseTimeMs} ms</span>
                    {device.isServerHost ? (
                      <span className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active Server
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-slate-800 text-gray-400">Connected Device</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs font-bold"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
