import { Bookmark, RotateCcw, Search, SlidersHorizontal, UserCheck } from 'lucide-react';
import { useMemo } from 'react';
import { CategoryIcon } from '../components/CategoryIcon';
import { SchemeCard } from '../components/SchemeCard';
import { useSchemes } from '../context/SchemeContext';
import {
  BENEFICIARY_FILTER_OPTIONS,
  getCategoryById,
  SCHEME_CATEGORIES,
} from '../data/categories';
import { getSchemesInCategory, SCHEMES } from '../data/schemes';
import type { BeneficiaryGroup, ProviderLevel } from '../types/scheme';
import { evaluateSchemeForProfile } from '../utils/matchingEngine';

const PROVIDER_OPTIONS: Array<ProviderLevel | 'All'> = [
  'All',
  'West Bengal State',
  'Central Government',
  'Joint State & Central',
];

export function SchemeExplorerView() {
  const {
    filters,
    updateFilters,
    resetFilters,
    profile,
    savedSchemeIds,
    navigateTo,
    language,
  } = useSchemes();

  const evaluatedList = useMemo(() => {
    const categoryPool = getSchemesInCategory(filters.categoryId);
    const query = filters.searchQuery.trim().toLowerCase();

    return categoryPool
      .map((scheme) => ({
        scheme,
        evaluation: evaluateSchemeForProfile(scheme, profile),
      }))
      .filter(({ scheme, evaluation }) => {
        if (query) {
          const searchable = [
            scheme.name,
            scheme.bengaliName,
            scheme.department,
            scheme.benefitSummary,
            scheme.benefitType,
            ...scheme.beneficiaryTypes,
          ]
            .join(' ')
            .toLowerCase();
          if (!searchable.includes(query)) return false;
        }

        if (
          filters.beneficiary !== 'All' &&
          !scheme.beneficiaryTypes.includes(filters.beneficiary)
        ) {
          return false;
        }

        if (
          filters.providerLevel !== 'All' &&
          scheme.providerLevel !== filters.providerLevel
        ) {
          return false;
        }

        if (filters.savedOnly && !savedSchemeIds.includes(scheme.id)) {
          return false;
        }

        if (filters.eligibilityFilter !== 'All') {
          if (filters.eligibilityFilter === 'verification-required') {
            if (
              scheme.verificationStatus !== 'Verification Required' &&
              scheme.verificationStatus !== 'Transitioning / Verify Guidelines'
            ) {
              return false;
            }
          } else if (evaluation.status !== filters.eligibilityFilter) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (profile.isCompleted) {
          return b.evaluation.score - a.evaluation.score;
        }
        return 0;
      });
  }, [filters, profile, savedSchemeIds]);

  const activeCategory = getCategoryById(filters.categoryId);
  const hasActiveFilters =
    filters.categoryId !== 'all' ||
    filters.searchQuery.trim() !== '' ||
    filters.beneficiary !== 'All' ||
    filters.providerLevel !== 'All' ||
    filters.eligibilityFilter !== 'All' ||
    filters.savedOnly;

  const likelyEligibleCount = useMemo(() => {
    if (!profile.isCompleted) return 0;
    return SCHEMES.filter(
      (s) => evaluateSchemeForProfile(s, profile).status === 'likely-eligible'
    ).length;
  }, [profile]);

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wide text-white uppercase">
            {language === 'bn' ? 'প্রকল্প অনুসন্ধান' : 'SCHEME EXPLORER'}
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-0.5">
            Search and filter verified West Bengal &amp; Central Government schemes across all 12
            welfare categories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {profile.isCompleted ? (
            <div className="flex items-center gap-3 glass-pane rounded-full pl-4 pr-2 py-1.5">
              <UserCheck className="w-4 h-4 text-[#B6FF50] shrink-0" aria-hidden="true" />
              <span className="text-xs font-medium text-white tabular-nums">
                {likelyEligibleCount} Benefit Matches
              </span>
              <button
                type="button"
                onClick={() =>
                  updateFilters({
                    eligibilityFilter:
                      filters.eligibilityFilter === 'likely-eligible' ? 'All' : 'likely-eligible',
                  })
                }
                className={`px-3 py-1 text-[11px] font-semibold rounded-full transition-colors whitespace-nowrap ${
                  filters.eligibilityFilter === 'likely-eligible'
                    ? 'bg-[#B6FF50] text-[#050505]'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                {filters.eligibilityFilter === 'likely-eligible' ? 'Showing Matches' : 'Filter Matches'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigateTo('profile')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#050505] bg-[#B6FF50] hover:bg-[#c8ff78] rounded-full transition-colors whitespace-nowrap"
            >
              <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Check Benefit Matches</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills (All 13 Categories) */}
      <section aria-label="Scheme categories" className="flex flex-wrap gap-2">
        {SCHEME_CATEGORIES.map((cat) => {
          const isActive = filters.categoryId === cat.id;
          const count = getSchemesInCategory(cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => updateFilters({ categoryId: cat.id })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#B6FF50] text-[#050505] border-[#B6FF50] font-semibold'
                  : 'glass-pane glass-pane-hover text-[#E2E6DC] hover:text-white'
              }`}
            >
              <CategoryIcon name={cat.iconName} className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? cat.bengaliName : cat.shortName}</span>
              <span
                className={`font-mono text-[10px] tabular-nums ${
                  isActive ? 'text-[#050505]/75' : 'text-[#A3A3A3]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </section>

      {/* Search & Multi-Dimensional Filters Panel */}
      <section
        aria-label="Search and filters"
        className="glass-window rounded-2xl p-4 sm:p-5 space-y-4"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <label htmlFor="scheme-search" className="sr-only">
              Search schemes
            </label>
            <Search
              className="w-4 h-4 text-[#A3A3A3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="scheme-search"
              type="text"
              value={filters.searchQuery}
              onChange={(e) => updateFilters({ searchQuery: e.target.value })}
              placeholder="Search scheme name, Bengali title, or dept..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm glass-pane rounded-xl text-white placeholder:text-[#9FA897] focus:border-[#B6FF50] focus:outline-none"
            />
          </div>

          {/* Beneficiary Filter */}
          <div className="lg:col-span-3">
            <label htmlFor="beneficiary-filter" className="sr-only">
              Filter by beneficiary
            </label>
            <select
              id="beneficiary-filter"
              value={filters.beneficiary}
              onChange={(e) =>
                updateFilters({ beneficiary: e.target.value as BeneficiaryGroup | 'All' })
              }
              className="w-full px-3 py-2 text-xs sm:text-sm glass-pane rounded-xl text-white focus:border-[#B6FF50] focus:outline-none"
            >
              <option value="All" className="bg-[#1D1D1D]">
                All Beneficiaries
              </option>
              {BENEFICIARY_FILTER_OPTIONS.map((group) => (
                <option key={group} value={group} className="bg-[#1D1D1D]">
                  {group}
                </option>
              ))}
            </select>
          </div>

          {/* Provider Level Filter */}
          <div className="lg:col-span-2">
            <label htmlFor="provider-filter" className="sr-only">
              Filter by State or Central Government
            </label>
            <select
              id="provider-filter"
              value={filters.providerLevel}
              onChange={(e) =>
                updateFilters({ providerLevel: e.target.value as ProviderLevel | 'All' })
              }
              className="w-full px-3 py-2 text-xs sm:text-sm glass-pane rounded-xl text-white focus:border-[#B6FF50] focus:outline-none"
            >
              {PROVIDER_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-[#1D1D1D]">
                  {opt === 'All' ? 'State & Central' : opt}
                </option>
              ))}
            </select>
          </div>

          {/* Eligibility / Status Filter */}
          <div className="lg:col-span-3">
            <label htmlFor="eligibility-filter" className="sr-only">
              Filter by eligibility status
            </label>
            <select
              id="eligibility-filter"
              value={filters.eligibilityFilter}
              onChange={(e) =>
                updateFilters({
                  eligibilityFilter: e.target.value as typeof filters.eligibilityFilter,
                })
              }
              className="w-full px-3 py-2 text-xs sm:text-sm glass-pane rounded-xl text-white focus:border-[#B6FF50] focus:outline-none"
            >
              <option value="All" className="bg-[#1D1D1D]">
                All Eligibility Statuses
              </option>
              <option value="likely-eligible" className="bg-[#1D1D1D]">
                Likely Eligible (Lime)
              </option>
              <option value="potential-match" className="bg-[#1D1D1D]">
                Needs Verification (Orange)
              </option>
              <option value="verification-required" className="bg-[#1D1D1D]">
                Transitioning / Portal Review
              </option>
              <option value="does-not-match" className="bg-[#1D1D1D]">
                Does Not Match
              </option>
            </select>
          </div>
        </div>

        {/* Status Legend & Toolbar Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/12 text-xs">
          <div className="flex flex-wrap items-center gap-3 text-[#A3A3A3]">
            <span className="inline-flex items-center gap-1.5 font-medium text-white tabular-nums">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#B6FF50]" aria-hidden="true" />
              {evaluatedList.length} {evaluatedList.length === 1 ? 'scheme' : 'schemes'}
            </span>
            <span aria-hidden="true" className="text-white/25">
              ·
            </span>
            <span className="truncate max-w-md">{activeCategory.description}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateFilters({ savedOnly: !filters.savedOnly })}
              aria-pressed={filters.savedOnly}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors whitespace-nowrap ${
                filters.savedOnly
                  ? 'border-[#B6FF50] bg-[#B6FF50] text-[#050505] font-semibold'
                  : 'glass-pane glass-pane-hover text-[#D4D4D4] hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="tabular-nums">Saved Only ({savedSchemeIds.length})</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pane glass-pane-hover text-[#D4D4D4] hover:text-white text-xs font-medium transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Results Grid or Empty State */}
      {evaluatedList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {evaluatedList.map(({ scheme, evaluation }) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              evaluation={evaluation}
              matchContextNote={
                profile.isCompleted &&
                evaluation.status === 'likely-eligible' &&
                evaluation.reasons.length > 0
                  ? evaluation.reasons[0]
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div className="glass-window rounded-2xl p-10 text-center space-y-3">
          <p className="font-display text-2xl font-bold text-white uppercase">
            No schemes match these filters
          </p>
          <p className="text-xs text-[#A3A3A3] max-w-md mx-auto">
            {filters.eligibilityFilter === 'likely-eligible' && !profile.isCompleted
              ? 'Complete the Household Profile Wizard first so SchemeSaathi can calculate your personalized Benefit Matches.'
              : 'Try clearing a filter or switching back to All Schemes.'}
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 text-xs font-semibold text-[#050505] bg-[#B6FF50] hover:bg-[#c8ff78] rounded-full transition-colors"
            >
              Reset All Filters
            </button>
            {!profile.isCompleted && (
              <button
                type="button"
                onClick={() => navigateTo('profile')}
                className="px-4 py-2 text-xs font-medium text-white glass-pane glass-pane-hover rounded-full transition-colors"
              >
                Open Profile Wizard
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
