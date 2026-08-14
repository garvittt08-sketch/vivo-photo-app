import React, { useEffect, useState } from 'react';
import { ShieldCheck, Smartphone, Check, X, Lock } from 'lucide-react';
import axios from 'axios';

interface PairingRequestData {
  requestId: string;
  deviceName: string;
  ipAddress: string;
  securityPin: string;
  requestedAt: string;
}

interface PairingPromptModalProps {
  onApprovedDevice: (deviceName: string, ipAddress: string) => void;
}

export const PairingPromptModal: React.FC<PairingPromptModalProps> = ({ onApprovedDevice }) => {
  const [pending, setPending] = useState<PairingRequestData[]>([]);

  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/pairing/pending');
      setPending(res.data || []);
    } catch {
      // Ignore polling error
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchPendingRequests, 2000);
    return () => clearInterval(interval);
  }, []);

  if (pending.length === 0) return null;

  const current = pending[0];

  const handleApprove = async () => {
    try {
      await axios.post(`http://localhost:5000/api/pairing/approve/${current.requestId}`);
      onApprovedDevice(current.deviceName, current.ipAddress);
      setPending((prev) => prev.filter((p) => p.requestId !== current.requestId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async () => {
    try {
      await axios.post(`http://localhost:5000/api/pairing/reject/${current.requestId}`);
      setPending((prev) => prev.filter((p) => p.requestId !== current.requestId));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#111827] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-center p-6 space-y-5 ring-1 ring-amber-500/30">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider">
            Pairing Permission Required
          </span>
          <h2 className="text-xl font-extrabold text-white mt-2">Incoming Connection Request</h2>
          <p className="text-xs text-gray-400 mt-1">A device on your Wi-Fi is asking permission to pair with this laptop.</p>
        </div>

        {/* Device Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left flex items-center gap-3">
          <Smartphone className="w-8 h-8 text-emerald-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-white truncate">{current.deviceName || 'Vivo Mobile Phone'}</p>
            <p className="text-xs text-gray-400 font-mono">IP Address: {current.ipAddress}</p>
          </div>
        </div>

        {/* Security PIN Code Display */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Verify Security PIN on Phone Screen:</span>
          </div>
          <div className="text-3xl font-black font-mono tracking-widest text-amber-300">
            {current.securityPin}
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleReject}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-400 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
          >
            <X className="w-4 h-4" />
            <span>Reject Request</span>
          </button>
          <button
            onClick={handleApprove}
            className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Allow & Connect</span>
          </button>
        </div>
      </div>
    </div>
  );
};
