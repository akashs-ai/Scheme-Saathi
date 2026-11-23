import {
  AlertCircle,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useSchemes } from '../context/SchemeContext';
import { getCategoryById } from '../data/categories';
import { SCHEMES } from '../data/schemes';
import { SYNTHETIC_FAMILIES } from '../data/syntheticFamilies';
import type { FamilyRoleTag, IncomeRange } from '../types/scheme';
import { getSchemesForFamilyMember } from '../utils/matchingEngine';

const ROLE_OPTIONS: Array<{ tag: FamilyRoleTag; label: string }> = [
  { tag: 'student', label: 'Student (School / College)' },
  { tag: 'girl-student', label: 'Unmarried Girl Student (13–19 / PG)' },
  { tag: 'woman', label: 'Adult Woman / Homemaker' },
  { tag: 'farmer', label: 'Farmer / Agricultural Worker' },
  { tag: 'senior-citizen', label: 'Senior Citizen (60+)' },
  { tag: 'senior-70-plus', label: 'Senior Citizen (70+)' },
  { tag: 'widow', label: 'Widow' },
  { tag: 'worker', label: 'Unorganised / Daily-Wage Worker' },
  { tag: 'construction-worker', label: 'Construction Worker' },
  { tag: 'youth-jobseeker', label: 'Unemployed Youth / Job-Seeker' },
  { tag: 'entrepreneur', label: 'Small Business / Self-Employed' },
  { tag: 'disability', label: 'Person with Disability (40%+)' },
  { tag: 'household-head', label: 'Household Head (Housing / Ration / Health)' },
];

export function FamilyBenefitsView() {
  const {
    openSchemeDetails,
    toggleSaveScheme,
    isSchemeSaved,
    customFamilyMembers,
    addCustomFamilyMember,
    removeCustomFamilyMember,
  } = useSchemes();

  const [selectedMode, setSelectedMode] = useState<string>(SYNTHETIC_FAMILIES[0].id);
  const [customIncome, setCustomIncome] = useState<Exclude<IncomeRange, ''>>('1l-2.5l');
  const [customResidence, setCustomResidence] = useState<'Rural' | 'Urban'>('Rural');

  const [memberName, setMemberName] = useState('');
  const [memberRelation, setMemberRelation] = useState('');
  const [memberAge, setMemberAge] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<FamilyRoleTag[]>(['woman']);

  const isCustomMode = selectedMode === 'custom';
  const activeSynthetic =
    SYNTHETIC_FAMILIES.find((f) => f.id === selectedMode) ?? SYNTHETIC_FAMILIES[0];

  const activeMembers = isCustomMode ? customFamilyMembers : activeSynthetic.members;
  const activeIncome = isCustomMode ? customIncome : activeSynthetic.incomeRange;
  const activeResidence = isCustomMode ? customResidence : activeSynthetic.residenceType;

  const toggleRoleSelection = (tag: FamilyRoleTag) => {
    setSelectedRoles((prev) =>
      prev.includes(tag) ? prev.filter((r) => r !== tag) : [...prev, tag]
    );
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || selectedRoles.length === 0) return;

    addCustomFamilyMember({
      name: memberName.trim(),
      relation: memberRelation.trim() || 'Household Member',
      ageDescription: memberAge.trim() || 'Age optional',
      summary: `Custom member mapped across ${selectedRoles.length} welfare role(s).`,
      roles: selectedRoles,
    });

    setMemberName('');
    setMemberRelation('');
    setMemberAge('');
    setSelectedRoles(['household-head']);
  };

  const uniqueHouseholdSchemeIds = new Set<string>();
  const memberMatches = activeMembers.map((member) => {
    const matches = getSchemesForFamilyMember(SCHEMES, member, activeIncome, activeResidence);
    matches.forEach((m) => uniqueHouseholdSchemeIds.add(m.scheme.id));
    return { member, matches };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wide text-white uppercase">
          BENEFITS FOR YOUR FAMILY
        </h1>
        <p className="text-xs text-[#A3A3A3] mt-1 max-w-2xl">
          Discover schemes across generations — students, mothers, farmers, workers, widows,
          persons with disabilities, and senior citizens side by side.
        </p>
      </div>

      {/* Household Switcher */}
      <section aria-label="Choose household profile" className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {SYNTHETIC_FAMILIES.map((preset) => {
            const active = selectedMode === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedMode(preset.id)}
                className={`px-3.5 py-2 rounded-full text-xs font-medium border transition-colors ${
                  active
                    ? 'bg-[#B6FF50] text-[#050505] border-[#B6FF50] font-semibold'
                    : 'glass-pane glass-pane-hover text-[#E2E6DC] hover:text-white'
                }`}
              >
                {preset.title}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setSelectedMode('custom')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border transition-colors ${
              isCustomMode
                ? 'bg-[#FF9D2E] text-[#050505] border-[#FF9D2E] font-semibold'
                : 'glass-pane text-[#FF9D2E] border-[#FF9D2E]/45 hover:border-[#FF9D2E]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="tabular-nums">
              Build My Own Household ({customFamilyMembers.length})
            </span>
          </button>
        </div>

        {/* Synthetic Disclosure OR Custom Builder */}
        {!isCustomMode ? (
          <div className="glass-window-amber rounded-2xl p-5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#FF9D2E]">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Synthetic Demo Profile &amp; Demo Matches (Illustrative Only)</span>
              </div>
              <span className="font-mono text-[11px] text-[#C7D0BE] tabular-nums">
                {activeSynthetic.district} · {activeSynthetic.residenceType} ·{' '}
                {activeSynthetic.incomeLabel}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#D4D4D4] leading-relaxed">
              {activeSynthetic.description}
            </p>
            <p className="text-[11px] text-[#A3A3A3]">
              Total unique household schemes matched:{' '}
              <strong className="font-mono text-[#B6FF50] tabular-nums">
                {uniqueHouseholdSchemeIds.size} schemes
              </strong>{' '}
              across multiple welfare categories.
            </p>
          </div>
        ) : (
          <div className="glass-window rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/12 pb-3.5">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Add Custom Household Members (Stored Locally)
                </h2>
                <p className="text-[11px] text-[#A3A3A3] mt-0.5">
                  Use labels like &ldquo;Mother&rdquo;, &ldquo;Father&rdquo;, or
                  &ldquo;Grandparent&rdquo; — no real IDs required.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <select
                  aria-label="Residence type"
                  value={customResidence}
                  onChange={(e) => setCustomResidence(e.target.value as 'Rural' | 'Urban')}
                  className="px-3 py-1.5 glass-pane rounded-lg text-white"
                >
                  <option value="Rural" className="bg-[#1D1D1D]">Rural</option>
                  <option value="Urban" className="bg-[#1D1D1D]">Urban</option>
                </select>
                <select
                  aria-label="Income bracket"
                  value={customIncome}
                  onChange={(e) => setCustomIncome(e.target.value as Exclude<IncomeRange, ''>)}
                  className="px-3 py-1.5 glass-pane rounded-lg text-white"
                >
                  <option value="below-1l" className="bg-[#1D1D1D]">Below ₹1L / yr</option>
                  <option value="1l-2.5l" className="bg-[#1D1D1D]">₹1L – ₹2.5L / yr</option>
                  <option value="2.5l-5l" className="bg-[#1D1D1D]">₹2.5L – ₹5L / yr</option>
                  <option value="above-5l" className="bg-[#1D1D1D]">Above ₹5L / yr</option>
                </select>
              </div>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="Member label (e.g. Mother) *"
                  className="px-3 py-2 text-xs glass-pane rounded-xl text-white placeholder:text-[#9FA897] focus:border-[#B6FF50] focus:outline-none"
                />
                <input
                  type="text"
                  value={memberRelation}
                  onChange={(e) => setMemberRelation(e.target.value)}
                  placeholder="Role (e.g. Farmer, Student)"
                  className="px-3 py-2 text-xs glass-pane rounded-xl text-white placeholder:text-[#9FA897] focus:border-[#B6FF50] focus:outline-none"
                />
                <input
                  type="text"
                  value={memberAge}
                  onChange={(e) => setMemberAge(e.target.value)}
                  placeholder="Age note (e.g. 64 yrs)"
                  className="px-3 py-2 text-xs glass-pane rounded-xl text-white placeholder:text-[#9FA897] focus:border-[#B6FF50] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.map((opt) => {
                  const selected = selectedRoles.includes(opt.tag);
                  return (
                    <button
                      key={opt.tag}
                      type="button"
                      onClick={() => toggleRoleSelection(opt.tag)}
                      aria-pressed={selected}
                      className={`px-3 py-1.5 text-[11px] font-medium rounded-full border transition-colors ${
                        selected
                          ? 'bg-[#B6FF50] text-[#050505] border-[#B6FF50] font-semibold'
                          : 'glass-pane glass-pane-hover text-[#D4D4D4]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={!memberName.trim() || selectedRoles.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#050505] bg-[#B6FF50] hover:bg-[#c8ff78] disabled:opacity-40 rounded-full transition-colors"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add Member &amp; Match Schemes</span>
              </button>
            </form>
          </div>
        )}
      </section>

      {/* Member Cards */}
      {memberMatches.length === 0 ? (
        <div className="glass-window rounded-2xl p-10 text-center space-y-2">
          <Users className="w-8 h-8 text-[#737373] mx-auto" aria-hidden="true" />
          <p className="font-display text-xl font-bold text-white uppercase">
            Add your first household member above
          </p>
          <p className="text-xs text-[#A3A3A3] max-w-md mx-auto">
            Add roles such as Student, Mother, Father, or Grandparent to instantly discover
            matched benefits across West Bengal.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {memberMatches.map(({ member, matches }) => (
            <section
              key={member.id}
              className="glass-window rounded-2xl p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/12 pb-3.5">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#A3A3A3]">
                    <span className="font-semibold text-[#B6FF50]">{member.relation}</span>
                    <span>·</span>
                    <span>{member.ageDescription}</span>
                    {member.isSynthetic && (
                      <>
                        <span>·</span>
                        <span className="text-[#FF9D2E] font-medium">Synthetic Demo Member</span>
                      </>
                    )}
                  </div>
                  <h2 className="mt-1 text-lg font-bold text-white">{member.name}</h2>
                  <p className="text-xs text-[#A3A3A3]">{member.summary}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-xs font-semibold text-[#B6FF50] tabular-nums">
                    {matches.length} matches
                  </span>
                  {!member.isSynthetic && (
                    <button
                      type="button"
                      onClick={() => removeCustomFamilyMember(member.id)}
                      aria-label={`Remove ${member.name}`}
                      className="p-2 text-[#A3A3A3] hover:text-[#E06C75] rounded-full hover:bg-white/10"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {matches.map(({ scheme, matchReason }) => {
                  const cat = getCategoryById(scheme.categoryId);
                  const saved = isSchemeSaved(scheme.id);
                  return (
                    <div
                      key={scheme.id}
                      className="glass-pane glass-pane-hover rounded-xl p-4 flex flex-col justify-between transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 text-[10px]">
                          <span className="font-semibold text-white/80">{cat.shortName}</span>
                          <span
                            className={
                              scheme.verificationStatus === 'Verified Active'
                                ? 'text-[#B6FF50] font-medium'
                                : 'text-[#FF9D2E] font-medium'
                            }
                          >
                            {scheme.verificationStatus === 'Verified Active'
                              ? 'Verified Active'
                              : 'Verify Portal'}
                          </span>
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-white leading-snug">
                          <button
                            type="button"
                            onClick={() => openSchemeDetails(scheme.id)}
                            className="text-left hover:text-[#B6FF50] transition-colors"
                          >
                            {scheme.name}
                          </button>
                        </h3>
                        <p className="mt-1.5 text-[11px] font-medium text-[#B6FF50]">
                          {matchReason}
                        </p>
                        <p className="mt-1 text-[11px] text-[#A3A3A3] line-clamp-2 leading-relaxed">
                          {scheme.benefitSummary}
                        </p>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-white/12 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => openSchemeDetails(scheme.id)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-white hover:text-[#B6FF50]"
                        >
                          <span>Details</span>
                          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleSaveScheme(scheme.id)}
                          className={`inline-flex items-center gap-1 text-xs font-medium ${
                            saved ? 'text-[#B6FF50]' : 'text-[#A3A3A3] hover:text-white'
                          }`}
                        >
                          {saved ? (
                            <>
                              <BookmarkCheck className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Saved</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Save</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
