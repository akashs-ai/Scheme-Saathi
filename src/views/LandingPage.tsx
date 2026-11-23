import {
  ArrowRight,
  Building2,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  Landmark,
  ShieldCheck,
  Sprout,
  Stethoscope,
} from 'lucide-react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { useMemo, useRef, useState } from 'react';
import { SchemeSaathiLogo } from '../components/SchemeSaathiLogo';
import { useSchemes } from '../context/SchemeContext';
import { SCHEMES } from '../data/schemes';

const CAPABILITIES = [
  {
    index: '01.',
    title: 'Instant Eligibility Matching',
    summary:
      'Evaluate 34 West Bengal State and Central Government welfare programs against your household income bracket, age, occupation, and district in one pass.',
    meta: 'Scholarships · Pensions · Healthcare · Agriculture · Housing',
  },
  {
    index: '02.',
    title: 'Multi-Member Family Mapping',
    summary:
      'Map simultaneous benefits for students, adult women, farmers, senior citizens, and unorganised workers within one household profile.',
    meta: 'Household Coverage · Role Mapping',
  },
  {
    index: '03.',
    title: 'Zero Sensitive ID Storage',
    summary:
      'Discover eligibility without entering Aadhaar numbers, bank credentials, OTPs, or uploading personal identity documents.',
    meta: 'Privacy-First · Local + Optional Sync',
  },
  {
    index: '04.',
    title: 'Official Portal & Duare Sarkar Readiness',
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

const EASE_EDITORIAL: [number, number, number, number] = [0.16, 1, 0.3, 1];
const TEXT_LEGIBILITY = '[text-shadow:0_4px_24px_rgba(6,10,6,0.86),0_1px_4px_rgba(6,10,6,0.9)]';

export function LandingPage() {
  const { enterAuth } = useSchemes();
  const prefersReducedMotion = useReducedMotion();
  const [scrollGateProgress, setScrollGateProgress] = useState(0);
  const gateTriggeredRef = useRef(false);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });

  const gateScale = useTransform(smoothProgress, [0.76, 1], prefersReducedMotion ? [1, 1] : [0.97, 1]);

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

  const directoryCategories = useMemo(
    () => [
      {
        label: 'Scholarships',
        count: SCHEMES.filter((s) => s.categoryId === 'education').length,
        icon: GraduationCap,
      },
      {
        label: 'Women & Family Support',
        count: SCHEMES.filter((s) => s.categoryId === 'women' || s.categoryId === 'widow').length,
        icon: HeartHandshake,
      },
      {
        label: 'Healthcare',
        count: SCHEMES.filter((s) => s.categoryId === 'healthcare').length,
        icon: Stethoscope,
      },
      {
        label: 'Pension',
        count: SCHEMES.filter((s) => s.categoryId === 'pension').length,
        icon: Landmark,
      },
      {
        label: 'Housing',
        count: SCHEMES.filter((s) => s.categoryId === 'housing').length,
        icon: Building2,
      },
      {
        label: 'Agriculture',
        count: SCHEMES.filter((s) => s.categoryId === 'farmers').length,
        icon: Sprout,
      },
    ],
    []
  );

  const headlineLines = [
    { text: 'Your future.', accent: false, delay: 0.28 },
    { text: 'Your benefits.', accent: false, delay: 0.46 },
    { text: 'Your opportunity.', accent: true, delay: 0.64 },
  ];

  return (
    <div className="relative z-10 min-h-screen w-full overflow-x-clip text-white flex flex-col pointer-events-none">
      {/* Restrained Atmospheric Depth Layers Over Existing Forest Background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(95deg,rgba(7,11,7,0.66)_0%,rgba(9,14,9,0.36)_46%,rgba(9,14,9,0.1)_100%)]"
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_55%_42%,transparent_42%,rgba(5,8,5,0.45)_100%)]"
      />

      {/* Scroll-linked top progress indicator */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: smoothProgress, transformOrigin: '0% 50%' }}
        className="fixed top-0 inset-x-0 h-[3px] bg-[#B6FF50] z-50 pointer-events-none"
      />

      {/* Stage 1 — Compact Editorial 3-Zone Navbar */}
      <motion.header
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.2 : 0.6, ease: EASE_EDITORIAL }}
        className="sticky top-0 z-30 glass-bar border-b border-white/12 px-5 sm:px-8 lg:px-12 py-3.5 pointer-events-auto"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-8">
          {/* Left: Logo + Wordmark */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-[#B6FF50] focus-visible:outline-offset-2"
          >
            <SchemeSaathiLogo size={30} variant="lime" />
            <span className="font-display text-xl font-bold tracking-wider text-white uppercase">
              SchemeSaathi
            </span>
          </button>

          {/* Middle: Compact Navigation Links */}
          <nav
            aria-label="Landing navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#DCE3D5]"
          >
            <button
              type="button"
              onClick={() => scrollToSection('landing-hero')}
              className="hover:text-[#B6FF50] transition-colors whitespace-nowrap shrink-0"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('landing-capabilities')}
              className="hover:text-[#B6FF50] transition-colors whitespace-nowrap shrink-0"
            >
              Capabilities
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('landing-coverage')}
              className="hover:text-[#B6FF50] transition-colors whitespace-nowrap shrink-0"
            >
              Coverage
            </button>
            <button
              type="button"
              onClick={() => enterAuth('login')}
              className="hover:text-[#B6FF50] transition-colors whitespace-nowrap shrink-0"
            >
              Sign In
            </button>
          </nav>

          {/* Right: Sign In (mobile) + Get Started CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <motion.button
              type="button"
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              onClick={() => enterAuth('login')}
              className="md:hidden text-xs font-medium text-[#DCE3D5] hover:text-[#B6FF50] transition-colors whitespace-nowrap shrink-0"
            >
              Sign In
            </motion.button>
            <motion.button
              type="button"
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              onClick={() => enterAuth('signup')}
              className="px-4 py-2 rounded-lg bg-[#B6FF50] hover:bg-[#c8ff78] text-[#050805] text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 shadow-[0_6px_20px_rgba(182,255,80,0.2)]"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-5 sm:px-8 lg:px-12 pb-16 space-y-24 sm:space-y-36 pointer-events-none">
        {/* ============================================================== */}
        {/* CINEMATIC ASYMMETRIC HERO                                      */}
        {/* ============================================================== */}
        <section
          id="landing-hero"
          aria-labelledby="hero-headline"
          className="max-w-7xl mx-auto min-h-[calc(100vh-76px)] py-10 sm:py-14 lg:py-16 flex items-center pointer-events-none"
        >
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 items-center pointer-events-none">
            {/* LEFT COLUMN — MAIN MESSAGE */}
            <div className="lg:col-span-7 xl:col-span-7 space-y-6 sm:space-y-7 pointer-events-none">
              {/* Stage 2 — Eyebrow */}
              <motion.div
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0.2 : 0.55,
                  delay: prefersReducedMotion ? 0 : 0.18,
                  ease: EASE_EDITORIAL,
                }}
                className={`inline-flex items-center gap-2.5 text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-[#D7E2CE] pointer-events-auto ${TEXT_LEGIBILITY}`}
              >
                <span className="w-5 h-px bg-[#B6FF50]" aria-hidden="true" />
                <span>West Bengal · Benefit Discovery</span>
              </motion.div>

              {/* Stage 3 — Clipping-Mask Three-Line Headline */}
              <h1
                id="hero-headline"
                className={`font-bold tracking-[-0.03em] leading-[1.03] text-[clamp(2.05rem,5vw,4.65rem)] pointer-events-auto ${TEXT_LEGIBILITY}`}
              >
                {headlineLines.map((line) => (
                  <span
                    key={line.text}
                    className="block overflow-hidden pb-[0.08em] -mb-[0.08em]"
                  >
                    <motion.span
                      initial={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : { y: '108%', opacity: 0.01 }
                      }
                      animate={{ y: '0%', opacity: 1 }}
                      transition={{
                        duration: prefersReducedMotion ? 0.2 : 0.72,
                        delay: prefersReducedMotion ? 0 : line.delay,
                        ease: EASE_EDITORIAL,
                      }}
                      className={`block ${line.accent ? 'text-[#B6FF50]' : 'text-white'}`}
                    >
                      {line.text}
                    </motion.span>
                  </span>
                ))}
              </h1>

              {/* Stage 4 — Supporting Description */}
              <motion.p
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0.2 : 0.6,
                  delay: prefersReducedMotion ? 0 : 0.88,
                  ease: EASE_EDITORIAL,
                }}
                className={`text-sm sm:text-base lg:text-[1.0625rem] text-[#DEE5D7] leading-relaxed max-w-xl pointer-events-auto ${TEXT_LEGIBILITY}`}
              >
                Discover scholarships, financial assistance, healthcare, pensions and government
                support tailored to your household.
              </motion.p>

              {/* Stage 5 — CTA Buttons & Trust Indicator */}
              <motion.div
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0.2 : 0.58,
                  delay: prefersReducedMotion ? 0 : 1.08,
                  ease: EASE_EDITORIAL,
                }}
                className="space-y-4 pt-1 pointer-events-auto"
              >
                <div className="flex flex-wrap items-center gap-3.5">
                  <motion.button
                    type="button"
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.975 }}
                    onClick={() => enterAuth('signup')}
                    className="group relative overflow-hidden inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#B6FF50] hover:bg-[#c8ff78] text-[#050805] text-sm font-semibold transition-colors duration-200 whitespace-nowrap shrink-0 shadow-[0_10px_28px_rgba(182,255,80,0.22)] focus-visible:outline-2 focus-visible:outline-[#B6FF50] focus-visible:outline-offset-2"
                  >
                    <span>Find My Benefits</span>
                    <ArrowRight
                      className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('landing-capabilities')}
                    className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-white/25 bg-[#0A1009]/45 hover:bg-[#131C11]/70 hover:border-[#B6FF50]/50 backdrop-blur-md text-white text-sm font-medium transition-colors duration-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#B6FF50] focus-visible:outline-offset-2"
                  >
                    Explore Schemes
                  </button>
                </div>

                <p
                  className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#C6D1BD] ${TEXT_LEGIBILITY}`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B6FF50] shrink-0" aria-hidden="true" />
                  <span>Official sources</span>
                  <span aria-hidden="true" className="text-white/40">
                    ·
                  </span>
                  <span>Personalized matching</span>
                  <span aria-hidden="true" className="text-white/40">
                    ·
                  </span>
                  <span>Clear application steps</span>
                </p>
              </motion.div>
            </div>

            {/* RIGHT COLUMN — REFINED FLOATING DIRECTORY PREVIEW */}
            <div className="lg:col-span-5 xl:col-span-5 flex lg:justify-end pointer-events-none">
              <motion.div
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 20, filter: 'blur(10px)' }
                }
                animate={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 1, y: 0, filter: 'blur(0px)' }
                }
                transition={{
                  duration: prefersReducedMotion ? 0.2 : 0.72,
                  delay: prefersReducedMotion ? 0 : 1.18,
                  ease: EASE_EDITORIAL,
                }}
                className="relative w-full max-w-[390px] lg:translate-y-4 pointer-events-auto"
              >
                {/* Controlled Lime Ambient Glow */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-6 -z-10 rounded-3xl pointer-events-none bg-[radial-gradient(circle_at_60%_30%,rgba(182,255,80,0.14)_0%,rgba(182,255,80,0)_70%)]"
                />

                {/* Low-Amplitude Post-Entrance Float */}
                <motion.aside
                  aria-label="West Bengal Benefit Directory Preview"
                  animate={
                    prefersReducedMotion
                      ? undefined
                      : { y: [0, -5, 0] }
                  }
                  transition={
                    prefersReducedMotion
                      ? undefined
                      : {
                          duration: 6.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 1.9,
                        }
                  }
                  className="rounded-2xl border border-white/18 bg-[#0C120B]/62 backdrop-blur-xl shadow-[0_24px_60px_rgba(4,7,4,0.48),inset_0_1px_0_rgba(255,255,255,0.2)] p-5 sm:p-6 space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-white/12">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#B6FF50]">
                        West Bengal Benefit Directory
                      </p>
                      <p className="mt-1 font-display text-xl sm:text-2xl font-bold tracking-wide text-white uppercase tabular-nums">
                        {SCHEMES.length} Programs Available
                      </p>
                    </div>
                    <span className="mt-0.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#B6FF50]/12 border border-[#B6FF50]/30 font-mono text-[10px] font-medium text-[#B6FF50] shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B6FF50]" aria-hidden="true" />
                      WB · GOI
                    </span>
                  </div>

                  {/* Category List */}
                  <ul className="space-y-1.5">
                    {directoryCategories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <li key={cat.label}>
                          <button
                            type="button"
                            onClick={() => scrollToSection('landing-capabilities')}
                            className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-transparent hover:border-[#B6FF50]/35 transition-colors text-left group"
                          >
                            <span className="flex items-center gap-2.5 min-w-0">
                              <span className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/10 inline-flex items-center justify-center shrink-0 group-hover:border-[#B6FF50]/40 transition-colors">
                                <Icon className="w-3.5 h-3.5 text-[#B6FF50]" aria-hidden="true" />
                              </span>
                              <span className="text-xs sm:text-[13px] font-medium text-[#EDF2E8] truncate">
                                {cat.label}
                              </span>
                            </span>
                            <span className="font-mono text-[11px] text-[#B8C4AE] group-hover:text-[#B6FF50] tabular-nums shrink-0 transition-colors">
                              {cat.count} schemes
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Compact Footer Hint */}
                  <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-[#B8C4AE]">
                    <span>Direct .gov.in portals</span>
                    <button
                      type="button"
                      onClick={() => enterAuth('signup')}
                      className="text-[#B6FF50] hover:underline underline-offset-4 font-medium inline-flex items-center gap-1"
                    >
                      <span>Match profile</span>
                      <ArrowRight className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </div>
                </motion.aside>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 2: CORE CAPABILITIES                                   */}
        {/* ============================================================== */}
        <section id="landing-capabilities" className="max-w-7xl mx-auto space-y-12 pointer-events-none">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/18 pb-6 pointer-events-none">
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: prefersReducedMotion ? 0.2 : 0.6, ease: EASE_EDITORIAL }}
              className={`pointer-events-auto ${TEXT_LEGIBILITY}`}
            >
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#B6FF50]">
                How SchemeSaathi Works
              </p>
              <h2 className="mt-1.5 font-display text-4xl sm:text-5xl font-bold tracking-wide text-white uppercase text-balance">
                From Confusion to Verified Eligibility
              </h2>
            </motion.div>

            <motion.p
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: prefersReducedMotion ? 0.2 : 0.6,
                delay: prefersReducedMotion ? 0 : 0.08,
                ease: EASE_EDITORIAL,
              }}
              className={`text-sm sm:text-base text-[#DEE5D7] max-w-md md:text-right pointer-events-auto ${TEXT_LEGIBILITY}`}
            >
              Every rule is structured around real household life stages rather than bureaucratic
              department silos.
            </motion.p>
          </div>

          <div className="divide-y divide-white/15 pointer-events-none">
            {CAPABILITIES.map((cap, idx) => (
              <motion.div
                key={cap.index}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: prefersReducedMotion ? 0.2 : 0.55,
                  delay: prefersReducedMotion ? 0 : idx * 0.06,
                  ease: EASE_EDITORIAL,
                }}
                className="py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-baseline pointer-events-none"
              >
                <div
                  className={`lg:col-span-5 flex items-baseline gap-4 pointer-events-auto ${TEXT_LEGIBILITY}`}
                >
                  <span className="font-mono text-sm sm:text-base font-semibold text-[#B6FF50] tabular-nums shrink-0">
                    {cap.index}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {cap.title}
                  </h3>
                </div>

                <div className={`lg:col-span-7 space-y-2 pointer-events-auto ${TEXT_LEGIBILITY}`}>
                  <p className="text-sm sm:text-base text-[#E6ECE0] leading-relaxed">
                    {cap.summary}
                  </p>
                  <p className="text-xs font-medium text-[#B6FF50]">{cap.meta}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 3: VERIFIED COVERAGE                                   */}
        {/* ============================================================== */}
        <section id="landing-coverage" className="max-w-7xl mx-auto space-y-12 pointer-events-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pointer-events-none">
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: prefersReducedMotion ? 0.2 : 0.6, ease: EASE_EDITORIAL }}
              className={`lg:col-span-7 pointer-events-auto ${TEXT_LEGIBILITY}`}
            >
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#B6FF50]">
                Verified Coverage
              </p>
              <h2 className="mt-2 font-display text-4xl sm:text-5xl font-bold tracking-wide text-white uppercase text-balance">
                Every Major Welfare Track in One Workspace
              </h2>
            </motion.div>

            <motion.p
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: prefersReducedMotion ? 0.2 : 0.6,
                delay: prefersReducedMotion ? 0 : 0.08,
                ease: EASE_EDITORIAL,
              }}
              className={`lg:col-span-5 text-sm sm:text-base text-[#E6ECE0] leading-relaxed lg:text-right pointer-events-auto ${TEXT_LEGIBILITY}`}
            >
              Combine Lakshmir Bhandar, Swasthya Sathi, Krishak Bandhu, and SVMCM in one plan.
              Track application stages in English or Bengali and sync optionally with your session.
            </motion.p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-white/18 pointer-events-none">
            {PROOF_METRICS.map((metric, idx) => (
              <motion.div
                key={metric.label}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: prefersReducedMotion ? 0.2 : 0.55,
                  delay: prefersReducedMotion ? 0 : idx * 0.06,
                  ease: EASE_EDITORIAL,
                }}
                className={`space-y-1.5 pointer-events-auto ${TEXT_LEGIBILITY}`}
              >
                <p className="font-mono text-4xl sm:text-5xl font-bold text-[#B6FF50] tabular-nums">
                  {metric.value}
                </p>
                <p className="text-sm font-semibold text-white">{metric.label}</p>
                <p className="text-xs text-[#C6D1BD]">{metric.detail}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 4: SCROLL-THROUGH ENTRY TO SIGN UP / LOGIN PAGE        */}
        {/* ============================================================== */}
        <section id="landing-portal-gate" className="max-w-4xl mx-auto pt-4 pb-24 pointer-events-none">
          <motion.div
            style={{ scale: gateScale }}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: prefersReducedMotion ? 0.2 : 0.6, ease: EASE_EDITORIAL }}
            className={`text-center space-y-6 pointer-events-auto ${TEXT_LEGIBILITY}`}
          >
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-[#B6FF50]">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>Ready to Enter Citizen Workspace</span>
            </div>

            <h2 className="font-display text-4xl sm:text-6xl font-bold tracking-wide uppercase text-balance">
              <span className="text-white">Create Your Account </span>
              <span className="text-[#B6FF50]">or Sign In</span>
            </h2>

            <p className="text-sm sm:text-base text-[#E6ECE0] max-w-xl mx-auto leading-relaxed">
              Continue scrolling to enter the Sign Up &amp; Login portal automatically, or choose an
              option below to open your SchemeSaathi welfare workspace.
            </p>

            <div className="max-w-md mx-auto space-y-2">
              <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full bg-[#B6FF50] transition-[width] duration-150"
                  style={{ width: `${Math.round(scrollGateProgress * 100)}%` }}
                />
              </div>
              <p className="font-mono text-xs text-[#C6D1BD] tabular-nums">
                {scrollGateProgress >= 0.9
                  ? 'Entering Sign Up / Login...'
                  : `Scroll gate progress · ${Math.round(scrollGateProgress * 100)}%`}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <motion.button
                type="button"
                whileTap={prefersReducedMotion ? undefined : { scale: 0.975 }}
                onClick={() => enterAuth('signup')}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#B6FF50] hover:bg-[#c8ff78] text-[#050805] text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                <span>Create Account</span>
                <ArrowRight
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </motion.button>
              <motion.button
                type="button"
                whileTap={prefersReducedMotion ? undefined : { scale: 0.975 }}
                onClick={() => enterAuth('login')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/25 bg-[#0A1009]/45 hover:bg-[#131C11]/70 hover:border-[#B6FF50]/50 backdrop-blur-md text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0"
              >
                <span>Log In to Existing Account</span>
              </motion.button>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
