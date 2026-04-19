-- Just create tables via Supabase UI (Table Editor), then use the Policy Builder

-- 1. Go to Table Editor
-- 2. Create "profiles" table with columns:
--    - id: uuid, primary key
--    - display_name: text
--    - theme: text, default 'dark'
--    - grid_type: text, default 'square'
--    - grid_size: text, default 'medium'
--    - default_color: text, default '#6C47FF'
--    - default_font_size: integer, default 13
--    - snap_to_grid: boolean, default true
--    - auto_save: boolean, default true
--    - created_at: timestamp with time zone, default now()

-- 3. Enable RLS but DON'T use SQL - use Policy Builder instead:
--    Table Editor → profiles → Policies → Add Policy
--    Use the dropdown to create policies - it handles types automatically

-- For diagrams table:
-- 4. Add column: user_id (uuid)
-- 5. Enable RLS, create policies via Policy Builder