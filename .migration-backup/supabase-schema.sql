-- Enable Row Level Security (RLS) on all tables
-- This ensures users can only access their own data

-- 1. Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('patient', 'dietician', 'nutritionist', 'admin')),
  phone TEXT,
  address TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Professionals can view patient profiles
CREATE POLICY "Professionals can view patient profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('dietician', 'nutritionist')
    ) AND role = 'patient'
  );

-- 2. Health Profiles table
CREATE TABLE health_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  height INTEGER, -- in cm
  weight DECIMAL(5,2), -- in kg
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  health_conditions TEXT[], -- array of conditions
  allergies TEXT[], -- array of allergies
  goal TEXT CHECK (goal IN ('lose', 'maintain', 'gain')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view/update their own health profile
CREATE POLICY "Users can manage own health profile" ON health_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Policy: Professionals can view patient health profiles
CREATE POLICY "Professionals can view patient health profiles" ON health_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('dietician', 'nutritionist')
    )
  );

-- 3. Daily Logs table
CREATE TABLE daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  meals JSONB DEFAULT '[]'::jsonb, -- array of meal entries
  total_calories INTEGER DEFAULT 0,
  total_protein DECIMAL(6,2) DEFAULT 0,
  total_carbs DECIMAL(6,2) DEFAULT 0,
  total_fat DECIMAL(6,2) DEFAULT 0,
  weight DECIMAL(5,2),
  blood_sugar DECIMAL(5,2),
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, date)
);

ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own daily logs
CREATE POLICY "Users can manage own daily logs" ON daily_logs
  FOR ALL USING (auth.uid() = user_id);

-- Policy: Professionals can view patient daily logs
CREATE POLICY "Professionals can view patient daily logs" ON daily_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('dietician', 'nutritionist')
    )
  );

-- 4. Meal Plans table
CREATE TABLE meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  meals JSONB NOT NULL, -- structured meal plan data
  total_calories INTEGER,
  total_protein DECIMAL(6,2),
  total_carbs DECIMAL(6,2),
  total_fat DECIMAL(6,2),
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own meal plans
CREATE POLICY "Users can manage own meal plans" ON meal_plans
  FOR ALL USING (auth.uid() = user_id);

-- Policy: Professionals can view patient meal plans
CREATE POLICY "Professionals can view patient meal plans" ON meal_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('dietician', 'nutritionist')
    )
  );

-- Policy: Template meal plans are public (for nutritionists to share)
CREATE POLICY "Template meal plans are public" ON meal_plans
  FOR SELECT USING (is_template = true);

-- 5. Dietician Notes table
CREATE TABLE dietician_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dietician_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  dietician_name TEXT NOT NULL,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('progress', 'warning', 'info', 'alert')) DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE dietician_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Dieticians can manage their own notes
CREATE POLICY "Dieticians can manage own notes" ON dietician_notes
  FOR ALL USING (auth.uid() = dietician_id);

-- Policy: Patients can view notes about themselves
CREATE POLICY "Patients can view notes about themselves" ON dietician_notes
  FOR SELECT USING (auth.uid() = patient_id);

-- Policy: Admins can view all notes
CREATE POLICY "Admins can view all notes" ON dietician_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Assigned Meal Plans table
CREATE TABLE assigned_meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  dietician_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  nutritionist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE NOT NULL,
  notes TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active'
);

ALTER TABLE assigned_meal_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Patients can view their assigned plans
CREATE POLICY "Patients can view their assigned plans" ON assigned_meal_plans
  FOR SELECT USING (auth.uid() = patient_id);

-- Policy: Professionals can manage assignments they created
CREATE POLICY "Professionals can manage their assignments" ON assigned_meal_plans
  FOR ALL USING (
    auth.uid() = dietician_id OR auth.uid() = nutritionist_id
  );

-- Policy: Admins can view all assignments
CREATE POLICY "Admins can view all assignments" ON assigned_meal_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_health_profiles_user_id ON health_profiles(user_id);
CREATE INDEX idx_daily_logs_user_date ON daily_logs(user_id, date);
CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX idx_dietician_notes_patient ON dietician_notes(patient_id);
CREATE INDEX idx_assigned_meal_plans_patient ON assigned_meal_plans(patient_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'patient')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();