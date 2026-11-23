import {
  ArrowRight,
  ArrowUpRight,
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { CategoryIcon } from '../components/CategoryIcon';
import { SchemeCard } from '../components/SchemeCard';
import { useSchemes } from '../context/SchemeContext';
import { SCHEME_CATEGORIES } from '../data/categories';
import { getSchemesInCategory, SCHEMES } from '../data/schemes';
import { evaluateSchemeForProfile } from '../utils/matchingEngine';

const HERO_IMAGE_PATH = '/src/assets/images/hero_wb_family_civic_1795322700768.jpg';
const FAMILY_IMAGE_PATH = '/src/assets/images/family_benefits_community_1795322702336.jpg';

const FEATURED_SCHEME_IDS = [
  'annapurna-yojana',
  'krishak-bandhu',
  'ayushman-bharat-pmjay',
  'wb-old-age-pension',
  'banglar-bari',
  'svmcm',
];

export function HomeView() {
  const { navigateTo, openCategoryInExplorer, profile, language } = useSchemes();
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [familyImgFailed, setFamilyImgFailed] = useState(false);

  const featuredSchemes = FEATURED_SCHEME_IDS.map((id) =>
    SCHEMES.find((s) => s.id === id)
  ).filter((s): s is NonNullable<typeof s> => Boolean(s));

  const verifiedCount = SCHEMES.filter((s) => s.verificationStatus === 'Verified Active').length;
  const verifyAttentionCount = SCHEMES.length - verifiedCount;

  return (
    <div className="space-y-8">
      {/* Top Workspace Header Row (mirrors Screenshot 2's compact title + filter pill bar) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-wide text-white uppercase">
            {language === 'bn' ? 'পশ্চিমবঙ্গ সরকারি সুবিধা ওভারভিউ' : 'WEST BENGAL WELFARE OVERVIEW'}
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-0.5">
            Universal State &amp; Central Government Benefit Discovery Workspace
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigateTo('dashboard')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full glass-pane glass-pane-hover text-xs font-medium text-white transition-colors whitespace-nowrap"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#B6FF50]" aria-hidden="true" />
            <span>Open Full Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => navigateTo('family')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full glass-pane glass-pane-hover text-xs font-medium text-[#D6DCD0] hover:text-white transition-colors whitespace-nowrap"
          >
            <Users className="w-3.5 h-3.5 text-[#FF9D2E]" aria-hidden="true" />
            <span>Family Mode</span>
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 1. COMPACT GLASS HERO CARD                                       */}
      {/* ================================================================ */}
      <section className="glass-window rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7 p-6 sm:p-7 lg:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-[#B6FF50]">
              <span className="w-2 h-2 rounded-full bg-[#B6FF50]" aria-hidden="true" />
              <span>West Bengal State &amp; Central Government Schemes</span>
            </div>

            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-[2.2rem] font-bold tracking-tight text-white leading-[1.15]">
              Government benefits are meant for you. Let&apos;s find yours.
            </h2>

            <p className="mt-3 text-sm text-[#A3A3A3] leading-relaxed max-w-xl">
              Discover scholarships, pensions, healthcare, financial assistance, farmer support,
              housing and government schemes for you and your family.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigateTo('profile')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#050505] bg-[#B6FF50] hover:bg-[#c8ff78] rounded-full transition-colors whitespace-nowrap shrink-0"
              >
                <span>Discover My Benefits</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => openCategoryInExplorer('all')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-medium text-white glass-pane glass-pane-hover rounded-full transition-colors whitespace-nowrap shrink-0"
              >
                <span>Explore All Schemes</span>
              </button>
            </div>

            <p className="text-[11px] text-[#A3A3A3] flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B6FF50] shrink-0" aria-hidden="true" />
              <span>
                No Aadhaar, bank details, or OTP collected. Direct{' '}
                <span className="font-mono text-white/90">.gov.in</span> source links.
              </span>
            </p>
          </div>
        </div>

        {/* Framed Documentary Family Scene */}
        <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full bg-black/20 border-t lg:border-t-0 lg:border-l border-white/15">
          {!heroImgFailed ? (
            <>
              <img
                src={HERO_IMAGE_PATH}
                alt="Multi-generational West Bengal family reviewing welfare and educational documents together"
                referrerPolicy="no-referrer"
                onError={() => setHeroImgFailed(true)}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 via-[#050505]/20 to-transparent" />
              <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-[11px] text-white/90">
                <span className="font-medium">Multi-Generational Household Coverage</span>
                <span className="font-mono text-[#B6FF50] tabular-nums">WB · 23 Districts</span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
              <Users className="w-8 h-8 text-[#B6FF50]" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-white">West Bengal Citizen Welfare</p>
              <p className="mt-1 text-xs text-[#A3A3A3]">
                Students, women, farmers, workers, and seniors.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================ */}
      {/* 2. FOUR GLASS DASHBOARD STATISTIC PANELS                         */}
      {/* ================================================================ */}
      <section aria-label="Platform statistics" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Schemes */}
        <div className="glass-window glass-window-hover rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-bold tracking-wider text-[#A3A3A3] uppercase">
              Total Schemes
            </span>
            <span className="text-[10px] font-mono text-[#B6FF50] inline-flex items-center gap-1">
              <TrendingUp className="w-3 h-3" aria-hidden="true" />
              <span>{verifiedCount} active</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2.5">
            <p className="font-mono text-3xl sm:text-4xl font-semibold text-white tabular-nums">
              {SCHEMES.length}
            </p>
            <span className="text-[11px] font-mono text-[#FF9D2E] tabular-nums">
              {verifyAttentionCount} review
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-[#B6FF50]"
              style={{ width: `${Math.round((verifiedCount / SCHEMES.length) * 100)}%` }}
            />
            <div
              className="h-full bg-[#FF9D2E]"
              style={{ width: `${Math.round((verifyAttentionCount / SCHEMES.length) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-[#A3A3A3]">West Bengal State &amp; Central portals</p>
        </div>

        {/* Stat 2: Benefit Categories */}
        <div className="glass-window glass-window-hover rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-bold tracking-wider text-[#A3A3A3] uppercase">
              Benefit Categories
            </span>
            <span className="w-2 h-2 rounded-full bg-[#B6FF50]" aria-hidden="true" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="font-mono text-3xl sm:text-4xl font-semibold text-white tabular-nums">
              {SCHEME_CATEGORIES.length - 1}
            </p>
            <span className="text-[11px] text-[#B6FF50] font-medium">+ All View</span>
          </div>
          <div className="mt-3 flex items-center gap-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i % 4 === 3 ? 'bg-[#FF9D2E]' : 'bg-[#B6FF50]'
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-[11px] text-[#A3A3A3]">Beyond scholarships to full household aid</p>
        </div>

        {/* Stat 3: District Coverage */}
        <div className="glass-window glass-window-hover rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-bold tracking-wider text-[#A3A3A3] uppercase">
              District Coverage
            </span>
            <span className="text-[10px] font-mono text-[#B6FF50]">100% WB</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="font-mono text-3xl sm:text-4xl font-semibold text-white tabular-nums">
              23
            </p>
            <span className="text-[11px] text-[#A3A3A3]">Districts</span>
          </div>
          <p className="mt-3 text-[11px] text-[#A3A3A3] leading-relaxed">
            Rural Gram Panchayats, Municipalities &amp; Kolkata Municipal wards
          </p>
        </div>

        {/* Stat 4: Privacy Protection */}
        <div className="glass-window glass-window-hover rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-bold tracking-wider text-[#A3A3A3] uppercase">
              Privacy Protection
            </span>
            <span className="text-[10px] font-mono text-[#B6FF50]">LOCAL ONLY</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="font-mono text-3xl sm:text-4xl font-semibold text-[#B6FF50] tabular-nums">
              0
            </p>
            <span className="text-[11px] text-white/90">Sensitive IDs</span>
          </div>
          <p className="mt-3 text-[11px] text-[#A3A3A3] leading-relaxed">
            Zero Aadhaar numbers, bank credentials, or OTPs ever requested
          </p>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 3. CATEGORIES SECTION (13 DARK DASHBOARD WIDGETS)                */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-wide text-white uppercase">
              Welfare Categories
            </h2>
            <p className="text-xs text-[#A3A3A3] mt-0.5">
              Select any category to filter verified West Bengal &amp; Central schemes immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('categories')}
            className="text-xs font-medium text-[#B6FF50] hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <span>Open Category Directory</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {SCHEME_CATEGORIES.map((category) => {
            const catSchemes = getSchemesInCategory(category.id);
            const count = catSchemes.length;
            const isAll = category.id === 'all';
            const hasAttention = catSchemes.some(
              (s) => s.verificationStatus !== 'Verified Active'
            );

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => openCategoryInExplorer(category.id)}
                className={`group text-left p-4.5 rounded-2xl transition-all duration-150 flex flex-col justify-between hover:-translate-y-0.5 ${
                  isAll
                    ? 'glass-window-lime hover:border-[#B6FF50]'
                    : 'glass-window glass-window-hover'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border ${
                        isAll
                          ? 'bg-[#B6FF50] border-[#B6FF50] text-[#050505]'
                          : 'glass-pane text-white group-hover:border-[#B6FF50]/50 group-hover:text-[#B6FF50] transition-colors'
                      }`}
                    >
                      <CategoryIcon name={category.iconName} className="w-4 h-4" />
                    </span>

                    <div className="flex items-center gap-2">
                      <span
                        title={
                          hasAttention && !isAll
                            ? 'Contains scheme(s) with transition/verification notice'
                            : 'Active verified schemes'
                        }
                        className={`w-2 h-2 rounded-full ${
                          !isAll && hasAttention ? 'bg-[#FF9D2E]' : 'bg-[#B6FF50]'
                        }`}
                      />
                      <span className="font-mono text-xs text-white/90 tabular-nums">
                        {count}
                      </span>
                    </div>
                  </div>

                  <h3 className="mt-3.5 text-sm font-semibold text-white leading-snug">
                    {language === 'bn' ? category.bengaliName : category.name}
                  </h3>
                  <p className="mt-0.5 text-[11px] font-bengali text-[#A3A3A3]">
                    {language === 'bn' ? category.name : category.bengaliName}
                  </p>
                  <p className="mt-2 text-xs text-[#A3A3A3] leading-relaxed line-clamp-2">
                    {category.description}
                  </p>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-white/12 flex items-center justify-between text-[11px] font-medium">
                  <span className={isAll ? 'text-[#B6FF50]' : 'text-white/80 group-hover:text-[#B6FF50]'}>
                    Browse category
                  </span>
                  <ArrowUpRight
                    className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                      isAll ? 'text-[#B6FF50]' : 'text-[#A3A3A3] group-hover:text-[#B6FF50]'
                    }`}
                    aria-hidden="true"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ================================================================ */}
      {/* 4. BENEFITS FOR YOUR FAMILY SPOTLIGHT PANEL                      */}
      {/* ================================================================ */}
      <section className="glass-window rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-5 relative min-h-[200px] bg-black/20">
          {!familyImgFailed ? (
            <>
              <img
                src={FAMILY_IMAGE_PATH}
                alt="Rural West Bengal paddy fields and morning countryside path"
                referrerPolicy="no-referrer"
                onError={() => setFamilyImgFailed(true)}
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#141A12]/25 to-[#141A12]/80 hidden lg:block" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center p-6">
              <Users className="w-10 h-10 text-[#B6FF50]" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-medium text-[#FF9D2E]">
              Synthetic Demo Preview · Multi-Member Matching
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-wide text-white uppercase">
              Benefits for Your Family
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
              Map students, mothers, farmers, workers, and grandparents together to uncover welfare
              benefits across every generation of your household.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { role: 'Student', benefit: 'SVMCM, Kanyashree, Aikyashree & OASIS', accent: 'bg-[#B6FF50]' },
                { role: 'Mother', benefit: 'Annapurna / Lakshmir Bhandar & Swasthya Sathi', accent: 'bg-[#FF9D2E]' },
                { role: 'Father', benefit: 'Krishak Bandhu, PM-KISAN or BM-SSY Security', accent: 'bg-[#B6FF50]' },
                { role: 'Grandparent', benefit: 'Old Age / Jai Johar Pension & Ayushman 70+', accent: 'bg-white' },
              ].map((item) => (
                <div
                  key={item.role}
                  className="glass-pane rounded-xl p-3 flex items-start gap-2.5"
                >
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.accent}`} />
                  <div>
                    <p className="text-xs font-semibold text-white">{item.role}</p>
                    <p className="text-[11px] text-[#A3A3A3] mt-0.5">{item.benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/12 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-[#A3A3A3]">
              Demo households are clearly marked synthetic. Add custom members anytime.
            </span>
            <button
              type="button"
              onClick={() => navigateTo('family')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#050505] bg-[#B6FF50] hover:bg-[#c8ff78] rounded-full transition-colors whitespace-nowrap shrink-0"
            >
              <span>Open Family Benefits</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 5. FEATURED MULTI-CATEGORY SCHEMES                               */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-wide text-white uppercase">
              Featured Across Categories
            </h2>
            <p className="text-xs text-[#A3A3A3] mt-0.5">
              Women, Farmers, Healthcare, Pensions, Housing, and Education — all in one view.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openCategoryInExplorer('all')}
            className="text-xs font-medium text-[#B6FF50] hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <span>Explore all {SCHEMES.length} schemes</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              evaluation={evaluateSchemeForProfile(scheme, profile)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
