import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Compass,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { useRef, useState } from 'react';
import { SchemeSaathiLogo } from '../components/SchemeSaathiLogo';
import { useSchemes } from '../context/SchemeContext';
import { SCHEMES } from '../data/schemes';

const HERO_IMAGE_PATH = '/src/assets/images/hero_wb_family_civic_1795322700768.jpg';
const FAMILY_IMAGE_PATH = '/src/assets/images/family_benefits_community_1795322702336.jpg';

const CAPABILITIES = [
  {
    index: '01.',
    title: 'Instant Eligibility Matching',
    span: 'lg:col-span-2',
    summary:
      'Evaluate 34 West Bengal State and Central Government welfare programs against your household income bracket, age, occupation, and district in one pass.',
    meta: 'Scholarships · Pensions · Healthcare · Agriculture · Housing',
  },
  {
    index: '02.',
    title: 'Multi-Member Family Mapping',
    span: 'lg:col-span-1',
    summary:
      'Map simultaneous benefits for students, adult women, farmers, senior citizens, and unorganised workers within one household profile.',
    meta: 'Household Coverage · Role Mapping',
  },
  {
    index: '03.',
    title: 'Zero Sensitive ID Storage',
    span: 'lg:col-span-1',
    summary:
      'Discover eligibility without entering Aadhaar numbers, bank credentials, OTPs, or uploading personal identity documents.',
    meta: 'Privacy-First · Local + Optional Sync',
  },
  {
    index: '04.',
    title: 'Official Portal & Duare Sarkar Readiness',
    span: 'lg:col-span-2',
    summary:
      'Review verified required documents, eligibility conditions, and direct .gov.in portal guidance before visiting your local BDO, Municipality, or Duare Sarkar camp.',
    meta: 'Verified .gov.in Links · Document Checklist · Stage Tracker',
  },
];

const PROOF_METRICS = [
  { value: String(SCHEMES.length), label: 'Curated Welfare Schemes', detail: 'WB State & Central' },
  { value: '12', label: 'Life-Stage Categories', detail: 'Education to Elder Care' },
  { value: '23', label: 'Districts Covered', detail: 'Rural Blocks & Urban Wards' },
  { value: '0', label: 'Sensitive IDs Collected', detail: 'No Aadhaar or OTPs' },
];

export function LandingPage() {
  const { enterAuth } = useSchemes();
  const prefersReducedMotion = useReducedMotion();
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [familyImgFailed, setFamilyImgFailed] = useState(false);
  const [scrollGateProgress, setScrollGateProgress] = useState(0);
  const gateTriggeredRef = useRef(false);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });

  const heroImageY = useTransform(smoothProgress, [0, 0.35], prefersReducedMotion ? [0, 0] : [0, -28]);
  const familyImageY = useTransform(smoothProgress, [0.35, 0.85], prefersReducedMotion ? [0, 0] : [20, -24]);
  const gateScale = useTransform(smoothProgress, [0.76, 1], prefersReducedMotion ? [1, 1] : [0.96, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const normalized = Math.max(0, Math.min(1, (latest - 0.82) / 0.16));
    setScrollGateProgress(normalized);

    if (latest >= 0.975 && !gateTriggeredRef.current && window.scrollY > 360) {
      gateTriggeredRef.current = true;
      window.setTimeout(() => {
        enterAuth('signup');
      }, 220);
    }
  });

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <div className="relative z-10 min-h-screen w-full text-white flex flex-col pointer-events-none">
      {/* Scroll-linked top progress indicator */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: smoothProgress, transformOrigin: '0% 50%' }}
        className="fixed top-0 inset-x-0 h-[3px] bg-[#B6FF50] z-50 pointer-events-none"
      />

      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 glass-bar border-b border-white/15 px-5 sm:px-8 lg:px-12 py-4 pointer-events-auto">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark (single line, no clutter) */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0"
          >
            <SchemeSaathiLogo size={32} variant="lime" />
            <span className="font-display text-xl font-bold tracking-wide text-white uppercase">
              SchemeSaathi
            </span>
          </button>

          {/* Zone 2: Clean single-line text nav links */}
          <nav aria-label="Landing navigation" className="hidden md:flex items-center gap-7 text-sm font-medium text-[#E2E6DC]">
            <button
              type="button"
              onClick={() => scrollToSection('landing-hero')}
              className="hover:text-[#B6FF50] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('landing-capabilities')}
              className="hover:text-[#B6FF50] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Capabilities
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('landing-coverage')}
              className="hover:text-[#B6FF50] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Coverage
            </button>
            <button
              type="button"
              onClick={() => enterAuth('login')}
              className="hover:text-[#B6FF50] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Sign In
            </button>
          </nav>

          {/* Zone 3: Primary CTA */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => enterAuth('signup')}
              className="px-4 py-2 rounded-full bg-[#B6FF50] hover:bg-[#c8ff78] text-[#050505] text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Scroll Journey */}
      <main className="flex-1 px-5 sm:px-8 lg:px-12 py-10 sm:py-16 space-y-24 sm:space-y-32 pointer-events-none">
        {/* ============================================================== */}
        {/* SECTION 1: HERO PROPOSITION                                    */}
        {/* ============================================================== */}
        <section
          id="landing-hero"
          className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch pt-2 sm:pt-6 pointer-events-none"
        >
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 glass-window rounded-2xl p-7 sm:p-10 flex flex-col justify-between pointer-events-auto"
          >
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#C7D0BE]">
                <span>West Bengal Welfare Directory</span>
                <span aria-hidden="true">·</span>
                <span>State &amp; Central Schemes</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{SCHEMES.length} Verified Programs</span>
              </div>

              <h1
                className="font-bold tracking-tight text-white leading-[1.08]"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.75rem)', textWrap: 'balance' }}
              >
                Government benefits are meant for you. Let&apos;s find yours.
              </h1>

              <p className="text-sm sm:text-base text-[#D6DCD0] leading-relaxed max-w-xl">
                Discover scholarships, women&apos;s financial assistance, farmer support, cashless
                healthcare, pensions, and housing schemes tailored for your West Bengal household.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/12 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => scrollToSection('landing-capabilities')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#B6FF50] hover:bg-[#c8ff78] text-[#050505] text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Scroll to Explore</span>
                  <ArrowDown className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => enterAuth('login')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-pane glass-pane-hover text-white text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-[#B6FF50]" aria-hidden="true" />
                </button>
              </div>

              <span className="text-xs text-[#C7D0BE] inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#B6FF50]" aria-hidden="true" />
                <span>Direct .gov.in source links</span>
              </span>
            </div>
          </motion.div>

          {/* Hero Visual Carrier with Scroll Parallax */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ y: heroImageY }}
            className="lg:col-span-5 relative rounded-2xl overflow-hidden glass-window min-h-[280px] lg:min-h-full pointer-events-auto"
          >
            {!heroImgFailed ? (
              <img
                src={HERO_IMAGE_PATH}
                alt="West Bengal family reviewing government welfare eligibility records together"
                referrerPolicy="no-referrer"
                onError={() => setHeroImgFailed(true)}
                className="w-full h-full object-cover min-h-[280px] lg:h-full"
              />
            ) : (
              <div className="w-full h-full min-h-[280px] bg-gradient-to-br from-[#23281E] to-[#141711] flex flex-col items-center justify-center p-8 text-center gap-3">
                <Compass className="w-10 h-10 text-[#B6FF50]" aria-hidden="true" />
                <p className="font-display text-xl font-bold uppercase tracking-wide text-white">
                  West Bengal Household Discovery
                </p>
              </div>
            )}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#121510]/90 via-[#121510]/25 to-transparent"
            />
            <div className="absolute bottom-0 inset-x-0 p-6">
              <p className="text-xs text-[#B6FF50] font-medium">
                Household Eligibility Engine
              </p>
              <p className="mt-1 text-sm text-white font-medium leading-snug">
                Built for students, women, farmers, workers, and senior citizens across all 23 districts.
              </p>
            </div>
          </motion.div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 2: SCROLL-REVEALED CORE CAPABILITIES (ASYMMETRIC BENTO) */}
        {/* ============================================================== */}
        <section id="landing-capabilities" className="max-w-6xl mx-auto space-y-8 pointer-events-none">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="glass-window rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pointer-events-auto"
          >
            <div>
              <p className="text-xs text-[#B6FF50] font-medium">How SchemeSaathi Works</p>
              <h2 className="mt-1 font-display text-3xl sm:text-4xl font-bold tracking-wide text-white uppercase">
                From Confusion to Verified Eligibility
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#D6DCD0] max-w-md">
              Every rule is structured around real household life stages rather than bureaucratic department silos.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pointer-events-none">
            {CAPABILITIES.map((cap, idx) => (
              <motion.article
                key={cap.index}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.42,
                  delay: prefersReducedMotion ? 0 : idx * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                className={`${cap.span} glass-window glass-window-hover rounded-2xl p-6 sm:p-7 flex flex-col justify-between pointer-events-auto`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-sm font-semibold text-[#B6FF50] tabular-nums">
                      {cap.index}
                    </span>
                    <span className="text-xs text-[#B8C0B0]">{cap.meta}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white tracking-tight">
                    {cap.title}
                  </h3>
                  <p className="mt-2.5 text-sm text-[#D6DCD0] leading-relaxed">
                    {cap.summary}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 3: PROOF & WEST BENGAL COVERAGE                        */}
        {/* ============================================================== */}
        <section id="landing-coverage" className="max-w-6xl mx-auto space-y-6 pointer-events-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pointer-events-none">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{ y: familyImageY }}
              className="lg:col-span-5 relative rounded-2xl overflow-hidden glass-window min-h-[260px] pointer-events-auto"
            >
              {!familyImgFailed ? (
                <img
                  src={FAMILY_IMAGE_PATH}
                  alt="West Bengal community members reviewing state and central family benefit programs"
                  referrerPolicy="no-referrer"
                  onError={() => setFamilyImgFailed(true)}
                  className="w-full h-full object-cover min-h-[260px] lg:h-full"
                />
              ) : (
                <div className="w-full h-full min-h-[260px] bg-gradient-to-br from-[#23281E] to-[#141711] flex flex-col items-center justify-center p-8 text-center gap-3">
                  <Users className="w-10 h-10 text-[#B6FF50]" aria-hidden="true" />
                  <p className="font-display text-xl font-bold uppercase text-white">
                    Whole-Family Benefit Mapping
                  </p>
                </div>
              )}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#121510]/88 via-[#121510]/20 to-transparent"
              />
              <div className="absolute bottom-0 inset-x-0 p-6">
                <p className="text-xs text-[#B6FF50] font-medium">Family-Level Discovery</p>
                <p className="mt-1 text-sm text-white font-medium">
                  Combine Lakshmir Bhandar, Swasthya Sathi, Krishak Bandhu, and SVMCM in one plan.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 glass-window rounded-2xl p-7 sm:p-9 flex flex-col justify-between pointer-events-auto"
            >
              <div>
                <p className="text-xs text-[#B6FF50] font-medium">Verified Coverage</p>
                <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-wide text-white uppercase">
                  Every Major Welfare Track in One Workspace
                </h2>
                <p className="mt-3 text-sm text-[#D6DCD0] leading-relaxed">
                  Track application stages from document preparation to official portal submission,
                  switch between English and Bengali labels, and sync optionally with your session.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/12">
                {PROOF_METRICS.map((metric) => (
                  <div key={metric.label} className="glass-pane rounded-xl p-3">
                    <p className="font-mono text-2xl sm:text-3xl font-bold text-[#B6FF50] tabular-nums">
                      {metric.value}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-white">{metric.label}</p>
                    <p className="text-[11px] text-[#B8C0B0]">{metric.detail}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 4: SCROLL-THROUGH ENTRY TO SIGN UP / LOGIN PAGE        */}
        {/* ============================================================== */}
        <section id="landing-portal-gate" className="max-w-4xl mx-auto pt-8 pb-24 pointer-events-none">
          <motion.div
            style={{ scale: gateScale }}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="glass-window-lime rounded-2xl p-8 sm:p-12 text-center space-y-6 pointer-events-auto"
          >
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#B6FF50]">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>Ready to Enter Citizen Workspace</span>
            </div>

            <h2
              className="font-display text-3xl sm:text-5xl font-bold tracking-wide text-white uppercase"
              style={{ textWrap: 'balance' }}
            >
              Create Your Account or Sign In
            </h2>

            <p className="text-sm text-[#D6DCD0] max-w-xl mx-auto leading-relaxed">
              Continue scrolling to enter the Sign Up &amp; Login portal automatically, or click below
              to sign in and open your SchemeSaathi welfare workspace.
            </p>

            {/* Scroll-completion visual bar */}
            <div className="max-w-md mx-auto space-y-2">
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#B6FF50] transition-[width] duration-150"
                  style={{ width: `${Math.round(scrollGateProgress * 100)}%` }}
                />
              </div>
              <p className="font-mono text-[11px] text-[#C7D0BE] tabular-nums">
                {scrollGateProgress >= 0.9
                  ? 'Entering Sign Up / Login...'
                  : `Scroll gate progress · ${Math.round(scrollGateProgress * 100)}%`}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => enterAuth('signup')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#B6FF50] hover:bg-[#c8ff78] text-[#050505] text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => enterAuth('login')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-pane glass-pane-hover text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0"
              >
                <span>Log In to Existing Account</span>
              </button>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
