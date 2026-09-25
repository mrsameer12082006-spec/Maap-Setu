import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// Supports both VITE_SUPABASE_PUBLISHABLE_KEY and legacy VITE_SUPABASE_ANON_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yrzhtrzelayycrnvmcup.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.warn(
    '[Metrika] Supabase API key is missing. Ensure frontend/.env.local contains VITE_SUPABASE_PUBLISHABLE_KEY (see frontend/.env.example).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey || '');
