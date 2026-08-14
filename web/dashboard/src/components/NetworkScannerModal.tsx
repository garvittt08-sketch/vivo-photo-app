import React, { useState } from 'react';
import { Wifi, Laptop, Smartphone, RefreshCw, X, CheckCircle2, ArrowRight, Edit2, Check } from 'lucide-react';
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
  const [customNicknames, setCustomNicknames] = useState<Record<string, string>>({});
  const [editingIp, setEditingIp] = useState<string | null>(null);
  const [tempNickname, setTempNickname] = useState('');

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

  const handleSaveNickname = (ip: string) => {
    if (tempNickname.trim()) {
      setCustomNicknames((prev) => ({ ...prev, [ip]: tempNickname.trim() }));
    }
    setEditingIp(null);
  };

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
              <h2 className="text-lg font-bold text-white">Wi-Fi Device Network Scanner</h2>
              <p className="text-xs text-gray-400">Actual hostnames & IP addresses resolved directly from your Wi-Fi router</p>
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
              <p className="text-sm font-semibold text-gray-300">Resolving real hostnames on your Wi-Fi network...</p>
            </div>
          ) : devices.length === 0 ? (
            <p className="text-xs text-gray-500 italic py-8 text-center">Click Rescan Subnet to scan connected devices.</p>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => {
                const isSelected = selectedDeviceIp === device.ipAddress;
                const displayName = customNicknames[device.ipAddress] || device.hostname;
                const isEditing = editingIp === device.ipAddress;

                return (
                  <div
                    key={device.ipAddress}
                    className={`p-4 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500 text-white ring-1 ring-sky-500/50'
                        : 'bg-slate-900/60 border-slate-800 text-gray-300 hover:border-sky-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 flex-1 pr-4">
                      {device.isServerHost ? (
                        <Laptop className="w-6 h-6 text-sky-400 flex-shrink-0" />
                      ) : (
                        <Smartphone className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={tempNickname}
                              onChange={(e) => setTempNickname(e.target.value)}
                              className="px-2.5 py-1 rounded bg-slate-800 border border-sky-500 text-xs text-white focus:outline-none"
                              placeholder="Enter device nickname..."
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveNickname(device.ipAddress)}
                              className="p-1 rounded bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-gray-100 truncate">{displayName}</p>
                            {!device.isServerHost && (
                              <button
                                onClick={() => {
                                  setEditingIp(device.ipAddress);
                                  setTempNickname(displayName);
                                }}
                                className="p-1 rounded text-gray-500 hover:text-sky-400"
                                title="Rename Device"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold">
                                ACTIVE TARGET
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                          IP: {device.ipAddress} • Response: {device.responseTimeMs} ms
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <div className="px-3.5 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Connected</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
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
          <span>Real device hostnames resolved via router DNS/mDNS</span>
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
