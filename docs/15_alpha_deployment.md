# Alpha deployment runbook

Version 0.2 · 25 September 2026 · Vercel/Supabase colleague preview

## Intended release

This release is an **alpha prototype** for invited colleagues. It demonstrates the public site, blue/yellow CP interface, synthetic role dashboards, community login and password recovery. Dashboard data, bill review, consumer import, board posts and CP answers remain synthetic or session-only. It is not a production energy service and must not receive real bills, account numbers, AI keys or confidential agreements.

The reviewed application commit `96e0442` is deployed at `https://community-power-theta.vercel.app`. Public HTTP checks passed for the landing page, About, Help and all three synthetic dashboard routes on 25 September 2026. The CP preview endpoint returned a wiki-grounded response, and a synthetic invalid login returned HTTP 401. Supabase now uses the stable alpha origin as its Site URL and allows exact local and deployed callbacks. Fresh recovery requests for both community accounts returned HTTP 200; each recipient still needs to complete the emailed link to finish the end-to-end recovery check.

The pilot-community Supabase project is connected. Its community-admin and consumer Auth identities have current database role assignments. The separate Sandz control project and platform-admin identity are not connected, so the Sandz dashboard remains a public synthetic preview.

## Vercel project settings

Import `mikeA911/CommunityPower` into Vercel and use:

| Setting | Value |
|---|---|
| Framework | Next.js |
| Root Directory | `apps/web` |
| Node.js | 24.x |
| Install command | automatic (`npm install`/lockfile detection) |
| Build command | `next build` (package default) |
| Output directory | automatic (`.next`) |

The repository is an npm workspace with its lockfile at the repository root. Vercel supports selecting an app directory in a monorepo. The Next.js configuration traces the CP preview wiki from the repository root into the required server routes.

## Runtime environment variables

Set these for the alpha environment:

| Variable | Value/source |
|---|---|
| `SUPABASE_COMMUNITY_ID` | `pilot` |
| `SUPABASE_COMMUNITY_URL` | Pilot-community project URL |
| `SUPABASE_COMMUNITY_PUBLISHABLE_KEY` | Project publishable key |
| `PUBLIC_SITE_URL` | Exact stable HTTPS URL colleagues will use |

Do **not** add service-role keys, bootstrap email variables, personal data or an AI provider key to Vercel for this alpha. The running web app does not need a service-role key. Keep `SUPABASE_CONTROL_*` unset until a separate Sandz control project exists.

For an initial preview before `PUBLIC_SITE_URL` is known, the callback builder can use Vercel's system deployment URL. Set the stable URL before sending further password-reset emails.

## Supabase Auth URLs

After Vercel assigns the stable alpha URL:

1. Set Supabase **Site URL** to that exact HTTPS origin.
2. Keep `http://127.0.0.1:3000/auth/callback` for local development.
3. Add `<stable-alpha-origin>/auth/callback` as an exact redirect URL.
4. Add a Vercel preview wildcard only if branch previews need Auth. Prefer an exact production callback for the colleague alpha.
5. Send new recovery links after the URL change; previously issued local links continue to point to localhost.

## Access and presentation

The app sets `robots: noindex, nofollow`, but that is not access control. Choose one:

- Share a public production URL with a small trusted colleague group and no real data.
- Use Vercel Deployment Protection for a preview URL; colleagues may need appropriate Vercel access depending on the selected protection method and plan.

Keep the on-page development labels. Explain that role selection and `/demo/*` are public design-review tools, while the two community Auth identities are only the start of the protected application. Do not present the Sandz view, synthetic calculations or session-only workflows as live operations.

## Release checks

Before sharing the URL:

- GitHub checks pass: typecheck, lint, domain tests, build, browser tests and planning-model checks.
- No tracked `.env*`, personal email, secret key, bill or private document exists.
- Landing page, About, Help and all three synthetic dashboard routes load on mobile and desktop.
- Community login rejects the wrong password and reads the current database role after successful authentication.
- A fresh recovery email returns through the deployed callback and updates a password.
- CP help loads its bundled preview wiki source in the deployed function.
- Supabase Auth and application logs contain no tokens or email addresses beyond the intended Auth records.
- The shared URL and its alpha limitations are recorded in `codex/PROJECT_CONTEXT.md` after deployment.

## Known alpha limitations

- `/demo/*` is public and uses synthetic data; Auth does not protect those routes yet.
- Sandz control Auth, platform-admin identity, MFA, session refresh middleware and route guards are pending.
- No durable board/import/bill data, real AI, bill upload, service worker/offline shell or production email sender.
- No feasibility, supplier relationship, household eligibility, savings or commercial terms are established by this deployment.

Technical setup references: Vercel monorepo, environment-variable and deployment-protection documentation; Supabase Auth redirect URL documentation; Next.js output file tracing documentation. Links are maintained in the architecture sources and deployment review notes.
