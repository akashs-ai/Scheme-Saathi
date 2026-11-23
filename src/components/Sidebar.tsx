import {
  Bookmark,
  Compass,
  FileCheck2,
  Grid2X2,
  Home,
  LayoutDashboard,
  Plus,
  Settings,
  Users,
} from 'lucide-react';
import { useSchemes } from '../context/SchemeContext';
import type { AppView } from '../types/scheme';

const SIDEBAR_ITEMS: Array<{
  view: AppView;
  label: string;
  icon: typeof Home;
}> = [
  { view: 'home', label: 'Home Overview', icon: Home },
  { view: 'dashboard', label: 'Citizen Dashboard', icon: LayoutDashboard },
  { view: 'explorer', label: 'Scheme Discovery', icon: Compass },
  { view: 'categories', label: 'Categories', icon: Grid2X2 },
  { view: 'family', label: 'Family Benefits', icon: Users },
  { view: 'saved', label: 'Saved Schemes', icon: Bookmark },
  { view: 'documents', label: 'Documents Checklist', icon: FileCheck2 },
  { view: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { activeView, navigateTo, savedSchemeIds } = useSchemes();

  return (
    <aside
      aria-label="Workspace sidebar"
      className="relative z-20 hidden md:flex flex-col items-center justify-between py-6 px-3.5 glass-bar border-r border-white/15 shrink-0 w-[72px] pointer-events-auto"
    >
      {/* Top Vertical Circular Icon Buttons */}
      <div className="flex flex-col items-center gap-3">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeView === item.view ||
            (activeView === 'details' && item.view === 'explorer');
          return (
            <div key={item.view} className="relative group">
              <button
                type="button"
                onClick={() => navigateTo(item.view)}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`relative w-11 h-11 rounded-full border inline-flex items-center justify-center transition-all duration-150 ${
                  isActive
                    ? 'bg-[#B6FF50] border-[#B6FF50] text-[#050505]'
                    : 'glass-pane glass-pane-hover text-[#C7D0BE] hover:text-white'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
                {item.view === 'saved' && savedSchemeIds.length > 0 && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#B6FF50] text-[#050505] font-mono text-[9px] font-bold inline-flex items-center justify-center tabular-nums">
                    {savedSchemeIds.length}
                  </span>
                )}
              </button>

              {/* High-contrast frosted tooltip shown only on hover or keyboard focus-visible */}
              <div
                role="tooltip"
                className="pointer-events-none opacity-0 group-hover:opacity-100 group-has-[:focus-visible]:opacity-100 transition-opacity duration-150 absolute left-14 top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 rounded-lg bg-[#121710]/95 backdrop-blur-xl border border-white/25 shadow-[0_10px_28px_rgba(0,0,0,0.65)] text-white text-[11px] font-medium whitespace-nowrap"
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Circular '+' Action Button (mirrors Screenshot 2) */}
      <div className="relative group mt-6">
        <button
          type="button"
          onClick={() => navigateTo('profile')}
          aria-label="Discover My Benefits (Profile Wizard)"
          className={`w-11 h-11 rounded-full border inline-flex items-center justify-center transition-all duration-150 ${
            activeView === 'profile'
              ? 'bg-[#B6FF50] border-[#B6FF50] text-[#050505]'
              : 'glass-pane glass-pane-hover text-white hover:text-[#B6FF50]'
          }`}
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
        </button>
        <div
          role="tooltip"
          className="pointer-events-none opacity-0 group-hover:opacity-100 group-has-[:focus-visible]:opacity-100 transition-opacity duration-150 absolute left-14 top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 rounded-lg bg-[#121710]/95 backdrop-blur-xl border border-white/25 shadow-[0_10px_28px_rgba(0,0,0,0.65)] text-white text-[11px] font-medium whitespace-nowrap"
        >
          Check Benefits Wizard
        </div>
      </div>
    </aside>
  );
}

export function MobileBottomNav() {
  const { activeView, navigateTo } = useSchemes();

  const items: Array<{ view: AppView; label: string; icon: typeof Home }> = [
    { view: 'home', label: 'Home', icon: Home },
    { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { view: 'explorer', label: 'Explorer', icon: Compass },
    { view: 'family', label: 'Family', icon: Users },
    { view: 'saved', label: 'Saved', icon: Bookmark },
  ];

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 glass-bar border-t border-white/15 px-2 py-2 pointer-events-auto"
    >
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeView === item.view ||
            (activeView === 'details' && item.view === 'explorer');
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => navigateTo(item.view)}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-colors ${
                isActive ? 'text-[#B6FF50] glass-pane' : 'text-[#C7D0BE] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span className="mt-1 text-[10px] font-medium whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
