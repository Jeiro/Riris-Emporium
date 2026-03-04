import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);


// Helper function to get authenticated user
export const getAuthUser = async () => {
  const { data } = await supabase.auth.getUser();
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
