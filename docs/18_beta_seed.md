# Synthetic beta seed

27 September 2026. User named the existing pilot `mzlzxcgoxkdquoitiojm` and requested seed data. This does not turn that project into a disposable test environment or authorize destructive isolation tests.

## Contents

- Two new synthetic consumer identities at reserved `example.invalid` addresses, visibly named SYNTHETIC. No administrator identities or invitations.
- Consumer One: houses A and B. Consumer Two: house C.
- Three billing periods per house (June–August 2026): nine bill records and nine generated synthetic PNG originals, in PHP.
- One credit balance and one unknown-kWh case. All ownership remains unverified. `confirmed` is a synthetic fixture state, not evidence of human review.
- No actual bill, supplier offer, eligibility, fee or savings claim. The supplied Khmer bills are not used.

## Running

`npm run seed:beta` prints a no-network preview and reads no credentials.

Before applying, the target must have both reviewed community migrations, including `202609260001_consumer_bills.sql`, and its private `consumer-bills` bucket. The seed checks these prerequisites; it never applies migrations, changes policies, deploys or enables uploads. Migration application remains a separate reviewed step.

For the explicit seed operation only, configure the existing ignored `apps/web/.env.local` with `SUPABASE_COMMUNITY_URL`, `SUPABASE_COMMUNITY_SERVICE_ROLE_KEY`, and `BETA_SEED_TARGET=mzlzxcgoxkdquoitiojm`. Do not paste credentials into chat, put them in source, or expose the service-role key to the browser. Normal checks and app requests do not use it. Alternatively supply these environment variables through an approved secret mechanism.

Then run from the repository root:

```powershell
node --env-file=apps/web/.env.local scripts/seed-beta.mjs --apply
```

This is scoped to the exact user-named project. It creates only marked synthetic consumer identities and their records. Passwords are random and not printed or saved; these are data fixtures, not immediately usable login accounts. A user-controlled credential setup or a separate test-identity workflow is needed before interactive login testing. Do not try recovery email to the reserved addresses.

## Reruns and partial failures

Stable bill IDs and marked identity addresses make reruns skip existing rows. The script refuses unmarked identity collisions, changed memberships/roles and foreign bill/image collisions. It never overwrites existing bills, changes passwords, restores revoked access or changes existing community configuration. Completed inserts remain after a later step fails; rerun after fixing the cause. Identical orphan seed images from a prior partial run can be reused. No automatic deletion or rollback of live data is performed.

The generated images use the locked `sharp` dependency supplied by the existing Next.js installation. `npm run test:seed` checks stable IDs, account separation, schema validity, credits/unknowns and valid PNGs locally; it does not prove remote API behavior.

## Current execution status

Applied and verified on 27 September 2026 after the user confirmed the SQL migration succeeded. The authorized seed created nine bill rows and their private PNG images for two synthetic consumer identities across three accounts. Read-only verification checked exact fixture fields/periods, identity markers, active consumer roles, private bucket state and all nine image hashes. All ownership remains unverified. No emails, AI calls or application deployment occurred. Consumer-session access and cross-project tests are still pending.

Repeat the read-only check with `node --env-file=apps/web/.env.local scripts/verify-beta-seed.mjs`. This administrative consistency check does not establish RLS isolation.

Wiki impact: no new consumer feature/navigation. Fixtures use existing `/dashboard` flows once configured; CP must not describe seeded bills as real or independently verified. B02 hosted/cross-project tests remain open.

## Test login access and hosted isolation · 27 September 2026

The user authorized login setup for the two synthetic consumers. Credentials are stored only in the Git-ignored `private/beta-test-logins.json`; open that file privately, never copy it into chat, documentation or a commit. Select **My community** in the app and use the appropriate synthetic email/password. Consumer One has six bills across houses A/B; Consumer Two has three bills for house C. These reserved addresses cannot receive recovery email. Setup changes only seed-tagged identities and does not create or elevate platform administrators.

`node --env-file=apps/web/.env.local scripts/setup-beta-logins.mjs` configures these credentials. `node --env-file=apps/web/.env.local scripts/test-hosted-consumer-isolation.mjs` tests hosted access using the publishable key plus each actual consumer session; it does not use the administrative key. These explicit hosted operations are not routine offline checks.

Result: **71 assertions passed**. Both consumers could list only their expected bills without an owner filter, and download all their own images with matching hashes. Both were denied direct foreign-bill reads/updates, foreign-image downloads, signed URLs and file listings. Anonymous bill/image access was denied. The update probes used identical existing fixture values, so they could not damage content even if isolation failed. Sessions were signed out afterward. No credentials/tokens printed, no emails or AI calls.

This verifies two consumers in one project. Cross-project tokens, admin access, suspension/revocation, concurrency, browser cookies/dashboard acceptance and deployment remain separate tasks. The deployed alpha may still route authenticated users to synthetic demo pages; no new web deployment was performed.

Password recovery requires an existing account in the selected workspace. A generic successful response does not prove email delivery. The intended platform-admin account is separate from these test consumers; the local Sandz configuration remains absent. No platform-admin provisioning was performed.
