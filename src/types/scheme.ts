export type SchemeCategoryId =
  | 'all'
  | 'education'
  | 'women'
  | 'pension'
  | 'widow'
  | 'farmers'
  | 'healthcare'
  | 'housing'
  | 'food'
  | 'employment'
  | 'business'
  | 'workers'
  | 'disability';

export type UiLanguage = 'en' | 'bn';

export type ProviderLevel =
  | 'West Bengal State'
  | 'Central Government'
  | 'Joint State & Central';

export type VerificationStatus =
  | 'Verified Active'
  | 'Transitioning / Verify Guidelines'
  | 'Verification Required';

export type BenefitType =
  | 'Scholarship'
  | 'Monthly Financial Assistance'
  | 'One-Time Financial Grant'
  | 'Pension'
  | 'Farmer Income & Insurance'
  | 'Cashless Health Cover'
  | 'Housing Assistance'
  | 'Food & Ration Security'
  | 'Skill & Employment Support'
  | 'Credit & Business Subsidy'
  | 'Worker Social Security'
  | 'Disability Support & Pension';

export type BeneficiaryGroup =
  | 'Students'
  | 'Women & Girls'
  | 'Senior Citizens'
  | 'Widows'
  | 'Farmers & Agricultural Workers'
  | 'Low-Income Households'
  | 'Unemployed Youth'
  | 'Micro-Entrepreneurs'
  | 'Unorganised & Construction Workers'
  | 'Persons with Disabilities'
  | 'SC / ST / Minority Communities'
  | 'All Resident Households';

export type EligibilityMatchLevel =
  | 'likely-eligible'
  | 'potential-match'
  | 'verification-required'
  | 'does-not-match'
  | 'not-evaluated';

export interface CategoryMeta {
  id: SchemeCategoryId;
  name: string;
  shortName: string;
  bengaliName: string;
  description: string;
  iconName:
    | 'LayoutGrid'
    | 'GraduationCap'
    | 'HeartHandshake'
    | 'Landmark'
    | 'ShieldHeart'
    | 'Sprout'
    | 'Stethoscope'
    | 'Home'
    | 'Wheat'
    | 'Briefcase'
    | 'Store'
    | 'HardHat'
    | 'Accessibility';
}

export interface SchemeMatchRules {
  requiresStudent?: boolean;
  requiresFarmer?: boolean;
  requiresWomanInHousehold?: boolean;
  requiresSeniorCitizen?: boolean;
  requiresWidow?: boolean;
  requiresDisability?: boolean;
  requiresUnemployedOrYouth?: boolean;
  requiresWorkerOrUnorganised?: boolean;
  requiresBusinessInterest?: boolean;
  ruralPreferred?: boolean;
  maxIncomeBracket?: 'below-1l' | '1l-2.5l' | '2.5l-5l' | 'any';
  universalHousehold?: boolean;
  familyRoles: FamilyRoleTag[];
}

export interface SchemeRecord {
  id: string;
  name: string;
  bengaliName: string;
  categoryId: Exclude<SchemeCategoryId, 'all'>;
  secondaryCategories?: Exclude<SchemeCategoryId, 'all'>[];
  providerLevel: ProviderLevel;
  department: string;
  beneficiaryTypes: BeneficiaryGroup[];
  benefitType: BenefitType;
  benefitSummary: string;
  overview: string;
  whoCanBenefit: string[];
  eligibilityConditions: string[];
  benefitDetails: string[];
  requiredDocuments: string[];
  howToApply: string[];
  applicationAvailability: string;
  deadline: string | null;
  deadlineNote?: string;
  officialSourceName: string;
  officialSourceUrl: string;
  lastVerifiedDate: string;
  verificationStatus: VerificationStatus;
  verificationNote?: string;
  matchRules: SchemeMatchRules;
}

export type AgeRange =
  | ''
  | 'Under 18'
  | '18–25'
  | '26–40'
  | '41–59'
  | '60–69'
  | '70+';

export type IncomeRange =
  | ''
  | 'below-1l'
  | '1l-2.5l'
  | '2.5l-5l'
  | 'above-5l';

export type ResidenceType = '' | 'Rural' | 'Urban';

export type EmploymentStatus =
  | ''
  | 'Student'
  | 'Unemployed / Seeking Work'
  | 'Farmer / Agricultural Worker'
  | 'Unorganised / Daily-Wage Worker'
  | 'Construction Worker'
  | 'Self-Employed / Small Business'
  | 'Salaried (Private / Formal)'
  | 'Homemaker'
  | 'Retired / Senior';

export interface CitizenProfile {
  isCompleted: boolean;
  isSyntheticDemo?: boolean;
  profileLabel?: string;
  ageRange: AgeRange;
  state: string;
  district: string;
  residenceType: ResidenceType;
  incomeRange: IncomeRange;
  familySize: number;
  isStudent: boolean;
  studentLevel: '' | 'Class 5–10' | 'Class 11–12' | 'Undergraduate / Diploma' | 'Postgraduate / Professional';
  studentMerit60Plus: boolean;
  employmentStatus: EmploymentStatus;
  wantsSkillOrApprenticeship: boolean;
  wantsBusinessLoan: boolean;
  hasFarmerInFamily: boolean;
  farmerLandType: '' | 'Own Cultivable Land' | 'Sharecropper (Bargadar) / Landless Labourer';
  hasSeniorCitizen: boolean;
  hasSenior70Plus: boolean;
  hasWidowInFamily: boolean;
  hasDisabilityInFamily: boolean;
  hasWomenInHousehold: boolean;
  womenAgeBracket: '' | '13–19 (Unmarried Girl)' | '18+ (Marriage Assistance)' | '25–60 (Adult Woman)' | 'Multiple Age Groups';
  needsHousingSupport: boolean;
  needsRationOrFoodSupport: boolean;
}

export interface EligibilityEvaluation {
  status: EligibilityMatchLevel;
  label: string;
  reasons: string[];
  score: number;
}

export type FamilyRoleTag =
  | 'student'
  | 'woman'
  | 'girl-student'
  | 'farmer'
  | 'senior-citizen'
  | 'senior-70-plus'
  | 'widow'
  | 'worker'
  | 'construction-worker'
  | 'youth-jobseeker'
  | 'entrepreneur'
  | 'disability'
  | 'household-head';

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  ageDescription: string;
  summary: string;
  roles: FamilyRoleTag[];
  isSynthetic: boolean;
}

export interface SyntheticFamilyPreset {
  id: string;
  title: string;
  district: string;
  residenceType: 'Rural' | 'Urban';
  incomeLabel: string;
  incomeRange: Exclude<IncomeRange, ''>;
  description: string;
  isSynthetic: true;
  members: FamilyMember[];
}

export type ApplicationStage =
  | 'Preparing Documents'
  | 'Ready to Apply'
  | 'Submitted on Official Portal'
  | 'Under Verification';

export interface ApplicationTrackerItem {
  schemeId: string;
  stage: ApplicationStage;
  updatedAt: string;
  note: string;
}

export type AppStage = 'landing' | 'auth' | 'app';

export type AppView =
  | 'home'
  | 'dashboard'
  | 'explorer'
  | 'categories'
  | 'details'
  | 'profile'
  | 'family'
  | 'saved'
  | 'documents'
  | 'support'
  | 'settings';

export interface ExplorerFilters {
  categoryId: SchemeCategoryId;
  searchQuery: string;
  beneficiary: BeneficiaryGroup | 'All';
  providerLevel: ProviderLevel | 'All';
  eligibilityFilter:
    | 'All'
    | 'likely-eligible'
    | 'potential-match'
    | 'verification-required'
    | 'does-not-match';
  savedOnly: boolean;
}
