# Development workflow

Step 1 · 6 November 2026

Complete the website before customer launch. `ARCHITECTURE.md` records the agreed design; Task reports are historical evidence. The older root README contains obsolete React/backend/schema/security claims and setup advice. Use this workflow and the current architecture until that README is revised in a focused documentation task.

## Local setup

The frontend package is `app/`; npm is selected by `package-lock.json`. There is no server installation/start command. Use Node 22.23.1 (the tested runtime) or a separately validated compatible release. The service audit tests use Node module hooks and type stripping; an older Node release may fail even if Vite starts.

```bash
cd /mnt/fedora-storage/Riris-Emporium
git switch store-improvements
git status --short
cd app
npm ci
npm run build
npm test
```

`npm ci` uses the existing lockfile. Do not upgrade dependencies, regenerate the lockfile gratuitously or run `npm audit fix --force`. If installation runs out of space, inspect `df -h`, `df -i` and scoped `du` output; remove only identified disposable installation/cache files after review. Never clean unrelated projects, Git history or local configuration.

Do not overwrite an existing `.env.local`. For a new setup, copy `app/.env.example` to `app/.env.local` only if no local file exists, then substitute the **approved development** public settings. Placeholders intentionally do not enable a live application. Without approved settings, the development setup screen is expected. Do not use the currently configured Supabase project just because its URL exists.

After the development target is approved:

```bash
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Normal manual browsing contacts the configured backend. Approval for local tests does not authorize using production accounts or unverified services. The isolated browser suites described below are the current safe testing path.

## Environment separation

| Environment | Accounts/data | Configuration |
| --- | --- | --- |
| Isolated automated tests | Synthetic identities, products and in-memory mocked writes | Synthetic public strings; external requests intercepted. No actual Clerk initialization or SQL execution. |
| Authorized development | Confirmed Clerk development instance and Supabase development project; synthetic accounts/data only | Explicitly approved project/issuer, reviewed schema/RLS and allowed test operations. Identity and authorization still pending. |
| Preview deployment | Development services only, access restricted until reviewed | Vercel preview scope, preferably branch-specific. Never inherit production keys/data. No preview deployment is authorized by Step 1. |
| Production | Approved production Clerk/Supabase pair; real records only after launch approval | Separate production scope. Activation, migration, release and rollback require explicit review. |

Public frontend names:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, or alternative `VITE_SUPABASE_ANON_KEY`
- `VITE_CLERK_PUBLISHABLE_KEY` for the inactive replacement

No `VITE_FLUTTERWAVE_PUBLIC_KEY` is needed. Do not place Clerk secret keys, service-role keys, signing secrets, database passwords or SMTP credentials in frontend variables. Future backend provisioning secrets must be separately reviewed and stored server-side; none is requested here. The legacy `server/.env.example` does not define the current architecture.

`.env`, `.env.local`, `.env.*` and nested local variants are ignored; only `.env.example`/`.env.*.example` templates are allowed. Ignore rules do not protect a file already tracked or remove history. Before staging, inspect names/status and run `git check-ignore app/.env.local`; never print environment values into reports. Rotate/revoke previously exposed privileged credentials outside the app if still outstanding. Do not force-push/rewrite history as an automatic response.

## Branch and checkpoint rules

- `main`: production-ready, reviewed releases only. No unfinished features or unreviewed migrations.
- `store-improvements`: ongoing development/integration; local checkpoints are not release approval.
- Optional short-lived feature branches: larger isolated changes, integrated after tests/review.
- Preserve existing work and reports. Check status/diff before editing; never use `git reset --hard`, blanket clean, force push or restore unknown changes.
- Keep major tasks reviewable and checkpoint after build/relevant tests, diff/security review and documentation. Prefer explicit file staging. Shared code/test changes may stay in one coherent commit rather than forcing an unsafe historical split.
- No direct production edits, unreviewed SQL or credentials in Git. A request to commit does not authorize pushing, merging, deploying or switching authentication.

Review commands:

```bash
git status --short
git diff --stat
git diff --check
# Stage only reviewed paths, then inspect:
git diff --cached --stat
git diff --cached --check
git diff --cached
```

Review untracked files explicitly: ordinary `git diff` does not include them. Exclude `.env.local`, dependency/build folders, logs, browser profiles, screenshots and machine-specific test outputs. Check that staged files match the tested working tree before committing. Do not disable hooks or skip checks to force a commit. Step 1 accepts documented pre-existing lint failures for a local checkpoint only.

## Test commands and evidence

```bash
cd /mnt/fedora-storage/Riris-Emporium/app
npm run build
npm test
npm run lint
cd ..
git diff --check
```

Baseline: 61 individual unit/service checks, 58 browser groups, 63 lint errors/4 warnings. `npm test` may report seven passing files rather than individual assertions on this runtime. To inspect individual checks, run each `tests/*.test.mjs` in its own process with `node --experimental-strip-types`; do not share the audit module hooks across tests. Some tests named “known gap” intentionally reproduce defects. They are evidence, not successful live workflows.

Capture ESLint JSON and compare findings by relative file/rule/severity/message, not just total counts. Preserve all regressions, introduce no additional lint findings, and leave unrelated cleanup for its own task. Never call a known failing lint run a pass.

All six browser commands must remain available:

```bash
npm run test:browser
npm run test:browser:cart
npm run test:browser:whatsapp
npm run test:browser:config
npm run test:browser:task5
npm run test:browser:beta
```

Use `app/tests/README.md` for driver setup. Existing tooling is outside app dependencies at `/home/dragneel/Documents/riris-browser-tools/node_modules/playwright-core/index.mjs` and uses installed Chrome. On another machine install the documented driver separately; do not alter app dependencies for this.

For safe reproduction, create a disposable copy of `app/` excluding `node_modules`, `dist`, **all `.env*` files** and build caches. Install from its unchanged lockfile, or link the already installed matching dependency directory. Give that copy a synthetic `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://synthetic-local.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_synthetic_local
```

These are test fixture strings, not replacement production credentials. Start a fresh Vite server from the copy on an unused local port. Set `TEST_ORIGIN`, `PLAYWRIGHT_MODULE` and a writable `TEST_OUTPUT` separately for each suite. The configuration suite starts/closes its own servers. Never use that synthetic server for unmocked integration tests. Do not reuse a hot-reloaded server for race suites after source changes because duplicate module URLs can invalidate the fixtures.

All external application requests must be intercepted. Synthetic mutations occur only in fixture memory; WhatsApp open is recorded, not sent. Passing browser tests do not verify RLS, real customer signup/recovery, Storage policies, manual message delivery or deployed routing. Store evidence outside the repository and record scope/failures honestly. Stop only the test servers you started when finished.

## Coding and migration conventions

Preserve the current visual design and project structure unless a task explicitly changes them. Keep UI composition in pages/components, database payload/error handling in services, state coordination in hooks/stores and pure validated logic in `lib`. Use existing TypeScript contracts and explicit writable-field lists. Fail closed on ownership or identity ambiguity; invalidate delayed private-data results on account/session changes. Do not replace unavailable features with fake success.

Distinguish the stable UUID store identity from the Clerk subject. No dual active Auth systems, guessed profile APIs or editable client admin authority. Review all legacy dependencies together at cutover. Preserve cart/wishlist/order race tests and WhatsApp-only behavior. Do not create confirmed orders merely because a customer opens the draft.

`docs/task5/inspect-development.sql` is a proposed read-only metadata inspection; it requires target/scope approval before execution. `rls-policy-proposal.sql` is entirely commented and not a runnable migration. Review exports, existing grants/policies, account links, backup and rollback before producing/applying executable migrations. Maintain separate schema/RLS test evidence using synthetic development identities. Never run these proposals against an unverified URL.

## Future release and rollback

After the entire site is complete and a release is approved, verify the Vercel project root `app`, Vite build, `npm ci`, output `dist`, production branch `main` and preview branch `store-improvements`. Scope public environment values by environment and rebuild after approved changes. `app/vercel.json` retains SPA fallback; verify assets, direct refresh and unknown routes after an authorized preview. Local Vite tests do not prove Vercel behavior. [Vercel Vite documentation](https://vercel.com/docs/frameworks/frontend/vite).

A preview uses a production bundle; the current staged Clerk guard intentionally denies it. Step 2 must design and review environment activation before any deployment. No project/dashboard settings were changed here.

Record the approved commit/artifact, environment scope and schema/policy version. Rehearse rollback in development. If a future release fails, stop new registrations/writes as needed before restoring the compatible artifact/configuration. Never restore broad insecure grants, delete new customer records or assume legacy Supabase Auth is compatible with Clerk-only records. Preserve UUID relationships and mapping exports; reconcile records before any schema rollback. For local work, revert reviewed commits/hunks while preserving later changes rather than deleting the working tree.

Step 1 stops at local checkpoints. Step 2 needs a separate request and the prerequisites listed in `STEP1-REPORT.md`.
