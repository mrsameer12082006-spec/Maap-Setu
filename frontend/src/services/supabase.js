import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yrzhtrzelayycrnvmcup.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseKey) {
  console.warn('VITE_SUPABASE_PUBLISHABLE_KEY is not defined. Supabase integration will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
