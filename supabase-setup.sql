-- Run this in Supabase SQL Editor

-- 1. Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  theme TEXT DEFAULT 'dark',
  grid_type TEXT DEFAULT 'square',
  grid_size TEXT DEFAULT 'medium',
  default_color TEXT DEFAULT '#6C47FF',
  default_font_size INTEGER DEFAULT 13,
  snap_to_grid BOOLEAN DEFAULT true,
  auto_save BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Add user_id to diagrams table (if not exists)
ALTER TABLE diagrams ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 5. Enable RLS on diagrams (if not already)
ALTER TABLE diagrams ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for diagrams
DROP POLICY IF EXISTS "Users can view own diagrams" ON diagrams;
CREATE POLICY "Users can view own diagrams" ON diagrams
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own diagrams" ON diagrams;
CREATE POLICY "Users can insert own diagrams" ON diagrams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own diagrams" ON diagrams;
CREATE POLICY "Users can update own diagrams" ON diagrams
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own diagrams" ON diagrams;
CREATE POLICY "Users can delete own diagrams" ON diagrams
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Auto-create profile on signup (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
