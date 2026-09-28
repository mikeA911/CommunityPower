# Controlled beta roadmap and task tracker

Updated 27 September 2026. User authorized starting this work and maintaining task, README, planning and CP navigation documentation. This is a development roadmap, not a production/pilot launch authorization. The existing 8–10 week / PHP 400k–700k assumptions are not estimates of remaining effort.

## Target

Invitation-only bill understanding, private history, CP help and a community board, with useful free consumer access. Initial language targets: English and Filipino (Tagalog). Begin with synthetic development and verification; real participant data requires the privacy gate. Commercial offers, referrals, charging and switching remain subject to feasibility and separate authorization. These beta boundaries do not delete broader MVP stories.

## Status and evidence

Prepared = code/document exists but required verification is incomplete. Local verified = repository checks demonstrate the stated local scope. Hosted verified = dedicated environment evidence exists. Released = separately authorized deployment and acceptance. Never infer later states from earlier ones. Test fixtures and screenshots must be synthetic. Named product/security/privacy reviewers remain unassigned; Codex is the implementation contributor, not an approver.

| ID | Task / backlog mapping | Status | Exit evidence / next dependency |
|---|---|---|---|
| B01 | Execute migration and owner/role policy tests (CP-0104, CP-1401) | Local verified | Ephemeral PostgreSQL runs actual migrations; owner success, cross-user/admin/anonymous/suspended denial, immutable extraction, duplicates and quota checks. Hosted service tests remain B02. |
| B02 | Hosted isolation and session validation (CP-0102, CP-0303, CP-1401) | Partial: 71 same-project consumer assertions passed | Two synthetic communities; real JWT issuer/session expiry/revocation, Storage upload/download/overwrite, direct APIs, concurrent quotas and duplicate races. User authorized additive synthetic seed preparation for the named pilot (B02a); this does not authorize destructive tests or make the pilot disposable. |
| B02a | Synthetic data seed for the user-named pilot | Applied; administrative verification passed | User confirmed SQL migration. Seed created two consumers, three accounts, nine bill rows/images. Read-only checks verified fields, identity/role markers, private bucket and nine image hashes. No emails/AI calls. Consumer-session and cross-project isolation remain B02. See docs/18_beta_seed.md. |
| B03 | Bill capture and persistent history (CP-0801–CP-0803, M21) | Local implementation; hosted unverified | Current JPEG/PNG upload/review/history and mock browser tests exist. Next: synthetic provider call, manual entry fallback, durable jobs/retries, field evaluation by language/layout, period trends and correction history. |
| B04 | Account authority review (CP-0601–CP-0602) | Planned | House/account entities; evidence policy; assigned reviewer and decisions/history; disputes/expiry. All current records remain unverified. |
| B05 | Privacy, consent and record lifecycle (CP-0603–CP-0604, V08) | Planned; blocks real-data beta | Reviewed notices/data handling, versioned consent, withdrawal, export/deletion requests, retention and file cleanup. Name privacy owner. |
| B06 | Invitations and access lifecycle (E03/E04) | Partial Auth; onboarding planned | Consumer/admin invitation acceptance, logout/recovery, suspension, anti-escalation; privileged MFA and Sandz control setup. Authorized synthetic delivery before real invites. |
| B07 | Persistent board and moderation (E10) | Synthetic only | Persist posts/replies; active membership, reports, scoped moderators, reasons/audit; name moderator. |
| B08 | CP feature/navigation coverage (E05/E09) | Preview locally verified; production pending | Wiki-backed public preview catalog, actual route links, dashboard help, unsupported-action abstention, coverage tests. Production publisher/role filtering and reviewed English/Filipino articles still pending. |
| B09 | AI operations (E07) | Partial | Per-user quota exists; add community/global budgets, redacted diagnostics, disable/rotation procedure and outage fallback. No consumer key-entry screen. |
| B10 | Beta operations and acceptance (E13/E14) | Planned | DB plus object restore, revoked-access reconciliation, support/incident owners, mobile/accessibility checks, critical defects closed and release record. |
| B11 | Keep planning and help synchronized | Ongoing | Every implementation change updates this tracker, relevant wiki/catalog, README when setup/status changes, and context/requirements when behavior changes. |

## Working order

1. B01 local checks and B08 preview catalog/navigation coverage are complete; preserve them in CI as features expand.
2. Run B02 in an isolated Supabase test environment, then B03 provider extraction with synthetic documents. Do not enable real uploads just because the interface works.
3. Complete B04/B05, followed by B06. Run privacy review alongside synthetic engineering.
4. Complete B07 and the reviewed-help portion of B08, then B09/B10 and the separate release decision.

## Release gates

- No critical access or data-loss defects; direct database/Storage and cross-project tests pass.
- New invited consumer completes login → upload/manual fallback → review → persistent account-specific history on mobile; access revocation takes effect.
- Current ownership status is explicit; any verified authority has independently reviewed evidence. No unverified records enter sharing/eligibility/commercial workflows.
- Approved data notices, consent and retention/deletion handling; named support and moderation owners.
- CP covers shipped features and real navigation from release-compatible reviewed help; unknown/planned features are labeled, not invented. Direct tasks still work during AI failure.
- Restore rehearsal includes files and DB. Deployment, privacy and feasibility evidence are linked in the release record. Relevant gates in docs/04_go_no_go.md and docs/08_validation_register.md remain in force.

## Work log

- 26 September: bill ingestion/history code and private-storage migration prepared; type/lint/build/model checks, eight domain tests and nine browser tests passed. Browser bill flows were mocked; no live extraction, bill migration or deployment occurred.
- 27 September: B01 local policy harness passes 39 assertions against actual migrations; fixed a nullable end-date constraint that permitted an incomplete confirmed record. B08 public preview catalog covers 15 feature areas; existing-route and planned-action checks pass; dashboard and demo CP show links and accurate draft wiki versions. Type checking, lint, nine domain tests, production build, model/snapshot checks and ten browser tests passed (`npm run check:full`, plus the expanded `npm run test:policies`). Hosted JWT/Storage, live provider extraction, independent review and release remain pending. No live migration/deployment or private bill processing occurred.

## Verification commands

`npm run test:policies` executes actual community migrations against disposable in-memory PostgreSQL with minimal synthetic Auth/Storage schemas. It does not authenticate real JWTs or run the Supabase Storage HTTP service. `npm run check:full` runs repository and browser checks; hosted acceptance remains separate.

Planning sources: docs/07_delivery_plan.md, docs/14_product_backlog.md, apps/web/README.md, codex/PROJECT_CONTEXT.md. Wiki impact: preview guide/catalog and CP navigation; production articles remain unreviewed drafts.

27 September hosted login milestone: two seed consumers now have private test credentials; 71 live consumer-session assertions passed for own bills/images and cross-user/anonymous denial. Setup credentials remain in ignored private storage. No deployment; browser, cross-project, admin and suspension scenarios are not claimed tested. A reported recovery issue was diagnosed as an absent intended admin identity in the community project and missing local control-project configuration; no new admin role was granted.

## B12 · Private chat history and recall (27 September 2026)

Latest hosted milestone: user confirmed saved-turn SQL application. `node --env-file=apps/web/.env.local scripts/test-hosted-conversation-isolation.mjs --apply --turns` passed 69 assertions. The optional `--turns` mode uses the server credential only for scoped synthetic saved-turn RPC checks; consumer sessions verify resulting rows and cross-owner denial. Invalid reply insertion rolled back the question, retries did not duplicate messages, mismatched owners and direct consumer/anonymous RPC calls were denied. Temporary conversations and all their messages were removed and cleanup verified. No indexing changes, provider calls or deployment. Authenticated application API/browser verification remains pending; worker integration follows persistence acceptance. Wiki impact: verification only; local feature/navigation guidance is unchanged.

Current slice: saved scripted CP conversation APIs/UI implemented locally at `/conversations`, including new chats, rename, paginated history, confirmed deletion and optional recall. Follow-up migration `202609270002_saved_chat_turns.sql` is prepared for atomic trusted assistant writes and retry deduplication; hosted application and web deployment remain pending. User-session RLS governs all reads/controls; no worker or OpenAI requests are enabled. CP draft guidance updated with actual navigation and remaining limits. Next gate: apply the follow-up migration, verify authenticated API/browser flows, then implement the bounded embedding worker.

Saved-history verification: `npm run check:full` passed type checking, lint, nine domain tests, 39 bill-policy assertions, two seed tests, 60 conversation/vector/queue assertions, production build, model/snapshot checks and 13 Chromium tests. New browser flows use synthetic API mocks; anonymous/origin-denial requests exercise the real local endpoints. Windows Playwright server cleanup was manual after all tests passed. The tests cover saved history reload, retry UUID reuse, rename, recall on/off, deletion confirmation/cancellation, older messages and mobile error handling. No hosted saved-turn RPC or authenticated web/API claim is made until the follow-up migration and integration verification.

Initial preparation log (superseded by hosted and implementation updates): database migration prepared and locally tested. User requested Supabase conversation/message/vector tables, access policies and indexing queue. `docs/19_private_conversation_rag.md` records the OpenAI text-embedding-3-small / 1536 candidate, disabled global indexing, per-conversation opt-in and deletion rules. Actual pgvector tests run via `npm run test:rag`; no real chats or embedding calls used. No automatic production release or Sandz control migration.

Local verification: 48 private conversation/vector/queue assertions, 39 bill policy assertions, nine domain tests, two seed tests and ten Chromium browser tests passed, along with type checking, lint, production build and model/snapshot checks. CP's draft preview catalog now covers 16 feature areas and correctly describes private recall as planned. These checks do not establish hosted RAG isolation or English/Filipino retrieval quality.

`npm run check:full` exited successfully; the Windows Playwright server required manual process cleanup after all browser tests passed.

Hosted follow-up, 27 September: user reported successful SQL application. `scripts/test-hosted-conversation-isolation.mjs --apply` passed 44 checks using two existing synthetic consumer sessions and the publishable key only. Own conversation/message reads succeeded; cross-owner access, forged assistant messages, client vector writes, queue/settings/worker access and anonymous access were denied. The empty private-search RPC succeeded. Temporary conversations and messages were removed and cleanup verified. No opt-in, indexing changes, service-role use, OpenAI calls or deployment. Hosted populated-vector retrieval, queue lifecycle, admin/suspension and concurrency remain pending. Next implementation slice: authenticated chat persistence and conversation controls, followed by the bounded embedding worker. Wiki impact: no new consumer navigation or behavior; existing planned/session-only guidance remains accurate.

## B13 · Future-service showcase · 28 September 2026

Implemented locally: consumer dashboard button, /services catalog with five illustrative future services, optional request-note modal, /services/manage with sample requests and Add service modal, and community-admin dashboard link. Consumer-created examples and manager-added cards share browser session storage in the same tab. Reset restores fixtures. No backend, private manager access, notifications, provider partnerships or service launch. CP navigation and draft guides updated; deployment pending. Verification results recorded below after checks.

B13 verification: npm run check:full passed type checking, lint, nine domain tests, 39 bill-policy assertions, two seed tests, 60 conversation/vector/queue assertions, production build, model checks and 15 Chromium tests. New browser coverage verifies dashboard links, consumer notes appearing in the manager example, manager-added cards returning to the consumer catalog, reload/reset and mobile Escape cancellation/no horizontal overflow. Windows Playwright server required cleanup after tests completed. No hosted changes or deployment.
