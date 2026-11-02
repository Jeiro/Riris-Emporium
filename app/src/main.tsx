import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { validatePublicConfig } from './lib/publicConfig';
import './index.css';

const root = createRoot(document.getElementById('root')!);
const config = validatePublicConfig({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
});
function unavailable(issues: string[]) {
  root.render(<main role="alert" className="min-h-screen flex items-center justify-center bg-[#FAF7F2] p-6">
    <div className="max-w-xl text-[#5D3A1A]">
      <h1 className="text-2xl font-bold mb-4">{import.meta.env.DEV ? 'Store configuration required' : 'Store temporarily unavailable'}</h1>
      {import.meta.env.DEV ? <>
        <p>Check the public settings in app/.env.local, then restart the development server.</p>
        <ul className="list-disc pl-6 mt-4">{issues.map(issue => <li key={issue}>{issue}</li>)}</ul>
      </> : <p>Please try again later.</p>}
    </div>
  </main>);
}
if (config.issues.length) unavailable(config.issues);
else {
  // App and its service imports construct Supabase only after validation succeeds.
  import('./App.tsx').then(({ default: App }) => root.render(<StrictMode><App /></StrictMode>))
    .catch(() => unavailable(['The application could not start. Check the local installation and reload.']));
}
