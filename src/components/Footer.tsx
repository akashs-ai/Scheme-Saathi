import { useSchemes } from '../context/SchemeContext';
import { SchemeSaathiLogo } from './SchemeSaathiLogo';

export function Footer() {
  const { navigateTo, openCategoryInExplorer } = useSchemes();

  return (
    <footer className="mt-12 rounded-2xl glass-window p-6 sm:p-8 mb-16 md:mb-0">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b border-white/12">
        <div className="md:col-span-5 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <SchemeSaathiLogo size={28} variant="lime" />
            <span className="font-display text-base font-bold tracking-wide text-white uppercase">
              SchemeSaathi
            </span>
          </div>
          <p className="text-xs text-[#A3A3A3] leading-relaxed max-w-md">
            Universal West Bengal government welfare scheme discovery workspace. Never collects
            Aadhaar numbers, bank credentials, OTPs, or document uploads. Verify and apply strictly
            on official <span className="font-mono text-white/90">.gov.in</span> portals or local
            BDO / Municipality / Duare Sarkar desks.
          </p>
        </div>

        <div className="md:col-span-3 space-y-2">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
            Workspace
          </h4>
          <ul className="space-y-1.5 text-xs text-[#A3A3A3]">
            <li>
              <button
                type="button"
                onClick={() => navigateTo('dashboard')}
                className="hover:text-[#B6FF50] transition-colors"
              >
                Citizen Dashboard
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigateTo('explorer')}
                className="hover:text-[#B6FF50] transition-colors"
              >
                Scheme Explorer
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigateTo('family')}
                className="hover:text-[#B6FF50] transition-colors"
              >
                Benefits for Your Family
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navigateTo('support')}
                className="hover:text-[#B6FF50] transition-colors"
              >
                Official Portals &amp; Support
              </button>
            </li>
          </ul>
        </div>

        <div className="md:col-span-4 space-y-2">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
            Core Categories
          </h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-[#A3A3A3]">
            <button
              type="button"
              onClick={() => openCategoryInExplorer('women')}
              className="text-left hover:text-[#B6FF50] transition-colors"
            >
              Women &amp; Girls
            </button>
            <button
              type="button"
              onClick={() => openCategoryInExplorer('farmers')}
              className="text-left hover:text-[#B6FF50] transition-colors"
            >
              Farmers &amp; Agriculture
            </button>
            <button
              type="button"
              onClick={() => openCategoryInExplorer('healthcare')}
              className="text-left hover:text-[#B6FF50] transition-colors"
            >
              Healthcare
            </button>
            <button
              type="button"
              onClick={() => openCategoryInExplorer('pension')}
              className="text-left hover:text-[#B6FF50] transition-colors"
            >
              Pension &amp; Seniors
            </button>
            <button
              type="button"
              onClick={() => openCategoryInExplorer('education')}
              className="text-left hover:text-[#B6FF50] transition-colors"
            >
              Education &amp; Scholarships
            </button>
            <button
              type="button"
              onClick={() => openCategoryInExplorer('workers')}
              className="text-left hover:text-[#B6FF50] transition-colors"
            >
              Workers &amp; Security
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#737373]">
        <p>
          Demo family profiles are clearly labeled as synthetic. Independent informational catalog.
        </p>
        <p className="font-mono tabular-nums">Catalog Verified: Nov 2026</p>
      </div>
    </footer>
  );
}
