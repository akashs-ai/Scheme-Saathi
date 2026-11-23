import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Eye,
  EyeOff,
  FileCheck2,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { SchemeSaathiLogo } from '../components/SchemeSaathiLogo';
import { useSchemes } from '../context/SchemeContext';
import { WEST_BENGAL_DISTRICTS } from '../data/categories';
import { loginCitizen, loginDemoCitizen, signupCitizen } from '../lib/apiClient';

const EASE_EDITORIAL: [number, number, number, number] = [0.16, 1, 0.3, 1];

function evaluatePasswordStrength(pw: string): {
  score: 0 | 1 | 2 | 3;
  label: string;
  barClass: string;
  textClass: string;
} {
  if (!pw) {
    return {
      score: 0,
      label: 'Minimum 8 characters',
      barClass: 'bg-white/12',
      textClass: 'text-[#8FA095]',
    };
  }
  const hasLength = pw.length >= 8;
  const hasMix = /[a-z]/.test(pw) && /[A-Z]/.test(pw);
  const hasNumOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>_-]/.test(pw);

  if (hasLength && hasMix && hasNumOrSymbol && pw.length >= 10) {
    return {
      score: 3,
      label: 'Strong password',
      barClass: 'bg-[#B6FF50]',
      textClass: 'text-[#B6FF50]',
    };
  }
  if (hasLength && (hasMix || hasNumOrSymbol)) {
    return {
      score: 2,
      label: 'Good password',
      barClass: 'bg-[#94E268]',
      textClass: 'text-[#C6E5A8]',
    };
  }
  return {
    score: 1,
    label: hasLength ? 'Fair — add uppercase or a number' : 'Use at least 8 characters',
    barClass: 'bg-[#FF9D2E]',
    textClass: 'text-[#F3BE78]',
  };
}

export function AuthPage() {
  const { authMode, completeAuth, returnToLanding } = useSchemes();
  const prefersReducedMotion = useReducedMotion();

  const [mode, setMode] = useState<'signup' | 'login'>(authMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('Kolkata');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMode(authMode);
    setErrorMsg(null);
  }, [authMode]);

  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  const switchMode = (nextMode: 'signup' | 'login') => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (mode === 'signup') {
      if (fullName.trim().length < 2) {
        setErrorMsg('Please enter your full name (at least 2 characters).');
        return;
      }
      if (password.length < 8) {
        setErrorMsg('Password must be at least 8 characters long.');
        return;
      }
    } else if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setSubmitting(true);
    const result =
      mode === 'signup'
        ? await signupCitizen({
            fullName: fullName.trim(),
            email: trimmedEmail,
            district,
            password,
          })
        : await loginCitizen({
            email: trimmedEmail,
            password,
          });
    setSubmitting(false);

    if (!result.ok || !result.token || !result.user) {
      setErrorMsg(result.error || 'Authentication failed. Please check your details.');
      return;
    }

    completeAuth(result.token, result.user);
  };

  const handleDemoAccess = async () => {
    setErrorMsg(null);
    setDemoLoading(true);
    const result = await loginDemoCitizen();
    setDemoLoading(false);

    if (!result.ok || !result.token || !result.user) {
      setErrorMsg(result.error || 'Unable to start demo citizen session.');
      return;
    }

    completeAuth(result.token, result.user);
  };

  const inputBaseClass =
    'w-full px-3.5 py-2.5 rounded-xl bg-[#09130D]/75 border border-white/14 text-sm text-white placeholder:text-[#7E9084] transition-colors duration-150 focus:outline-none focus:border-[#B6FF50]/75 focus:ring-2 focus:ring-[#B6FF50]/20';

  return (
    <div className="relative z-10 min-h-screen w-full overflow-x-clip flex flex-col justify-between px-4 sm:px-8 py-5 sm:py-6 pointer-events-none">
      {/* Full-Width Side-Aligned Sanctuary Header */}
      <motion.header
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.2 : 0.42, ease: EASE_EDITORIAL }}
        className="w-full flex items-center justify-between gap-4 pointer-events-auto"
      >
        <motion.button
          type="button"
          whileTap={prefersReducedMotion ? undefined : { scale: 0.975 }}
          onClick={returnToLanding}
          className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/15 bg-[#0C1711]/70 hover:bg-[#122219]/85 hover:border-[#B6FF50]/45 backdrop-blur-md text-xs font-medium text-[#E5ECE6] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#B6FF50] focus-visible:outline-offset-2"
        >
          <ArrowLeft
            className="w-3.5 h-3.5 text-[#B6FF50] transition-transform duration-200 group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          <span>Back to Overview</span>
        </motion.button>

        <div className="flex items-center gap-2.5 shrink-0">
          <SchemeSaathiLogo size={28} variant="lime" />
          <span className="font-display text-lg font-bold tracking-wider text-white uppercase">
            SchemeSaathi
          </span>
        </div>
      </motion.header>

      {/* Centered Split Sanctuary Card (Phase 4 Entrance) */}
      <main className="flex-1 flex items-center justify-center py-6 sm:py-8 pointer-events-none">
        <motion.div
          data-auth-card="true"
          initial={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 26, filter: 'blur(8px)' }
          }
          animate={
            prefersReducedMotion
              ? { opacity: 1 }
              : { opacity: 1, y: 0, filter: 'blur(0px)' }
          }
          transition={{ duration: prefersReducedMotion ? 0.2 : 0.54, ease: EASE_EDITORIAL }}
          className="relative max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden border border-white/12 bg-[#0B1510]/90 backdrop-blur-xl shadow-[0_24px_64px_rgba(2,6,4,0.58),inset_0_1px_0_rgba(255,255,255,0.1)] pointer-events-auto"
        >
          {/* LEFT PANEL — BRAND MESSAGING & TRUST */}
          <div className="relative lg:col-span-5 p-6 sm:p-8 lg:p-10 bg-emerald-950/20 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between gap-8">
            <div className="space-y-4">
              {/* Phase 5: Eyebrow */}
              <motion.p
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0.15 : 0.4,
                  delay: prefersReducedMotion ? 0 : 0.08,
                  ease: EASE_EDITORIAL,
                }}
                className="font-mono text-xs uppercase tracking-[0.12em] text-[#B6FF50]"
              >
                West Bengal Citizen Access
              </motion.p>

              {/* Phase 5: Editorial Heading */}
              <motion.h1
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0.15 : 0.45,
                  delay: prefersReducedMotion ? 0 : 0.13,
                  ease: EASE_EDITORIAL,
                }}
                className="font-bold tracking-[-0.02em] leading-[1.14] text-2xl sm:text-3xl lg:text-[2.125rem] text-white text-balance"
              >
                <span className="block">Your family&apos;s support,</span>
                <span className="block text-[#B6FF50] mt-1">all in one place.</span>
              </motion.h1>

              {/* Phase 5: Description */}
              <motion.p
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0.15 : 0.45,
                  delay: prefersReducedMotion ? 0 : 0.18,
                  ease: EASE_EDITORIAL,
                }}
                className="text-sm text-[#C8D5CC] leading-relaxed max-w-sm"
              >
                Discover benefits you may qualify for, track applications and access official scheme
                information—all through one simple workspace.
              </motion.p>
            </div>

            {/* Phase 5: Trust Statements */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0.15 : 0.45,
                delay: prefersReducedMotion ? 0 : 0.24,
                ease: EASE_EDITORIAL,
              }}
              className="space-y-4 pt-6 border-t border-white/10"
            >
              <div className="flex items-start gap-3">
                <ShieldCheck
                  className="w-4 h-4 text-[#B6FF50]/90 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-xs font-semibold text-white">Privacy-first access</p>
                  <p className="mt-0.5 text-xs text-[#9FB0A4] leading-relaxed">
                    No Aadhaar or bank details required for demo access.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileCheck2
                  className="w-4 h-4 text-[#B6FF50]/90 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-xs font-semibold text-white">Verified scheme information</p>
                  <p className="mt-0.5 text-xs text-[#9FB0A4] leading-relaxed">
                    Explore government welfare schemes with official-source references.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT PANEL — SIGNUP / LOGIN FORM */}
          <div className="relative lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-5">
            {/* Phase 5: Segmented Mode Switcher */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0.15 : 0.4,
                delay: prefersReducedMotion ? 0 : 0.14,
                ease: EASE_EDITORIAL,
              }}
              role="tablist"
              aria-label="Authentication mode"
              className="relative grid grid-cols-2 p-1 rounded-xl bg-[#070F0A]/80 border border-white/12"
            >
              {(['signup', 'login'] as const).map((tab) => {
                const isActive = mode === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => switchMode(tab)}
                    className={`relative z-10 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[#B6FF50] focus-visible:outline-offset-2 ${
                      isActive ? 'text-[#050A06]' : 'text-[#A8B8AD] hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="auth-mode-pill"
                        transition={{
                          duration: prefersReducedMotion ? 0.05 : 0.26,
                          ease: EASE_EDITORIAL,
                        }}
                        className="absolute inset-0 -z-10 rounded-lg bg-[#B6FF50]"
                      />
                    )}
                    {tab === 'signup' ? 'Sign Up' : 'Log In'}
                  </button>
                );
              })}
            </motion.div>

            {/* Form + Inline Feedback Container */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0.15 : 0.45,
                delay: prefersReducedMotion ? 0 : 0.2,
                ease: EASE_EDITORIAL,
              }}
              className="space-y-3"
            >
              {/* Reserved Inline Validation Slot (prevents form jumping) */}
              <div className="min-h-[40px] flex items-center">
                <AnimatePresence mode="wait">
                  {errorMsg && (
                    <motion.div
                      key={errorMsg}
                      role="alert"
                      initial={{ opacity: 0, y: -3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      transition={{ duration: 0.16, ease: EASE_EDITORIAL }}
                      className="w-full flex items-start gap-2.5 px-3.5 py-2 rounded-xl bg-[#271516]/90 border border-[#E06C75]/45 text-xs text-[#F7C2C6]"
                    >
                      <AlertCircle
                        className="w-4 h-4 text-[#E06C75] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{errorMsg}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mode}
                    initial={
                      prefersReducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, x: mode === 'signup' ? -8 : 8 }
                    }
                    animate={{ opacity: 1, x: 0 }}
                    exit={
                      prefersReducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, x: mode === 'signup' ? 8 : -8 }
                    }
                    transition={{
                      duration: prefersReducedMotion ? 0.12 : 0.2,
                      ease: EASE_EDITORIAL,
                    }}
                    className="space-y-4"
                  >
                    {mode === 'signup' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="auth-fullname"
                            className="block text-xs font-medium text-[#DCE5DF]"
                          >
                            Full Name
                          </label>
                          <input
                            id="auth-fullname"
                            type="text"
                            required
                            autoComplete="name"
                            value={fullName}
                            onChange={(e) => {
                              setFullName(e.target.value);
                              if (errorMsg) setErrorMsg(null);
                            }}
                            placeholder="e.g., Subhankar Das"
                            className={inputBaseClass}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="auth-district"
                            className="block text-xs font-medium text-[#DCE5DF]"
                          >
                            District of West Bengal
                          </label>
                          <div className="relative">
                            <select
                              id="auth-district"
                              value={district}
                              onChange={(e) => setDistrict(e.target.value)}
                              className={`${inputBaseClass} appearance-none pr-9`}
                            >
                              {WEST_BENGAL_DISTRICTS.map((d) => (
                                <option key={d} value={d} className="bg-[#0E1812] text-white">
                                  {d}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              className="w-4 h-4 text-[#94A69A] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label
                        htmlFor="auth-email"
                        className="block text-xs font-medium text-[#DCE5DF]"
                      >
                        Email Address
                      </label>
                      <input
                        id="auth-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errorMsg) setErrorMsg(null);
                        }}
                        placeholder="name@example.com"
                        className={inputBaseClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="auth-password"
                        className="block text-xs font-medium text-[#DCE5DF]"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="auth-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={mode === 'signup' ? 8 : 1}
                          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder={
                            mode === 'signup'
                              ? 'Create a strong password'
                              : 'Enter your password'
                          }
                          className={`${inputBaseClass} pr-11`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          aria-pressed={showPassword}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg text-[#94A69A] hover:text-white hover:bg-white/[0.06] inline-flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-[#B6FF50]"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" aria-hidden="true" />
                          ) : (
                            <Eye className="w-4 h-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>

                      {mode === 'signup' && (
                        <div className="pt-1 space-y-1.5" aria-live="polite">
                          <div className="grid grid-cols-3 gap-1.5">
                            {[1, 2, 3].map((step) => (
                              <div
                                key={step}
                                className={`h-1 rounded-full transition-colors duration-200 ${
                                  strength.score >= step ? strength.barClass : 'bg-white/12'
                                }`}
                              />
                            ))}
                          </div>
                          <p className={`text-xs ${strength.textClass}`}>{strength.label}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={submitting || demoLoading}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.988 }}
                  className="group w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#B6FF50] hover:bg-[#c5ff6e] disabled:opacity-60 text-[#050A06] text-sm font-semibold transition-colors duration-200 shadow-sm focus-visible:outline-2 focus-visible:outline-[#B6FF50] focus-visible:outline-offset-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>
                        {mode === 'signup' ? 'Creating Account...' : 'Logging In...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'signup' ? 'Create Account & Enter' : 'Log In'}</span>
                      <ArrowRight
                        className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>

            {/* Secondary Action: Demo Citizen Account */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0.15 : 0.42,
                delay: prefersReducedMotion ? 0 : 0.26,
                ease: EASE_EDITORIAL,
              }}
              className="pt-4 border-t border-white/10 space-y-2.5"
            >
              <motion.button
                type="button"
                disabled={submitting || demoLoading}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.988 }}
                onClick={handleDemoAccess}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/16 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/28 disabled:opacity-60 text-xs sm:text-[13px] font-medium text-[#E5ECE6] transition-colors focus-visible:outline-2 focus-visible:outline-[#B6FF50] focus-visible:outline-offset-2"
              >
                {demoLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B6FF50]" aria-hidden="true" />
                    <span>Starting Demo Citizen Session...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#B6FF50]" aria-hidden="true" />
                    <span>Continue with Demo Citizen Account</span>
                  </>
                )}
              </motion.button>
              <p className="text-xs text-center text-[#8FA095]">
                Demo access opens a temporary citizen workspace with no personal IDs collected.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
