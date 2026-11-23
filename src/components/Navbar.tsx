import {
  Compass,
  Globe,
  HelpCircle,
  LayoutGrid,
  LogOut,
  Search,
  Sparkles,
  User,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useSchemes } from '../context/SchemeContext';
import type { AppView } from '../types/scheme';
import { SchemeSaathiLogo } from './SchemeSaathiLogo';

const TOP_NAV_ITEMS: Array<{
  view: AppView;
  labelEn: string;
  labelBn: string;
  icon: typeof LayoutGrid;
}> = [
  { view: 'home', labelEn: 'Overview', labelBn: 'ওভারভিউ', icon: LayoutGrid },
  { view: 'profile', labelEn: 'Check Benefits', labelBn: 'যোগ্যতা যাচাই', icon: Sparkles },
  { view: 'explorer', labelEn: 'Scheme Explorer', labelBn: 'প্রকল্প খুঁজুন', icon: Compass },
  { view: 'family', labelEn: 'Family Benefits', labelBn: 'পরিবারের সুবিধা', icon: Users },
  { view: 'support', labelEn: 'Support', labelBn: 'সহায়তা', icon: HelpCircle },
];

export function Navbar() {
  const {
    activeView,
    navigateTo,
    language,
    toggleLanguage,
    profile,
    applications,
    searchAndExplore,
    authUser,
    signOut,
  } = useSchemes();

  const [searchOpen, setSearchOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchAndExplore(quickQuery);
    setSearchOpen(false);
  };

  const pendingAttentionCount =
    (profile.isCompleted ? 0 : 1) +
    applications.filter((a) => a.stage === 'Preparing Documents').length;

  return (
    <header className="sticky top-0 z-30 glass-bar border-b border-white/15 px-4 sm:px-6 lg:px-7 py-3.5 pointer-events-auto">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Circular Logo + Rounded Dark Nav Buttons + Search Icon */}
        <div className="flex items-center gap-2.5 lg:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            aria-label="SchemeSaathi Home"
            className="flex items-center gap-2.5 group shrink-0"
          >
            <SchemeSaathiLogo size={38} variant="white" />
            <span className="font-display text-lg font-bold tracking-wide text-white uppercase hidden xl:inline whitespace-nowrap">
              SchemeSaathi
            </span>
          </button>

          {/* Desktop Rounded Dark Navigation Buttons */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-2 ml-1"
          >
            {TOP_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeView === item.view ||
                (activeView === 'details' && item.view === 'explorer');
              return (
                <button
                  key={item.view}
                  type="button"
                  onClick={() => navigateTo(item.view)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium glass-pane glass-pane-hover transition-all duration-150 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'border-[#B6FF50]/65 text-[#B6FF50]'
                      : 'text-[#E5E5E5] hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-[#B6FF50]' : 'text-[#A3A3A3]'
                    }`}
                    aria-hidden="true"
                  />
                  <span className={language === 'bn' ? 'font-bengali' : ''}>
                    {language === 'bn' ? item.labelBn : item.labelEn}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Search Icon Button (like Screenshot 2) */}
          <div className="relative flex items-center">
            {searchOpen ? (
              <form
                onSubmit={handleQuickSearchSubmit}
                className="flex items-center glass-pane border-[#B6FF50]/60 rounded-full pl-3.5 pr-1.5 py-1 gap-2"
              >
                <Search className="w-3.5 h-3.5 text-[#B6FF50] shrink-0" aria-hidden="true" />
                <input
                  type="text"
                  autoFocus
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  placeholder="Search schemes..."
                  aria-label="Quick search schemes"
                  className="w-32 sm:w-44 bg-transparent text-xs text-white placeholder:text-[#A3A3A3] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setQuickQuery('');
                  }}
                  aria-label="Close search"
                  className="w-6 h-6 rounded-full bg-white/10 text-[#A3A3A3] hover:text-white inline-flex items-center justify-center"
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search schemes"
                title="Search schemes"
                className="w-9 h-9 rounded-full glass-pane glass-pane-hover text-[#E5E5E5] hover:text-[#B6FF50] inline-flex items-center justify-center transition-colors shrink-0"
              >
                <Search className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Language Toggle + Compact Profile / Dashboard Trigger */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={toggleLanguage}
            title="Toggle English / Bengali"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full glass-pane glass-pane-hover text-xs font-medium text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-[#B6FF50]" aria-hidden="true" />
            <span className="font-mono">{language === 'en' ? 'EN' : 'বাং'}</span>
          </button>

          {/* Profile / Citizen Dashboard Block */}
          <button
            type="button"
            onClick={() => navigateTo('dashboard')}
            className={`flex items-center gap-2.5 pl-3 pr-1.5 py-1 rounded-full glass-pane glass-pane-hover transition-colors shrink-0 ${
              activeView === 'dashboard'
                ? 'border-[#B6FF50]/65'
                : ''
            }`}
          >
            <div className="text-right hidden sm:block leading-tight">
              <p className="text-xs font-semibold text-white whitespace-nowrap max-w-[140px] truncate">
                {authUser?.fullName ||
                  (profile.isCompleted
                    ? profile.isSyntheticDemo
                      ? 'Demo Household'
                      : profile.district || 'WB Citizen'
                    : 'My Dashboard')}
              </p>
              <p className="text-[10px] text-[#A3A3A3] whitespace-nowrap">
                {authUser?.district || (profile.isCompleted ? 'Profile Active' : 'Citizen Workspace')}
              </p>
            </div>
            <div className="relative w-8 h-8 rounded-full bg-white/10 border border-white/20 inline-flex items-center justify-center text-white">
              <User className="w-4 h-4 text-[#B6FF50]" aria-hidden="true" />
              {pendingAttentionCount > 0 && (
                <span
                  title={`${pendingAttentionCount} item(s) need attention`}
                  className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#FF9D2E] text-[#050505] font-mono text-[10px] font-bold inline-flex items-center justify-center tabular-nums"
                >
                  {pendingAttentionCount}
                </span>
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => void signOut()}
            aria-label="Sign out"
            title="Sign out"
            className="w-9 h-9 rounded-full glass-pane hover:border-[#E06C75]/60 text-[#E5E5E5] hover:text-[#E06C75] inline-flex items-center justify-center transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Tablet Compact Sub-Row for Navigation (md to lg) */}
      <nav
        aria-label="Tablet navigation"
        className="hidden md:flex lg:hidden items-center gap-2 mt-3 pt-2.5 border-t border-white/10 overflow-x-auto"
      >
        {TOP_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeView === item.view ||
            (activeView === 'details' && item.view === 'explorer');
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => navigateTo(item.view)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium glass-pane transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'border-[#B6FF50]/65 text-[#B6FF50]'
                  : 'text-[#E5E5E5]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{language === 'bn' ? item.labelBn : item.labelEn}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
