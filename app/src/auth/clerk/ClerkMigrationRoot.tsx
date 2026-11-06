import { useLayoutEffect, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { ClerkProvider, SignIn, SignUp, UserProfile, useSession } from '@clerk/react';
import { useNavigate } from 'react-router-dom';
import { canActivateDevelopmentClerk } from './activation';
import type { ClerkActivationReview } from './activation';
import { ClerkSetupGate } from './ClerkAccess';
import { validateClerkConfig } from './config';
import type { PublicEnvironment } from '../../lib/publicConfig';
import type { ClerkSessionController } from './sessionController';

function SessionBridge({ controller, children }: { controller: ClerkSessionController; children: ReactNode }) {
  const { isLoaded, session } = useSession();
  const identity = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  useLayoutEffect(() => {
    controller.update({ isLoaded, userId: session?.user.id ?? null, sessionId: session?.id ?? null,
      getToken: () => session?.getToken() ?? Promise.resolve(null) });
    return () => controller.clear();
  }, [controller, isLoaded, session]);
  if (!isLoaded || identity.userId !== (session?.user.id ?? null) || identity.sessionId !== (session?.id ?? null)) return <p role="status">Loading your account…</p>;
  return <>{children}</>;
}

// Staged only. main.tsx/App do not import this; keys alone cannot activate Clerk.
// Must sit inside the application's single BrowserRouter after cutover review.
export function ClerkMigrationRoot({ env, controller, review, children }: {
  env: PublicEnvironment; controller: ClerkSessionController; review?: ClerkActivationReview; children: ReactNode;
}) {
  const navigate = useNavigate();
  const config = validateClerkConfig(env);
  return <ClerkSetupGate env={env} development={import.meta.env.DEV} reviewed={canActivateDevelopmentClerk(import.meta.env.DEV, review)}>
    <ClerkProvider publishableKey={config.publishableKey}
      routerPush={to => navigate(to)} routerReplace={to => navigate(to, { replace: true })}
      signInUrl="/login" signUpUrl="/register" signInFallbackRedirectUrl="/" signUpFallbackRedirectUrl="/"
      appearance={{ variables: { colorPrimary: '#8B5A2B' } }}>
      <SessionBridge controller={controller}>{children}</SessionBridge>
    </ClerkProvider>
  </ClerkSetupGate>;
}

// Clerk's components own registration, recovery, verification and account management.
// Mount only at cutover, replacing (not alongside) the old auth forms.
export const ClerkLogin = () => <SignIn routing="path" path="/login" />;
export const ClerkRegister = () => <SignUp routing="path" path="/register" />;
export const ClerkProfile = () => <UserProfile routing="hash" />;
