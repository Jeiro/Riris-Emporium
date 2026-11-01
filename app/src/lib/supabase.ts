import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
  // Non-fatal: warn and continue so the app can run in read-only or offline dev mode.
  // Network calls will still fail until proper keys are provided.
  // This prevents the app from crashing during local development when env vars are absent.
  // Ensure we log only once.
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn('[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Supabase requests will fail until set.');
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey);


// Do not cache identity across logout or account changes.
export const getAuthUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error && error.name !== 'AuthSessionMissingError') throw error;
  return data.user;
};

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return error;
};

// Helper function to get session
export const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

export default supabase;
