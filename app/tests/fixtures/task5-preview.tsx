// Test-only entry. No Clerk SDK initialization and no application Supabase client.
import { useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ClerkAccess, ClerkSetupGate } from '../../src/auth/clerk/ClerkAccess';
import { createClerkSessionController } from '../../src/auth/clerk/sessionController';
import type { AdminDecision } from '../../src/auth/clerk/sessionController';
import { wishlistKey, parseWishlist } from '../../src/lib/wishlistStorage';

const session = createClerkSessionController();
Object.assign(window, { task5Session: session });
export function IdentityView() {
  const identity = useSyncExternalStore(session.subscribe, session.getSnapshot);
  const [, refresh] = useState(0);
  const ids = identity.userId ? parseWishlist(localStorage.getItem(wishlistKey(identity.userId))) : [];
  return <>
    <p data-testid="identity">{identity.userId}</p>
    <p data-testid="saved">{ids.join(',') || 'Empty wishlist'}</p>
    <button onClick={() => {
      if (identity.userId) localStorage.setItem(wishlistKey(identity.userId), JSON.stringify(['synthetic-product']));
      refresh(n => n + 1);
    }}>Save product</button>
  </>;
}
export function LoginProbe() {
  const location = useLocation();
  return <pre data-testid="login-destination">{JSON.stringify(location.state?.from ?? null)}</pre>;
}
export function Preview() {
  const navigate = useNavigate();
  const [authority, setAuthority] = useState<AdminDecision>();
  const signIn = (userId: string) => session.update({ isLoaded: true, userId, sessionId: `sess_${userId}`, getToken: async () => 'synthetic' });
  const params = new URLSearchParams(location.search);
  const env = params.has('configured') ? {
    VITE_SUPABASE_URL: 'https://database.invalid', VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: 'sb_publishable_synthetic',
    VITE_CLERK_PUBLISHABLE_KEY: `pk_test_${btoa('clerk.invalid$')}`,
  } : {};
  return <>
    <button onClick={() => signIn('user_A')}>Sign in A</button>
    <button onClick={() => signIn('user_B')}>Sign in B</button>
    <button onClick={() => session.clear()}>Sign out</button>
    <button onClick={() => navigate('/protected?source=test#summary')}>Protected</button>
    <button onClick={() => navigate('/admin')}>Admin</button>
    <button onClick={() => setAuthority({ userId: 'user_A', revision: session.getSnapshot().revision, role: 'admin' })}>Synthetic admin result A</button>
    <Routes>
      <Route path="/login" element={<LoginProbe />} />
      <Route path="/protected" element={<ClerkAccess session={session}><IdentityView /></ClerkAccess>} />
      <Route path="/admin" element={<ClerkAccess session={session} admin authority={authority}><p>Admin fixture allowed</p></ClerkAccess>} />
      <Route path="*" element={<ClerkSetupGate env={env} development={!params.has('production')} reviewed={params.has('reviewed')}><p>Initialization allowed</p></ClerkSetupGate>} />
    </Routes>
  </>;
}
createRoot(document.getElementById('root')!).render(<BrowserRouter><Preview /></BrowserRouter>);
