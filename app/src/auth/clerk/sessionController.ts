// Prepared migration adapter. The active application does not import this module.
// Browser identity is a UI hint; Supabase must verify the Clerk JWT and enforce RLS.
export interface ClerkSource {
  isLoaded: boolean;
  userId: string | null;
  sessionId: string | null;
  getToken: () => Promise<string | null>;
}
export interface ClerkIdentity {
  status: 'loading' | 'guest' | 'authenticated' | 'error';
  userId: string | null;
  sessionId: string | null;
  revision: number;
}
export function createClerkSessionController() {
  let state: ClerkIdentity = { status: 'loading', userId: null, sessionId: null, revision: 0 };
  let blockedSessionId: string | null = null;
  let tokenProvider: ClerkSource['getToken'] = async () => null;
  const listeners = new Set<() => void>();
  function publish(status: ClerkIdentity['status'], userId: string | null, sessionId: string | null) {
    if (state.status === status && state.userId === userId && state.sessionId === sessionId) return;
    state = { status, userId, sessionId, revision: state.revision + 1 };
    listeners.forEach(listener => listener());
  }
  function capture() {
    if (state.status !== 'authenticated' || !state.userId) throw new Error('Please sign in before accessing account data.');
    const { userId, revision } = state;
    return { userId, isCurrent: () => state.status === 'authenticated' && state.revision === revision && state.userId === userId };
  }
  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    update(source: ClerkSource) {
      // A cached SDK snapshot must not restore a session while sign-out is pending
      // or has failed. A genuinely new session can authenticate again.
      if (blockedSessionId && source.sessionId === blockedSessionId) return;
      if (source.sessionId && source.sessionId !== blockedSessionId) blockedSessionId = null;
      tokenProvider = source.getToken;
      if (!source.isLoaded) publish('loading', null, null);
      else if (!source.userId || !source.sessionId) publish('guest', null, null);
      else publish('authenticated', source.userId, source.sessionId);
    },
    clear() { tokenProvider = async () => null; publish('guest', null, null); },
    capture,
    async accessToken() {
      if (state.status === 'guest') return null;
      const request = capture();
      const token = await tokenProvider();
      if (!request.isCurrent()) throw new Error('Your account changed. Please retry.');
      if (!token) throw new Error('Could not verify your session. Please sign in again.');
      return token;
    },
    async logout(signOut: () => Promise<unknown>) {
      blockedSessionId = state.sessionId ?? blockedSessionId;
      tokenProvider = async () => null;
      publish('guest', null, null);
      const revision = state.revision;
      try { await signOut(); } catch {
        if (state.revision === revision) publish('error', null, null);
        throw new Error('Sign-out could not be confirmed. Please retry.');
      }
    },
  };
}
export type ClerkSessionController = ReturnType<typeof createClerkSessionController>;

export interface AdminDecision { userId: string; revision: number; role: 'admin' | 'customer' }
export function accessDecision(identity: ClerkIdentity, admin = false, authority?: AdminDecision) {
  if (identity.status === 'loading') return 'loading';
  if (identity.status === 'error') return 'error';
  if (identity.status !== 'authenticated') return 'login';
  if (!admin) return 'allow';
  // Only a current backend role result may inform UI access. RLS remains authority.
  if (!authority || authority.userId !== identity.userId || authority.revision !== identity.revision) return 'deny';
  return authority.role === 'admin' ? 'allow' : 'deny';
}
