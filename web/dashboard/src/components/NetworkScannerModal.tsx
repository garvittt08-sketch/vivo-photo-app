import React, { useState } from 'react';
import { Wifi, Laptop, Smartphone, RefreshCw, X, CheckCircle2, ArrowRight } from 'lucide-react';
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
  selectedDeviceIp: string;
  onSelectDevice: (device: NetworkDevice) => void;
}

export const NetworkScannerModal: React.FC<NetworkScannerModalProps> = ({
  isOpen,
  onClose,
  selectedDeviceIp,
  onSelectDevice,
}) => {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [loading, setLoading] = useState(false);

  const runSubnetScan = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/network/devices');
      const list: NetworkDevice[] = res.data.devices || [];
      setDevices(list);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Connect & Select Target Wi-Fi Device</h2>
              <p className="text-xs text-gray-400">Click any connected device below to connect and pair for photo transfers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-gray-400 pb-2 border-b border-slate-800/50">
            <span>Found {devices.length} active Wi-Fi devices</span>
            <button
              onClick={runSubnetScan}
              disabled={loading}
              className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-semibold disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Rescan Subnet</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-gray-300">Probing local Wi-Fi IP range...</p>
            </div>
          ) : devices.length === 0 ? (
            <p className="text-xs text-gray-500 italic py-8 text-center">Click Rescan Subnet to scan connected devices.</p>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => {
                const isSelected = selectedDeviceIp === device.ipAddress;
                const displayName = device.isServerHost
                  ? `${device.hostname}`
                  : device.hostname === 'Unknown Device'
                  ? `Mobile Device (${device.ipAddress})`
                  : device.hostname;

                return (
                  <div
                    key={device.ipAddress}
                    onClick={() => {
                      onSelectDevice({ ...device, hostname: displayName });
                      onClose();
                    }}
                    className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500 text-white ring-1 ring-sky-500/50'
                        : 'bg-slate-900/60 border-slate-800 text-gray-300 hover:border-sky-500/50 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {device.isServerHost ? (
                        <Laptop className="w-6 h-6 text-sky-400" />
                      ) : (
                        <Smartphone className="w-6 h-6 text-emerald-400" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-gray-100">{displayName}</p>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold">
                              ACTIVE TARGET
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                          IP: {device.ipAddress} • Response: {device.responseTimeMs} ms
                        </p>
                      </div>
                    </div>

                    <div>
                      {isSelected ? (
                        <div className="px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Connected</span>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDevice({ ...device, hostname: displayName });
                            onClose();
                          }}
                          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                        >
                          <span>Connect Device</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-between items-center text-xs text-gray-400">
          <span>Click any device card above to establish direct Wi-Fi sync</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 font-bold"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
