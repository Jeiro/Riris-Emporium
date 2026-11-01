import { useMemo, useSyncExternalStore } from 'react';
import { supabase } from '../lib/supabase';
import { parseWishlist, wishlistKey } from '../lib/wishlistStorage';
import { useVerifiedUser } from './useVerifiedUser';

const eventName = 'riris:wishlist-change';
function subscribe(notify: () => void) {
  window.addEventListener('storage', notify);
  window.addEventListener(eventName, notify);
  return () => {
    window.removeEventListener('storage', notify);
    window.removeEventListener(eventName, notify);
  };
}

export function useWishlist() {
  const identity = useVerifiedUser();
  const key = identity.userId ? wishlistKey(identity.userId) : null;
  const raw = useSyncExternalStore(subscribe, () => {
    if (!key) return null;
    try { return localStorage.getItem(key); } catch { return 'storage-unavailable'; }
  }, () => null);
  const saved = useMemo<{ ids: string[]; error: string | null }>(() => {
    try { return { ids: parseWishlist(raw), error: null }; }
    catch { return { ids: [], error: 'Unable to read your saved wishlist on this device. Retry or clear it to start again.' }; }
  }, [raw]);

  async function update(change: (ids: string[]) => string[], reset = false) {
    const { data, error } = await supabase.auth.getUser();
    if (error || !key || !data.user || data.user.id !== identity.userId) {
      throw new Error('Your account changed. Please sign in again before changing your wishlist.');
    }
    try {
      const ids = reset ? [] : parseWishlist(localStorage.getItem(key));
      localStorage.setItem(key, JSON.stringify(change(ids)));
      window.dispatchEvent(new Event(eventName));
    } catch {
      throw new Error('Could not save your wishlist on this device. Check browser storage settings and retry.');
    }
  }

  return {
    ...identity, ids: saved.ids, error: identity.error || saved.error,
    toggle: (id: string) => update(ids => ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id]),
    remove: (id: string) => update(ids => ids.filter(item => item !== id)),
    clear: () => update(() => [], true),
  };
}
