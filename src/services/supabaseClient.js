import { createClient } from '@supabase/supabase-js';

const env = import.meta.env;

console.log('Env keys:', Object.keys(env).filter(k => k.includes('SUPABASE')));

const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

console.log('Supabase init:', { hasUrl: !!supabaseUrl, hasKey: !!supabaseKey, url: supabaseUrl });

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);