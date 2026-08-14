import React from 'react';
import { 
  LayoutDashboard, 
  Image, 
  Copy, 
  Sparkles, 
  CheckSquare, 
  ArrowRightLeft, 
  HardDrive, 
  Settings 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  needsReviewCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, needsReviewCount }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'photos', label: 'All Photos', icon: Image },
    { id: 'duplicates', label: 'Exact Duplicates', icon: Copy },
    { id: 'similar', label: 'Similar Photos', icon: Sparkles },
    { id: 'review', label: 'Review & Confirm', icon: CheckSquare, badge: needsReviewCount },
    { id: 'transfers', label: 'Transfer Engine', icon: ArrowRightLeft },
    { id: 'storage', label: 'Storage (E:\\Vivo Photo)', icon: HardDrive },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#111827] border-r border-[#1F2937] flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-[#1F2937] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-lg">
          V
        </div>
        <div>
          <h1 className="font-bold text-white text-base leading-tight">Vivo Photo</h1>
          <p className="text-xs text-sky-400 font-medium">Smart Cleaner & Transfer</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm' 
                  : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#1F2937]">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <div>
            <p className="text-xs font-semibold text-gray-200">Local Wi-Fi Network</p>
            <p className="text-[11px] text-gray-400">Direct PC-Phone Link</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
