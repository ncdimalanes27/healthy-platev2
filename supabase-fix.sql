-- ============================================================
-- HealthyPlate Supabase Fix Script
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── STEP 1: Create a security-definer helper to get the current
--            user's role. This breaks the infinite recursion in
--            profiles policies that call back into profiles.
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- ── STEP 2: Fix profiles table — drop the recursive policies
--            and replace with non-recursive versions.
-- ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Professionals can view patient profiles" ON profiles;

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.get_my_role() = 'admin');

CREATE POLICY "Professionals can view patient profiles" ON profiles
  FOR SELECT USING (
    public.get_my_role() IN ('dietician', 'nutritionist')
    AND role = 'patient'
  );

-- ── STEP 3: Fix health_profiles policies
-- ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Professionals can view patient health profiles" ON health_profiles;

CREATE POLICY "Professionals can view patient health profiles" ON health_profiles
  FOR SELECT USING (
    public.get_my_role() IN ('dietician', 'nutritionist')
  );

-- ── STEP 4: Fix daily_logs policies
-- ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Professionals can view patient daily logs" ON daily_logs;

CREATE POLICY "Professionals can view patient daily logs" ON daily_logs
  FOR SELECT USING (
    public.get_my_role() IN ('dietician', 'nutritionist')
  );

-- ── STEP 5: Fix meal_plans policies
-- ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Professionals can view patient meal plans" ON meal_plans;

CREATE POLICY "Professionals can view patient meal plans" ON meal_plans
  FOR SELECT USING (
    public.get_my_role() IN ('dietician', 'nutritionist')
  );

-- ── STEP 6: Fix dietician_notes policies
-- ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can view all notes" ON dietician_notes;

CREATE POLICY "Admins can view all notes" ON dietician_notes
  FOR SELECT USING (public.get_my_role() = 'admin');

-- ── STEP 7: Fix assigned_meal_plans policies
-- ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can view all assignments" ON assigned_meal_plans;

CREATE POLICY "Admins can view all assignments" ON assigned_meal_plans
  FOR SELECT USING (public.get_my_role() = 'admin');

-- ── STEP 8: Fix daily_logs table schema
--            The "date" column may be missing or named "log_date".
--            This safely handles all three cases.
-- ──────────────────────────────────────────────────────────────
DO $$
BEGIN
  -- Case A: column is named log_date → rename it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'daily_logs'
      AND column_name = 'log_date'
  ) THEN
    ALTER TABLE daily_logs RENAME COLUMN log_date TO date;

  -- Case B: date column missing entirely → add it
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'daily_logs'
      AND column_name = 'date'
  ) THEN
    ALTER TABLE daily_logs ADD COLUMN date DATE NOT NULL DEFAULT CURRENT_DATE;
  END IF;
  -- Case C: column already named date → nothing to do
END $$;

-- ── STEP 9: Ensure daily_logs has all required columns
--            (safe to run even if they already exist)
-- ──────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='daily_logs' AND column_name='meals') THEN
    ALTER TABLE daily_logs ADD COLUMN meals JSONB DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='daily_logs' AND column_name='total_calories') THEN
    ALTER TABLE daily_logs ADD COLUMN total_calories INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='daily_logs' AND column_name='total_protein') THEN
    ALTER TABLE daily_logs ADD COLUMN total_protein DECIMAL(6,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='daily_logs' AND column_name='total_carbs') THEN
    ALTER TABLE daily_logs ADD COLUMN total_carbs DECIMAL(6,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='daily_logs' AND column_name='total_fat') THEN
    ALTER TABLE daily_logs ADD COLUMN total_fat DECIMAL(6,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='daily_logs' AND column_name='weight') THEN
    ALTER TABLE daily_logs ADD COLUMN weight DECIMAL(5,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='daily_logs' AND column_name='blood_sugar') THEN
    ALTER TABLE daily_logs ADD COLUMN blood_sugar DECIMAL(5,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='daily_logs' AND column_name='blood_pressure_systolic') THEN
    ALTER TABLE daily_logs ADD COLUMN blood_pressure_systolic INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='daily_logs' AND column_name='blood_pressure_diastolic') THEN
    ALTER TABLE daily_logs ADD COLUMN blood_pressure_diastolic INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='daily_logs' AND column_name='updated_at') THEN
    ALTER TABLE daily_logs ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Add unique constraint if missing (needed for upsert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'daily_logs_user_id_date_key'
      AND conrelid = 'daily_logs'::regclass
  ) THEN
    ALTER TABLE daily_logs ADD CONSTRAINT daily_logs_user_id_date_key UNIQUE (user_id, date);
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL; -- ignore if constraint already exists under different name
END $$;

-- ── STEP 10: Ensure health_profiles table has correct columns
-- ──────────────────────────────────────────────────────────────
DO $$
BEGIN
  -- activity_level might be named differently
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='health_profiles' AND column_name='activity_level') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='health_profiles' AND column_name='activitylevel') THEN
      ALTER TABLE health_profiles RENAME COLUMN activitylevel TO activity_level;
    ELSE
      ALTER TABLE health_profiles ADD COLUMN activity_level TEXT;
    END IF;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='health_profiles' AND column_name='health_conditions') THEN
    ALTER TABLE health_profiles ADD COLUMN health_conditions TEXT[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='health_profiles' AND column_name='allergies') THEN
    ALTER TABLE health_profiles ADD COLUMN allergies TEXT[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='health_profiles' AND column_name='updated_at') THEN
    ALTER TABLE health_profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- ── STEP 11: Ensure dietician_notes has dietician_name column
-- ──────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='dietician_notes' AND column_name='dietician_name') THEN
    ALTER TABLE dietician_notes ADD COLUMN dietician_name TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='dietician_notes' AND column_name='updated_at') THEN
    ALTER TABLE dietician_notes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- ── STEP 12: Ensure meal_plans has all required columns
-- ──────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='meal_plans' AND column_name='meals') THEN
    ALTER TABLE meal_plans ADD COLUMN meals JSONB NOT NULL DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='meal_plans' AND column_name='is_template') THEN
    ALTER TABLE meal_plans ADD COLUMN is_template BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='meal_plans' AND column_name='total_calories') THEN
    ALTER TABLE meal_plans ADD COLUMN total_calories INTEGER;
  END IF;
END $$;

-- ── Done! ──────────────────────────────────────────────────────
SELECT 'HealthyPlate Supabase fix applied successfully!' AS status;
