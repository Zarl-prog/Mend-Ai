-- Run each statement SEPARATELY in Supabase SQL Editor

-- Step 1: Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
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

-- Step 2: Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policies - DON'T CAST, compare as text
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = id::text);

-- Run each separately