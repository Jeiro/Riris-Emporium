import { createClient } from '@supabase/supabase-js';

import { validatePublicConfig } from './publicConfig';

const config = validatePublicConfig({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
});
export const isSupabaseConfigured = config.issues.length === 0;
// main.tsx gates App imports; this guard also prevents accidental invalid clients.
if (!isSupabaseConfigured) throw new Error('Public Supabase configuration is unavailable.');
export const supabase = createClient(config.url, config.key);

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
