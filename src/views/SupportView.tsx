import { AlertTriangle, Building2, ExternalLink, ShieldCheck } from 'lucide-react';
import { SCHEMES } from '../data/schemes';

const OFFICIAL_PORTALS = [
  { name: 'West Bengal State Portal', url: 'https://wb.gov.in/', scope: 'Jai Bangla, Pensions & Departments' },
  { name: 'WB Social Registry Portal', url: 'https://socialregistry.wb.gov.in/', scope: 'Annapurna / Lakshmir Bhandar Status' },
  { name: 'SVMCM Scholarship Portal', url: 'https://svmcm.wb.gov.in/', scope: 'Merit-cum-Means Scholarships' },
  { name: 'OASIS Scholarship Portal', url: 'https://oasis.gov.in/', scope: 'SC / ST / OBC Scholarships' },
  { name: 'Krishak Bandhu Portal', url: 'https://krishakbandhu.wb.gov.in/', scope: 'Farmer Assistance & Death Benefit' },
  { name: 'Swasthya Sathi & PM-JAY', url: 'https://beneficiary.nha.gov.in/', scope: '₹5 Lakh Cashless Healthcare' },
  { name: 'Food & Supplies (Khadya Sathi)', url: 'https://food.wb.gov.in/', scope: 'Digital Ration Card & WBPDS' },
  { name: 'BM-SSY Labour Welfare', url: 'https://bmssy.wblabour.gov.in/', scope: 'Unorganised & Construction Workers' },
  { name: 'Bhabishyat Credit Card', url: 'https://bccs.wb.gov.in/', scope: 'Youth Micro-Enterprise Loans' },
  { name: 'Utkarsh Bangla (PBSSD)', url: 'https://www.pbssd.gov.in/', scope: 'Free Placement-Linked Skill Training' },
];

export function SupportView() {
  const verificationRequiredCount = SCHEMES.filter(
    (s) => s.verificationStatus !== 'Verified Active'
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-wide text-white uppercase">
          CITIZEN SUPPORT &amp; VERIFICATION GUIDE
        </h1>
        <p className="text-xs text-[#A3A3A3] mt-1 max-w-2xl">
          How to verify active West Bengal welfare notices safely, apply via local facilitation
          desks, and avoid unofficial websites or OTP scams.
        </p>
      </div>

      {/* Safety & Offline Channels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="glass-window rounded-2xl p-6 space-y-3.5">
          <div className="flex items-center gap-2 text-[#B6FF50]">
            <Building2 className="w-5 h-5" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold tracking-wide text-white uppercase">
              Offline Assistance in West Bengal
            </h2>
          </div>
          <ul className="space-y-2.5 text-xs text-[#D4D4D4] leading-relaxed">
            <li>
              <strong className="text-white">Bangla Sahayata Kendra (BSK):</strong> Free digital
              assistance centres located at BDO offices, Gram Panchayats, and municipalities across
              all 23 districts for online form submission and status checks.
            </li>
            <li>
              <strong className="text-white">Duare Sarkar Camps:</strong> Periodic state outreach
              camps accepting applications and grievance updates for pensions, ration cards,
              Krishak Bandhu, and women’s welfare programs.
            </li>
            <li>
              <strong className="text-white">BDO / SDO / KMC Ward Offices:</strong> Permanent local
              administration desks for Jai Bangla pensions, Rupashree verification, and housing
              survey lists.
            </li>
          </ul>
        </section>

        <section className="glass-window-amber rounded-2xl p-6 space-y-3.5">
          <div className="flex items-center gap-2 text-[#FF9D2E]">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold tracking-wide text-white uppercase">
              Verification &amp; Anti-Fraud Checklist
            </h2>
          </div>
          <ul className="space-y-2.5 text-xs text-[#D4D4D4] leading-relaxed">
            <li>
              <strong className="text-[#FF9D2E]">Never Share OTPs or Bank PINs:</strong> Official
              welfare disbursement happens directly via NPCI/DBT. No government officer calls asking
              for UPI PINs or processing fees.
            </li>
            <li>
              <strong className="text-white">Check .gov.in Extensions:</strong> Always verify the
              browser address ends with <span className="font-mono text-[#B6FF50]">.gov.in</span> or{' '}
              <span className="font-mono text-[#B6FF50]">.nic.in</span> before submitting details.
            </li>
            <li>
              <strong className="text-white">Transitional Schemes ({verificationRequiredCount}):</strong>{' '}
              Programs marked in orange (such as Lakshmir Bhandar / Annapurna Yojana transitions,
              Swasthya Sathi / PM-JAY harmonisation, or Yuva Sathi circulars) should always be
              re-verified on official department notices.
            </li>
          </ul>
        </section>
      </div>

      {/* Verified Official Portals Directory */}
      <section className="glass-window rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-white/12 pb-3">
          <h2 className="font-display text-lg font-bold tracking-wide text-white uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#B6FF50]" aria-hidden="true" />
            <span>Official Government Portal Directory</span>
          </h2>
          <span className="font-mono text-xs text-[#A3A3A3] tabular-nums">
            {OFFICIAL_PORTALS.length} Official Links
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {OFFICIAL_PORTALS.map((portal) => (
            <a
              key={portal.url}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 p-3.5 rounded-xl glass-pane glass-pane-hover transition-colors group"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white group-hover:text-[#B6FF50] truncate">
                  {portal.name}
                </p>
                <p className="text-[11px] text-[#A3A3A3] truncate mt-0.5">{portal.scope}</p>
              </div>
              <ExternalLink
                className="w-4 h-4 text-[#A3A3A3] group-hover:text-[#B6FF50] shrink-0"
                aria-hidden="true"
              />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
