import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Calendar,
  CheckCircle2,
  CheckSquare,
  ClipboardList,
  Clock,
  ExternalLink,
  Square,
} from 'lucide-react';
import { SchemeCard } from '../components/SchemeCard';
import { useSchemes } from '../context/SchemeContext';
import { getCategoryById } from '../data/categories';
import { getSchemeById, getSchemesInCategory } from '../data/schemes';
import type { ApplicationStage } from '../types/scheme';
import { evaluateSchemeForProfile } from '../utils/matchingEngine';

const TRACKER_STAGES: ApplicationStage[] = [
  'Preparing Documents',
  'Ready to Apply',
  'Submitted on Official Portal',
  'Under Verification',
];

export function SchemeDetailsView() {
  const {
    selectedSchemeId,
    navigateTo,
    openCategoryInExplorer,
    toggleSaveScheme,
    isSchemeSaved,
    profile,
    checkedDocuments,
    toggleDocumentChecked,
    applications,
    startOrUpdateApplication,
    removeApplication,
  } = useSchemes();

  const scheme = selectedSchemeId ? getSchemeById(selectedSchemeId) : undefined;

  if (!scheme) {
    return (
      <div className="glass-window rounded-2xl p-10 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-white uppercase">
          Scheme details unavailable
        </h1>
        <p className="text-xs text-[#A3A3A3]">
          Select any scheme from Scheme Explorer or Family Benefits to view its complete dossier.
        </p>
        <button
          type="button"
          onClick={() => navigateTo('explorer')}
          className="px-5 py-2 text-xs font-semibold text-[#050505] bg-[#B6FF50] hover:bg-[#c8ff78] rounded-full transition-colors"
        >
          Back to Scheme Explorer
        </button>
      </div>
    );
  }

  const category = getCategoryById(scheme.categoryId);
  const saved = isSchemeSaved(scheme.id);
  const evaluation = evaluateSchemeForProfile(scheme, profile);
  const trackedApp = applications.find((a) => a.schemeId === scheme.id);
  const relatedSchemes = getSchemesInCategory(scheme.categoryId)
    .filter((s) => s.id !== scheme.id)
    .slice(0, 3);

  const verificationColor =
    scheme.verificationStatus === 'Verified Active' ? 'text-[#B6FF50]' : 'text-[#FF9D2E]';

  return (
    <div className="space-y-6">
      {/* Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#A3A3A3]">
          <button
            type="button"
            onClick={() => navigateTo('explorer')}
            className="inline-flex items-center gap-1.5 font-medium text-[#B6FF50] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Scheme Explorer</span>
          </button>
          <span aria-hidden="true">/</span>
          <button
            type="button"
            onClick={() => openCategoryInExplorer(scheme.categoryId)}
            className="hover:text-white transition-colors"
          >
            {category.name}
          </button>
        </div>

        <span className="font-mono text-xs text-[#A3A3A3] tabular-nums">
          Last Verified: {scheme.lastVerifiedDate}
        </span>
      </div>

      {/* Header Dossier Card */}
      <header className="glass-window rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#A3A3A3]">
          <span className="font-semibold text-[#B6FF50]">{category.name}</span>
          <span aria-hidden="true">·</span>
          <span>{scheme.providerLevel}</span>
          <span aria-hidden="true">·</span>
          <span>{scheme.benefitType}</span>
          <span aria-hidden="true">·</span>
          <span className={`inline-flex items-center gap-1 font-semibold ${verificationColor}`}>
            {scheme.verificationStatus === 'Verified Active' ? (
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {scheme.verificationStatus}
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            {scheme.name}
          </h1>
          <p className="mt-1 text-sm font-bengali text-[#A3A3A3]">{scheme.bengaliName}</p>
        </div>

        <p className="text-xs text-[#A3A3A3]">
          <span className="font-medium text-white">Administering Department:</span>{' '}
          {scheme.department}
        </p>

        {/* Verification / Transition Advisory */}
        {scheme.verificationNote && (
          <div className="glass-window-amber rounded-xl p-4 flex items-start gap-3">
            <AlertCircle
              className="w-4 h-4 text-[#FF9D2E] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="text-xs text-[#E5E5E5] leading-relaxed">
              <span className="font-semibold text-[#FF9D2E]">Verification Advisory: </span>
              {scheme.verificationNote}
            </div>
          </div>
        )}

        {/* Profile Assessment Strip */}
        {profile.isCompleted && (
          <div className="pt-3 border-t border-white/12 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-white">Your Profile Assessment:</span>
            <span
              className={`font-semibold ${
                evaluation.status === 'likely-eligible'
                  ? 'text-[#B6FF50]'
                  : evaluation.status === 'does-not-match'
                  ? 'text-[#E06C75]'
                  : 'text-[#FF9D2E]'
              }`}
            >
              {evaluation.label}
            </span>
            {evaluation.reasons.length > 0 && (
              <>
                <span aria-hidden="true" className="text-[#404040]">
                  ·
                </span>
                <span className="text-[#A3A3A3]">{evaluation.reasons.join(' · ')}</span>
              </>
            )}
          </div>
        )}
      </header>

      {/* Main 2-Column Reading Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Main Content Dossier (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Overview */}
          <section className="glass-window rounded-2xl p-6 space-y-2.5">
            <h2 className="font-display text-lg font-bold tracking-wide text-white uppercase">
              Overview
            </h2>
            <p className="text-sm text-[#D4D4D4] leading-relaxed">{scheme.overview}</p>
          </section>

          {/* Who Can Benefit & Eligibility */}
          <section className="glass-window rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="font-display text-lg font-bold tracking-wide text-white uppercase">
                Who Can Benefit
              </h2>
              <p className="mt-1 text-xs text-[#A3A3A3]">
                Beneficiaries: {scheme.beneficiaryTypes.join(' · ')}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-[#D4D4D4] list-disc pl-5 leading-relaxed">
                {scheme.whoCanBenefit.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-white/12">
              <h2 className="font-display text-lg font-bold tracking-wide text-white uppercase">
                Eligibility Conditions
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-[#D4D4D4] list-disc pl-5 leading-relaxed">
                {scheme.eligibilityConditions.map((cond) => (
                  <li key={cond}>{cond}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Benefit Details */}
          <section className="glass-window rounded-2xl p-6 space-y-2.5">
            <h2 className="font-display text-lg font-bold tracking-wide text-white uppercase">
              Benefit Details
            </h2>
            <p className="text-xs text-[#B6FF50]">Format: {scheme.benefitType}</p>
            <ul className="mt-2 space-y-2 text-sm text-[#D4D4D4] list-disc pl-5 leading-relaxed">
              {scheme.benefitDetails.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </section>

          {/* Required Documents */}
          <section className="glass-window rounded-2xl p-6 space-y-3">
            <div>
              <h2 className="font-display text-lg font-bold tracking-wide text-white uppercase">
                Required Documents
              </h2>
              <p className="mt-1 text-xs text-[#A3A3A3]">
                Check off items you have ready — syncs automatically with your Document Checklist.
              </p>
            </div>

            <ul className="divide-y divide-white/10 border-t border-white/12">
              {scheme.requiredDocuments.map((doc) => {
                const isChecked = Boolean(checkedDocuments[doc]);
                return (
                  <li key={doc} className="py-3">
                    <button
                      type="button"
                      onClick={() => toggleDocumentChecked(doc)}
                      aria-pressed={isChecked}
                      className="w-full text-left flex items-start gap-3 group"
                    >
                      {isChecked ? (
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
                      <span
                        className={`text-sm leading-snug ${
                          isChecked ? 'line-through text-[#737373]' : 'text-white/95'
                        }`}
                      >
                        {doc}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* How to Apply */}
          <section className="glass-window rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-lg font-bold tracking-wide text-white uppercase">
              How to Apply
            </h2>
            <ol className="space-y-3 text-sm text-[#D4D4D4] leading-relaxed">
              {scheme.howToApply.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="font-mono text-xs font-bold text-[#050505] bg-[#B6FF50] w-6 h-6 rounded-full inline-flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Right Sticky Action Rail (4 cols) */}
        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
          <div className="glass-window rounded-2xl p-5 space-y-4">
            <h2 className="font-display text-sm font-bold tracking-wider text-white uppercase">
              Status &amp; Official Portal
            </h2>

            <dl className="space-y-3 text-xs border-t border-white/12 pt-3.5">
              <div>
                <dt className="text-[#A3A3A3] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Application Availability</span>
                </dt>
                <dd className="mt-1 text-sm font-medium text-white">
                  {scheme.applicationAvailability}
                </dd>
              </div>

              {scheme.deadline && (
                <div>
                  <dt className="text-[#A3A3A3] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#FF9D2E]" aria-hidden="true" />
                    <span>Deadline / Window</span>
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-[#FF9D2E]">{scheme.deadline}</dd>
                </div>
              )}

              {scheme.deadlineNote && (
                <p className="text-[11px] text-[#A3A3A3] leading-relaxed">{scheme.deadlineNote}</p>
              )}

              <div className="pt-2 border-t border-white/12">
                <dt className="text-[#A3A3A3]">Verification Status</dt>
                <dd className={`mt-1 text-sm font-semibold ${verificationColor}`}>
                  {scheme.verificationStatus}
                </dd>
              </div>

              <div>
                <dt className="text-[#A3A3A3]">Last Verified Date</dt>
                <dd className="mt-1 font-mono text-xs text-white tabular-nums">
                  {scheme.lastVerifiedDate}
                </dd>
              </div>
            </dl>

            <div className="space-y-2.5 pt-3 border-t border-white/12">
              <a
                href={scheme.officialSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#050505] bg-[#B6FF50] hover:bg-[#c8ff78] rounded-full transition-colors"
              >
                <span>Visit Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
              <p className="text-[10px] text-[#A3A3A3] text-center font-mono break-all">
                {scheme.officialSourceName}
              </p>

              <button
                type="button"
                onClick={() => toggleSaveScheme(scheme.id)}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-full glass-pane glass-pane-hover transition-colors ${
                  saved
                    ? 'border-[#B6FF50]/55 text-[#B6FF50]'
                    : 'text-white'
                }`}
              >
                {saved ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Saved in Workspace</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Save Scheme</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Application Tracker Panel */}
          <div className="glass-window rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#B6FF50]" aria-hidden="true" />
              <h3 className="font-display text-sm font-bold tracking-wider text-white uppercase">
                Application Tracker
              </h3>
            </div>

            {trackedApp ? (
              <div className="space-y-3">
                <p className="text-xs text-[#A3A3A3]">
                  Current stage:{' '}
                  <span className="font-semibold text-[#B6FF50]">{trackedApp.stage}</span>
                </p>
                <select
                  aria-label="Update application stage"
                  value={trackedApp.stage}
                  onChange={(e) =>
                    startOrUpdateApplication(scheme.id, e.target.value as ApplicationStage)
                  }
                  className="w-full px-3 py-2 text-xs glass-pane rounded-xl text-white focus:border-[#B6FF50] focus:outline-none"
                >
                  {TRACKER_STAGES.map((stage) => (
                    <option key={stage} value={stage} className="bg-[#1D1D1D]">
                      {stage}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => navigateTo('dashboard')}
                    className="text-xs font-medium text-[#B6FF50] hover:underline"
                  >
                    View Timeline
                  </button>
                  <button
                    type="button"
                    onClick={() => removeApplication(scheme.id)}
                    className="text-xs text-[#A3A3A3] hover:text-[#E06C75]"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-[#A3A3A3] leading-relaxed">
                  Add this scheme to your Dashboard Application Timeline to monitor documents and
                  submission status.
                </p>
                <button
                  type="button"
                  onClick={() => startOrUpdateApplication(scheme.id, 'Preparing Documents')}
                  className="w-full px-4 py-2 text-xs font-medium text-white glass-pane glass-pane-hover rounded-full transition-colors"
                >
                  Start Tracking Application
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Related Schemes */}
      {relatedSchemes.length > 0 && (
        <section className="pt-4 border-t border-white/12 space-y-4">
          <h2 className="font-display text-xl font-bold tracking-wide text-white uppercase">
            More in {category.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedSchemes.map((rel) => (
              <SchemeCard
                key={rel.id}
                scheme={rel}
                evaluation={evaluateSchemeForProfile(rel, profile)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
