import type { ClerkSessionController } from './sessionController';

export interface StoreProfileLink { id: string; clerk_subject: string }
export type LoadStoreProfile = (subject: string) => Promise<StoreProfileLink | null>;

// Prepared boundary only; no invented RPC/schema query. The approved backend must
// derive the caller from its verified JWT and enforce the mapping through RLS.
export async function resolveStoreIdentity(session: ClerkSessionController, loadProfile: LoadStoreProfile) {
  const request = session.capture();
  const profile = await loadProfile(request.userId);
  if (!request.isCurrent()) throw new Error('Your account changed. Please retry.');
  if (!profile || profile.clerk_subject !== request.userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(profile.id)) {
    throw new Error('Your store profile is not ready. Please contact support.');
  }
  return { clerkSubject: request.userId, customerId: profile.id, isCurrent: request.isCurrent };
}
