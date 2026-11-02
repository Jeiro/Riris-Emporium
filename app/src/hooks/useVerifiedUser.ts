import { useEffect } from 'react';
import { initializeVerifiedUser, refreshVerifiedUser, verifiedSession } from '../lib/verifiedSession';

export function useVerifiedUser() {
  const identity = verifiedSession();
  useEffect(initializeVerifiedUser, []);
  return { ...identity, retry: refreshVerifiedUser };
}
