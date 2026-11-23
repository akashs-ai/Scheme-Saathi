import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckSquare,
  Compass,
  ExternalLink,
  FileCheck2,
  Plus,
  Sparkles,
  Square,
  Trash2,
  Users,
} from 'lucide-react';
import { useMemo } from 'react';
import { SchemeCard } from '../components/SchemeCard';
import { useSchemes } from '../context/SchemeContext';
import { getCategoryById, SCHEME_CATEGORIES } from '../data/categories';
import { getSchemeById, getSchemesInCategory, SCHEMES } from '../data/schemes';
import type { ApplicationStage } from '../types/scheme';
import {
  aggregateRequiredDocuments,
  evaluateSchemeForProfile,
  getRecommendedNextSteps,
} from '../utils/matchingEngine';

const STAGES: ApplicationStage[] = [
  'Preparing Documents',
  'Ready to Apply',
  'Submitted on Official Portal',
  'Under Verification',
];

const STAGE_PROGRESS: Record<ApplicationStage, { start: number; width: number; color: string; textColor: string }> = {
  'Preparing Documents': { start: 4, width: 32, color: 'bg-[#FF9D2E]', textColor: 'text-[#050505]' },
  'Ready to Apply': { start: 18, width: 44, color: 'bg-[#FFFFFF]', textColor: 'text-[#050505]' },
  'Submitted on Official Portal': { start: 34, width: 48, color: 'bg-[#B6FF50]', textColor: 'text-[#050505]' },
  'Under Verification': { start: 46, width: 50, color: 'bg-[#B6FF50]', textColor: 'text-[#050505]' },
};

export function DashboardView() {
  const {
    profile,
    savedSchemeIds,
    exploredSchemeIds,
    checkedDocuments,
    toggleDocumentChecked,
    applications,
    startOrUpdateApplication,
    removeApplication,
    toggleSaveScheme,
    openSchemeDetails,
    openCategoryInExplorer,
    navigateTo,
    loadSyntheticDemoProfile,
  } = useSchemes();

  const evaluations = useMemo(
    () =>
      SCHEMES.map((scheme) => ({
        scheme,
        evaluation: evaluateSchemeForProfile(scheme, profile),
      })),
    [profile]
  );

  const qualifyingSchemes = useMemo(() => {
    if (!profile.isCompleted) {
      return SCHEMES.filter(
        (s) =>
          s.matchRules.universalHousehold ||
          ['annapurna-yojana', 'krishak-bandhu', 'wb-old-age-pension', 'svmcm', 'utkarsh-bangla'].includes(
            s.id
          )
      );
    }
    return evaluations
      .filter((e) => e.evaluation.status === 'likely-eligible')
      .map((e) => e.scheme);
  }, [evaluations, profile.isCompleted]);

  const educationBenefits = qualifyingSchemes.filter((s) => s.categoryId === 'education');
  const familyBenefits = qualifyingSchemes.filter((s) => s.categoryId !== 'education');

  const deadlineSchemes = useMemo(() => SCHEMES.filter((s) => Boolean(s.deadline)), []);

  const savedSchemes = useMemo(
    () =>
      savedSchemeIds
        .map((id) => getSchemeById(id))
        .filter((s): s is NonNullable<typeof s> => Boolean(s)),
    [savedSchemeIds]
  );

  const missingFamilyBenefits = useMemo(() => {
    const trackedOrSaved = new Set([
      ...savedSchemeIds,
      ...applications.map((a) => a.schemeId),
    ]);
    const preferredOrder = [
      'healthcare',
      'women',
      'pension',
      'farmers',
      'housing',
      'food',
      'workers',
      'widow',
      'disability',
      'business',
      'employment',
    ];

    const candidates = (
      profile.isCompleted ? familyBenefits : SCHEMES.filter((s) => s.categoryId !== 'education')
    ).filter((s) => !trackedOrSaved.has(s.id));

    const selected: typeof candidates = [];
    const seenCategories = new Set<string>();

    for (const catId of preferredOrder) {
      const match = candidates.find((s) => s.categoryId === catId && !seenCategories.has(catId));
      if (match) {
        selected.push(match);
        seenCategories.add(catId);
      }
      if (selected.length >= 6) break;
    }

    return selected;
  }, [applications, familyBenefits, profile.isCompleted, savedSchemeIds]);

  const targetDocSchemeIds = useMemo(
    () => Array.from(new Set([...savedSchemeIds, ...applications.map((a) => a.schemeId)])),
    [applications, savedSchemeIds]
  );

  const requiredDocs = useMemo(
    () => aggregateRequiredDocuments(SCHEMES, targetDocSchemeIds),
    [targetDocSchemeIds]
  );

  const preparedDocsCount = requiredDocs.filter((d) => checkedDocuments[d.documentName]).length;

  const nextSteps = useMemo(
    () =>
      getRecommendedNextSteps({
        profile,
        savedCount: savedSchemes.length,
        applications,
        preparedDocsCount,
        totalDocsCount: requiredDocs.length,
      }),
    [applications, preparedDocsCount, profile, requiredDocs.length, savedSchemes.length]
  );

  // Category distribution for capsule bar visual (Screenshot 2 inspired)
  const categoryVisualBars = useMemo(() => {
    return SCHEME_CATEGORIES.filter((c) => c.id !== 'all')
      .slice(0, 8)
      .map((cat) => {
        const schemesInCat = getSchemesInCategory(cat.id);
        const eligibleInCat = schemesInCat.filter(
          (s) => evaluateSchemeForProfile(s, profile).status === 'likely-eligible'
        ).length;
        const attentionInCat = schemesInCat.filter(
          (s) => s.verificationStatus !== 'Verified Active'
        ).length;
        return {
          cat,
          total: schemesInCat.length,
          eligible: eligibleInCat,
          attention: attentionInCat,
        };
      });
  }, [profile]);

  const docReadinessPct =
    requiredDocs.length > 0 ? Math.round((preparedDocsCount / requiredDocs.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/* TOP BAR ROW (Mirrors Screenshot 2's CHECK BOX + filter pills)    */}
      {/* ================================================================ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wide text-white uppercase">
            CITIZEN BENEFITS DASHBOARD
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-0.5">
            {profile.isCompleted
              ? profile.isSyntheticDemo
                ? 'Active: Synthetic Demo Household Profile (Illustrative)'
                : `Active: ${profile.district || 'West Bengal'} · ${profile.residenceType || 'Household'} Profile`
              : 'Track scheme matches, family opportunities, document readiness, and official applications.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3.5 py-2 rounded-full glass-pane text-xs text-[#C7D0BE]">
            District:{' '}
            <span className="text-white font-medium">
              {profile.district || 'All WB (23)'}
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-full glass-pane text-xs text-[#C7D0BE] tabular-nums">
            Explored: <span className="text-white font-mono font-medium">{exploredSchemeIds.length}/{SCHEMES.length}</span>
          </div>
          {!profile.isCompleted && (
            <button
              type="button"
              onClick={loadSyntheticDemoProfile}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full glass-pane glass-pane-hover text-xs font-medium text-[#FF9D2E] transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Load Demo Profile</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => navigateTo('profile')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#B6FF50] hover:bg-[#c8ff78] text-xs font-semibold text-[#050505] transition-colors whitespace-nowrap"
          >
            <span>{profile.isCompleted ? 'Edit Profile' : 'Check Eligibility'}</span>
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* SCREENSHOT 2 ASYMMETRIC BENTO GRID                               */}
      {/* Left: 2 Compact KPI Cards + Category Capsule Coverage Card       */}
      {/* Right: Tall Application Timeline Card                            */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* LEFT 7 COLUMNS */}
        <div className="xl:col-span-7 flex flex-col gap-5">
          {/* Top 2 Compact Metric Cards (mirrors CUSTOMER & PRODUCT in Screenshot 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Card A: Potential Matches & Education vs Family */}
            <div className="glass-window glass-window-hover rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase">
                  POTENTIAL MATCHES
                </h2>
                <button
                  type="button"
                  onClick={() => navigateTo('explorer')}
                  className="text-[11px] text-[#A3A3A3] hover:text-[#B6FF50] transition-colors"
                >
                  Explorer →
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#B6FF50] font-medium">
                    <span className="inline-block w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-[#B6FF50]" />
                    <span>Qualify</span>
                  </div>
                  <p className="mt-1 font-mono text-3xl font-semibold text-white tabular-nums">
                    {qualifyingSchemes.length}
                  </p>
                  <p className="text-[11px] text-[#A3A3A3] mt-0.5">
                    {profile.isCompleted ? 'Profile Matched' : 'WB Baseline'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#FF9D2E] font-medium">
                    <span className="inline-block w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-[#FF9D2E]" />
                    <span>Deadlines</span>
                  </div>
                  <p className="mt-1 font-mono text-3xl font-semibold text-white tabular-nums">
                    {deadlineSchemes.length}
                  </p>
                  <p className="text-[11px] text-[#A3A3A3] mt-0.5">Seasonal Windows</p>
                </div>
              </div>

              {/* Dual-Tone Minimalist Line Spark Visual (inspired by Screenshot 2) */}
              <div className="mt-5 pt-2">
                <svg viewBox="0 0 240 44" className="w-full h-11 overflow-visible" aria-hidden="true">
                  <polyline
                    fill="none"
                    stroke="#B6FF50"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="0,32 34,26 68,28 102,16 136,22 170,12 204,18 240,8"
                  />
                  <polyline
                    fill="none"
                    stroke="#FF9D2E"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="0,24 38,34 76,20 114,30 152,18 190,28 240,22"
                  />
                </svg>
              </div>
            </div>

            {/* Card B: Family Benefits & Saved Matrix (mirrors PRODUCT dot card in Screenshot 2) */}
            <div className="glass-window glass-window-hover rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase">
                  FAMILY &amp; EDUCATION
                </h2>
                <button
                  type="button"
                  onClick={() => navigateTo('family')}
                  className="text-[11px] text-[#A3A3A3] hover:text-[#B6FF50] transition-colors"
                >
                  Family →
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#B6FF50] font-medium">
                    <span className="inline-block w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-[#B6FF50]" />
                    <span>Family</span>
                  </div>
                  <p className="mt-1 font-mono text-3xl font-semibold text-white tabular-nums">
                    {familyBenefits.length}
                  </p>
                  <p className="text-[11px] text-[#A3A3A3] mt-0.5">Non-Scholarship</p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#FF9D2E] font-medium">
                    <span className="inline-block w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-[#FF9D2E]" />
                    <span>Education</span>
                  </div>
                  <p className="mt-1 font-mono text-3xl font-semibold text-white tabular-nums">
                    {educationBenefits.length}
                  </p>
                  <p className="text-[11px] text-[#A3A3A3] mt-0.5">Scholarships</p>
                </div>
              </div>

              {/* Clean Dot Matrix Representing Explored / Saved / Remaining Schemes */}
              <div className="mt-5 grid grid-cols-11 gap-1.5" aria-hidden="true">
                {SCHEMES.map((s) => {
                  const isSaved = savedSchemeIds.includes(s.id);
                  const isVerify = s.verificationStatus !== 'Verified Active';
                  const isExplored = exploredSchemeIds.includes(s.id);
                  return (
                    <span
                      key={s.id}
                      className={`w-2 h-2 rounded-full ${
                        isSaved
                          ? 'bg-[#B6FF50]'
                          : isVerify
                          ? 'bg-[#FF9D2E]'
                          : isExplored
                          ? 'bg-white'
                          : 'bg-white/20'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom-Left Wide Card: Category Coverage Capsules (inspired by Screenshot 2 bottom-left) */}
          <div className="glass-window rounded-2xl p-5 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase">
                SCHEMES BY WELFARE CATEGORY
              </h2>
              <span className="font-mono text-[11px] text-[#A3A3A3] tabular-nums">
                Total: {SCHEMES.length}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-4 sm:grid-cols-8 gap-3 items-end">
              {categoryVisualBars.map(({ cat, total, eligible, attention }) => {
                const topHeight = Math.min(72, 28 + total * 10);
                const pillTone =
                  eligible > 0
                    ? 'bg-[#B6FF50] text-[#050505]'
                    : attention > 0
                    ? 'bg-[#FF9D2E] text-[#050505]'
                    : 'bg-white text-[#050505]';
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => openCategoryInExplorer(cat.id)}
                    title={`${cat.name}: ${total} schemes`}
                    className="group flex flex-col items-center gap-2 focus:outline-none"
                  >
                    <div className="relative w-full flex flex-col items-center justify-end h-24">
                      <div className="absolute inset-y-0 w-px bg-white/15" aria-hidden="true" />
                      <div
                        style={{ height: `${topHeight}px` }}
                        className={`relative z-10 w-8 sm:w-9 rounded-full flex items-center justify-center font-mono text-xs font-bold tabular-nums transition-transform group-hover:scale-105 ${pillTone}`}
                      >
                        {total}
                      </div>
                    </div>
                    <span className="text-[10px] text-[#A3A3A3] group-hover:text-white truncate max-w-full">
                      {cat.shortName.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-white/12 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#A3A3A3]">
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-[#B6FF50]" />
                  <span>Eligible Match</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-[#FF9D2E]" />
                  <span>Needs Verification</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-white" />
                  <span>Active Catalog</span>
                </span>
              </div>
              <span className="font-mono text-white tabular-nums">
                Saved: {savedSchemes.length}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLUMNS: APPLICATION TIMELINE (Mirrors PROJECTS TIMELINE in Screenshot 2) */}
        <section className="xl:col-span-5 glass-window rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase">
                APPLICATION TIMELINE
              </h2>
              <span className="font-mono text-[11px] text-[#B6FF50] tabular-nums">
                {applications.length} Active
              </span>
            </div>
            <p className="text-[11px] text-[#A3A3A3] mt-1">
              Visual stage progress across your tracked West Bengal &amp; Central applications.
            </p>

            {/* Stage Scale Labels */}
            <div className="mt-4 grid grid-cols-4 text-[10px] font-mono text-[#A3A3A3] border-b border-white/12 pb-2">
              <span>01 PREP</span>
              <span>02 READY</span>
              <span>03 SENT</span>
              <span className="text-right">04 VERIFY</span>
            </div>

            {/* Horizontal Timeline Bars */}
            {applications.length > 0 ? (
              <div className="mt-4 space-y-4">
                {applications.map((item) => {
                  const scheme = getSchemeById(item.schemeId);
                  if (!scheme) return null;
                  const bar = STAGE_PROGRESS[item.stage];
                  return (
                    <div key={item.schemeId} className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => openSchemeDetails(scheme.id)}
                          className="font-medium text-white hover:text-[#B6FF50] truncate text-left"
                        >
                          {scheme.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeApplication(scheme.id)}
                          aria-label={`Remove ${scheme.name} tracker`}
                          className="text-[#737373] hover:text-[#E06C75] shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>

                      {/* Capsule Timeline Bar (Screenshot 2 signature motif) */}
                      <div className="relative h-8 rounded-full glass-pane overflow-hidden flex items-center">
                        <div
                          style={{ left: `${bar.start}%`, width: `${bar.width}%` }}
                          className={`absolute h-6 rounded-full px-3 flex items-center justify-between text-[10px] font-semibold transition-all duration-200 ${bar.color} ${bar.textColor}`}
                        >
                          <span className="truncate">{item.stage}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <select
                          aria-label={`Update stage for ${scheme.name}`}
                          value={item.stage}
                          onChange={(e) =>
                            startOrUpdateApplication(scheme.id, e.target.value as ApplicationStage)
                          }
                          className="px-2.5 py-1 text-[11px] glass-pane rounded-lg text-white focus:border-[#B6FF50] focus:outline-none"
                        >
                          {STAGES.map((st) => (
                            <option key={st} value={st} className="bg-[#1D1D1D]">
                              {st}
                            </option>
                          ))}
                        </select>
                        <a
                          href={scheme.officialSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#B6FF50] hover:underline"
                        >
                          <span>Portal</span>
                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center space-y-2">
                <p className="text-xs font-medium text-white">No applications in progress</p>
                <p className="text-[11px] text-[#A3A3A3]">
                  Track any saved scheme below to monitor your stage progress.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-white/12 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#A3A3A3]">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B6FF50]" />
                <span>Submitted</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF9D2E]" />
                <span>Prep</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>Ready</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('explorer')}
              className="text-[#B6FF50] hover:underline font-medium"
            >
              + Track Scheme
            </button>
          </div>
        </section>
      </div>

      {/* ================================================================ */}
      {/* QUICK ACTIONS + DOCUMENT CHECKLIST + UPCOMING DEADLINES          */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Document Checklist (5 cols) */}
        <section className="lg:col-span-5 glass-window rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase">
                DOCUMENT CHECKLIST
              </h2>
              <p className="text-[11px] text-[#A3A3A3] mt-0.5">
                Auto-aggregated from saved &amp; tracked schemes
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-[#B6FF50] tabular-nums">
              {preparedDocsCount}/{requiredDocs.length} ({docReadinessPct}%)
            </span>
          </div>

          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#B6FF50] transition-all duration-200"
              style={{ width: `${docReadinessPct}%` }}
            />
          </div>

          {requiredDocs.length > 0 ? (
            <ul className="divide-y divide-white/10 max-h-[260px] overflow-y-auto pr-1">
              {requiredDocs.map((doc) => {
                const checked = Boolean(checkedDocuments[doc.documentName]);
                return (
                  <li key={doc.documentName} className="py-2.5">
                    <button
                      type="button"
                      onClick={() => toggleDocumentChecked(doc.documentName)}
                      aria-pressed={checked}
                      className="w-full text-left flex items-start gap-2.5 group"
                    >
                      {checked ? (
                        <CheckSquare
                          className="w-4 h-4 text-[#B6FF50] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                      ) : (
                        <Square
                          className="w-4 h-4 text-[#737373] group-hover:text-white shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                      )}
                      <div className="min-w-0">
                        <p
                          className={`text-xs leading-snug ${
                            checked ? 'line-through text-[#737373]' : 'text-white/95'
                          }`}
                        >
                          {doc.documentName}
                        </p>
                        <p className="text-[10px] text-[#A3A3A3] truncate mt-0.5">
                          {doc.requiredBySchemes.join(', ')}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-xs text-[#A3A3A3] py-4">
              Save a scheme to generate your personal document checklist.
            </p>
          )}

          <button
            type="button"
            onClick={() => navigateTo('documents')}
            className="text-xs font-medium text-[#B6FF50] hover:underline inline-flex items-center gap-1"
          >
            <span>Open Full Document Vault</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </section>

        {/* Upcoming Deadlines (4 cols) */}
        <section className="lg:col-span-4 glass-window rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase inline-flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FF9D2E]" aria-hidden="true" />
              <span>UPCOMING DEADLINES</span>
            </h2>
            <span className="font-mono text-xs text-[#FF9D2E] tabular-nums">
              {deadlineSchemes.length}
            </span>
          </div>

          <p className="text-[11px] text-[#A3A3A3] leading-relaxed">
            Seasonal &amp; academic windows. Most pension, health, ration, and worker schemes stay
            open year-round.
          </p>

          <ul className="divide-y divide-white/10">
            {deadlineSchemes.map((scheme) => (
              <li key={scheme.id} className="py-2.5 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => openSchemeDetails(scheme.id)}
                  className="text-left group w-full"
                >
                  <p className="text-xs font-medium text-white group-hover:text-[#B6FF50] leading-snug">
                    {scheme.name}
                  </p>
                  <p className="mt-1 text-[11px] text-[#FF9D2E]">{scheme.deadline}</p>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Quick Actions & Recommended Next Steps (3 cols) */}
        <section className="lg:col-span-3 glass-window rounded-2xl p-5 space-y-4">
          <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase">
            QUICK ACTIONS
          </h2>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => navigateTo('profile')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl glass-pane glass-pane-hover text-xs font-medium text-white transition-colors"
            >
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#B6FF50]" aria-hidden="true" />
                <span>Check Eligibility</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#A3A3A3]" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => navigateTo('family')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl glass-pane glass-pane-hover text-xs font-medium text-white transition-colors"
            >
              <span className="inline-flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-[#B6FF50]" aria-hidden="true" />
                <span>Map Family Members</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#A3A3A3]" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => navigateTo('explorer')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl glass-pane glass-pane-hover text-xs font-medium text-white transition-colors"
            >
              <span className="inline-flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-[#FF9D2E]" aria-hidden="true" />
                <span>Browse All Schemes</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#A3A3A3]" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => navigateTo('documents')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl glass-pane glass-pane-hover text-xs font-medium text-white transition-colors"
            >
              <span className="inline-flex items-center gap-2">
                <FileCheck2 className="w-3.5 h-3.5 text-[#B6FF50]" aria-hidden="true" />
                <span>Prepare Documents</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#A3A3A3]" aria-hidden="true" />
            </button>
          </div>

          {/* Recommended Next Steps Compact List */}
          <div className="pt-3 border-t border-white/12 space-y-2.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#A3A3A3]">
              Recommended Next Steps
            </h3>
            <ul className="space-y-2">
              {nextSteps.slice(0, 3).map((step, i) => (
                <li key={step.id} className="text-[11px] text-[#D4D4D4] leading-snug flex gap-2">
                  <span className="font-mono text-[#B6FF50] shrink-0">0{i + 1}</span>
                  <span>{step.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* ================================================================ */}
      {/* "YOUR FAMILY MAY BE MISSING THESE BENEFITS"                      */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <p className="text-[11px] font-medium text-[#FF9D2E]">
              Multi-Category Family Discovery
            </p>
            <h2 className="mt-0.5 font-display text-2xl font-bold tracking-wide text-white uppercase">
              Your family may be missing these benefits
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('family')}
            className="text-xs font-medium text-[#B6FF50] hover:underline inline-flex items-center gap-1 whitespace-nowrap"
          >
            <span>Open Family Benefits</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {missingFamilyBenefits.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              evaluation={evaluateSchemeForProfile(scheme, profile)}
            />
          ))}
        </div>
      </section>

      {/* ================================================================ */}
      {/* SAVED SCHEMES LIST                                               */}
      {/* ================================================================ */}
      <section className="glass-window rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-white/12 pb-3">
          <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase">
            SAVED SCHEMES ({savedSchemes.length})
          </h2>
          <button
            type="button"
            onClick={() => navigateTo('saved')}
            className="text-xs font-medium text-[#B6FF50] hover:underline"
          >
            View All Saved →
          </button>
        </div>

        {savedSchemes.length > 0 ? (
          <div className="divide-y divide-white/10">
            {savedSchemes.map((scheme) => {
              const cat = getCategoryById(scheme.categoryId);
              const alreadyTracked = applications.some((a) => a.schemeId === scheme.id);
              return (
                <div
                  key={scheme.id}
                  className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#A3A3A3]">
                      <span className="text-[#B6FF50] font-medium">{cat.shortName}</span>
                      <span className="mx-1.5">·</span>
                      <span>{scheme.benefitType}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => openSchemeDetails(scheme.id)}
                      className="text-sm font-semibold text-white hover:text-[#B6FF50] text-left truncate block max-w-full"
                    >
                      {scheme.name}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!alreadyTracked && (
                      <button
                        type="button"
                        onClick={() => startOrUpdateApplication(scheme.id, 'Preparing Documents')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#050505] bg-[#B6FF50] hover:bg-[#c8ff78] rounded-full transition-colors whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Track</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openSchemeDetails(scheme.id)}
                      className="px-3 py-1.5 text-xs font-medium text-white glass-pane glass-pane-hover rounded-full transition-colors"
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSaveScheme(scheme.id)}
                      aria-label={`Remove ${scheme.name} from saved`}
                      className="p-1.5 text-[#737373] hover:text-[#E06C75] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#A3A3A3] py-3">
            No schemes saved yet. Explore categories and bookmark benefits for your family.
          </p>
        )}
      </section>
    </div>
  );
}
