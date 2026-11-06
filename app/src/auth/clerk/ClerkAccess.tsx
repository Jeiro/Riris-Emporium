import { useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { accessDecision } from './sessionController';
import type { ClerkSessionController, AdminDecision } from './sessionController';
import { validateClerkConfig } from './config';
import type { PublicEnvironment } from '../../lib/publicConfig';

export function ClerkSetupGate({ env, development, reviewed = false, children }: {
  env: PublicEnvironment; development: boolean; reviewed?: boolean; children: ReactNode;
}) {
  const { issues } = validateClerkConfig(env);
  if (issues.length || !reviewed) return <main role="alert" className="container-custom py-24 text-[#5D3A1A]">
    <h1 className="text-2xl font-bold mb-4">{development ? 'Clerk setup requires review' : 'Store temporarily unavailable'}</h1>
    {development ? <>
      <p>The authentication migration is not active. Complete configuration and database review before enabling it.</p>
      <ul>{issues.map(issue => <li key={issue}>{issue}</li>)}</ul>
    </> : <p>Please try again later.</p>}
  </main>;
  return <>{children}</>;
}

export function ClerkAccess({ session, admin = false, authority, children }: {
  session: ClerkSessionController; admin?: boolean; authority?: AdminDecision; children: ReactNode;
}) {
  const identity = useSyncExternalStore(session.subscribe, session.getSnapshot);
  const location = useLocation();
  const decision = accessDecision(identity, admin, authority);
  if (decision === 'loading') return <p role="status">Loading your account…</p>;
  if (decision === 'error') return <p role="alert">Your account could not be verified. Please sign in again.</p>;
  if (decision === 'login') return <Navigate to="/login" state={{ from: { pathname: location.pathname, search: location.search, hash: location.hash } }} replace />;
  if (decision === 'deny') return <p role="alert">Admin access required.</p>;
  return <>{children}</>;
}
