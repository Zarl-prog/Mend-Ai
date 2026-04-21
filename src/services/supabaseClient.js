import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_PUBLISHABLE_KEY

const isConfigured = supabaseUrl && supabaseKey

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')

export const isSupabaseConfigured = isConfigured