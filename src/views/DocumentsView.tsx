import { CheckSquare, Lock, Square } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSchemes } from '../context/SchemeContext';
import { SCHEMES } from '../data/schemes';
import { aggregateRequiredDocuments } from '../utils/matchingEngine';

const CORE_WB_DOCUMENTS = [
  'Domicile Certificate (West Bengal)',
  'Family Income Certificate (BDO / SDO / Municipal Executive Officer)',
  'Digital Ration Card (or Form 3 / Form 4 for new application or member addition)',
  'Single-holder Bank Passbook (NPCI / DBT enabled)',
  'West Bengal Residency Proof',
];

export function DocumentsView() {
  const { savedSchemeIds, applications, checkedDocuments, toggleDocumentChecked, navigateTo } =
    useSchemes();
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'ready'>('all');

  const targetIds = useMemo(
    () => Array.from(new Set([...savedSchemeIds, ...applications.map((a) => a.schemeId)])),
    [applications, savedSchemeIds]
  );

  const schemeDocs = useMemo(
    () => aggregateRequiredDocuments(SCHEMES, targetIds),
    [targetIds]
  );

  const allDocs = useMemo(() => {
    if (schemeDocs.length > 0) return schemeDocs;
    return CORE_WB_DOCUMENTS.map((doc) => ({
      documentName: doc,
      requiredBySchemes: ['Core West Bengal Welfare Readiness'],
    }));
  }, [schemeDocs]);

  const filteredDocs = allDocs.filter((doc) => {
    const isReady = Boolean(checkedDocuments[doc.documentName]);
    if (filterMode === 'ready') return isReady;
    if (filterMode === 'pending') return !isReady;
    return true;
  });

  const preparedCount = allDocs.filter((d) => checkedDocuments[d.documentName]).length;
  const pct = allDocs.length > 0 ? Math.round((preparedCount / allDocs.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wide text-white uppercase">
            DOCUMENTS CHECKLIST
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-1">
            Prepare required certificates ahead of applying on official{' '}
            <span className="font-mono text-white">.gov.in</span> portals or Duare Sarkar camps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'pending', 'ready'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilterMode(mode)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize border transition-colors ${
                filterMode === mode
                  ? 'bg-[#B6FF50] text-[#050505] border-[#B6FF50] font-semibold'
                  : 'glass-pane glass-pane-hover text-[#D4D4D4] hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Privacy & Progress Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 glass-window rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#A3A3A3] font-medium">Readiness Progress</span>
            <span className="font-mono font-bold text-[#B6FF50] tabular-nums">
              {preparedCount}/{allDocs.length} ({pct}%)
            </span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#B6FF50] transition-all duration-200"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[11px] text-[#A3A3A3]">
            Synced live with your {savedSchemeIds.length} saved scheme(s) and {applications.length}{' '}
            tracked application(s).
          </p>
        </div>

        <div className="lg:col-span-7 glass-window rounded-2xl p-5 flex items-start gap-3">
          <Lock className="w-5 h-5 text-[#B6FF50] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-white">Checklist Only — Zero File Uploads</p>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              For your safety, SchemeSaathi never asks you to upload scans of Aadhaar, PAN, bank
              passbooks, or caste certificates. Use this checklist strictly to organise your folder
              before visiting official government offices or portals.
            </p>
          </div>
        </div>
      </div>

      {/* Checklist Card */}
      <section className="glass-window rounded-2xl p-5">
        {filteredDocs.length > 0 ? (
          <ul className="divide-y divide-white/10">
            {filteredDocs.map((doc) => {
              const checked = Boolean(checkedDocuments[doc.documentName]);
              return (
                <li key={doc.documentName} className="py-3.5 first:pt-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => toggleDocumentChecked(doc.documentName)}
                    aria-pressed={checked}
                    className="w-full text-left flex items-start justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
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
                          className={`text-sm font-medium ${
                            checked ? 'line-through text-[#737373]' : 'text-white'
                          }`}
                        >
                          {doc.documentName}
                        </p>
                        <p className="text-[11px] text-[#A3A3A3] mt-0.5">
                          Needed for: {doc.requiredBySchemes.join(' · ')}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-semibold shrink-0 ${
                        checked ? 'text-[#B6FF50]' : 'text-[#FF9D2E]'
                      }`}
                    >
                      {checked ? 'READY' : 'PENDING'}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="py-8 text-center space-y-2">
            <p className="text-sm font-medium text-white">No documents in this filter view</p>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className="text-xs text-[#B6FF50] hover:underline"
            >
              Show all documents
            </button>
          </div>
        )}
      </section>

      {schemeDocs.length === 0 && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigateTo('explorer')}
            className="px-4 py-2 text-xs font-semibold text-[#050505] bg-[#B6FF50] rounded-full"
          >
            Save Schemes to Customise Checklist
          </button>
        </div>
      )}
    </div>
  );
}
