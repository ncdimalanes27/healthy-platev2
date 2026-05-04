import { supabase } from './supabaseClient';
import type { User, HealthProfile, DailyLog, MealPlan, MealEntry, DieticianNote, AssignedMealPlan } from '../types';

// Database service functions for Supabase operations

export const db = {
  // Profile operations
  async getProfile(userId: string): Promise<HealthProfile | null> {
    const { data, error } = await supabase
      .from('health_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  },

  async saveProfile(profile: HealthProfile): Promise<boolean> {
    const { error } = await supabase
      .from('health_profiles')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving profile:', error);
      return false;
    }
    return true;
  },

  // Daily logs operations
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

    return data;
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

    // First, get current log or create new one
    let currentLog = await this.getTodayLog(userId);

    if (!currentLog) {
      currentLog = {
        id: '', // Will be set by Supabase
        user_id: userId,
        date: today,
        meals: [],
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
      };
    }

    const updatedMeals = [...currentLog.meals, entry];
    const { error } = await supabase
      .from('daily_logs')
      .update({
        meals: updatedMeals,
        total_calories: (currentLog.total_calories || 0) + entry.calories,
        total_protein: (currentLog.total_protein || 0) + entry.protein,
        total_carbs: (currentLog.total_carbs || 0) + entry.carbs,
        total_fat: (currentLog.total_fat || 0) + entry.fat,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('date', today);

    if (error) {
      console.error('Error adding meal entry:', error);
      return false;
    }
    return true;
  },

  async updateHealthMetrics(userId: string, data: Partial<DailyLog>): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('daily_logs')
      .upsert({
        user_id: userId,
        date: today,
        ...data,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error updating health metrics:', error);
      return false;
    }
    return true;
  },

  // Meal plans operations
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

    return data || [];
  },

  async saveMealPlan(userId: string, plan: Omit<MealPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    const { error } = await supabase
      .from('meal_plans')
      .insert({
        ...plan,
        user_id: userId,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving meal plan:', error);
      return false;
    }
    return true;
  },

  // Notes operations
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

    return data || [];
  },

  async addNote(note: Omit<DieticianNote, 'id' | 'createdAt'>): Promise<boolean> {
    const { error } = await supabase
      .from('dietician_notes')
      .insert({
        ...note,
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
        ...updates,
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

  // Assigned meal plans operations
  async getAssignedPlansForPatient(patientId: string): Promise<AssignedMealPlan[]> {
    const { data, error } = await supabase
      .from('assigned_meal_plans')
      .select(`
        *,
        meal_plans (*)
      `)
      .eq('patient_id', patientId)
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching assigned plans:', error);
      return [];
    }

    return data || [];
  },

  async getAssignedPlansByProfessional(professionalId: string): Promise<AssignedMealPlan[]> {
    const { data, error } = await supabase
      .from('assigned_meal_plans')
      .select(`
        *,
        meal_plans (*),
        profiles!patient_id (name, email)
      `)
      .or(`dietician_id.eq.${professionalId},nutritionist_id.eq.${professionalId}`)
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching professional assignments:', error);
      return [];
    }

    return data || [];
  },

  async assignMealPlan(assignment: Omit<AssignedMealPlan, 'id' | 'assignedAt'>): Promise<boolean> {
    const { error } = await supabase
      .from('assigned_meal_plans')
      .insert(assignment);

    if (error) {
      console.error('Error assigning meal plan:', error);
      return false;
    }
    return true;
  },

  // User management (admin functions)
  async getAllPatients(): Promise<{ user: User; profile: HealthProfile | null; lastLog: DailyLog | null }[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        health_profiles (*),
        daily_logs (
          date,
          total_calories,
          weight,
          blood_sugar,
          blood_pressure_systolic,
          blood_pressure_diastolic
        )
      `)
      .eq('role', 'patient')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patients:', error);
      return [];
    }

    return (data || []).map(item => ({
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
      profile: item.health_profiles?.[0] || null,
      lastLog: item.daily_logs?.[0] || null,
    }));
  },

  async getAllProfessionals(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['dietician', 'nutritionist'])
      .order('name');

    if (error) {
      console.error('Error fetching professionals:', error);
      return [];
    }

    return (data || []).map(item => ({
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .order('name');

    if (error) {
      console.error('Error fetching admins:', error);
      return [];
    }

    return (data || []).map(item => ({
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
    // Note: This will cascade delete related data due to foreign key constraints
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