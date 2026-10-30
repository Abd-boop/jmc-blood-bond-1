import { createClient } from '@supabase/supabase-js';

// Retrieve public environment variables provided by Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verify that the anon key is present and NOT the service_role key
if (supabaseAnonKey.includes('service_role')) {
  console.error('CRITICAL SECURITY ALERT: service_role key detected in frontend code! Replace immediately with anon public key.');
}

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  !supabaseUrl.includes('placeholder')
);

// Instantiate Supabase client with public anon key only
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

