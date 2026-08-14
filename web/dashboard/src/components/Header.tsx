import React from 'react';
import { Wifi, Smartphone, CheckCircle } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="h-16 border-b border-[#1F2937] bg-[#111827]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
      <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Wifi className="w-3.5 h-3.5" />
          <span>Wi-Fi Online</span>
        </div>

        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-gray-200 text-xs font-medium">
          <Smartphone className="w-4 h-4 text-sky-400" />
          <span>Vivo V29 Pro (1920×1080)</span>
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 ml-1" />
        </div>
      </div>
    </header>
  );
};
