import { Bookmark, Compass } from 'lucide-react';
import { SchemeCard } from '../components/SchemeCard';
import { useSchemes } from '../context/SchemeContext';
import { getSchemeById } from '../data/schemes';
import { evaluateSchemeForProfile } from '../utils/matchingEngine';

export function SavedSchemesView() {
  const { savedSchemeIds, profile, navigateTo } = useSchemes();

  const savedSchemes = savedSchemeIds
    .map((id) => getSchemeById(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wide text-white uppercase">
            SAVED SCHEMES ({savedSchemes.length})
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-1">
            Bookmarked West Bengal &amp; Central schemes stored locally for your household.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigateTo('explorer')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#B6FF50] hover:bg-[#c8ff78] text-xs font-semibold text-[#050505] transition-colors whitespace-nowrap shrink-0"
        >
          <Compass className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Discover More Schemes</span>
        </button>
      </div>

      {savedSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {savedSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              evaluation={evaluateSchemeForProfile(scheme, profile)}
            />
          ))}
        </div>
      ) : (
        <div className="glass-window rounded-2xl p-12 text-center space-y-3">
          <Bookmark className="w-8 h-8 text-[#737373] mx-auto" aria-hidden="true" />
          <p className="font-display text-2xl font-bold text-white uppercase">
            No saved schemes yet
          </p>
          <p className="text-xs text-[#A3A3A3] max-w-md mx-auto">
            Bookmark any scheme across healthcare, women, farmers, pensions, housing, or education
            to build your personal document checklist and track applications.
          </p>
          <button
            type="button"
            onClick={() => navigateTo('explorer')}
            className="mt-2 px-5 py-2.5 text-xs font-semibold text-[#050505] bg-[#B6FF50] hover:bg-[#c8ff78] rounded-full transition-colors"
          >
            Open Scheme Explorer
          </button>
        </div>
      )}
    </div>
  );
}
