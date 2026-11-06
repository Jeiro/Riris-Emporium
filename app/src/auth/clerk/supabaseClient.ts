import { createClient } from '@supabase/supabase-js';
import { validateClerkConfig } from './config';
import type { PublicEnvironment } from '../../lib/publicConfig';
import type { ClerkSessionController } from './sessionController';

// Native third-party Auth, NOT the deprecated Clerk Supabase JWT template.
// Factory only: no singleton, environment read or connection on module import.
export function createClerkSupabaseClient(env: PublicEnvironment, session: ClerkSessionController, fetcher?: typeof fetch) {
  const config = validateClerkConfig(env);
  if (config.issues.length) throw new Error('Public Clerk/Supabase configuration is unavailable.');
  return createClient(config.url, config.key, {
    accessToken: () => session.accessToken(),
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    ...(fetcher ? { global: { fetch: fetcher } } : {}),
  });
}
