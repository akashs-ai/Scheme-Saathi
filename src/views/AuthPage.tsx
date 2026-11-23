import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { SchemeSaathiLogo } from '../components/SchemeSaathiLogo';
import { useSchemes } from '../context/SchemeContext';
import { WEST_BENGAL_DISTRICTS } from '../data/categories';
import { loginCitizen, loginDemoCitizen, signupCitizen } from '../lib/apiClient';

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

  return (
    <div className="relative z-10 min-h-screen w-full flex flex-col justify-between px-4 sm:px-8 py-6 pointer-events-none">
      {/* Compact Top Return Navigation */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between gap-4 pointer-events-auto">
        <button
          type="button"
          onClick={returnToLanding}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pane glass-pane-hover text-xs font-medium text-white transition-colors whitespace-nowrap"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#B6FF50]" aria-hidden="true" />
          <span>Back to Overview</span>
        </button>

        <div className="flex items-center gap-2.5">
          <SchemeSaathiLogo size={30} variant="lime" />
          <span className="font-display text-lg font-bold tracking-wide text-white uppercase">
            SchemeSaathi
          </span>
        </div>
      </header>

      {/* Main Centered Two-Column Auth Container */}
      <main className="flex-1 flex items-center justify-center py-8 pointer-events-none">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 glass-window rounded-2xl overflow-hidden pointer-events-auto"
        >
          {/* Left Panel: Citizen Portal Context */}
          <div className="lg:col-span-5 p-7 sm:p-8 bg-white/[0.04] border-b lg:border-b-0 lg:border-r border-white/15 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <p className="text-xs font-medium text-[#B6FF50]">
                West Bengal Citizen Access
              </p>
              <h1
                className="font-display text-3xl sm:text-4xl font-bold tracking-wide text-white uppercase leading-tight"
                style={{ textWrap: 'balance' }}
              >
                Enter Your Welfare Workspace
              </h1>
              <p className="text-xs sm:text-sm text-[#D6DCD0] leading-relaxed">
                Sign up or log in to unlock the full SchemeSaathi hero overview, personalized
                eligibility matching, family benefit mapping, and document checklists.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10 text-xs text-[#D6DCD0]">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#B6FF50] shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  No Aadhaar number, bank account details, or OTPs are ever collected during
                  registration or scheme matching.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#B6FF50] shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Covers 34 verified West Bengal State &amp; Central Government welfare schemes.
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel: Sign Up / Log In Form */}
          <div className="lg:col-span-7 p-7 sm:p-9 space-y-6">
            {/* Segmented Switcher */}
            <div
              role="tablist"
              aria-label="Authentication mode"
              className="grid grid-cols-2 gap-1 p-1 glass-pane rounded-xl"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'signup'}
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                  mode === 'signup'
                    ? 'bg-[#B6FF50] text-[#050505]'
                    : 'text-[#C7D0BE] hover:text-white'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                  mode === 'login'
                    ? 'bg-[#B6FF50] text-[#050505]'
                    : 'text-[#C7D0BE] hover:text-white'
                }`}
              >
                Log In
              </button>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#2A1B1C] border border-[#E06C75]/50 text-xs text-[#F5B7BC]"
              >
                <AlertCircle className="w-4 h-4 text-[#E06C75] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="auth-fullname" className="block text-xs font-medium text-[#E2E6DC]">
                      Full Name
                    </label>
                    <input
                      id="auth-fullname"
                      type="text"
                      required
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g., Subhankar Das"
                      className="w-full px-3.5 py-2.5 rounded-xl glass-pane focus:border-[#B6FF50] text-sm text-white placeholder:text-[#9FA897] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="auth-district" className="block text-xs font-medium text-[#E2E6DC]">
                      District (West Bengal)
                    </label>
                    <select
                      id="auth-district"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-pane focus:border-[#B6FF50] text-sm text-white focus:outline-none"
                    >
                      {WEST_BENGAL_DISTRICTS.map((d) => (
                        <option key={d} value={d} className="bg-[#181B15] text-white">
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="auth-email" className="block text-xs font-medium text-[#E2E6DC]">
                  Email Address
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-pane focus:border-[#B6FF50] text-sm text-white placeholder:text-[#9FA897] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="auth-password" className="block text-xs font-medium text-[#E2E6DC]">
                  Password {mode === 'signup' && <span className="text-[#9FA897]">(min. 8 characters)</span>}
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={mode === 'signup' ? 8 : 1}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
                    className="w-full pl-3.5 pr-11 py-2.5 rounded-xl glass-pane focus:border-[#B6FF50] text-sm text-white placeholder:text-[#9FA897] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg text-[#9FA897] hover:text-white inline-flex items-center justify-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || demoLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#B6FF50] hover:bg-[#c8ff78] disabled:opacity-60 text-[#050505] text-sm font-semibold transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>{mode === 'signup' ? 'Creating Account...' : 'Signing In...'}</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'signup' ? 'Create Account & Enter' : 'Log In & Enter'}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <button
                type="button"
                disabled={submitting || demoLoading}
                onClick={handleDemoAccess}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full glass-pane glass-pane-hover disabled:opacity-60 text-xs font-medium text-white transition-colors"
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
              </button>
              <p className="text-[11px] text-center text-[#9FA897]">
                Demo access creates a temporary non-privileged citizen session with no Aadhaar or ID data.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
