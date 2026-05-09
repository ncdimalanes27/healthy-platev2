import { supabase } from './supabaseClient';
import type { User, HealthProfile, DailyLog, MealPlan, MealEntry, DieticianNote, AssignedMealPlan } from '../types';

// ── Mapping helpers ───────────────────────────────────────────────────────────
// The DB uses snake_case; our TypeScript types use camelCase. These helpers
// convert between the two so every caller gets the right shape.

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

// ── Database service ──────────────────────────────────────────────────────────
export const db = {

  // ── Profile ────────────────────────────────────────────────────────────────
  async getProfile(userId: string): Promise<HealthProfile | null> {
    const { data, error } = await supabase
      .from('health_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return null;
    }
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
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching logs:', error);
      return [];
    }
    return data || [];
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
    const { data, error } = await supabase
      .from('dietician_notes')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
    return (data || []).map(mapNote);
  },

  async addNote(note: Omit<DieticianNote, 'id' | 'createdAt'>): Promise<boolean> {
    const categoryMap: Record<string, string> = {
      recommendation: 'info',
      general: 'info',
      warning: 'warning',
      progress: 'progress',
    };
    const { error } = await supabase
      .from('dietician_notes')
      .insert({
        patient_id: note.patientId,
        dietician_id: note.dieticianId,
        dietician_name: note.dieticianName,
        content: note.content,
        category: categoryMap[note.category] || 'info',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error adding note:', error);
      return false;
    }
    return true;
  },

  async updateNote(noteId: string, updates: Partial<DieticianNote>): Promise<boolean> {
    const { error } = await supabase
      .from('dietician_notes')
      .update({
        content: updates.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', noteId);

    if (error) {
      console.error('Error updating note:', error);
      return false;
    }
    return true;
  },

  async deleteNote(noteId: string): Promise<boolean> {
    const { error } = await supabase
      .from('dietician_notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error('Error deleting note:', error);
      return false;
    }
    return true;
  },

  // ── Assigned meal plans ────────────────────────────────────────────────────
  async getAssignedPlansForPatient(patientId: string): Promise<AssignedMealPlan[]> {
    const { data, error } = await supabase
      .from('assigned_meal_plans')
      .select('*, meal_plans (*)')
      .eq('patient_id', patientId)
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching assigned plans:', error);
      return [];
    }
    return (data || []).map(mapAssignedPlan);
  },

  async getAssignedPlansByProfessional(professionalId: string): Promise<AssignedMealPlan[]> {
    const { data, error } = await supabase
      .from('assigned_meal_plans')
      .select('*, meal_plans (*)')
      .or(`dietician_id.eq.${professionalId},nutritionist_id.eq.${professionalId}`)
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching professional assignments:', error);
      return [];
    }
    return (data || []).map(mapAssignedPlan);
  },

  async assignMealPlan(assignment: Omit<AssignedMealPlan, 'id' | 'assignedAt'>): Promise<boolean> {
    // Step 1: Create a meal_plan record so we have a valid FK id
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

    // Step 2: Assign it to the patient
    const { error } = await supabase
      .from('assigned_meal_plans')
      .insert({
        patient_id: assignment.patientId,
        dietician_id: assignment.dieticianId || null,
        nutritionist_id: assignment.nutritionistId || null,
        meal_plan_id: planData.id,
        notes: assignment.note || null,
        status: 'active',
        assigned_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error assigning meal plan:', error);
      return false;
    }
    return true;
  },

  // ── User management (uses server-side admin API to bypass RLS) ─────────────
  async _adminFetch(role: string): Promise<any[]> {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const token = session?.access_token;
      const res = await fetch(`/admin-api/users?role=${role}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error(`Admin API error (${role}):`, err);
        return [];
      }
      return await res.json();
    } catch (e) {
      console.error(`Admin API fetch failed (${role}):`, e);
      return [];
    }
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
      id: item.id,
      name: item.name,
      email: item.email,
      role: item.role,
      phone: item.phone,
      address: item.address,
      avatar: item.avatar,
      createdAt: item.created_at,
      lastLogin: item.last_login,
    }));
  },

  async getAllAdmins(): Promise<User[]> {
    const rows = await this._adminFetch('admin');
    return rows.map((item: any) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      role: item.role,
      phone: item.phone,
      address: item.address,
      avatar: item.avatar,
      createdAt: item.created_at,
      lastLogin: item.last_login,
    }));
  },

  async updateUser(userId: string, data: Partial<User>): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId);

    if (error) {
      console.error('Error updating user:', error);
      return false;
    }
    return true;
  },

  async deleteUser(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }
    return true;
  },
};
