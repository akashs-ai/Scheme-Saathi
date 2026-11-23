import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { GreenSanctuaryBackground } from './components/GreenSanctuaryBackground';
import { Navbar } from './components/Navbar';
import { Scene } from './components/Scene';
import { SchemeSaathiLogo } from './components/SchemeSaathiLogo';
import { MobileBottomNav, Sidebar } from './components/Sidebar';
import { SchemeProvider, useSchemes } from './context/SchemeContext';
import { AuthPage } from './views/AuthPage';
import { CategoriesView } from './views/CategoriesView';
import { DashboardView } from './views/DashboardView';
import { DocumentsView } from './views/DocumentsView';
import { FamilyBenefitsView } from './views/FamilyBenefitsView';
import { HomeView } from './views/HomeView';
import { LandingPage } from './views/LandingPage';
import { ProfileWizardView } from './views/ProfileWizardView';
import { SavedSchemesView } from './views/SavedSchemesView';
import { SchemeDetailsView } from './views/SchemeDetailsView';
import { SchemeExplorerView } from './views/SchemeExplorerView';
import { SettingsView } from './views/SettingsView';
import { SupportView } from './views/SupportView';

function SchemeSaathiShell() {
  const { appStage, activeView, selectedSchemeId, toastMessage } = useSchemes();
  const prefersReducedMotion = useReducedMotion();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setInitializing(false), 320);
    return () => window.clearTimeout(timer);
  }, []);

  const renderActiveView = () => {
    switch (activeView) {
      case 'home':
        return <HomeView />;
      case 'dashboard':
        return <DashboardView />;
      case 'explorer':
        return <SchemeExplorerView />;
      case 'categories':
        return <CategoriesView />;
      case 'details':
        return <SchemeDetailsView />;
      case 'profile':
        return <ProfileWizardView />;
      case 'family':
        return <FamilyBenefitsView />;
      case 'saved':
        return <SavedSchemesView />;
      case 'documents':
        return <DocumentsView />;
      case 'support':
        return <SupportView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen w-full text-white flex flex-col relative">
      {/* Persistent Forest Scene (Landing & Workspace) + Green Sanctuary Crossfade (Auth) */}
      <motion.div
        aria-hidden={appStage === 'auth'}
        animate={{ opacity: appStage === 'auth' ? 0 : 1 }}
        transition={{
          duration: prefersReducedMotion ? 0.2 : 0.72,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={appStage === 'auth' ? 'fixed inset-0 z-0 pointer-events-none' : 'fixed inset-0 z-0'}
      >
        <Scene />
      </motion.div>

      <AnimatePresence>
        {appStage === 'auth' && <GreenSanctuaryBackground key="bg-sanctuary" />}
      </AnimatePresence>

      {/* Brief Branded Loading Screen */}
      <AnimatePresence>
        {initializing && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#4a4d44]/90 backdrop-blur-md flex flex-col items-center justify-center gap-3"
          >
            <SchemeSaathiLogo size={54} variant="lime" />
            <p className="font-display text-lg font-bold tracking-widest text-white uppercase">
              SchemeSaathi
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage Transition: Landing <-> Auth (Green Sanctuary) -> Main Workspace */}
      <AnimatePresence mode="wait">
        {appStage === 'landing' && (
          <motion.div
            key="stage-landing"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -14, scale: 0.992, filter: 'blur(5px)' }
            }
            transition={{ duration: prefersReducedMotion ? 0.18 : 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col flex-1 min-h-screen pointer-events-none"
          >
            <LandingPage />
          </motion.div>
        )}

        {appStage === 'auth' && (
          <motion.div
            key="stage-auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 18, filter: 'blur(5px)' }
            }
            transition={{ duration: prefersReducedMotion ? 0.18 : 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col flex-1 min-h-screen pointer-events-none"
          >
            <AuthPage />
          </motion.div>
        )}

        {appStage === 'app' && (
          <motion.div
            key="stage-app"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col flex-1 min-h-screen pointer-events-none"
          >
            {/* Compact Translucent Top Navbar */}
            <Navbar />

            {/* Body Split: Left Vertical Circular Icon Sidebar + Main Content Area */}
            <div className="flex flex-1 min-h-0 pointer-events-none">
              <Sidebar />

              <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 ui-overlay-main">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeView === 'details' ? `details-${selectedSchemeId}` : activeView}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {renderActiveView()}
                  </motion.div>
                </AnimatePresence>

                <Footer />
              </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transient Feedback Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-16 md:bottom-8 right-5 md:right-9 z-50 glass-window-lime text-white text-xs font-medium px-4 py-2.5 rounded-full max-w-sm flex items-center gap-2 pointer-events-auto"
          >
            <span className="w-2 h-2 rounded-full bg-[#B6FF50] shrink-0" aria-hidden="true" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SchemeProvider>
        <SchemeSaathiShell />
      </SchemeProvider>
    </ErrorBoundary>
  );
}
