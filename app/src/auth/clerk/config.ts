import { validatePublicConfig } from '../../lib/publicConfig';
import type { PublicEnvironment } from '../../lib/publicConfig';

export function validateClerkConfig(env: PublicEnvironment) {
  const config = validatePublicConfig(env);
  const publishableKey = typeof env.VITE_CLERK_PUBLISHABLE_KEY === 'string' ? env.VITE_CLERK_PUBLISHABLE_KEY.trim() : '';
  let valid = false;
  if (/^pk_(test|live)_/.test(publishableKey)) {
    try {
      const encoded = publishableKey.replace(/^pk_(test|live)_/, '');
      const decoded = atob(encoded);
      const host = decoded.endsWith('$') ? decoded.slice(0, -1) : '';
      valid = /^[a-z0-9]+(?:[.-][a-z0-9]+)*\.[a-z]{2,}$/i.test(host);
    } catch { valid = false; }
  }
  return { ...config, publishableKey, issues: [...config.issues,
    ...(!valid ? ['Set VITE_CLERK_PUBLISHABLE_KEY to a valid public Clerk publishable key. Never use a secret key.'] : [])] };
}
