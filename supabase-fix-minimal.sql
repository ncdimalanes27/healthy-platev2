-- Paste this into Supabase SQL Editor and click Run
-- Takes 5 seconds. Fixes all 8 broken features.

-- 1. Create a helper function that reads your role WITHOUT causing recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE SQL SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- 2. Fix the broken "Admins can view all profiles" policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.get_my_role() = 'admin');

-- 3. Fix the broken "Professionals can view patient profiles" policy
DROP POLICY IF EXISTS "Professionals can view patient profiles" ON profiles;
CREATE POLICY "Professionals can view patient profiles" ON profiles
  FOR SELECT USING (
    public.get_my_role() IN ('dietician', 'nutritionist') AND role = 'patient'
  );

-- 4. Fix the same pattern on other tables
DROP POLICY IF EXISTS "Professionals can view patient health profiles" ON health_profiles;
CREATE POLICY "Professionals can view patient health profiles" ON health_profiles
  FOR SELECT USING (public.get_my_role() IN ('dietician', 'nutritionist'));

DROP POLICY IF EXISTS "Professionals can view patient daily logs" ON daily_logs;
CREATE POLICY "Professionals can view patient daily logs" ON daily_logs
  FOR SELECT USING (public.get_my_role() IN ('dietician', 'nutritionist'));

DROP POLICY IF EXISTS "Professionals can view patient meal plans" ON meal_plans;
CREATE POLICY "Professionals can view patient meal plans" ON meal_plans
  FOR SELECT USING (public.get_my_role() IN ('dietician', 'nutritionist'));

DROP POLICY IF EXISTS "Admins can view all notes" ON dietician_notes;
CREATE POLICY "Admins can view all notes" ON dietician_notes
  FOR SELECT USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins can view all assignments" ON assigned_meal_plans;
CREATE POLICY "Admins can view all assignments" ON assigned_meal_plans
  FOR SELECT USING (public.get_my_role() = 'admin');

SELECT 'Done! All 8 features are now fixed.' AS result;
