export interface PublicEnvironment {
  [key: string]: unknown;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY?: string;
}
export function validatePublicConfig(env: PublicEnvironment) {
  const issues: string[] = [];
  const url = env.VITE_SUPABASE_URL?.trim() || '';
  const anon = env.VITE_SUPABASE_ANON_KEY?.trim() || '';
  const publishable = env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim() || '';
  if (!url) issues.push('Set VITE_SUPABASE_URL.');
  else {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password || parsed.search || parsed.hash) throw new Error();
    } catch { issues.push('VITE_SUPABASE_URL must be a valid HTTP(S) project URL.'); }
  }
  if (!anon && !publishable) issues.push('Set VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY.');
  // Reject privileged keys even in the unused alternative. Never echo values.
  for (const [name, key] of [['VITE_SUPABASE_ANON_KEY', anon], ['VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY', publishable]]) {
    if (!key) continue;
    let publicKey = key.startsWith('sb_publishable_') && key.length > 'sb_publishable_'.length;
    if (key.split('.').length === 3) {
      try {
        const part = key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload: unknown = JSON.parse(atob(part.padEnd(Math.ceil(part.length / 4) * 4, '=')));
        publicKey = typeof payload === 'object' && payload !== null && 'role' in payload && payload.role === 'anon';
      } catch { publicKey = false; }
    }
    if (!publicKey || key.startsWith('sb_secret_')) issues.push(`${name} must contain a public publishable or anon key, never a secret or service-role key.`);
  }
  return { issues, url, key: anon || publishable };
}
