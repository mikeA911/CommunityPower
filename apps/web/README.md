# Community Power web application

First local implementation slice, `preview-0.2.0`. Next.js App Router, React, TypeScript and a blue/yellow visual system using the user-supplied CP logo. Dashboard data remains synthetic. Public `/demo/*` routes are design-review views, not authenticated dashboards. Do not put real bills or member records in this application yet.

## Run from the repository root

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:3000. The server binds to loopback. Node 24 is required. Dependencies are pinned in the workspace package and root lockfile. Public pages and synthetic demos work without environment variables; account login and recovery fail closed until Supabase projects are configured.

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npm exec --workspace @community-power/web -- playwright install chromium
npm run test:e2e
```

Browser tests start the built application unless a local server is already running. `npm start` serves the production build locally. The development and production server use port 3000 by default.

## Implemented

- Public landing and About pages; responsive layouts, original CP branding and CP launcher.
- Landing-page access dialog with separate community and Sandz realms, invitation-only sign-up guidance, email/password login and a non-enumerating forgot-password response.
- Supabase PKCE recovery callback and new-password form. Auth routes fail closed when a realm is not configured.
- Idempotent server-only pilot-user bootstrap script. It reads personal addresses and service-role keys only from ignored local environment variables and prints role labels rather than addresses.
- Consumer, community-admin and Sandz synthetic dashboard views.
- Scripted CP help reads one explicit preview wiki source and cites its sections. No AI call, user history persistence or broad wiki retrieval.
- Editable sample-bill arithmetic/review interaction; no real uploads or verification.
- Synthetic `.example` email preview with duplicate/invalid detection and session-only staging; no email sends. One-column demo input is not a full CSV importer.
- Session-only community-board notes. All changes reset on reload or role navigation.
- Server-side Supabase clients for community login and recovery, plus fail-closed registry/issuer utilities. The single configured pilot mapping is not yet a complete multi-tenant resolver; issuer equality is not JWT verification.
- Web manifest using the original supplied asset. Dedicated square install icons, service worker/offline shell and cross-device install verification remain pending; do not claim full PWA readiness.

## Boundaries and next work

Authentication transport and recovery are now scaffolded, and the login handler reads current database role assignments after authentication. The local community project configuration is ignored by Git. `/demo/*` remains public synthetic data. Invitation acceptance, MFA, broader persistence, live AI, real bill ingestion and publishing are not implemented. Before live use, complete the trusted tenant registry, session refresh middleware and isolation tests; protect or disable demo routes in the live release.

`src/lib/supabase/server.ts` handles route-handler cookie writes for the configured Auth realms. Login verifies credentials with Supabase and reads the current database role assignment. Session refresh middleware, route guards, MFA and cross-project isolation tests must be added before protecting real records.

## Local Supabase connection and pilot accounts

Copy `apps/web/.env.example` to the ignored `apps/web/.env.local`, then add the control and community project URLs, publishable keys and service-role keys. Add the three requested addresses to the `BOOTSTRAP_*_EMAIL` variables. Never commit `.env.local` or paste a service-role key into CP chat.

Add `http://127.0.0.1:3000/auth/callback` to the Auth redirect allowlist in both projects. Then run:

```powershell
npm run bootstrap:users
```

The command creates or updates one `platform_admin` identity in the control project and one `community_admin` plus one `consumer` identity in the community project. New identities get random initial passwords that are not printed. Each person uses **Forgot password** in the matching workspace to set their own password. This bootstrap is for the named pilot operators; the production onboarding flow remains invitation-based and must create database membership/role records before granting privileges.

The supplied `public/brand/cp-logo.png` is copied unchanged from the user's CP-Logo.png. A CSS viewport frames the circular artwork without modifying the source. Brand colors: blue `#0057B7`, yellow `#FFD700`, dark-blue text and light surfaces. Provenance: user-provided asset, 25 September 2026; no supplier affiliation is implied.

Preview help lives at `wiki/previews/first-look.md`, rendered at `/help/preview`. This deliberately labeled draft is separate from the planned production publishing/index workflow. Never broaden this endpoint to arbitrary wiki paths or private articles. Keep the guide synchronized with code.

Development references checked 25 September 2026: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [PWA guide](https://nextjs.org/docs/app/guides/progressive-web-apps), [Supabase SSR clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs).
