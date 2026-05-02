import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, HealthProfile, DailyLog, MealPlan, MealEntry, DieticianNote, AssignedMealPlan, AuthState } from '../types/index';

// JWT Token generation helper
const generateToken = (user: User): string => {
  const payload = { id: user.id, email: user.email, role: user.role, exp: Date.now() + 24 * 60 * 60 * 1000 };
  return btoa(JSON.stringify(payload));
};

const generateRefreshToken = (): string => {
  return `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

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

interface AppState {
  currentUser: User | null;
  auth: AuthState;
  users: User[];
  passwords: Record<string, string>;
  profiles: Record<string, HealthProfile>;
  logs: Record<string, DailyLog[]>;
  mealPlans: Record<string, MealPlan[]>;
  notes: DieticianNote[];
  assignedPlans: AssignedMealPlan[];

  // Auth methods
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  register: (user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>, password: string) => { success: boolean; error?: string };
  refreshAuth: () => boolean;
  hasRole: (requiredRoles: string[]) => boolean;

  saveProfile: (profile: HealthProfile) => void;
  getProfile: (userId: string) => HealthProfile | null;

  addMealEntry: (userId: string, entry: MealEntry) => void;
  getTodayLog: (userId: string) => DailyLog | null;
  updateHealthMetrics: (userId: string, data: Partial<DailyLog>) => void;
  getLogs: (userId: string) => DailyLog[];

  saveMealPlan: (userId: string, plan: MealPlan) => void;
  getMealPlans: (userId: string) => MealPlan[];

  // Dietician/Nutritionist features
  addNote: (note: Omit<DieticianNote, 'id' | 'createdAt'>) => void;
  getNotesForPatient: (patientId: string) => DieticianNote[];
  deleteNote: (noteId: string) => void;
  updateNote: (noteId: string, updates: Partial<DieticianNote>) => void;
  getNotesForCurrentPatient: () => DieticianNote[];

  assignMealPlan: (assignment: Omit<AssignedMealPlan, 'id' | 'assignedAt'>) => void;
  getAssignedPlansForPatient: (patientId: string) => AssignedMealPlan[];
  getAssignedPlansByProfessional: (professionalId: string) => AssignedMealPlan[];

  getAllPatients: () => { user: User; profile: HealthProfile | null; lastLog: DailyLog | null }[];
  getAllProfessionals: () => User[];
  getAllAdmins: () => User[];
  updateUser: (userId: string, data: Partial<User>) => void;
  updateUserPassword: (userId: string, newPassword: string) => void;
  deleteUser: (userId: string) => void;
}

const today = () => new Date().toISOString().split('T')[0];

const seedUsers: User[] = [
  { id: 'u001', name: 'Maria Santos', email: 'patient@demo.com', role: 'patient', createdAt: '2024-01-15' },
  { id: 'u002', name: 'Dr. Jose Reyes', email: 'dietician@demo.com', role: 'dietician', createdAt: '2024-01-10' },
  { id: 'u003', name: 'Pedro Reyes', email: 'pedro@demo.com', role: 'patient', createdAt: '2024-02-01' },
  { id: 'u004', name: 'Ana Cruz', email: 'ana@demo.com', role: 'patient', createdAt: '2024-02-15' },
  { id: 'u005', name: 'Nutri Pro', email: 'nutritionist@demo.com', role: 'nutritionist', createdAt: '2024-01-05' },
  { id: 'u006', name: 'Admin User', email: 'admin@demo.com', role: 'admin', createdAt: '2024-01-01' },
];

// Demo passwords (in real app, these would be hashed)
const seedPasswords: Record<string, string> = {
  'patient@demo.com': 'patient123',
  'dietician@demo.com': 'dietician123',
  'pedro@demo.com': 'pedro123',
  'ana@demo.com': 'ana123',
  'nutritionist@demo.com': 'nutritionist123',
  'admin@demo.com': 'admin123',
};

const seedProfiles: Record<string, HealthProfile> = {
  u001: { userId: 'u001', age: 35, gender: 'female', height: 158, weight: 68, activityLevel: 'moderate', healthConditions: ['Type 2 Diabetes'], allergies: [], goal: 'lose' },
  u003: { userId: 'u003', age: 42, gender: 'male', height: 170, weight: 88, activityLevel: 'light', healthConditions: ['Hypertension', 'High Cholesterol'], allergies: ['Shellfish'], goal: 'lose' },
  u004: { userId: 'u004', age: 28, gender: 'female', height: 162, weight: 52, activityLevel: 'active', healthConditions: [], allergies: [], goal: 'gain' },
};

const seedNotes: DieticianNote[] = [
  { id: 'n001', dieticianId: 'u002', dieticianName: 'Dr. Jose Reyes', patientId: 'u001', content: 'Patient is responding well to the low-carb meal plan. Recommend continuing with 1500 kcal target and increasing vegetable intake.', category: 'progress', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'n002', dieticianId: 'u002', dieticianName: 'Dr. Jose Reyes', patientId: 'u003', content: 'Blood pressure elevated. Advised to reduce sodium intake and avoid processed foods. Follow-up in 2 weeks.', category: 'warning', createdAt: new Date(Date.now() - 86400000).toISOString() },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      auth: { token: null, refreshToken: null, expiresAt: null },
      users: seedUsers,
      passwords: seedPasswords,
      profiles: seedProfiles,
      logs: {
        u001: [{ date: today(), meals: [], totalCalories: 820, totalProtein: 42, totalCarbs: 95, totalFat: 28, weight: 68, bloodSugar: 110, bloodPressureSystolic: 118, bloodPressureDiastolic: 76 }],
        u003: [{ date: today(), meals: [], totalCalories: 1200, totalProtein: 55, totalCarbs: 140, totalFat: 38, weight: 88, bloodSugar: 95, bloodPressureSystolic: 142, bloodPressureDiastolic: 92 }],
        u004: [{ date: today(), meals: [], totalCalories: 1850, totalProtein: 78, totalCarbs: 210, totalFat: 55, weight: 52, bloodSugar: 88, bloodPressureSystolic: 110, bloodPressureDiastolic: 70 }],
      },
      mealPlans: {},
      notes: seedNotes,
      assignedPlans: [],

      // JWT Authentication
      login: (email, password) => {
        const user = get().users.find((u) => u.email === email);
        if (!user) return { success: false, error: 'No account found with that email.' };
        
        const storedPassword = get().passwords[email];
        if (password !== storedPassword) return { success: false, error: 'Invalid password.' };
        
        const token = generateToken(user);
        const refreshToken = generateRefreshToken();
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        
        set({ 
          currentUser: { ...user, lastLogin: new Date().toISOString() }, 
          auth: { token, refreshToken, expiresAt }
        });
        return { success: true };
      },

      logout: () => set({ 
        currentUser: null, 
        auth: { token: null, refreshToken: null, expiresAt: null } 
      }),

      register: (userData, password) => {
        const existingUser = get().users.find((u) => u.email === userData.email);
        if (existingUser) return { success: false, error: 'Email already registered.' };
        
        const newUser: User = {
          ...userData,
          id: `u${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        
        const token = generateToken(newUser);
        const refreshToken = generateRefreshToken();
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
        
        set((state) => ({ 
          users: [...state.users, newUser],
          passwords: { ...state.passwords, [userData.email]: password },
          currentUser: newUser,
          auth: { token, refreshToken, expiresAt }
        }));
        return { success: true };
      },

      refreshAuth: () => {
        const { auth, currentUser } = get();
        if (!auth.refreshToken || !currentUser) return false;
        
        const newToken = generateToken(currentUser);
        const newExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
        set({ auth: { ...auth, token: newToken, expiresAt: newExpiresAt } });
        return true;
      },

      hasRole: (requiredRoles) => {
        const { currentUser } = get();
        if (!currentUser) return false;
        return hasPermission(currentUser.role, requiredRoles);
      },

      saveProfile: (profile) => set((state) => ({ profiles: { ...state.profiles, [profile.userId]: profile } })),
      getProfile: (userId) => get().profiles[userId] || null,

      addMealEntry: (userId, entry) =>
        set((state) => {
          const userLogs = state.logs[userId] || [];
          const todayDate = today();
          const existing = userLogs.find((l) => l.date === todayDate);
          const updatedLog: DailyLog = existing
            ? { ...existing, meals: [...existing.meals, entry], totalCalories: existing.totalCalories + entry.calories }
            : { date: todayDate, meals: [entry], totalCalories: entry.calories, totalProtein: 0, totalCarbs: 0, totalFat: 0 };
          const newLogs = existing ? userLogs.map((l) => (l.date === todayDate ? updatedLog : l)) : [...userLogs, updatedLog];
          return { logs: { ...state.logs, [userId]: newLogs } };
        }),

      getTodayLog: (userId) => { const userLogs = get().logs[userId] || []; return userLogs.find((l) => l.date === today()) || null; },

      updateHealthMetrics: (userId, data) =>
        set((state) => {
          const userLogs = state.logs[userId] || [];
          const todayDate = today();
          const existing = userLogs.find((l) => l.date === todayDate);
          const updated = existing ? { ...existing, ...data } : { date: todayDate, meals: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, ...data };
          const newLogs = existing ? userLogs.map((l) => (l.date === todayDate ? updated : l)) : [...userLogs, updated];
          return { logs: { ...state.logs, [userId]: newLogs } };
        }),

      getLogs: (userId) => get().logs[userId] || [],

      saveMealPlan: (userId, plan) =>
        set((state) => ({ mealPlans: { ...state.mealPlans, [userId]: [...(state.mealPlans[userId] || []), plan] } })),

      getMealPlans: (userId) => get().mealPlans[userId] || [],

      addNote: (noteData) =>
        set((state) => ({
          notes: [...state.notes, { ...noteData, id: `n${Date.now()}`, createdAt: new Date().toISOString() }],
        })),

      getNotesForPatient: (patientId) => get().notes.filter((n) => n.patientId === patientId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

      deleteNote: (noteId) => set((state) => ({ notes: state.notes.filter((n) => n.id !== noteId) })),

      updateNote: (noteId: string, updates: Partial<DieticianNote>) => 
        set((state) => ({
          notes: state.notes.map((n) => n.id === noteId ? { ...n, ...updates } : n),
        })),

      getNotesForCurrentPatient: () => {
        const user = get().currentUser;
        if (!user || user.role !== 'patient') return [];
        return get().notes.filter((n) => n.patientId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      },

      assignMealPlan: (assignment) =>
        set((state) => ({
          assignedPlans: [...state.assignedPlans, { ...assignment, id: `ap${Date.now()}`, assignedAt: new Date().toISOString() }],
        })),

      getAssignedPlansForPatient: (patientId) => get().assignedPlans.filter((p) => p.patientId === patientId),
      getAssignedPlansByProfessional: (professionalId) => get().assignedPlans.filter((p) => p.dieticianId === professionalId || p.nutritionistId === professionalId),

      getAllPatients: () => {
        const state = get();
        return state.users.filter((u) => u.role === 'patient').map((u) => ({
          user: u,
          profile: state.profiles[u.id] || null,
          lastLog: (state.logs[u.id] || []).sort((a, b) => b.date.localeCompare(a.date))[0] || null,
        }));
      },

      getAllProfessionals: () => {
        return get().users.filter((u) => u.role === 'dietician' || u.role === 'nutritionist');
      },

      getAllAdmins: () => {
        return get().users.filter((u) => u.role === 'admin');
      },

      updateUser: (userId, data) => 
        set((state) => ({
          users: state.users.map((u) => u.id === userId ? { ...u, ...data } : u),
        })),

      updateUserPassword: (userId, newPassword) => 
        set((state) => {
          const user = state.users.find((u) => u.id === userId);
          if (!user) return state;
          return {
            passwords: { ...state.passwords, [user.email]: newPassword },
          };
        }),

      deleteUser: (userId) => 
        set((state) => ({
          users: state.users.filter((u) => u.id !== userId),
          profiles: Object.fromEntries(
            Object.entries(state.profiles).filter(([key]) => key !== userId)
          ),
        })),
    }),
    {
      name: 'healthyplate-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        auth: state.auth,
        users: state.users,
        passwords: state.passwords,
        profiles: state.profiles,
        logs: state.logs,
        mealPlans: state.mealPlans,
        notes: state.notes,
        assignedPlans: state.assignedPlans,
      }),
    }
  )
);
