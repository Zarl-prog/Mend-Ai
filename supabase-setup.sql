-- Run these SQL commands in Supabase SQL Editor to fix RLS policies

-- Drop existing policies if broken
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;

-- Recreate correct profiles policies
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- For diagrams table
DROP POLICY IF EXISTS "Users can manage own diagrams" ON diagrams;

CREATE POLICY "Users can insert own diagram"
ON diagrams FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own diagrams"
ON diagrams FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own diagrams"
ON diagrams FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diagrams"
ON diagrams FOR DELETE
USING (auth.uid() = user_id);