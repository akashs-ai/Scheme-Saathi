import {
  AlertCircle,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import { useSchemes } from '../context/SchemeContext';
import { getCategoryById } from '../data/categories';
import type { EligibilityEvaluation, SchemeRecord } from '../types/scheme';

interface SchemeCardProps {
  scheme: SchemeRecord;
  evaluation?: EligibilityEvaluation;
  matchContextNote?: string;
}

export function SchemeCard({ scheme, evaluation, matchContextNote }: SchemeCardProps) {
  const { openSchemeDetails, toggleSaveScheme, isSchemeSaved, language } = useSchemes();
  const saved = isSchemeSaved(scheme.id);
  const category = getCategoryById(scheme.categoryId);

  const getStatusPresentation = () => {
    if (scheme.verificationStatus === 'Verification Required') {
      return {
        text: 'Needs Verification',
        textClass: 'text-[#FF9D2E]',
        dotClass: 'bg-[#FF9D2E]',
        icon: <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
      };
    }
    if (evaluation) {
      if (evaluation.status === 'likely-eligible') {
        return {
          text: 'Likely Eligible',
          textClass: 'text-[#B6FF50]',
          dotClass: 'bg-[#B6FF50]',
          icon: <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
        };
      }
      if (evaluation.status === 'potential-match' || evaluation.status === 'verification-required') {
        return {
          text: 'Needs Verification',
          textClass: 'text-[#FF9D2E]',
          dotClass: 'bg-[#FF9D2E]',
          icon: <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
        };
      }
      if (evaluation.status === 'does-not-match') {
        return {
          text: 'Does Not Match',
          textClass: 'text-[#E06C75]',
          dotClass: 'bg-[#E06C75]',
          icon: <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
        };
      }
      if (evaluation.status === 'not-evaluated') {
        return {
          text: 'Missing Info',
          textClass: 'text-[#A3A3A3]',
          dotClass: 'bg-[#737373]',
          icon: <HelpCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
        };
      }
    }
    if (scheme.verificationStatus === 'Transitioning / Verify Guidelines') {
      return {
        text: 'Needs Verification',
        textClass: 'text-[#FF9D2E]',
        dotClass: 'bg-[#FF9D2E]',
        icon: <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
      };
    }
    return {
      text: 'Verified Active',
      textClass: 'text-[#B6FF50]',
      dotClass: 'bg-[#B6FF50]',
      icon: <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
    };
  };

  const statusInfo = getStatusPresentation();

  let officialDomain = scheme.officialSourceName;
  try {
    officialDomain = new URL(scheme.officialSourceUrl).hostname.replace(/^www\./, '');
  } catch {
    // fallback to source name
  }

  return (
    <article className="glass-window glass-window-hover rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-0.5">
      <div>
        {/* Top Metadata Line (Category · Provider | Status Indicator) */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#A3A3A3]">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className="font-medium text-white/90 truncate">
              {language === 'bn' ? category.bengaliName : category.shortName}
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{scheme.providerLevel}</span>
          </div>
          <span
            className={`inline-flex items-center gap-1 font-medium whitespace-nowrap shrink-0 ${statusInfo.textClass}`}
          >
            {statusInfo.icon}
            <span>{statusInfo.text}</span>
          </span>
        </div>

        {/* Title & Bengali Title */}
        <h3 className="mt-2.5 text-[15px] font-semibold text-white leading-snug">
          <button
            type="button"
            onClick={() => openSchemeDetails(scheme.id)}
            className="text-left hover:text-[#B6FF50] transition-colors"
          >
            {language === 'bn' ? scheme.bengaliName : scheme.name}
          </button>
        </h3>
        <p className="mt-0.5 text-[11px] font-bengali text-[#A3A3A3] truncate">
          {language === 'bn' ? scheme.name : scheme.bengaliName}
        </p>

        {/* Concise Benefit Summary */}
        <p className="mt-2.5 text-xs text-[#A3A3A3] leading-relaxed line-clamp-2">
          {scheme.benefitSummary}
        </p>

        {/* Optional Match Reason Strip */}
        {matchContextNote && (
          <p className="mt-2.5 text-[11px] font-medium text-[#B6FF50] glass-pane px-3 py-1.5 rounded-xl">
            {matchContextNote}
          </p>
        )}

        {/* Compact Key-Value Facts */}
        <dl className="mt-3.5 pt-3 border-t border-white/12 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-[#A3A3A3] shrink-0">Beneficiaries</dt>
            <dd className="text-white/90 text-right truncate">
              {scheme.beneficiaryTypes.slice(0, 2).join(', ')}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-[#A3A3A3] shrink-0 inline-flex items-center gap-1">
              {scheme.deadline ? (
                <>
                  <Calendar className="w-3 h-3 text-[#FF9D2E]" aria-hidden="true" />
                  <span>Window</span>
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 text-[#A3A3A3]" aria-hidden="true" />
                  <span>Status</span>
                </>
              )}
            </dt>
            <dd
              className={`text-right truncate ${
                scheme.deadline ? 'text-[#FF9D2E] font-medium' : 'text-[#D4D4D4]'
              }`}
            >
              {scheme.deadline ?? scheme.applicationAvailability}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-[#A3A3A3] shrink-0">Source</dt>
            <dd className="text-right truncate">
              <a
                href={scheme.officialSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[10px] text-[#B6FF50] hover:underline"
              >
                <span>{officialDomain}</span>
                <ExternalLink className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
              </a>
            </dd>
          </div>
        </dl>
      </div>

      {/* Compact Action Footer */}
      <div className="mt-4 pt-3 border-t border-white/12 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => openSchemeDetails(scheme.id)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#050505] bg-[#B6FF50] hover:bg-[#c6ff75] rounded-full transition-colors whitespace-nowrap shrink-0"
        >
          <span>View Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => toggleSaveScheme(scheme.id)}
          aria-pressed={saved}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full glass-pane glass-pane-hover transition-colors whitespace-nowrap shrink-0 ${
            saved
              ? 'border-[#B6FF50]/55 text-[#B6FF50]'
              : 'text-[#E5E5E5] hover:text-white'
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
    </article>
  );
}
