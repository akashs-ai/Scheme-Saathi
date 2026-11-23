import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  RotateCcw,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useState } from 'react';
import { useSchemes } from '../context/SchemeContext';
import { WEST_BENGAL_DISTRICTS } from '../data/categories';
import { SCHEMES } from '../data/schemes';
import { EMPTY_PROFILE } from '../data/syntheticFamilies';
import type { AgeRange, CitizenProfile, EmploymentStatus, IncomeRange } from '../types/scheme';
import { evaluateSchemeForProfile } from '../utils/matchingEngine';

const AGE_RANGES: AgeRange[] = ['Under 18', '18–25', '26–40', '41–59', '60–69', '70+'];

const INCOME_OPTIONS: Array<{ value: Exclude<IncomeRange, ''>; label: string }> = [
  { value: 'below-1l', label: 'Below ₹1,00,000 / year' },
  { value: '1l-2.5l', label: '₹1,00,000 – ₹2,50,000 / year' },
  { value: '2.5l-5l', label: '₹2,50,000 – ₹5,00,000 / year' },
  { value: 'above-5l', label: 'Above ₹5,00,000 / year' },
];

const EMPLOYMENT_OPTIONS: Exclude<EmploymentStatus, ''>[] = [
  'Student',
  'Unemployed / Seeking Work',
  'Farmer / Agricultural Worker',
  'Unorganised / Daily-Wage Worker',
  'Construction Worker',
  'Self-Employed / Small Business',
  'Homemaker',
  'Salaried (Private / Formal)',
  'Retired / Senior',
];

const STEP_LABELS = [
  '01. Household Basics',
  '02. Family & Roles',
  '03. Specific Context',
  '04. Review & Match',
];

export function ProfileWizardView() {
  const {
    profile,
    saveProfile,
    loadSyntheticDemoProfile,
    clearProfile,
    navigateTo,
    updateFilters,
  } = useSchemes();

  const [step, setStep] = useState<number>(0);
  const [draft, setDraft] = useState<CitizenProfile>(() =>
    profile.isCompleted ? profile : { ...EMPTY_PROFILE, state: 'West Bengal' }
  );

  const updateDraft = (partial: Partial<CitizenProfile>) => {
    setDraft((prev) => ({ ...prev, ...partial, isSyntheticDemo: false }));
  };

  const previewProfile: CitizenProfile = { ...draft, isCompleted: true };
  const previewMatches = SCHEMES.filter(
    (s) => evaluateSchemeForProfile(s, previewProfile).status === 'likely-eligible'
  );
  const previewCategories = new Set(previewMatches.map((s) => s.categoryId)).size;

  const hasConditionalSection =
    draft.isStudent ||
    draft.employmentStatus === 'Student' ||
    draft.hasFarmerInFamily ||
    draft.employmentStatus === 'Farmer / Agricultural Worker' ||
    draft.hasWomenInHousehold ||
    draft.hasSeniorCitizen ||
    draft.employmentStatus === 'Unemployed / Seeking Work' ||
    draft.employmentStatus === 'Self-Employed / Small Business' ||
    draft.employmentStatus === 'Unorganised / Daily-Wage Worker' ||
    draft.employmentStatus === 'Construction Worker';

  const handleFinish = (destination: 'explorer' | 'dashboard') => {
    saveProfile({ ...draft, isCompleted: true, isSyntheticDemo: false });
    if (destination === 'explorer') {
      updateFilters({
        categoryId: 'all',
        eligibilityFilter: 'likely-eligible',
        savedOnly: false,
        searchQuery: '',
      });
      navigateTo('explorer');
    } else {
      navigateTo('dashboard');
    }
  };

  const handleLoadDemo = () => {
    loadSyntheticDemoProfile();
    navigateTo('dashboard');
  };

  const handleClear = () => {
    clearProfile();
    setDraft({ ...EMPTY_PROFILE, state: 'West Bengal' });
    setStep(0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wide text-white uppercase">
            CHECK BENEFITS · HOUSEHOLD PROFILE
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-1 max-w-2xl">
            Optional, non-sensitive household questionnaire matching students, women, farmers,
            seniors, widows, workers, and low-income families across West Bengal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLoadDemo}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#FF9D2E] glass-pane glass-pane-hover rounded-full transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Load Synthetic Demo</span>
          </button>
          {profile.isCompleted && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#D4D4D4] hover:text-white glass-pane glass-pane-hover rounded-full transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="glass-window rounded-2xl px-4 py-3 flex items-start gap-3">
        <Lock className="w-4 h-4 text-[#B6FF50] shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs text-[#A3A3A3] leading-relaxed">
          <span className="font-semibold text-white">Privacy Protection:</span> Stored strictly in
          your browser. SchemeSaathi never asks for Aadhaar numbers, bank details, OTPs, or full
          identity documents.
        </p>
      </div>

      {/* Stepper Tabs */}
      <nav aria-label="Profile steps" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STEP_LABELS.map((label, idx) => {
          const isCurrent = step === idx;
          const isCompleted = idx < step;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setStep(idx)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-medium text-left border transition-colors ${
                isCurrent
                  ? 'bg-[#B6FF50] text-[#050505] border-[#B6FF50] font-semibold'
                  : isCompleted
                  ? 'glass-pane glass-pane-hover text-[#B6FF50] border-[#B6FF50]/35'
                  : 'glass-pane glass-pane-hover text-[#D4D4D4] hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </nav>

      {/* Main Step Card */}
      <section className="glass-window rounded-2xl p-6 space-y-6">
        {/* STEP 1 */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-xl font-bold text-white uppercase">
                Location &amp; Household Basics
              </h2>
              <p className="mt-0.5 text-xs text-[#A3A3A3]">
                Helps differentiate rural vs. urban schemes (Banglar Bari vs. PMAY-U) and
                income-linked criteria.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="wizard-age" className="block text-xs font-medium text-[#D4D4D4] mb-1.5">
                  Your Age Range (Optional)
                </label>
                <select
                  id="wizard-age"
                  value={draft.ageRange}
                  onChange={(e) => updateDraft({ ageRange: e.target.value as AgeRange })}
                  className="w-full px-3.5 py-2.5 text-sm glass-pane rounded-xl text-white focus:border-[#B6FF50] focus:outline-none"
                >
                  <option value="" className="bg-[#1D1D1D]">Select age range</option>
                  {AGE_RANGES.map((age) => (
                    <option key={age} value={age} className="bg-[#1D1D1D]">
                      {age}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="wizard-district" className="block text-xs font-medium text-[#D4D4D4] mb-1.5">
                  West Bengal District (Optional)
                </label>
                <select
                  id="wizard-district"
                  value={draft.district}
                  onChange={(e) => updateDraft({ district: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm glass-pane rounded-xl text-white focus:border-[#B6FF50] focus:outline-none"
                >
                  <option value="" className="bg-[#1D1D1D]">Select district</option>
                  {WEST_BENGAL_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist} className="bg-[#1D1D1D]">
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-xs font-medium text-[#D4D4D4] mb-1.5">
                  Area of Residence
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {(['Rural', 'Urban'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateDraft({ residenceType: type })}
                      className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition-colors ${
                        draft.residenceType === type
                          ? 'bg-[#B6FF50] text-[#050505] border-[#B6FF50]'
                          : 'glass-pane glass-pane-hover text-[#D4D4D4]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="wizard-family-size" className="block text-xs font-medium text-[#D4D4D4] mb-1.5">
                  Number of Family Members
                </label>
                <input
                  id="wizard-family-size"
                  type="number"
                  min={1}
                  max={15}
                  value={draft.familySize}
                  onChange={(e) =>
                    updateDraft({ familySize: Math.max(1, Number(e.target.value) || 1) })
                  }
                  className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums glass-pane rounded-xl text-white focus:border-[#B6FF50] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="wizard-income" className="block text-xs font-medium text-[#D4D4D4] mb-1.5">
                  Approximate Annual Household Income Range (Optional)
                </label>
                <select
                  id="wizard-income"
                  value={draft.incomeRange}
                  onChange={(e) => updateDraft({ incomeRange: e.target.value as IncomeRange })}
                  className="w-full px-3.5 py-2.5 text-sm glass-pane rounded-xl text-white focus:border-[#B6FF50] focus:outline-none"
                >
                  <option value="" className="bg-[#1D1D1D]">
                    Prefer not to specify / check broad eligibility
                  </option>
                  {INCOME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#1D1D1D]">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-xl font-bold text-white uppercase">
                Who Lives in Your Household?
              </h2>
              <p className="mt-0.5 text-xs text-[#A3A3A3]">
                Select every role that applies to you or your family. Step 3 shows conditional
                follow-up questions based on these choices.
              </p>
            </div>

            <div>
              <label htmlFor="wizard-employment" className="block text-xs font-medium text-[#D4D4D4] mb-1.5">
                Your Primary Occupation / Status
              </label>
              <select
                id="wizard-employment"
                value={draft.employmentStatus}
                onChange={(e) => {
                  const val = e.target.value as EmploymentStatus;
                  updateDraft({
                    employmentStatus: val,
                    isStudent: val === 'Student' ? true : draft.isStudent,
                    hasFarmerInFamily:
                      val === 'Farmer / Agricultural Worker' ? true : draft.hasFarmerInFamily,
                    hasSeniorCitizen:
                      val === 'Retired / Senior' ? true : draft.hasSeniorCitizen,
                    hasWomenInHousehold: val === 'Homemaker' ? true : draft.hasWomenInHousehold,
                  });
                }}
                className="w-full px-3.5 py-2.5 text-sm glass-pane rounded-xl text-white focus:border-[#B6FF50] focus:outline-none"
              >
                <option value="" className="bg-[#1D1D1D]">Select occupation or life stage</option>
                {EMPLOYMENT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#1D1D1D]">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  key: 'isStudent' as const,
                  title: 'Student in Household',
                  desc: 'School, college, diploma, or university learner',
                },
                {
                  key: 'hasWomenInHousehold' as const,
                  title: 'Women / Girls in Household',
                  desc: 'Annapurna, Lakshmir Bhandar, Kanyashree, Rupashree & Health',
                },
                {
                  key: 'hasFarmerInFamily' as const,
                  title: 'Farmer / Agricultural Worker',
                  desc: 'Cultivable land, Bargadar, or agricultural labourer',
                },
                {
                  key: 'hasSeniorCitizen' as const,
                  title: 'Senior Citizen (60+) in Family',
                  desc: 'Monthly state pensions & 70+ universal Ayushman cover',
                },
                {
                  key: 'hasWidowInFamily' as const,
                  title: 'Widow in Household',
                  desc: 'Dedicated West Bengal & NSAP monthly widow pensions',
                },
                {
                  key: 'hasDisabilityInFamily' as const,
                  title: 'Person with Disability in Family',
                  desc: 'Manabik pension, UDID card & ADIP assistive aids',
                },
                {
                  key: 'needsHousingSupport' as const,
                  title: 'Living in Kutcha / Non-Pucca Home',
                  desc: 'Banglar Bari & PMAY-G / PMAY-U 2.0 housing support',
                },
                {
                  key: 'needsRationOrFoodSupport' as const,
                  title: 'Food & Digital Ration Card Needs',
                  desc: 'Khadya Sathi & WBPDS / ONORC food security',
                },
              ].map((item) => {
                const active = Boolean(draft[item.key]);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => updateDraft({ [item.key]: !active })}
                    aria-pressed={active}
                    className={`text-left p-4 rounded-xl glass-pane glass-pane-hover transition-colors ${
                      active
                        ? 'border-[#B6FF50] bg-white/[0.12]'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-white">{item.title}</span>
                      <span
                        className={`text-[10px] font-mono font-semibold ${
                          active ? 'text-[#B6FF50]' : 'text-[#737373]'
                        }`}
                      >
                        {active ? 'ACTIVE' : 'OPTIONAL'}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#A3A3A3] leading-relaxed">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Conditional Questions */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-xl font-bold text-white uppercase">
                Conditional Role Questions
              </h2>
              <p className="mt-0.5 text-xs text-[#A3A3A3]">
                Shown dynamically based on the household roles you selected in Step 2.
              </p>
            </div>

            {!hasConditionalSection && (
              <div className="p-4 glass-pane rounded-xl text-xs text-[#A3A3A3]">
                No extra conditional fields required. Continue to Review &amp; Match or return to
                Step 2 to select specific household roles.
              </div>
            )}

            {(draft.isStudent || draft.employmentStatus === 'Student') && (
              <div className="p-4 glass-pane rounded-xl space-y-3">
                <h3 className="text-xs font-semibold text-[#B6FF50] uppercase tracking-wider">
                  Education Details (Student Selected)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="cond-student-level" className="block text-xs text-[#D4D4D4] mb-1">
                      Current Education Stage
                    </label>
                    <select
                      id="cond-student-level"
                      value={draft.studentLevel}
                      onChange={(e) =>
                        updateDraft({
                          studentLevel: e.target.value as CitizenProfile['studentLevel'],
                        })
                      }
                      className="w-full px-3 py-2 text-xs glass-pane rounded-lg text-white focus:border-[#B6FF50] focus:outline-none"
                    >
                      <option value="" className="bg-[#1D1D1D]">Select study level</option>
                      <option value="Class 5–10" className="bg-[#1D1D1D]">Class 5–10 (Pre-Matric)</option>
                      <option value="Class 11–12" className="bg-[#1D1D1D]">Class 11–12 (Higher Secondary)</option>
                      <option value="Undergraduate / Diploma" className="bg-[#1D1D1D]">Undergraduate / Diploma / ITI</option>
                      <option value="Postgraduate / Professional" className="bg-[#1D1D1D]">Postgraduate / Professional</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2.5 text-xs text-[#D4D4D4] p-2.5 glass-pane rounded-lg w-full">
                      <input
                        type="checkbox"
                        checked={draft.studentMerit60Plus}
                        onChange={(e) => updateDraft({ studentMerit60Plus: e.target.checked })}
                        className="w-4 h-4 accent-[#B6FF50]"
                      />
                      <span>60%+ marks in last qualifying exam (SVMCM)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {(draft.hasFarmerInFamily ||
              draft.employmentStatus === 'Farmer / Agricultural Worker') && (
              <div className="p-4 glass-pane rounded-xl space-y-3">
                <h3 className="text-xs font-semibold text-[#B6FF50] uppercase tracking-wider">
                  Agricultural Details (Farmer Selected)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(
                    [
                      'Own Cultivable Land',
                      'Sharecropper (Bargadar) / Landless Labourer',
                    ] as const
                  ).map((landOpt) => (
                    <button
                      key={landOpt}
                      type="button"
                      onClick={() => updateDraft({ farmerLandType: landOpt })}
                      className={`p-3 text-left text-xs font-medium rounded-lg border transition-colors ${
                        draft.farmerLandType === landOpt
                          ? 'bg-[#B6FF50] text-[#050505] border-[#B6FF50] font-semibold'
                          : 'glass-pane glass-pane-hover text-white'
                      }`}
                    >
                      {landOpt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {draft.hasWomenInHousehold && (
              <div className="p-4 glass-pane rounded-xl space-y-2.5">
                <h3 className="text-xs font-semibold text-[#B6FF50] uppercase tracking-wider">
                  Women &amp; Girls Context
                </h3>
                <select
                  aria-label="Women age group in household"
                  value={draft.womenAgeBracket}
                  onChange={(e) =>
                    updateDraft({
                      womenAgeBracket: e.target.value as CitizenProfile['womenAgeBracket'],
                    })
                  }
                  className="w-full px-3 py-2 text-xs glass-pane rounded-lg text-white focus:border-[#B6FF50] focus:outline-none"
                >
                  <option value="" className="bg-[#1D1D1D]">Select age bracket</option>
                  <option value="13–19 (Unmarried Girl)" className="bg-[#1D1D1D]">
                    13–19 years (Unmarried girl — Kanyashree)
                  </option>
                  <option value="18+ (Marriage Assistance)" className="bg-[#1D1D1D]">
                    18+ unmarried adult woman (Rupashree)
                  </option>
                  <option value="25–60 (Adult Woman)" className="bg-[#1D1D1D]">
                    25–60 adult woman (Annapurna / Lakshmir Bhandar)
                  </option>
                  <option value="Multiple Age Groups" className="bg-[#1D1D1D]">
                    Multiple generations (both daughter and mother)
                  </option>
                </select>
              </div>
            )}

            {draft.hasSeniorCitizen && (
              <div className="p-4 glass-pane rounded-xl space-y-2">
                <h3 className="text-xs font-semibold text-[#B6FF50] uppercase tracking-wider">
                  Senior Citizen Age Detail
                </h3>
                <label className="flex items-start gap-2.5 text-xs text-[#D4D4D4]">
                  <input
                    type="checkbox"
                    checked={draft.hasSenior70Plus}
                    onChange={(e) => updateDraft({ hasSenior70Plus: e.target.checked })}
                    className="w-4 h-4 mt-0.5 accent-[#B6FF50]"
                  />
                  <span>
                    Includes a senior citizen aged <strong className="text-white">70+</strong>{' '}
                    (universal Ayushman Bharat ₹5 lakh health cover regardless of income).
                  </span>
                </label>
              </div>
            )}

            <div className="p-4 glass-pane rounded-xl space-y-2.5">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                Skills &amp; Business Goals (Optional)
              </h3>
              <label className="flex items-start gap-2.5 text-xs text-[#D4D4D4]">
                <input
                  type="checkbox"
                  checked={draft.wantsSkillOrApprenticeship}
                  onChange={(e) => updateDraft({ wantsSkillOrApprenticeship: e.target.checked })}
                  className="w-4 h-4 mt-0.5 accent-[#B6FF50]"
                />
                <span>Interested in Utkarsh Bangla / PMKVY skill training or NAPS apprenticeships.</span>
              </label>
              <label className="flex items-start gap-2.5 text-xs text-[#D4D4D4]">
                <input
                  type="checkbox"
                  checked={draft.wantsBusinessLoan}
                  onChange={(e) => updateDraft({ wantsBusinessLoan: e.target.checked })}
                  className="w-4 h-4 mt-0.5 accent-[#B6FF50]"
                />
                <span>Interested in Bhabishyat Credit Card, PM Mudra Yojana, or PMEGP business credit.</span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 4: Review */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <UserCheck className="w-6 h-6 text-[#B6FF50] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="font-display text-xl font-bold text-white uppercase">
                  Ready to Calculate Benefit Matches
                </h2>
                <p className="mt-1 text-xs text-[#A3A3A3]">
                  Estimated{' '}
                  <strong className="font-mono text-[#B6FF50] tabular-nums">
                    {previewMatches.length} likely eligible schemes
                  </strong>{' '}
                  across{' '}
                  <strong className="font-mono text-white tabular-nums">
                    {previewCategories} welfare categories
                  </strong>
                  .
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-t border-b border-white/12 py-4">
              <div>
                <dt className="text-[#A3A3A3]">Location &amp; Area</dt>
                <dd className="mt-0.5 font-medium text-white">
                  {draft.district || 'West Bengal'}{' '}
                  {draft.residenceType ? `· ${draft.residenceType}` : ''}
                </dd>
              </div>
              <div>
                <dt className="text-[#A3A3A3]">Household Size &amp; Income</dt>
                <dd className="mt-0.5 font-medium text-white tabular-nums">
                  {draft.familySize} members ·{' '}
                  {INCOME_OPTIONS.find((i) => i.value === draft.incomeRange)?.label ?? 'Broad check'}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleFinish('explorer')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#050505] bg-[#B6FF50] hover:bg-[#c8ff78] rounded-full transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>Save &amp; View Benefit Matches</span>
              </button>
              <button
                type="button"
                onClick={() => handleFinish('dashboard')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white glass-pane glass-pane-hover rounded-full transition-colors"
              >
                <span>Save &amp; Open Dashboard</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Step Controls */}
        <div className="pt-4 border-t border-white/12 flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white glass-pane glass-pane-hover rounded-full disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Previous</span>
          </button>

          {step < STEP_LABELS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(STEP_LABELS.length - 1, s + 1))}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-[#050505] bg-[#B6FF50] hover:bg-[#c8ff78] rounded-full transition-colors"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          ) : (
            <span className="text-[11px] text-[#A3A3A3]">Editable anytime</span>
          )}
        </div>
      </section>
    </div>
  );
}
