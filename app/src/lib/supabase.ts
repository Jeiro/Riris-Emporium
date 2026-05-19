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


// Helper function to get authenticated user
// Cached helper to avoid repeated concurrent calls to supabase.auth.getUser()
let _userCache: any = null;
let _userPromise: Promise<any> | null = null;
export const getAuthUser = async () => {
  // return cached user if available
  if (_userCache) return _userCache;

  // if a request is already in-flight, return that promise
  if (_userPromise) return _userPromise;

  const retryDelays = [100, 300, 800];
  _userPromise = (async () => {
    try {
      for (let attempt = 0; attempt < retryDelays.length; attempt++) {
        try {
          const { data } = await supabase.auth.getUser();
          _userCache = data?.user ?? null;
          return _userCache;
        } catch (err: any) {
          // If it's an AbortError or a gotrue lock-related transient error, retry
          const msg = String(err?.message || '');
          const isAbort = err?.name === 'AbortError' || /lock/.test(msg) || /Lock broken/.test(msg);
          if (!isAbort || attempt === retryDelays.length - 1) {
            throw err;
          }
          // brief backoff then retry
          await new Promise((res) => setTimeout(res, retryDelays[attempt]));
        }
      }
      return null;
    } finally {
      // clear the in-flight promise so subsequent calls can refresh as needed
      _userPromise = null;
    }
  })();

  return _userPromise;
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
