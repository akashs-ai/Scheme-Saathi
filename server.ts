import crypto from 'crypto';
import 'dotenv/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const ALLOWED_STAGES = new Set([
  'Preparing Documents',
  'Ready to Apply',
  'Submitted on Official Portal',
  'Under Verification',
]);

const ALLOWED_ROLES = new Set([
  'student',
  'woman',
  'girl-student',
  'farmer',
  'senior-citizen',
  'senior-70-plus',
  'widow',
  'worker',
  'construction-worker',
  'youth-jobseeker',
  'entrepreneur',
  'disability',
  'household-head',
]);

const SESSION_ID_PATTERN = /^[a-zA-Z0-9_-]{16,80}$/;
const SCHEME_ID_PATTERN = /^[a-z0-9-]{2,64}$/;

function sanitizeText(val: unknown, maxLength = 120): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLength);
}

function isValidSessionId(val: unknown): val is string {
  return typeof val === 'string' && SESSION_ID_PATTERN.test(val);
}

function getSupabaseClient(): { client: SupabaseClient | null; configured: boolean } {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const key = (
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim();

  if (!url || !key) {
    return { client: null, configured: false };
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      return { client: null, configured: false };
    }
  } catch {
    return { client: null, configured: false };
  }

  const client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (...args) => globalThis.fetch(...args),
    },
  });

  return { client, configured: true };
}

interface AuthUserRecord {
  id: string;
  fullName: string;
  email: string;
  district: string;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
}

interface AuthPublicUser {
  id: string;
  fullName: string;
  email: string;
  district: string;
  isDemo?: boolean;
}

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const authUsersByEmail = new Map<string, AuthUserRecord>();
const activeSessions = new Map<string, { user: AuthPublicUser; expiresAt: number }>();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hashPassword(password: string, saltHex?: string): { salt: string; hash: string } {
  const salt = saltHex || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash: derived };
}

function verifyPassword(password: string, salt: string, expectedHashHex: string): boolean {
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHashHex, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

function issueSessionToken(user: AuthPublicUser): string {
  const nonce = crypto.randomBytes(24).toString('hex');
  const payload = `${user.id}.${nonce}.${Date.now()}`;
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  const token = `${payload}.${sig}`;
  activeSessions.set(token, {
    user,
    expiresAt: Date.now() + 1000 * 60 * 60 * 12,
  });
  return token;
}

function getBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token || null;
}

function getAuthenticatedSession(req: Request): AuthPublicUser | null {
  const token = getBearerToken(req);
  if (!token) return null;
  const session = activeSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }
  return session.user;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '256kb' }));

  // 0. Citizen Authentication Routes (scrypt-hashed, Bearer token in memory)
  app.post('/api/auth/signup', (req: Request, res: Response) => {
    const fullName = sanitizeText(req.body?.fullName, 80);
    const emailRaw = sanitizeText(req.body?.email, 120).toLowerCase();
    const district = sanitizeText(req.body?.district, 60) || 'Kolkata';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (fullName.length < 2) {
      res.status(400).json({ error: 'Please enter your full name (at least 2 characters).' });
      return;
    }
    if (!EMAIL_PATTERN.test(emailRaw)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (password.length < 8 || password.length > 128) {
      res.status(400).json({ error: 'Password must be between 8 and 128 characters.' });
      return;
    }
    if (authUsersByEmail.has(emailRaw)) {
      res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
      return;
    }

    const { salt, hash } = hashPassword(password);
    const record: AuthUserRecord = {
      id: `usr_${crypto.randomUUID()}`,
      fullName,
      email: emailRaw,
      district,
      passwordSalt: salt,
      passwordHash: hash,
      createdAt: new Date().toISOString(),
    };
    authUsersByEmail.set(emailRaw, record);

    const publicUser: AuthPublicUser = {
      id: record.id,
      fullName: record.fullName,
      email: record.email,
      district: record.district,
    };
    const token = issueSessionToken(publicUser);
    res.status(201).json({ token, user: publicUser });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const emailRaw = sanitizeText(req.body?.email, 120).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!EMAIL_PATTERN.test(emailRaw) || !password) {
      res.status(400).json({ error: 'Please enter both email and password.' });
      return;
    }

    const record = authUsersByEmail.get(emailRaw);
    if (!record || !verifyPassword(password, record.passwordSalt, record.passwordHash)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const publicUser: AuthPublicUser = {
      id: record.id,
      fullName: record.fullName,
      email: record.email,
      district: record.district,
    };
    const token = issueSessionToken(publicUser);
    res.json({ token, user: publicUser });
  });

  app.post('/api/auth/demo', (_req: Request, res: Response) => {
    const publicUser: AuthPublicUser = {
      id: `demo_${crypto.randomUUID()}`,
      fullName: 'Ananya Chatterjee',
      email: 'citizen.demo@schemesaathi.wb.in',
      district: 'South 24 Parganas',
      isDemo: true,
    };
    const token = issueSessionToken(publicUser);
    res.json({ token, user: publicUser });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const user = getAuthenticatedSession(req);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    res.json({ user });
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const token = getBearerToken(req);
    if (token) {
      activeSessions.delete(token);
    }
    res.json({ ok: true });
  });

  // 1. Database Health & Configuration Check
  app.get('/api/db/health', async (_req: Request, res: Response) => {
    const { client, configured } = getSupabaseClient();
    if (!configured || !client) {
      res.json({
        configured: false,
        connected: false,
        tablesReady: false,
        message:
          'Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in Secrets to enable cloud database storage.',
      });
      return;
    }

    try {
      const { error } = await client
        .from('citizen_profiles')
        .select('id', { count: 'exact', head: true });

      if (error) {
        const missingTable =
          error.code === '42P01' ||
          error.code === 'PGRST205' ||
          error.message.toLowerCase().includes('citizen_profiles');
        res.json({
          configured: true,
          connected: true,
          tablesReady: false,
          message: missingTable
            ? 'Connected to Supabase. Run supabase/schema.sql once in your Supabase SQL Editor to create the tables.'
            : 'Connected to Supabase, but table verification returned an access error. Confirm RLS policies from supabase/schema.sql.',
        });
        return;
      }

      res.json({
        configured: true,
        connected: true,
        tablesReady: true,
        message: 'Supabase database connected and ready.',
      });
    } catch {
      res.json({
        configured: true,
        connected: false,
        tablesReady: false,
        message: 'Unable to reach Supabase right now. Changes remain saved locally.',
      });
    }
  });

  // 2. Load Saved Remote Workspace by Session ID
  app.get('/api/db/workspace', async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId;
    if (!isValidSessionId(sessionId)) {
      res.status(400).json({ error: 'Invalid sessionId' });
      return;
    }

    const { client } = getSupabaseClient();
    if (!client) {
      res.status(503).json({ error: 'Supabase not configured' });
      return;
    }

    try {
      const [profileRes, bookmarksRes, docsRes, familyRes] = await Promise.all([
        client
          .from('citizen_profiles')
          .select('*')
          .eq('client_session_id', sessionId)
          .maybeSingle(),
        client
          .from('scheme_bookmarks')
          .select('scheme_id, is_saved, application_stage, note, updated_at')
          .eq('client_session_id', sessionId),
        client
          .from('document_checklist_items')
          .select('document_name, is_prepared')
          .eq('client_session_id', sessionId),
        client
          .from('family_members')
          .select('local_member_id, member_name, relation, age_description, roles')
          .eq('client_session_id', sessionId),
      ]);

      if (profileRes.error || bookmarksRes.error || docsRes.error || familyRes.error) {
        res.status(502).json({ error: 'Tables unavailable or query failed' });
        return;
      }

      const row = profileRes.data;
      const mappedProfile = row
        ? {
            isCompleted: true,
            isSyntheticDemo: false,
            ageRange: row.age_range ?? '',
            state: row.state ?? 'West Bengal',
            district: row.district ?? '',
            residenceType: row.residence_type ?? '',
            incomeRange: row.income_range ?? '',
            familySize: Number(row.family_size) || 4,
            employmentStatus: row.employment_status ?? '',
            isStudent: Boolean(row.is_student),
            studentLevel: row.student_level ?? '',
            studentMerit60Plus: Boolean(row.student_merit_60_plus),
            wantsSkillOrApprenticeship: Boolean(row.wants_skill_or_apprenticeship),
            wantsBusinessLoan: Boolean(row.wants_business_loan),
            hasFarmerInFamily: Boolean(row.has_farmer_in_family),
            farmerLandType: row.farmer_land_type ?? '',
            hasSeniorCitizen: Boolean(row.has_senior_citizen),
            hasSenior70Plus: Boolean(row.has_senior_70_plus),
            hasWidowInFamily: Boolean(row.has_widow_in_family),
            hasDisabilityInFamily: Boolean(row.has_disability_in_family),
            hasWomenInHousehold: Boolean(row.has_women_in_household),
            womenAgeBracket: row.women_age_bracket ?? '',
            needsHousingSupport: Boolean(row.needs_housing_support),
            needsRationOrFoodSupport: Boolean(row.needs_ration_or_food_support),
          }
        : null;

      const savedSchemeIds = (bookmarksRes.data ?? [])
        .filter((b) => b.is_saved)
        .map((b) => b.scheme_id);

      const applications = (bookmarksRes.data ?? [])
        .filter((b) => b.application_stage && ALLOWED_STAGES.has(b.application_stage))
        .map((b) => ({
          schemeId: b.scheme_id,
          stage: b.application_stage,
          updatedAt: new Date(b.updated_at || Date.now()).toLocaleDateString('en-IN', {
            month: 'short',
            year: 'numeric',
          }),
          note: b.note || '',
        }));

      const checkedDocuments: Record<string, boolean> = {};
      for (const d of docsRes.data ?? []) {
        checkedDocuments[d.document_name] = Boolean(d.is_prepared);
      }

      const customFamilyMembers = (familyRes.data ?? []).map((m) => ({
        id: m.local_member_id,
        name: m.member_name,
        relation: m.relation || 'Household Member',
        ageDescription: m.age_description || '',
        summary: `Synced household member mapped across ${(m.roles ?? []).length} role(s).`,
        roles: Array.isArray(m.roles) ? m.roles : [],
        isSynthetic: false,
      }));

      res.json({
        profile: mappedProfile,
        savedSchemeIds,
        applications,
        checkedDocuments,
        customFamilyMembers,
      });
    } catch {
      res.status(500).json({ error: 'Workspace retrieval failed' });
    }
  });

  // 3. Upsert Citizen Household Profile
  app.post('/api/db/profile', async (req: Request, res: Response) => {
    const { sessionId, profile, matchedSchemeIds } = req.body ?? {};
    if (!isValidSessionId(sessionId) || !profile || typeof profile !== 'object') {
      res.status(400).json({ synced: false, error: 'Invalid profile payload' });
      return;
    }

    const { client } = getSupabaseClient();
    if (!client) {
      res.json({ synced: false, error: 'Supabase secrets not configured' });
      return;
    }

    const familySizeRaw = Number(profile.familySize);
    const familySize = Number.isFinite(familySizeRaw)
      ? Math.min(20, Math.max(1, Math.round(familySizeRaw)))
      : 4;

    const cleanMatches = Array.isArray(matchedSchemeIds)
      ? matchedSchemeIds
          .filter((id: unknown): id is string => typeof id === 'string' && SCHEME_ID_PATTERN.test(id))
          .slice(0, 50)
      : [];

    const record = {
      client_session_id: sessionId,
      age_range: sanitizeText(profile.ageRange, 30),
      state: sanitizeText(profile.state, 40) || 'West Bengal',
      district: sanitizeText(profile.district, 60),
      residence_type: ['Rural', 'Urban', ''].includes(profile.residenceType)
        ? profile.residenceType
        : '',
      income_range: ['below-1l', '1l-2.5l', '2.5l-5l', 'above-5l', ''].includes(
        profile.incomeRange
      )
        ? profile.incomeRange
        : '',
      family_size: familySize,
      employment_status: sanitizeText(profile.employmentStatus, 60),
      is_student: Boolean(profile.isStudent),
      student_level: sanitizeText(profile.studentLevel, 60),
      student_merit_60_plus: Boolean(profile.studentMerit60Plus),
      wants_skill_or_apprenticeship: Boolean(profile.wantsSkillOrApprenticeship),
      wants_business_loan: Boolean(profile.wantsBusinessLoan),
      has_farmer_in_family: Boolean(profile.hasFarmerInFamily),
      farmer_land_type: sanitizeText(profile.farmerLandType, 80),
      has_senior_citizen: Boolean(profile.hasSeniorCitizen),
      has_senior_70_plus: Boolean(profile.hasSenior70Plus),
      has_widow_in_family: Boolean(profile.hasWidowInFamily),
      has_disability_in_family: Boolean(profile.hasDisabilityInFamily),
      has_women_in_household: Boolean(profile.hasWomenInHousehold),
      women_age_bracket: sanitizeText(profile.womenAgeBracket, 60),
      needs_housing_support: Boolean(profile.needsHousingSupport),
      needs_ration_or_food_support: Boolean(profile.needsRationOrFoodSupport),
      matched_scheme_ids: cleanMatches,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await client
        .from('citizen_profiles')
        .upsert(record, { onConflict: 'client_session_id' });

      if (error) {
        res.json({ synced: false, error: 'Database write failed — confirm schema.sql is applied' });
        return;
      }

      res.json({ synced: true });
    } catch {
      res.json({ synced: false, error: 'Network error while syncing profile' });
    }
  });

  // 4. Upsert Saved Scheme / Application Stage
  app.post('/api/db/bookmark', async (req: Request, res: Response) => {
    const { sessionId, schemeId, isSaved, applicationStage, note } = req.body ?? {};
    if (
      !isValidSessionId(sessionId) ||
      typeof schemeId !== 'string' ||
      !SCHEME_ID_PATTERN.test(schemeId)
    ) {
      res.status(400).json({ synced: false, error: 'Invalid bookmark payload' });
      return;
    }

    const { client } = getSupabaseClient();
    if (!client) {
      res.json({ synced: false });
      return;
    }

    const stage =
      typeof applicationStage === 'string' && ALLOWED_STAGES.has(applicationStage)
        ? applicationStage
        : null;

    try {
      const { error } = await client.from('scheme_bookmarks').upsert(
        {
          client_session_id: sessionId,
          scheme_id: schemeId,
          is_saved: Boolean(isSaved),
          application_stage: stage,
          note: sanitizeText(note, 280),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'client_session_id,scheme_id' }
      );

      res.json({ synced: !error });
    } catch {
      res.json({ synced: false });
    }
  });

  // 5. Upsert Document Checklist Status
  app.post('/api/db/document', async (req: Request, res: Response) => {
    const { sessionId, documentName, isPrepared } = req.body ?? {};
    const cleanDoc = sanitizeText(documentName, 200);
    if (!isValidSessionId(sessionId) || !cleanDoc) {
      res.status(400).json({ synced: false, error: 'Invalid document payload' });
      return;
    }

    const { client } = getSupabaseClient();
    if (!client) {
      res.json({ synced: false });
      return;
    }

    try {
      const { error } = await client.from('document_checklist_items').upsert(
        {
          client_session_id: sessionId,
          document_name: cleanDoc,
          is_prepared: Boolean(isPrepared),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'client_session_id,document_name' }
      );

      res.json({ synced: !error });
    } catch {
      res.json({ synced: false });
    }
  });

  // 6. Add / Upsert Custom Family Member
  app.post('/api/db/family-member', async (req: Request, res: Response) => {
    const { sessionId, member } = req.body ?? {};
    if (!isValidSessionId(sessionId) || !member || typeof member !== 'object') {
      res.status(400).json({ synced: false, error: 'Invalid family member payload' });
      return;
    }

    const { client } = getSupabaseClient();
    if (!client) {
      res.json({ synced: false });
      return;
    }

    const cleanRoles = Array.isArray(member.roles)
      ? member.roles.filter((r: unknown): r is string => typeof r === 'string' && ALLOWED_ROLES.has(r))
      : [];

    const localId = sanitizeText(member.id, 64);
    const memberName = sanitizeText(member.name, 80);
    if (!localId || !memberName || cleanRoles.length === 0) {
      res.status(400).json({ synced: false, error: 'Missing required member fields' });
      return;
    }

    try {
      const { error } = await client.from('family_members').upsert(
        {
          client_session_id: sessionId,
          local_member_id: localId,
          member_name: memberName,
          relation: sanitizeText(member.relation, 80) || 'Household Member',
          age_description: sanitizeText(member.ageDescription, 60),
          roles: cleanRoles,
        },
        { onConflict: 'client_session_id,local_member_id' }
      );

      res.json({ synced: !error });
    } catch {
      res.json({ synced: false });
    }
  });

  // 7. Delete Custom Family Member
  app.delete('/api/db/family-member', async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId;
    const localMemberId = sanitizeText(req.query.localMemberId, 64);
    if (!isValidSessionId(sessionId) || !localMemberId) {
      res.status(400).json({ synced: false, error: 'Invalid delete parameters' });
      return;
    }

    const { client } = getSupabaseClient();
    if (!client) {
      res.json({ synced: false });
      return;
    }

    try {
      const { error } = await client
        .from('family_members')
        .delete()
        .eq('client_session_id', sessionId)
        .eq('local_member_id', localMemberId);

      res.json({ synced: !error });
    } catch {
      res.json({ synced: false });
    }
  });

  // Mount Vite Dev Middleware in Development or Static Dist in Production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SchemeSaathi server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
