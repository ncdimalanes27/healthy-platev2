import { supabase } from './supabaseClient';
import type { User, HealthProfile, DailyLog, MealPlan, MealEntry, DieticianNote, AssignedMealPlan } from '../types';

// ── Mapping helpers ───────────────────────────────────────────────────────────

function mapHealthProfile(row: any): HealthProfile | null {
  if (!row) return null;
  return {
    userId: row.user_id,
    age: row.age,
    gender: row.gender,
    height: row.height,
    weight: row.weight,
    activityLevel: row.activity_level,
    healthConditions: row.health_conditions || [],
    allergies: row.allergies || [],
    goal: row.goal,
  };
}

function mapNote(row: any): DieticianNote {
  const rawCat = row.category as string | undefined;
  const category = (rawCat === 'info' ? 'general' : rawCat === 'alert' ? 'warning' : rawCat) as DieticianNote['category'] || 'general';
  return {
    id: row.id,
    dieticianId: row.dietician_id,
    dieticianName: row.dietician_name || '',
    patientId: row.patient_id,
    content: row.content,
    category,
    createdAt: row.created_at,
  };
}

function mapMealPlan(row: any): MealPlan {
  return {
    id: row.id,
    name: row.name,
    targetCalories: row.total_calories || 0,
    days: row.meals || [],
    createdAt: row.created_at,
  };
}

function mapAssignedPlan(row: any): AssignedMealPlan {
  return {
    id: row.id,
    mealPlanId: row.meal_plan_id,
    mealPlanName: row.meal_plans?.name || 'Meal Plan',
    patientId: row.patient_id,
    dieticianId: row.dietician_id || '',
    nutritionistId: row.nutritionist_id || undefined,
    dieticianName: row.profiles?.name || '',
    targetCalories: row.meal_plans?.total_calories || 0,
    assignedAt: row.assigned_at,
    note: row.notes || undefined,
  };
}

// ── Admin API helpers (bypass RLS via server-side service role key) ────────────

async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function adminGet(path: string): Promise<any> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`/admin-api/${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(`[adminGet] ${path} failed:`, err);
      return null;
    }
    return res.json();
  } catch (e) {
    console.error(`[adminGet] ${path} threw:`, e);
    return null;
  }
}

async function adminPost(path: string, body: unknown): Promise<{ ok: boolean; data: any }> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`/admin-api/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) console.error(`[adminPost] ${path} failed:`, data);
    return { ok: res.ok, data };
  } catch (e) {
    console.error(`[adminPost] ${path} threw:`, e);
    return { ok: false, data: null };
  }
}

async function adminPatch(path: string, body: unknown): Promise<{ ok: boolean; data: any }> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`/admin-api/${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    return { ok: res.ok, data };
  } catch (e) {
    console.error(`[adminPatch] ${path} threw:`, e);
    return { ok: false, data: null };
  }
}

async function adminDelete(path: string): Promise<boolean> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`/admin-api/${path}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.ok;
  } catch (e) {
    console.error(`[adminDelete] ${path} threw:`, e);
    return false;
  }
}

// ── Database service ──────────────────────────────────────────────────────────
export const db = {

  // ── My profile (role sync) ─────────────────────────────────────────────────
  // Returns the caller's profile row from profiles table — used to get authoritative role
  async getMyProfile(): Promise<{ id: string; role: string; name: string; email: string } | null> {
    const data = await adminGet('me');
    return data ?? null;
  },

  // ── Health Profile ─────────────────────────────────────────────────────────
  async getProfile(userId: string): Promise<HealthProfile | null> {
    const data = await adminGet(`health-profile/${userId}`);
    return mapHealthProfile(data);
  },

  async saveProfile(profile: HealthProfile): Promise<boolean> {
    const { error } = await supabase
      .from('health_profiles')
      .upsert({
        user_id: profile.userId,
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        weight: profile.weight,
        activity_level: profile.activityLevel,
        health_conditions: profile.healthConditions,
        allergies: profile.allergies,
        goal: profile.goal,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error saving profile:', error);
      return false;
    }
    return true;
  },

  // ── Daily logs ─────────────────────────────────────────────────────────────
  async getTodayLog(userId: string): Promise<DailyLog | null> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching today log:', error);
      return null;
    }
    return data || null;
  },

  async getLogs(userId: string): Promise<DailyLog[]> {
    const data = await adminGet(`logs/${userId}`);
    return Array.isArray(data) ? data : [];
  },

  async addMealEntry(userId: string, entry: MealEntry): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const currentLog = await this.getTodayLog(userId);

    const updatedMeals = currentLog ? [...currentLog.meals, entry] : [entry];
    const { error } = await supabase
      .from('daily_logs')
      .upsert({
        user_id: userId,
        date: today,
        meals: updatedMeals,
        total_calories: (currentLog?.total_calories || 0) + entry.calories,
        total_protein: (currentLog?.total_protein || 0) + entry.protein,
        total_carbs: (currentLog?.total_carbs || 0) + entry.carbs,
        total_fat: (currentLog?.total_fat || 0) + entry.fat,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,date' });

    if (error) {
      console.error('Error adding meal entry:', error);
      return false;
    }
    return true;
  },

  async updateHealthMetrics(userId: string, data: Partial<DailyLog>): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const currentLog = await this.getTodayLog(userId);

    const { error } = await supabase
      .from('daily_logs')
      .upsert({
        user_id: userId,
        date: today,
        meals: currentLog?.meals || [],
        total_calories: currentLog?.total_calories || 0,
        total_protein: currentLog?.total_protein || 0,
        total_carbs: currentLog?.total_carbs || 0,
        total_fat: currentLog?.total_fat || 0,
        ...data,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,date' });

    if (error) {
      console.error('Error updating health metrics:', error);
      return false;
    }
    return true;
  },

  // ── Meal plans ─────────────────────────────────────────────────────────────
  async getMealPlans(userId: string): Promise<MealPlan[]> {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching meal plans:', error);
      return [];
    }
    return (data || []).map(mapMealPlan);
  },

  async saveMealPlan(userId: string, plan: any): Promise<boolean> {
    const { error } = await supabase
      .from('meal_plans')
      .insert({
        user_id: userId,
        name: plan.name,
        description: plan.description || null,
        meals: plan.days || plan.meals || [],
        total_calories: plan.targetCalories || plan.total_calories || null,
        total_protein: plan.total_protein || null,
        total_carbs: plan.total_carbs || null,
        total_fat: plan.total_fat || null,
        is_template: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving meal plan:', error);
      return false;
    }
    return true;
  },

  // ── Notes ──────────────────────────────────────────────────────────────────
  async getNotesForPatient(patientId: string): Promise<DieticianNote[]> {
    const data = await adminGet(`notes/${patientId}`);
    return Array.isArray(data) ? data.map(mapNote) : [];
  },

  async addNote(note: Omit<DieticianNote, 'id' | 'createdAt'>): Promise<boolean> {
    // category column may not exist in live DB — omit it so the row saves with the DB default
    const body: Record<string, unknown> = {
      patient_id: note.patientId,
      dietician_id: note.dieticianId,
      dietician_name: note.dieticianName,
      content: note.content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Only include category if the value maps cleanly to the DB constraint
    const categoryMap: Record<string, string> = {
      recommendation: 'info',
      general: 'info',
      warning: 'warning',
      progress: 'progress',
    };
    const dbCat = categoryMap[note.category];
    if (dbCat) body.category = dbCat;

    const { ok, data } = await adminPost('notes', body);

    // If category column doesn't exist in live DB, retry without it
    if (!ok && typeof data === 'object' && data !== null) {
      const msg = (data as any).message as string | undefined;
      if (msg?.includes('category')) {
        delete body.category;
        const retry = await adminPost('notes', body);
        return retry.ok;
      }
    }
    return ok;
  },

  async updateNote(noteId: string, updates: Partial<DieticianNote>): Promise<boolean> {
    const body: Record<string, unknown> = {
      content: updates.content,
      updated_at: new Date().toISOString(),
    };
    // Only include category if provided and maps cleanly
    const categoryMap: Record<string, string> = {
      recommendation: 'info',
      general: 'info',
      warning: 'warning',
      progress: 'progress',
    };
    if (updates.category) {
      const dbCat = categoryMap[updates.category];
      if (dbCat) body.category = dbCat;
    }
    const { ok, data } = await adminPatch(`note/${noteId}`, body);
    if (!ok && typeof data === 'object' && data !== null) {
      const msg = (data as any).message as string | undefined;
      if (msg?.includes('category')) {
        delete body.category;
        const retry = await adminPatch(`note/${noteId}`, body);
        return retry.ok;
      }
    }
    return ok;
  },

  async deleteNote(noteId: string): Promise<boolean> {
    return adminDelete(`note/${noteId}`);
  },

  // ── Assigned meal plans ────────────────────────────────────────────────────
  async getAssignedPlansForPatient(patientId: string): Promise<AssignedMealPlan[]> {
    const data = await adminGet(`assigned-plans/${patientId}`);
    return Array.isArray(data) ? data.map(mapAssignedPlan) : [];
  },

  async getAssignedPlansByProfessional(professionalId: string): Promise<AssignedMealPlan[]> {
    const data = await adminGet(`professional-plans/${professionalId}`);
    return Array.isArray(data) ? data.map(mapAssignedPlan) : [];
  },

  async assignMealPlan(assignment: Omit<AssignedMealPlan, 'id' | 'assignedAt'>): Promise<boolean> {
    // Step 1: Create meal_plan record (own-user insert — non-recursive RLS)
    const { data: planData, error: planError } = await supabase
      .from('meal_plans')
      .insert({
        user_id: assignment.dieticianId,
        name: assignment.mealPlanName,
        description: assignment.note || null,
        meals: [],
        total_calories: assignment.targetCalories || null,
        is_template: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (planError || !planData) {
      console.error('Error creating meal plan for assignment:', planError);
      return false;
    }

    // Step 2: Assign via admin API (bypasses recursive RLS on assigned_meal_plans)
    const { ok } = await adminPost('assigned-plans', {
      patient_id: assignment.patientId,
      dietician_id: assignment.dieticianId || null,
      nutritionist_id: assignment.nutritionistId || null,
      meal_plan_id: planData.id,
      notes: assignment.note || null,
      status: 'active',
      assigned_at: new Date().toISOString(),
    });
    return ok;
  },

  // ── User management ────────────────────────────────────────────────────────
  async _adminFetch(role: string): Promise<any[]> {
    const data = await adminGet(`users?role=${role}`);
    return Array.isArray(data) ? data : [];
  },

  async getAllPatients(): Promise<{ user: User; profile: HealthProfile | null; lastLog: DailyLog | null }[]> {
    const rows = await this._adminFetch('patient');
    return rows.map((item: any) => ({
      user: {
        id: item.id,
        name: item.name,
        email: item.email,
        role: item.role,
        phone: item.phone,
        address: item.address,
        avatar: item.avatar,
        createdAt: item.created_at,
        lastLogin: item.last_login,
      },
      profile: mapHealthProfile(item.health_profiles?.[0] || null),
      lastLog: null,
    }));
  },

  async getAllProfessionals(): Promise<User[]> {
    const rows = await this._adminFetch('professional');
    return rows.map((item: any) => ({
      id: item.id, name: item.name, email: item.email, role: item.role,
      phone: item.phone, address: item.address, avatar: item.avatar,
      createdAt: item.created_at, lastLogin: item.last_login,
    }));
  },

  async getAllAdmins(): Promise<User[]> {
    const rows = await this._adminFetch('admin');
    return rows.map((item: any) => ({
      id: item.id, name: item.name, email: item.email, role: item.role,
      phone: item.phone, address: item.address, avatar: item.avatar,
      createdAt: item.created_at, lastLogin: item.last_login,
    }));
  },

  // Update user via admin API (bypasses recursive RLS on profiles UPDATE)
  async updateUser(userId: string, data: Partial<User>): Promise<boolean> {
    const { ok } = await adminPatch(`user/${userId}`, {
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone,
      address: data.address,
    });
    return ok;
  },

  // Delete user via admin API (bypasses recursive RLS on profiles DELETE)
  async deleteUser(userId: string): Promise<boolean> {
    return adminDelete(`user/${userId}`);
  },
};
