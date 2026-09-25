# Project context
Last updated: 25 September 2026. Status: planning package plus public alpha prototype and connected pilot-community Supabase Auth foundation; feasibility not completed.

## Objective
Validate and, if justified, build a supplier-neutral Philippine community energy coordination platform. The package covers concept, MVP, economics, benefits, competition, pilot decisions and future vision.

## Established planning decisions
Supplier-neutral; community message board in MVP; free consumers with optional upgrades; feasibility then 1–3 community pilot; indicative 8–10 week / PHP 400k–700k build assumption. The inventory also includes bill/energy data, aggregation, supplier matching, savings dashboard and AI assistance.

## Evidence boundaries
Original documents and spreadsheet were unavailable. The prior conversation provides an artifact inventory, not complete content. All detailed requirements, model inputs beyond explicit anchors, budget allocations and gate thresholds are newly proposed. No customers, suppliers, licenses, live data, revenue or eligibility have been verified.

## Current implementation
Markdown planning documents, a standard-library Python CSV calculator, repository harness and a Next.js/React synthetic UI preview in `apps/web`. The preview implements public/About pages, role-specific demo surfaces, scripted CP help grounded in `wiki/previews/first-look.md`, editable sample-bill arithmetic, synthetic consumer-import preview and session-only board posts. The landing page includes a community/Sandz login dialog, forgot-password request and PKCE recovery callback. Supabase project `mzlzxcgoxkdquoitiojm` is connected as the pilot community; community Auth/RLS tables and two requested community identities with current database roles were created on 25 September 2026. Authenticated users still land on public synthetic role previews. The separate Sandz control project and platform-admin identity are pending. The user-supplied logo is copied unchanged and framed in the UI. It has no real dashboard persistence, live AI/API key, real bill upload or production PWA/offline support. The user-selected repository is https://github.com/mikeA911/CommunityPower; application commit `96e0442` is deployed as a Vercel alpha prototype at https://community-power-theta.vercel.app. Vercel uses Node.js 24 and the Next.js framework preset; the stable production alias is public while generated deployment URLs require Vercel authentication. Public smoke checks passed for the landing, About, Help and three synthetic role views, the wiki-backed CP endpoint, and invalid-login rejection on 25 September 2026. Supabase uses the stable alpha origin as its Site URL and permits exact local and deployed callback URLs. Fresh production recovery requests for the community-admin and consumer accounts returned HTTP 200; completing each emailed link remains an end-to-end user check. The model has 12 post-build operating months and three illustrative scenarios. Disabled optional revenue streams default to zero. Feasibility/other launch costs are unbudgeted zero placeholders.

## Next work
First implementation slice is complete locally. Continue with the trusted tenant/Auth/RLS foundation before treating demo role views as real dashboards. The demo is deliberately public and synthetic. Connect neither real accounts nor documents until the security and privacy boundaries are implemented and reviewed.

Review and edit `docs/14_product_backlog.md`: draft epics and user stories trace M01–M20, include acceptance criteria/wiki impact, and propose build slices. All stories remain unassigned/unestimated Draft; no GitHub issues were created. The user accepted the architecture as the planning baseline, with explicitly open decisions still unresolved.

Maintain `wiki/` throughout code development as CP's platform-help source. Starter guides/template and review/retrieval rules now exist; all articles are planned drafts. Behavior changes require wiki updates and representative questions in the same PR or a no-impact explanation. Publishing/retrieval, automated wiki checks and runtime evaluations are not implemented; reviewers and first supported release remain unassigned.

Assign sponsor and reviewers; identify a candidate community and meter/account structure; resolve route and authority; obtain supplier interest and comparable terms; validate demand; secure a scoped quote and operating runway. Do not treat software development as a substitute for these gates.

## Open decisions
Architecture details in `docs/13_architecture.md` remain proposed: one Supabase project per community plus a Sandz control project, separate community logins, and server-side AI adapters. The user explicitly requested AI bill reading instead of a dedicated OCR service and an API key supplied by platform_admin. CP is the main UI with permission-checked tools and structured confirmation cards. AI provider/model, hosting/secrets integration, costs, data terms and limits are unresolved; no API key has been requested or stored.

Sandz is the user-designated organization for the `platform_admin` support and maintenance role. The ontology proposes separate staff capabilities, support cases, scoped temporary access and recorded maintenance/recovery changes. Initial role grantors, independent approvers and operational policies remain to be assigned; this creates no live staff access or deployment authorization.

The proposed domain ontology is in `docs/12_domain_ontology.md`. It models consumer, community, community-scoped admin roles, and service providers with category-specific capabilities. Account authority is separate from membership, and provider self-service remains outside MVP. Community bootstrap, admin grants, account authority evidence and aggregate privacy rules remain unresolved. This is a design artifact; no application permissions are implemented.

Pilot location and community type; actual account eligibility; legal role and business entity; authority and consent; providers and fee terms; pricing; build team and detailed hosting/version choices; privacy arrangements; acquisition/support costs; moderation owner; AI provider and approved knowledge; pilot success thresholds.

## Decision log
| Date | Decision | Basis | Status |
|---|---|---|---|
| 2026-09-24 | Preserve listed planning anchors | Current user instruction | Preserved |
| 2026-09-24 | Deliver Markdown and CSV package plus calculator | Current user request; executable model added for reproducibility | Delivered planning artifact |
| 2026-09-24 | Separate feasibility and operations from build envelope | Reconstruction convention; not a recovered historical allocation | Proposed |
| 2026-09-24 | Use manual offer review/referral during MVP | Scope-control proposal | Proposed |
| 2026-09-25 | Add repository setup, automated checks, and PR/issue templates; use Python 3.14 for CI | User clarification in current task; implementation by Codex | Implemented locally; GitHub destination and remote settings pending |
| 2026-09-25 | Use mikeA911/CommunityPower as the GitHub destination | Repository URL supplied by user; empty remote confirmed with Git | Destination selected; branch protection and reviewer assignment remain pending |
| 2026-09-25 | Draft actor/action ontology with energy-first provider categories and scoped roles | User requested consumer, community, community_admin, service_providers and actions; MVP M01–M14 constrain the draft; authored by Codex | Proposed for review; no commercial authority or application behavior established |
| 2026-09-25 | Add Sandz platform admin for support and maintenance | Explicit user request; ontology v0.2 and proposed requirement M15 describe the role/actions | Role purpose preserved; detailed controls proposed; not implemented |
| 2026-09-25 | React/Next.js PWA, Supabase, separate community DBs, admin email invitations, bulk consumer imports and three dashboards | Explicit user architecture principles; documented in architecture v0.1 and M16–M18 | User-selected principles; project-per-community topology and local logins proposed |
| 2026-09-25 | CP as minimalist conversational interface; AI bill reading with Sandz-supplied API key | User correction supersedes OCR-service proposal; M11/M17/M19 and ontology v0.3 | User-selected direction; provider and implementation controls proposed; no credentials or live processing |
| 2026-09-25 | Maintain a CP wiki alongside code for platform answers | Explicit user instruction; `wiki/`, M20, architecture v0.2, agent instructions and PR checklist | Maintenance requirement established; starter content draft; publishing/retrieval design proposed |
| 2026-09-25 | Use architecture as baseline and draft editable epic/story backlog | User said architecture is OK and requested a draft to add/modify | Architecture accepted as planning baseline; backlog priorities/acceptance detail proposed for review, not implementation approval |
| 2026-09-25 | Start implementation with supplied logo, blue/yellow techno styling and CP button | Explicit user instruction; first local Next.js slice implements public and synthetic demo experiences | Implemented locally as preview-0.1.0; live Supabase/Auth/AI and full PWA remain pending |
| 2026-09-25 | Add landing-page login/sign-up modal and bootstrap three named pilot Auth identities; users establish passwords through recovery | Explicit user instruction; personal addresses stay in ignored local configuration and are not committed | Auth/recovery code and bootstrap command implemented locally as preview-0.2.0; projects and identities await local Supabase configuration; database roles/RLS remain pending |
| 2026-09-25 | Connect Supabase project `mzlzxcgoxkdquoitiojm` as the pilot community project | Project link and community-admin Supabase identity supplied by user; project dashboard inspected after user login | Community URL/publishable key stored only in ignored local configuration; Auth URL and callback configured; community migration applied; community-admin and consumer identities/roles created; control project pending |
| 2026-09-25 | Publish the reviewed alpha prototype through Vercel at `community-power-theta.vercel.app` | User requested a colleague-ready alpha and supplied Vercel project `prj_38klhZgXunLbHYOl5vojVXsSl8eH`; Vercel CLI inspection, redeployment and public HTTP checks | Commit `96e0442` deployed with Node.js 24 and Next.js preset; stable alias public, generated deployment URLs protected; Supabase stable callback configured and recovery requests accepted, emailed-link completion pending |

Add new entries with owner, evidence and status as decisions are made. User decisions take priority over this draft.
