import { ArrowUpRight } from 'lucide-react';
import { CategoryIcon } from '../components/CategoryIcon';
import { useSchemes } from '../context/SchemeContext';
import { SCHEME_CATEGORIES } from '../data/categories';
import { getSchemesInCategory } from '../data/schemes';

export function CategoriesView() {
  const { openCategoryInExplorer, openSchemeDetails, language } = useSchemes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wide text-white uppercase">
          WELFARE CATEGORIES DIRECTORY
        </h1>
        <p className="text-xs text-[#A3A3A3] mt-1 max-w-2xl">
          Browse all 13 West Bengal &amp; Central scheme categories with live verified counts and
          direct access to flagship programs in each sector.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {SCHEME_CATEGORIES.map((category) => {
          const schemes = getSchemesInCategory(category.id);
          const isAll = category.id === 'all';
          const verifiedCount = schemes.filter(
            (s) => s.verificationStatus === 'Verified Active'
          ).length;
          const reviewCount = schemes.length - verifiedCount;

          return (
            <div
              key={category.id}
              className={`rounded-2xl p-5 flex flex-col justify-between ${
                isAll
                  ? 'glass-window-lime'
                  : 'glass-window glass-window-hover'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`w-10 h-10 rounded-xl border inline-flex items-center justify-center ${
                      isAll
                        ? 'bg-[#B6FF50] border-[#B6FF50] text-[#050505]'
                        : 'glass-pane text-[#B6FF50]'
                    }`}
                  >
                    <CategoryIcon name={category.iconName} className="w-5 h-5" />
                  </span>

                  <div className="text-right">
                    <p className="font-mono text-lg font-bold text-white tabular-nums">
                      {schemes.length}
                    </p>
                    <p className="text-[10px] text-[#A3A3A3]">
                      <span className="text-[#B6FF50]">{verifiedCount} verified</span>
                      {reviewCount > 0 && (
                        <>
                          <span> · </span>
                          <span className="text-[#FF9D2E]">{reviewCount} review</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <h2 className="mt-4 text-base font-bold text-white">
                  {language === 'bn' ? category.bengaliName : category.name}
                </h2>
                <p className="text-[11px] font-bengali text-[#A3A3A3]">
                  {language === 'bn' ? category.name : category.bengaliName}
                </p>
                <p className="mt-2 text-xs text-[#A3A3A3] leading-relaxed">
                  {category.description}
                </p>

                {/* Preview Top 2 Schemes Inside This Category */}
                {!isAll && schemes.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-white/12 space-y-1.5">
                    {schemes.slice(0, 2).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => openSchemeDetails(s.id)}
                        className="w-full text-left text-[11px] text-[#D4D4D4] hover:text-[#B6FF50] truncate block transition-colors"
                      >
                        • {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => openCategoryInExplorer(category.id)}
                className={`mt-4 w-full inline-flex items-center justify-between px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                  isAll
                    ? 'bg-[#B6FF50] text-[#050505] hover:bg-[#c8ff78]'
                    : 'glass-pane glass-pane-hover text-white hover:text-[#B6FF50]'
                }`}
              >
                <span>Browse Category</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
