import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session } from '@supabase/supabase-js';
import type { User, HealthProfile, DailyLog, MealPlan, MealEntry, DieticianNote, AssignedMealPlan, AuthState } from '../types/index';
import { supabase } from '../lib/supabaseClient';
import { db } from '../lib/database';

const hasPermission = (userRole: string, requiredRole: string[]): boolean => {
  const roleHierarchy: Record<string, number> = { admin: 4, nutritionist: 3, dietician: 2, patient: 1 };
  return requiredRole.some(role => (roleHierarchy[userRole] || 0) >= (roleHierarchy[role] || 0));
};

const mapSupabaseUser = (user: Session['user'] | null): User | null => {
  if (!user) return null;
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const rawRole = metadata?.role as string | undefined;
  const role = rawRole && ['patient', 'dietician', 'nutritionist', 'admin'].includes(rawRole)
    ? (rawRole as User['role'])
    : 'patient';

  return {
    id: user.id,
    name: (metadata?.name as string) || user.email?.split('@')[0] || 'Anonymous',
    email: user.email || '',
    role,
    avatar: metadata?.avatar as string | undefined,
    phone: metadata?.phone as string | undefined,
    address: metadata?.address as string | undefined,
    createdAt: user.created_at ? new Date(user.created_at).toISOString() : undefined,
    lastLogin: new Date().toISOString(),
  };
};

const createAuthState = (session: Session | null): AuthState => ({
  token: session?.access_token ?? null,
  refreshToken: session?.refresh_token ?? null,
  expiresAt: session?.expires_at ? session.expires_at * 1000 : null,
});

// Fetch authoritative role + name from the profiles table via admin API.
// This corrects stale JWT metadata (e.g. after admin changes a user's role).
async function syncProfileFromDB(token: string): Promise<{ role: User['role']; name: string } | null> {
  try {
    const res = await fetch('/admin-api/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const validRoles = ['patient', 'dietician', 'nutritionist', 'admin'] as const;
    if (!data?.role || !validRoles.includes(data.role)) return null;
    return { role: data.role as User['role'], name: data.name || '' };
  } catch {
    return null;
  }
}

interface AppState {
  currentUser: User | null;
  auth: AuthState;
  authLoading: boolean;

  initializeAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>, password: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  completeOAuthRegistration: (profileData: { name: string; role: User['role']; phone: string; address?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshAuth: () => Promise<boolean>;
  hasRole: (requiredRoles: string[]) => boolean;

  saveProfile: (profile: HealthProfile) => Promise<boolean>;
  getProfile: (userId: string) => Promise<HealthProfile | null>;

  addMealEntry: (userId: string, entry: MealEntry) => Promise<boolean>;
  getTodayLog: (userId: string) => Promise<DailyLog | null>;
  updateHealthMetrics: (userId: string, data: Partial<DailyLog>) => Promise<boolean>;
  getLogs: (userId: string) => Promise<DailyLog[]>;

  saveMealPlan: (userId: string, plan: Omit<MealPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  getMealPlans: (userId: string) => Promise<MealPlan[]>;

  addNote: (note: Omit<DieticianNote, 'id' | 'createdAt'>) => Promise<boolean>;
  getNotesForPatient: (patientId: string) => Promise<DieticianNote[]>;
  deleteNote: (noteId: string) => Promise<boolean>;
  updateNote: (noteId: string, updates: Partial<DieticianNote>) => Promise<boolean>;
  getNotesForCurrentPatient: () => Promise<DieticianNote[]>;

  assignMealPlan: (assignment: Omit<AssignedMealPlan, 'id' | 'assignedAt'>) => Promise<boolean>;
  getAssignedPlansForPatient: (patientId: string) => Promise<AssignedMealPlan[]>;
  getAssignedPlansByProfessional: (professionalId: string) => Promise<AssignedMealPlan[]>;

  getAllPatients: () => Promise<{ user: User; profile: HealthProfile | null; lastLog: DailyLog | null }[]>;
  getAllProfessionals: () => Promise<User[]>;
  getAllAdmins: () => Promise<User[]>;
  updateUser: (userId: string, data: Partial<User>) => Promise<boolean>;
  updateUserPassword: (userId: string, newPassword: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      authLoading: true,
      auth: { token: null, refreshToken: null, expiresAt: null },

      initializeAuth: async () => {
        set({ authLoading: true });

        if (typeof window !== 'undefined') {
          const hash = window.location.hash;
          if (hash.includes('access_token') || hash.includes('refresh_token') || window.location.search.includes('code=')) {
            const authWithUrl = supabase.auth as unknown as {
              getSessionFromUrl?: () => Promise<{ data: { session: Session | null } | null; error: { message: string } | null }>;
            };
            const { data, error } = authWithUrl.getSessionFromUrl
              ? await authWithUrl.getSessionFromUrl()
              : { data: null, error: null };
            if (error) console.error('Supabase OAuth redirect session error:', error.message);
            if (data?.session) {
              if (window.location.pathname === '/') {
                window.location.replace('/register');
                return;
              }
              if (window.location.pathname === '/register') {
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
              }
            }
          }
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) console.error('Supabase session restore failed:', error.message);

        let user = mapSupabaseUser(data.session?.user ?? null);

        // Sync authoritative role + name from profiles table (overrides stale JWT metadata)
        if (user && data.session?.access_token) {
          const dbProfile = await syncProfileFromDB(data.session.access_token);
          if (dbProfile) user = { ...user, role: dbProfile.role, name: dbProfile.name || user.name };
        }

        set({ currentUser: user, auth: createAuthState(data.session ?? null), authLoading: false });

        supabase.auth.onAuthStateChange(async (_event, session) => {
          let sessionUser = mapSupabaseUser(session?.user ?? null);
          if (sessionUser && session?.access_token) {
            const dbProfile = await syncProfileFromDB(session.access_token);
            if (dbProfile) sessionUser = { ...sessionUser, role: dbProfile.role, name: dbProfile.name || sessionUser.name };
          }
          set({ currentUser: sessionUser, auth: createAuthState(session ?? null), authLoading: false });
        });
      },

      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };

        const session = data.session;
        if (!session) {
          return { success: false, error: 'Unable to sign in. Please verify your email or try again.' };
        }

        let user = mapSupabaseUser(session.user);

        // Sync authoritative role from profiles table
        if (user && session.access_token) {
          const dbProfile = await syncProfileFromDB(session.access_token);
          if (dbProfile) user = { ...user, role: dbProfile.role, name: dbProfile.name || user.name };
        }

        set({ currentUser: user, auth: createAuthState(session) });
        return { success: true };
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ currentUser: null, auth: { token: null, refreshToken: null, expiresAt: null } });
      },

      register: async (userData, password) => {
        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password,
          options: {
            data: { role: userData.role, name: userData.name, phone: userData.phone, address: userData.address },
          },
        });

        if (error) {
          const errText = error.message.toLowerCase();
          const errorMessage = errText.includes('already registered')
            ? errText.includes('phone') || errText.includes('number')
              ? 'The phone number is already registered. Please use another number or sign in with Google.'
              : 'The email is already registered. Please try another email or sign in with Google.'
            : error.message;
          return { success: false, error: errorMessage };
        }
        if (!data.session) {
          return { success: true, message: 'Registration successful. Please verify your email before signing in.' };
        }

        let user = mapSupabaseUser(data.session.user);
        if (user && data.session.access_token) {
          const dbProfile = await syncProfileFromDB(data.session.access_token);
          if (dbProfile) user = { ...user, role: dbProfile.role, name: dbProfile.name || user.name };
        }

        set({ currentUser: user, auth: createAuthState(data.session) });
        return { success: true };
      },

      completeOAuthRegistration: async (profileData) => {
        const { data, error } = await supabase.auth.updateUser({
          data: { name: profileData.name, role: profileData.role, phone: profileData.phone, address: profileData.address },
        });

        if (error) {
          const errText = error.message.toLowerCase();
          const errorMessage = errText.includes('already registered')
            ? errText.includes('phone') || errText.includes('number')
              ? 'The phone number is already registered. Please use another number or sign in with Google.'
              : 'The email is already registered. Please try another email or sign in with Google.'
            : error.message;
          return { success: false, error: errorMessage };
        }

        if (data.user) {
          let user = mapSupabaseUser(data.user);
          if (user) {
            const session = (await supabase.auth.getSession()).data.session;
            if (session?.access_token) {
              const dbProfile = await syncProfileFromDB(session.access_token);
              if (dbProfile) user = { ...user, role: dbProfile.role, name: dbProfile.name || user.name };
            }
          }
          set({ currentUser: user });
          return { success: true };
        }

        return { success: false, error: 'Unable to update account details.' };
      },

      refreshAuth: async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) return false;
        set({ auth: createAuthState(data.session) });
        return true;
      },

      hasRole: (requiredRoles) => {
        const { currentUser } = get();
        if (!currentUser) return false;
        return hasPermission(currentUser.role, requiredRoles);
      },

      saveProfile: async (profile) => db.saveProfile(profile),
      getProfile: async (userId) => db.getProfile(userId),
      addMealEntry: async (userId, entry) => db.addMealEntry(userId, entry),
      getTodayLog: async (userId) => db.getTodayLog(userId),
      updateHealthMetrics: async (userId, data) => db.updateHealthMetrics(userId, data),
      getLogs: async (userId) => db.getLogs(userId),
      saveMealPlan: async (userId, plan) => db.saveMealPlan(userId, plan),
      getMealPlans: async (userId) => db.getMealPlans(userId),
      addNote: async (note) => db.addNote(note),
      getNotesForPatient: async (patientId) => db.getNotesForPatient(patientId),
      deleteNote: async (noteId) => db.deleteNote(noteId),
      updateNote: async (noteId, updates) => db.updateNote(noteId, updates),

      getNotesForCurrentPatient: async () => {
        const user = get().currentUser;
        if (!user) return [];
        return db.getNotesForPatient(user.id);
      },

      assignMealPlan: async (assignment) => db.assignMealPlan(assignment),
      getAssignedPlansForPatient: async (patientId) => db.getAssignedPlansForPatient(patientId),
      getAssignedPlansByProfessional: async (professionalId) => db.getAssignedPlansByProfessional(professionalId),
      getAllPatients: async () => db.getAllPatients(),
      getAllProfessionals: async () => db.getAllProfessionals(),
      getAllAdmins: async () => db.getAllAdmins(),
      updateUser: async (userId, data) => db.updateUser(userId, data),

      updateUserPassword: async (_userId, _newPassword) => {
        void _userId; void _newPassword;
        console.warn('Password updates must be done through Supabase Auth admin API');
        return false;
      },

      deleteUser: async (userId) => db.deleteUser(userId),
    }),
    {
      name: 'healthyplate-auth',
      partialize: (state) => ({ currentUser: state.currentUser, auth: state.auth }),
    }
  )
);
