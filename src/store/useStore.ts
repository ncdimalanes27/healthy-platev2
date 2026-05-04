import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session } from '@supabase/supabase-js';
import type { User, HealthProfile, DailyLog, MealPlan, MealEntry, DieticianNote, AssignedMealPlan, AuthState } from '../types/index';
import { supabase } from '../lib/supabaseClient';
import { db } from '../lib/database';

// Role-based access control helper
const hasPermission = (userRole: string, requiredRole: string[]): boolean => {
  const roleHierarchy: Record<string, number> = {
    admin: 4,
    nutritionist: 3,
    dietician: 2,
    patient: 1,
  };
  return requiredRole.some(role => (roleHierarchy[userRole] || 0) >= (roleHierarchy[role] || 0));
};

const mapSupabaseUser = (user: Session['user'] | null): User | null => {
  if (!user) return null;
  const metadata = user.user_metadata as Record<string, unknown> | undefined;

  return {
    id: user.id,
    name: (metadata?.name as string) || user.email?.split('@')[0] || 'Anonymous',
    email: user.email || '',
    role: (metadata?.role as User['role']) || 'patient',
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

interface AppState {
  currentUser: User | null;
  auth: AuthState;
  authLoading: boolean;

  // Auth methods
  initializeAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>, password: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  completeOAuthRegistration: (profileData: { name: string; role: User['role']; phone: string; address?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshAuth: () => Promise<boolean>;
  hasRole: (requiredRoles: string[]) => boolean;

  // Data methods (now using Supabase)
  saveProfile: (profile: HealthProfile) => Promise<boolean>;
  getProfile: (userId: string) => Promise<HealthProfile | null>;

  addMealEntry: (userId: string, entry: MealEntry) => Promise<boolean>;
  getTodayLog: (userId: string) => Promise<DailyLog | null>;
  updateHealthMetrics: (userId: string, data: Partial<DailyLog>) => Promise<boolean>;
  getLogs: (userId: string) => Promise<DailyLog[]>;

  saveMealPlan: (userId: string, plan: Omit<MealPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  getMealPlans: (userId: string) => Promise<MealPlan[]>;

  // Dietician/Nutritionist features
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

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Supabase session restore failed:', error.message);
        }

        set({
          currentUser: mapSupabaseUser(data.session?.user ?? null),
          auth: createAuthState(data.session ?? null),
          authLoading: false,
        });

        supabase.auth.onAuthStateChange((_event, session) => {
          set({
            currentUser: mapSupabaseUser(session?.user ?? null),
            auth: createAuthState(session ?? null),
            authLoading: false,
          });
        });
      },

      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };

        const session = data.session;
        if (!session) {
          return { success: false, error: 'Unable to sign in. Please verify your email or try again.' };
        }

        set({
          currentUser: mapSupabaseUser(session.user),
          auth: createAuthState(session),
        });

        return { success: true };
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({
          currentUser: null,
          auth: { token: null, refreshToken: null, expiresAt: null },
        });
      },

      register: async (userData, password) => {
        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password,
          options: {
            data: {
              role: userData.role,
              name: userData.name,
              phone: userData.phone,
              address: userData.address,
            },
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
          return {
            success: true,
            message: 'Registration successful. Please verify your email before signing in.',
          };
        }

        set({
          currentUser: mapSupabaseUser(data.session.user),
          auth: createAuthState(data.session),
        });
        return { success: true };
      },

      completeOAuthRegistration: async (profileData) => {
        const { data, error } = await supabase.auth.updateUser({
          data: {
            name: profileData.name,
            role: profileData.role,
            phone: profileData.phone,
            address: profileData.address,
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

        if (data.user) {
          set({
            currentUser: mapSupabaseUser(data.user),
          });
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

  // Data methods (using Supabase database)
  saveProfile: async (profile) => {
    return await db.saveProfile(profile);
  },

  getProfile: async (userId) => {
    return await db.getProfile(userId);
  },

  addMealEntry: async (userId, entry) => {
    return await db.addMealEntry(userId, entry);
  },

  getTodayLog: async (userId) => {
    return await db.getTodayLog(userId);
  },

  updateHealthMetrics: async (userId, data) => {
    return await db.updateHealthMetrics(userId, data);
  },

  getLogs: async (userId) => {
    return await db.getLogs(userId);
  },

  saveMealPlan: async (userId, plan) => {
    return await db.saveMealPlan(userId, plan);
  },

  getMealPlans: async (userId) => {
    return await db.getMealPlans(userId);
  },

  addNote: async (note) => {
    return await db.addNote(note);
  },

  getNotesForPatient: async (patientId) => {
    return await db.getNotesForPatient(patientId);
  },

  deleteNote: async (noteId) => {
    return await db.deleteNote(noteId);
  },

  updateNote: async (noteId, updates) => {
    return await db.updateNote(noteId, updates);
  },

  getNotesForCurrentPatient: async () => {
    const user = get().currentUser;
    if (!user || user.role !== 'patient') return [];
    return await db.getNotesForPatient(user.id);
  },

  assignMealPlan: async (assignment) => {
    return await db.assignMealPlan(assignment);
  },

  getAssignedPlansForPatient: async (patientId) => {
    return await db.getAssignedPlansForPatient(patientId);
  },

  getAssignedPlansByProfessional: async (professionalId) => {
    return await db.getAssignedPlansByProfessional(professionalId);
  },

  getAllPatients: async () => {
    return await db.getAllPatients();
  },

  getAllProfessionals: async () => {
    return await db.getAllProfessionals();
  },

  getAllAdmins: async () => {
    return await db.getAllAdmins();
  },

  updateUser: async (userId, data) => {
    return await db.updateUser(userId, data);
  },

  updateUserPassword: async (_userId, _newPassword) => {
    void _userId;
    void _newPassword;
    // Note: Password updates should be handled through Supabase auth
    // This is a placeholder for admin password reset functionality
    console.warn('Password updates should be handled through Supabase auth admin API');
    return false;
  },

  deleteUser: async (userId) => {
    return await db.deleteUser(userId);
  },
    }),
    {
      name: 'healthyplate-auth',
      partialize: (state) => ({
        currentUser: state.currentUser,
        auth: state.auth,
      }),
    }
  )
);
