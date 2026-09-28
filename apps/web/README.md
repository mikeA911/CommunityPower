# Community Power web application

First local implementation slice, `preview-0.2.0`. Next.js App Router, React, TypeScript and a blue/yellow visual system using the user-supplied CP logo. Public demo dashboard data remains synthetic. A separate private bill dashboard is implemented locally; see the gated enablement instructions below. Public `/demo/*` routes are design-review views, not authenticated dashboards. Do not put real bills in the public demo. Private bill ingestion remains disabled pending migration and isolation review.

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

Authentication transport and recovery are now scaffolded, and the login handler reads current database role assignments after authentication. The local community project configuration is ignored by Git. `/demo/*` remains public synthetic data. Invitation acceptance, MFA and publishing are not implemented. Private bill persistence and OpenAI ingestion are now implemented locally behind a disabled enablement switch; see below. Before live use, complete the trusted tenant registry, session refresh middleware and isolation tests; protect or disable demo routes in the live release.

`src/lib/supabase/server.ts` handles route-handler cookie writes for the configured Auth realms. Login verifies credentials with Supabase and reads the current database role assignment. Bill API routes now validate and refresh the community session and enforce active consumer membership. Broader route guards, MFA and live cross-project isolation tests remain pending.

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

## Consumer bill history (local implementation, not enabled in the deployed alpha)

`/dashboard` is the consumer login destination. Its public shell contains no records; every `/api/bills` request verifies the community session with `getUser`, active membership in the configured community, and a current consumer role. Community and Sandz admins have no default bill access. Database and private Storage policies enforce the same consumer/user boundary without service-role credentials. This implementation supports the single configured community project, not dynamic multi-community routing.

Upload one complete bill per JPEG/PNG, at most 3 MB, up to 10 selected files processed sequentially. Consumers explicitly consent before images go to OpenAI and private Storage. Responses API image input and strict JSON schema use `OPENAI_API_KEY`, optional `OPENAI_BILL_MODEL` (default `gpt-4o`), and `store:false`. This does not promise zero provider retention. Model access, cost and English/Filipino/Khmer extraction quality require deployment-specific evaluation. Failed/incomplete extractions create no bill row. A database quota allows ten read attempts per consumer per rolling one-hour window; failed attempts count. Storage/insertion failures attempt orphan cleanup; operators must audit failed cleanup without logging bill contents.

Immutable original extraction and image are retained separately from consumer corrections. Exact-image hashes catch repeated uploads; confirmed records also have a unique normalized supplier/account/period constraint. An account can have several periods and a user several accounts. History is grouped by supplier/account/currency, ordered by period, and limited to the 500 most recently uploaded records. Missing kWh remains unknown, credits remain negative, and subtotal/final payable are separate. Overlapping but nonidentical periods are not automatically merged or treated as savings.

Consumers declare their name, service address, account number and authority. Original extracted fields are compared with those declarations. Both matches and mismatches remain `unverified`: self-declaration, editable profile metadata, OCR and a possession of an image cannot establish legal authority. These records are suitable only for the user's own unverified history. Independent account-holder verification, tenant/relative evidence review, designated reviewers, retention/deletion workflow, and any supplier/aggregation use remain future work. No reviewer approval endpoint exists; consumers cannot set a verified state.

### Enablement checklist for a separately authorized release

1. Apply `supabase/community/migrations/202609260001_consumer_bills.sql` after the auth foundation in an isolated test project first. No migration was applied by this repository change.
2. Verify with synthetic identities that another consumer, suspended member, community admin, anonymous caller and a different project cannot select/update bills or read/write their images. Exercise quota concurrency and duplicate-image/period races. Review existing Storage policies for broader grants (policies combine with OR).
3. Run `npm run check:full`. Browser tests use synthetic mocked bill responses; they do not establish database isolation or live extraction accuracy.
4. Configure `OPENAI_API_KEY`, optional `OPENAI_BILL_MODEL`, and `BILL_UPLOADS_ENABLED=true` only after review, migration and live synthetic extraction checks. Current default is disabled. No keys are needed for repository checks. No deployment was performed.
5. Confirm the hosting request origin matches the canonical public origin, and test session expiry/refresh on the dashboard. Bill APIs refresh through the route-handler client; the public shell does not authorize data access.

Official implementation references checked 26 September 2026: [image inputs](https://developers.openai.com/api/docs/guides/images-vision), [structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs). This is a bounded local feature; it does not validate the Vercel key or reproduce the in-chat visual reading through the API.

## CP navigation and policy tests (27 September 2026)

The public scripted endpoint also reads `wiki/previews/navigation.json`. Demo chat, `/help/preview` and the dashboard's Ask CP panel expose public feature/navigation summaries; no private bill fields enter chat. Planned features have no action link. The catalog is draft preview material, not the production knowledge index; no personal records or privileged runbooks belong there. New features must update catalog/help and representative tests in the same change. Output tracing includes both wiki files.

`npm run test:policies` uses PGlite, an ephemeral PostgreSQL engine, to execute actual community migrations against minimal synthetic Auth/Storage schemas. Repository and CI tests include it. It validates row policies/privileges and constraints locally, not hosted API/JWT behavior, Storage object bytes, cross-project routing or concurrency. See `docs/17_beta_roadmap.md` for remaining acceptance tasks. Reference: https://pglite.dev/docs/ (checked 27 September 2026).

## Synthetic seed support

The repository provides `npm run seed:beta` (no-network preview) and `npm run test:seed` (fixture checks). See `docs/18_beta_seed.md` for the explicit apply operation and prerequisites. Two new synthetic consumers own three house accounts and nine bill/image fixtures; no records are attached to real pilot consumers. Passwords are random and not shared, so data seeding alone does not supply interactive test logins. Current status: applied on 27 September after the user ran the bill migration; nine records/images and two consumer identities passed administrative verification. Consumer-session isolation and interactive logins remain pending. No wiki/navigation behavior changes in this tooling slice.

Two synthetic consumer test logins are now configured; see docs/18_beta_seed.md and ignored private/beta-test-logins.json. The hosted consumer-session suite passed 71 assertions, independent of the service-role key. This does not imply a web deployment or completed browser/cross-project acceptance. Existing recovery semantics and CP navigation are unchanged.

## Private chat/RAG foundation

Hosted status update: the user has applied both conversation migrations. The expanded hosted suite (`scripts/test-hosted-conversation-isolation.mjs --apply --turns`, with local environment loaded) passed 69 assertions and verified cleanup. Do not rerun these migrations in the pilot. Setup instructions below apply to fresh environments. Authenticated application API/browser acceptance and deployment are not yet verified.

Foundation migration `supabase/community/migrations/202609270001_private_conversation_rag.sql` is user-applied. The local `/conversations` page uses protected `/api/conversations` and `/api/conversations/messages` endpoints for active community accounts. It supports history pagination, rename, confirmed deletion and optional recall controls. Replies are scripted from the explicitly draft preview guide, not an LLM. Public demo and dashboard quick help remain session-only.

Before running saved replies, apply `202609270002_saved_chat_turns.sql` after the foundation. This trusted-server-only RPC atomically saves a question/reply pair, checks current owner/membership, serializes with conversation deletion/recall updates, and deduplicates retries by request UUID. Existing `SUPABASE_COMMUNITY_URL`, `SUPABASE_COMMUNITY_PUBLISHABLE_KEY`, `SUPABASE_COMMUNITY_ID` and server-only `SUPABASE_COMMUNITY_SERVICE_ROLE_KEY` are used; never expose the service key to browsers. All reads, rename, recall changes and deletion use the verified user's RLS client. The service client is used only for the checked turn-saving RPC, never for retrieval. Message POST bodies ignore supplied owner/role/answer fields and generate replies on the server.

See `docs/19_private_conversation_rag.md`. Follow-up SQL application, hosted API acceptance and deployment remain pending. No embedding worker is connected and indexing must remain disabled; future embedding calls use server-side OPENAI_API_KEY. Community-admins own only their own chats; Sandz control-schema support is separate. Privacy/retention review and quota controls remain release work.

## Future service examples

/services and /services/manage are deliberately public synthetic previews, linked from the consumer dashboard and community-admin demo. Browser session storage shares example requests and added cards across the two pages in the same tab; Reset examples clears edits. No credentials, SQL migration, API or provider integration is required. Do not treat the manager preview as authorization or collect real request notes there. Production request storage, manager RLS and notification consent are separate future work.
