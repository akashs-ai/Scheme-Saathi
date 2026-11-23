import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SCHEMES } from '../data/schemes';
import { EMPTY_PROFILE, SYNTHETIC_DEMO_PROFILE } from '../data/syntheticFamilies';
import {
  deleteFamilyMemberFromSupabase,
  fetchRemoteWorkspace,
  fetchSupabaseHealth,
  getOrCreateClientSessionId,
  logoutCitizen,
  syncBookmarkToSupabase,
  syncDocumentToSupabase,
  syncFamilyMemberToSupabase,
  syncProfileToSupabase,
  type AuthUser,
  type SyncStatusResponse,
} from '../lib/apiClient';
import type {
  ApplicationStage,
  ApplicationTrackerItem,
  AppStage,
  AppView,
  CitizenProfile,
  ExplorerFilters,
  FamilyMember,
  SchemeCategoryId,
  UiLanguage,
} from '../types/scheme';
import { evaluateSchemeForProfile } from '../utils/matchingEngine';

const STORAGE_KEY = 'schemesaathi_wb_state_v2';

interface PersistedState {
  language: UiLanguage;
  profile: CitizenProfile;
  savedSchemeIds: string[];
  exploredSchemeIds: string[];
  checkedDocuments: Record<string, boolean>;
  applications: ApplicationTrackerItem[];
  customFamilyMembers: FamilyMember[];
}

const DEFAULT_PERSISTED: PersistedState = {
  language: 'en',
  profile: EMPTY_PROFILE,
  savedSchemeIds: ['swasthya-sathi', 'krishak-bandhu', 'svmcm', 'annapurna-yojana'],
  exploredSchemeIds: [
    'swasthya-sathi',
    'annapurna-yojana',
    'krishak-bandhu',
    'svmcm',
    'wb-old-age-pension',
    'banglar-bari',
  ],
  checkedDocuments: {
    'Domicile Certificate (West Bengal)': true,
    'Digital Ration Card (or Form 3 / Form 4 for new application or member addition)': true,
  },
  applications: [
    {
      schemeId: 'swasthya-sathi',
      stage: 'Under Verification',
      updatedAt: 'Nov 2026',
      note: 'Checking family member names and PM-JAY harmonisation status.',
    },
    {
      schemeId: 'svmcm',
      stage: 'Submitted on Official Portal',
      updatedAt: 'Nov 2026',
      note: 'Income certificate and marksheets uploaded to svmcm.wb.gov.in.',
    },
    {
      schemeId: 'krishak-bandhu',
      stage: 'Ready to Apply',
      updatedAt: 'Nov 2026',
      note: 'Parcha and bank passbook verified for ADA office submission.',
    },
    {
      schemeId: 'annapurna-yojana',
      stage: 'Preparing Documents',
      updatedAt: 'Nov 2026',
      note: 'Confirming transition notice and NPCI bank seeding status.',
    },
  ],
  customFamilyMembers: [],
};

const DEFAULT_FILTERS: ExplorerFilters = {
  categoryId: 'all',
  searchQuery: '',
  beneficiary: 'All',
  providerLevel: 'All',
  eligibilityFilter: 'All',
  savedOnly: false,
};

interface SchemeContextValue {
  appStage: AppStage;
  authMode: 'login' | 'signup';
  authUser: AuthUser | null;
  authToken: string | null;
  enterAuth: (mode?: 'login' | 'signup') => void;
  returnToLanding: () => void;
  completeAuth: (token: string, user: AuthUser) => void;
  signOut: () => Promise<void>;
  activeView: AppView;
  selectedSchemeId: string | null;
  filters: ExplorerFilters;
  language: UiLanguage;
  profile: CitizenProfile;
  savedSchemeIds: string[];
  exploredSchemeIds: string[];
  checkedDocuments: Record<string, boolean>;
  applications: ApplicationTrackerItem[];
  customFamilyMembers: FamilyMember[];
  toastMessage: string | null;
  dbStatus: SyncStatusResponse;
  refreshDbStatus: () => Promise<void>;
  navigateTo: (view: AppView) => void;
  openCategoryInExplorer: (categoryId: SchemeCategoryId) => void;
  openSchemeDetails: (schemeId: string) => void;
  searchAndExplore: (query: string) => void;
  updateFilters: (partial: Partial<ExplorerFilters>) => void;
  resetFilters: () => void;
  toggleLanguage: () => void;
  setLanguage: (lang: UiLanguage) => void;
  toggleSaveScheme: (schemeId: string) => void;
  isSchemeSaved: (schemeId: string) => boolean;
  saveProfile: (nextProfile: CitizenProfile) => void;
  loadSyntheticDemoProfile: () => void;
  clearProfile: () => void;
  resetAllLocalData: () => void;
  toggleDocumentChecked: (documentName: string) => void;
  startOrUpdateApplication: (schemeId: string, stage: ApplicationStage, note?: string) => void;
  removeApplication: (schemeId: string) => void;
  addCustomFamilyMember: (member: Omit<FamilyMember, 'id' | 'isSynthetic'>) => void;
  removeCustomFamilyMember: (memberId: string) => void;
  showToast: (message: string) => void;
}

const SchemeContext = createContext<SchemeContextValue | undefined>(undefined);

function loadPersistedState(): PersistedState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PERSISTED;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      language: parsed.language === 'bn' ? 'bn' : 'en',
      profile: parsed.profile ? { ...EMPTY_PROFILE, ...parsed.profile } : DEFAULT_PERSISTED.profile,
      savedSchemeIds: Array.isArray(parsed.savedSchemeIds)
        ? parsed.savedSchemeIds
        : DEFAULT_PERSISTED.savedSchemeIds,
      exploredSchemeIds: Array.isArray(parsed.exploredSchemeIds)
        ? parsed.exploredSchemeIds
        : DEFAULT_PERSISTED.exploredSchemeIds,
      checkedDocuments:
        parsed.checkedDocuments && typeof parsed.checkedDocuments === 'object'
          ? parsed.checkedDocuments
          : DEFAULT_PERSISTED.checkedDocuments,
      applications: Array.isArray(parsed.applications)
        ? parsed.applications
        : DEFAULT_PERSISTED.applications,
      customFamilyMembers: Array.isArray(parsed.customFamilyMembers)
        ? parsed.customFamilyMembers
        : DEFAULT_PERSISTED.customFamilyMembers,
    };
  } catch {
    return DEFAULT_PERSISTED;
  }
}

export function SchemeProvider({ children }: { children: React.ReactNode }) {
  const sessionIdRef = useRef<string>(getOrCreateClientSessionId());
  const [persisted, setPersisted] = useState<PersistedState>(() => loadPersistedState());
  const [appStage, setAppStage] = useState<AppStage>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [activeView, setActiveView] = useState<AppView>('home');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExplorerFilters>(DEFAULT_FILTERS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<SyncStatusResponse>({
    configured: false,
    connected: false,
    tablesReady: false,
    message: 'Checking Supabase database connection...',
  });

  const refreshDbStatus = async () => {
    const status = await fetchSupabaseHealth();
    setDbStatus(status);
    if (status.tablesReady) {
      const remote = await fetchRemoteWorkspace(sessionIdRef.current);
      if (remote) {
        setPersisted((prev) => ({
          ...prev,
          profile: remote.profile ?? prev.profile,
          savedSchemeIds:
            remote.savedSchemeIds.length > 0 ? remote.savedSchemeIds : prev.savedSchemeIds,
          applications:
            remote.applications.length > 0 ? remote.applications : prev.applications,
          checkedDocuments:
            Object.keys(remote.checkedDocuments).length > 0
              ? { ...prev.checkedDocuments, ...remote.checkedDocuments }
              : prev.checkedDocuments,
          customFamilyMembers:
            remote.customFamilyMembers.length > 0
              ? remote.customFamilyMembers
              : prev.customFamilyMembers,
        }));
      }
    }
  };

  useEffect(() => {
    void refreshDbStatus();
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // Ignore storage quota errors in restricted frames
    }
  }, [persisted]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const enterAuth = (mode: 'login' | 'signup' = 'signup') => {
    setAuthMode(mode);
    setAppStage('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const returnToLanding = () => {
    setAppStage('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completeAuth = (token: string, user: AuthUser) => {
    setAuthToken(token);
    setAuthUser(user);
    if (user.district) {
      setPersisted((prev) => ({
        ...prev,
        profile: prev.profile.district
          ? prev.profile
          : { ...prev.profile, district: user.district },
      }));
    }
    setActiveView('home');
    setAppStage('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Welcome, ${user.fullName}`);
  };

  const signOut = async () => {
    const token = authToken;
    setAuthToken(null);
    setAuthUser(null);
    setAppStage('auth');
    setAuthMode('login');
    await logoutCitizen(token);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Signed out of SchemeSaathi');
  };

  const navigateTo = (view: AppView) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCategoryInExplorer = (categoryId: SchemeCategoryId) => {
    setFilters({
      ...DEFAULT_FILTERS,
      categoryId,
    });
    setActiveView('explorer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const searchAndExplore = (query: string) => {
    setFilters({
      ...DEFAULT_FILTERS,
      searchQuery: query,
    });
    setActiveView('explorer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openSchemeDetails = (schemeId: string) => {
    setSelectedSchemeId(schemeId);
    setPersisted((prev) => ({
      ...prev,
      exploredSchemeIds: prev.exploredSchemeIds.includes(schemeId)
        ? prev.exploredSchemeIds
        : [...prev.exploredSchemeIds, schemeId],
    }));
    setActiveView('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateFilters = (partial: Partial<ExplorerFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const setLanguage = (lang: UiLanguage) => {
    setPersisted((prev) => ({ ...prev, language: lang }));
    showToast(
      lang === 'bn' ? 'ভাষা পরিবর্তন করা হয়েছে: বাংলা (বাং)' : 'Language switched to English (EN)'
    );
  };

  const toggleLanguage = () => {
    setLanguage(persisted.language === 'en' ? 'bn' : 'en');
  };

  const toggleSaveScheme = (schemeId: string) => {
    const schemeName = SCHEMES.find((s) => s.id === schemeId)?.name ?? 'Scheme';
    let nextIsSaved = false;
    let currentStage: string | null = null;
    let currentNote = '';

    setPersisted((prev) => {
      const exists = prev.savedSchemeIds.includes(schemeId);
      nextIsSaved = !exists;
      const app = prev.applications.find((a) => a.schemeId === schemeId);
      currentStage = app?.stage ?? null;
      currentNote = app?.note ?? '';
      const nextSaved = exists
        ? prev.savedSchemeIds.filter((id) => id !== schemeId)
        : [...prev.savedSchemeIds, schemeId];
      return { ...prev, savedSchemeIds: nextSaved };
    });

    showToast(
      nextIsSaved ? `Saved "${schemeName}"` : `Removed "${schemeName}" from saved schemes`
    );

    void syncBookmarkToSupabase(sessionIdRef.current, {
      schemeId,
      isSaved: nextIsSaved,
      applicationStage: currentStage,
      note: currentNote,
    });
  };

  const isSchemeSaved = (schemeId: string) => persisted.savedSchemeIds.includes(schemeId);

  const saveProfile = (nextProfile: CitizenProfile) => {
    const completedProfile: CitizenProfile = { ...nextProfile, isCompleted: true };
    setPersisted((prev) => ({
      ...prev,
      profile: completedProfile,
    }));

    const matchedIds = SCHEMES.filter(
      (s) => evaluateSchemeForProfile(s, completedProfile).status === 'likely-eligible'
    ).map((s) => s.id);

    void syncProfileToSupabase(sessionIdRef.current, completedProfile, matchedIds).then(
      (result) => {
        if (result.synced) {
          showToast('Profile saved & stored in Supabase — Benefit Matches updated');
        } else {
          showToast('Profile saved locally — Benefit Matches updated');
        }
      }
    );
  };

  const loadSyntheticDemoProfile = () => {
    setPersisted((prev) => ({
      ...prev,
      profile: SYNTHETIC_DEMO_PROFILE,
    }));
    showToast('Loaded synthetic demo household profile (illustrative)');
  };

  const clearProfile = () => {
    setPersisted((prev) => ({
      ...prev,
      profile: EMPTY_PROFILE,
    }));
    showToast('Household profile cleared');
  };

  const resetAllLocalData = () => {
    setPersisted(DEFAULT_PERSISTED);
    setFilters(DEFAULT_FILTERS);
    showToast('Workspace reset to default local state');
  };

  const toggleDocumentChecked = (documentName: string) => {
    const nextValue = !persisted.checkedDocuments[documentName];
    setPersisted((prev) => ({
      ...prev,
      checkedDocuments: {
        ...prev.checkedDocuments,
        [documentName]: nextValue,
      },
    }));
    void syncDocumentToSupabase(sessionIdRef.current, documentName, nextValue);
  };

  const startOrUpdateApplication = (
    schemeId: string,
    stage: ApplicationStage,
    note?: string
  ) => {
    const todayLabel = new Date().toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    });
    const finalNote = note ?? 'Verify required documents before visiting the official portal.';

    setPersisted((prev) => {
      const existing = prev.applications.find((a) => a.schemeId === schemeId);
      const nextApps = existing
        ? prev.applications.map((a) =>
            a.schemeId === schemeId
              ? { ...a, stage, updatedAt: todayLabel, note: note ?? a.note }
              : a
          )
        : [
            ...prev.applications,
            {
              schemeId,
              stage,
              updatedAt: todayLabel,
              note: finalNote,
            },
          ];
      const nextSaved = prev.savedSchemeIds.includes(schemeId)
        ? prev.savedSchemeIds
        : [...prev.savedSchemeIds, schemeId];
      return {
        ...prev,
        savedSchemeIds: nextSaved,
        applications: nextApps,
      };
    });

    showToast(`Application status updated: ${stage}`);
    void syncBookmarkToSupabase(sessionIdRef.current, {
      schemeId,
      isSaved: true,
      applicationStage: stage,
      note: finalNote,
    });
  };

  const removeApplication = (schemeId: string) => {
    const stillSaved = persisted.savedSchemeIds.includes(schemeId);
    setPersisted((prev) => ({
      ...prev,
      applications: prev.applications.filter((a) => a.schemeId !== schemeId),
    }));
    showToast('Removed scheme from applications in progress');
    void syncBookmarkToSupabase(sessionIdRef.current, {
      schemeId,
      isSaved: stillSaved,
      applicationStage: null,
      note: '',
    });
  };

  const addCustomFamilyMember = (member: Omit<FamilyMember, 'id' | 'isSynthetic'>) => {
    const newMember: FamilyMember = {
      ...member,
      id: `custom-${Date.now()}`,
      isSynthetic: false,
    };
    setPersisted((prev) => ({
      ...prev,
      customFamilyMembers: [...prev.customFamilyMembers, newMember],
    }));

    void syncFamilyMemberToSupabase(sessionIdRef.current, newMember).then((res) => {
      showToast(
        res.synced
          ? `Added ${member.name} & synced to Supabase`
          : `Added ${member.name} to your household`
      );
    });
  };

  const removeCustomFamilyMember = (memberId: string) => {
    setPersisted((prev) => ({
      ...prev,
      customFamilyMembers: prev.customFamilyMembers.filter((m) => m.id !== memberId),
    }));
    showToast('Removed family member');
    void deleteFamilyMemberFromSupabase(sessionIdRef.current, memberId);
  };

  const value = useMemo<SchemeContextValue>(
    () => ({
      appStage,
      authMode,
      authUser,
      authToken,
      enterAuth,
      returnToLanding,
      completeAuth,
      signOut,
      activeView,
      selectedSchemeId,
      filters,
      language: persisted.language,
      profile: persisted.profile,
      savedSchemeIds: persisted.savedSchemeIds,
      exploredSchemeIds: persisted.exploredSchemeIds,
      checkedDocuments: persisted.checkedDocuments,
      applications: persisted.applications,
      customFamilyMembers: persisted.customFamilyMembers,
      toastMessage,
      dbStatus,
      refreshDbStatus,
      navigateTo,
      openCategoryInExplorer,
      openSchemeDetails,
      searchAndExplore,
      updateFilters,
      resetFilters,
      toggleLanguage,
      setLanguage,
      toggleSaveScheme,
      isSchemeSaved,
      saveProfile,
      loadSyntheticDemoProfile,
      clearProfile,
      resetAllLocalData,
      toggleDocumentChecked,
      startOrUpdateApplication,
      removeApplication,
      addCustomFamilyMember,
      removeCustomFamilyMember,
      showToast,
    }),
    [appStage, authMode, authUser, authToken, activeView, selectedSchemeId, filters, persisted, toastMessage, dbStatus]
  );

  return <SchemeContext.Provider value={value}>{children}</SchemeContext.Provider>;
}

export function useSchemes(): SchemeContextValue {
  const ctx = useContext(SchemeContext);
  if (!ctx) {
    throw new Error('useSchemes must be used within SchemeProvider');
  }
  return ctx;
}
