import { useEffect } from 'react';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Verify with Auth; persisted UI state is not proof of a current session.
const useIdentity = create<{ userId: string | null; isLoading: boolean; error: string | null }>(() => ({
  userId: null, isLoading: true, error: null,
}));
let started = false;
let revision = 0;

export async function refreshVerifiedUser() {
  const request = ++revision;
  useIdentity.setState({ userId: null, isLoading: true, error: null });
  try {
    const { data, error } = await supabase.auth.getUser();
    if (request !== revision) return;
    if (error && error.name !== 'AuthSessionMissingError') throw error;
    useIdentity.setState({ userId: data.user?.id ?? null, isLoading: false });
  } catch {
    if (request === revision) useIdentity.setState({
      userId: null, isLoading: false, error: 'Could not verify your account. Please retry or sign in again.',
    });
  }
}

export function useVerifiedUser() {
  const identity = useIdentity();
  useEffect(() => {
    if (started) return;
    started = true;
    supabase.auth.onAuthStateChange((_event, session) => {
      const change = ++revision;
      // Clear old account data synchronously; do not call Auth inside its lock.
      useIdentity.setState({ userId: null, isLoading: Boolean(session), error: null });
      if (session) setTimeout(() => {
        if (change === revision) void refreshVerifiedUser();
      }, 0);
    });
    void refreshVerifiedUser();
  }, []);
  return { ...identity, retry: refreshVerifiedUser };
}
