# MVP specification
Status: proposed implementation detail built around preserved planning anchors.

## Product outcome
Enable one community to move from voluntary onboarding to an evidence-based offer decision and benefit tracking, without implying eligibility or savings before verification. Expand to 1–3 pilot communities after feasibility.

## Roles and permissions
| Role | Access |
|---|---|
| Member/account holder | Own records, own consent, eligible community posts, published offers, own estimates |
| Community manager | Membership coordination and approved aggregates; no default access to members’ raw bills |
| Operations reviewer | Assigned bill/eligibility reviews and offer preparation with audit logging |
| Moderator | Community post moderation; no bill access through this role |
| Sandz platform administrator | Capability-scoped support, identity/role administration, diagnostics, maintenance and recovery; case-bound, time-limited authorization for sensitive records; no default bill access |
| Supplier contact | Receives authorized opportunity summaries; no general resident database access |

## Core journey and acceptance criteria
| ID | Requirement | Acceptance evidence |
|---|---|---|
| M01 | Invite/join community and authenticate | Member cannot access another community by changing an ID; duplicate invitation handled |
| M02 | Record purpose-specific consent | Version, scope, timestamp and withdrawal recorded; supplier sharing requires its own authorized scope |
| M03 | Upload bill or enter period, kWh, total and charge components | Missing values stay unknown, distinct from zero; invalid periods and duplicate bills are flagged |
| M04 | Review and correct extracted/manual data | Original and corrected values traceable; unreviewed bill excluded from verified calculations |
| M05 | Show community participation and usage | Only reviewed, authorized records aggregate; date coverage and meter/account type visible; no claim that kWh proves demand eligibility |
| M06 | Maintain eligibility case | Status is unknown, in review, verified for stated route/date, or not eligible; reviewer evidence required for verified status |
| M07 | Compare manually entered offers | Supplier, validity, scope, rate basis, fees, taxes treatment, deposit, term, escalation, exit terms, and compensation disclosed; expired offer cannot become current silently |
| M08 | Display savings dashboard | Baseline period, included charges, calculation version and uncertainty shown; negative outcomes displayed; estimated and measured savings distinct |
| M09 | Record interest/referral | Explicit member action and consent recorded; interest is never shown as completed switching or a signed contract |
| M10 | Community message board | Members post/reply; moderators pin, hide and resolve reports; membership enforced; author and timestamp visible; no raw bill attachments in board |
| M11 | CP conversational interface and dashboard explanations | Minimalist CP chat with accessible task cards and direct controls; approved FAQs and authorized user data only; permission-checked tools; sensitive actions require payload-bound confirmation; admit unknowns; no legal eligibility decision, guaranteed savings or autonomous contracting |
| M12 | Free tier plus paid-upgrade entitlement | Free bill overview, basic comparison and board stay usable; upgrade terms visible; trial entitlement can be managed manually |
| M13 | Operations dashboard and export | Consent-aware CSV export, status filters, audit trail, and role restrictions demonstrated |
| M14 | Privacy and recovery | Access revocation tested; deletion/retention workflow documented; backup restoration demonstrated before live pilot |
| M15 | Sandz support and maintenance | Named staff and capability checks; support-case lifecycle; independently authorized sensitive access expires/revokes correctly; redacted diagnostics; maintenance and recovery changes retain approval, verification and rollback evidence |
| M16 | Admin-led invitation and bulk consumer onboarding | Sandz invites community admins by email; community admins preview/confirm consumer email imports; duplicate, revoked, wrong-identity and partial-failure cases tested; import grants no data-sharing consent |
| M17 | AI-assisted bill reading | Camera/file/manual input; configured vision AI returns structured suggestions; missing values remain unknown; consumer correction and reviewer verification are separate; payment receipts never imply missing kWh |
| M18 | Shared application with separate community databases | Shared code/migrations, trusted routing and cross-project token rejection; community-local access controls and recovery demonstrated |
| M19 | Sandz-managed AI configuration | Dedicated capability/MFA-protected secret input, server-only key storage, provider/model scope, rotation, usage limits and audit; no key in CP/logs/browser bundles; manual core tasks work without AI |
| M20 | Maintained CP platform-help wiki | Behavior changes update versioned help in the same PR or explain no impact; reviewed audience/community/release-compatible content only; CP cites sources and abstains on gaps; retrieval isolation and publication/retirement tests pass |

## Screens
The primary signed-in experience is CP chat with role-specific summaries and structured task cards. Consumer, community-admin and Sandz dashboards remain distinct permissioned views. Critical tasks are also reachable without chat. CP conversations are private and separate from the community board. Sandz AI settings use a dedicated secret form rather than the chat composer.

Sandz support queue and case details; capability-restricted platform health and maintenance history. Maintenance execution can use controlled operational tools rather than a custom deployment UI.

Landing/interest; sign-in/invite; community join and consent; bill entry/review; member dashboard; offer details/comparison; referral status; message board with report flow; AI help with human escalation; manager aggregate view; operations review queue; settings/consent/data requests.

## Data design (proposed)
See [domain ontology](12_domain_ontology.md) for the proposed actor and action vocabulary. `consumer` maps to member/account holder; `community_admin` maps to community manager; `service_provider` generalizes Supplier with energy as the initial category. Provider representatives replace the informal supplier-contact identity, while MVP submissions and referrals remain operations-assisted. Account authority and community membership are separate relationships. Provider self-service and other service categories remain future scope. The ontology adds proposed acceptance examples; they are not implemented controls.

Use stable IDs and UTC timestamps, with local display timezone explicit. Every community-scoped row carries `community_id`. Relational entities: User, Community, Membership, ConsentRecord, MeterAccount, Bill, BillLineItem, EligibilityReview, Supplier, Offer, OfferCharge, Estimate, Referral, SubscriptionEntitlement, BoardPost, BoardReply, ModerationReport, AuditEvent. Each estimate references bill/offer versions and a calculation version. Store money as fixed-decimal values and retain units; never sum currency and energy quantities. Keep private bill files outside the public web path.

## Workflow states
Bills: draft → submitted → needs correction or reviewed. Eligibility: unknown → in review → verified for a specific route or not eligible; expiry or changed facts returns it to review. Offers: draft → reviewed → published → expired/withdrawn. Referral: interest → consented handoff → supplier acknowledged → contracted → active, with evidence at each later stage. Board reports: open → triaged → actioned/dismissed with reason. Maintain history rather than overwriting material status evidence.

## Proposed architecture and boundaries
The user selected React/Next.js as a progressive web app, Supabase, and one database per community. The [architecture draft](13_architecture.md) proposes one Supabase project per community plus a Sandz control project, community-local Auth, private Storage and durable workers. The project topology and separate community logins remain proposals to confirm before implementation. CP is the primary conversational interface with structured, permission-checked actions. Compute bills and savings in deterministic code; AI extracts candidate bill fields and explains results. Use fake data for development. Do not send real bills or private conversations to an AI provider until data handling and provider terms are reviewed.

The MVP supports manually reviewed offers/referrals and user-requested AI bill reading with human confirmation/review and manual fallback. A dedicated OCR service is not planned. Automated utility integration, settlement, power procurement, wallets, energy resale, autonomous switching, unattended bill verification, native mobile apps, and a broad marketplace are outside the initial build. The message board and CP remain in scope. AI failures or exhausted allowances must fall back to direct task controls, manual entry, FAQs and human support.

## Quality and pilot release
Test role/community isolation, withdrawn consent, bad uploads, duplicate bills, missing data, expired offers, zero/negative savings, fee reconciliation, prompt injection in uploaded content, moderation abuse, and backup restore. Proposed performance target: core pages load within 3 seconds on the agreed pilot test connection for 95% of a recorded test sample; confirm a realistic load profile before implementation. Support mobile layouts, readable contrast, keyboard navigation, clear labels, and accessible error messages. Record incidents and service ownership.

Definition of done: each requirement has a demonstrated acceptance result; no unresolved critical access-control or data-loss defects; support and moderation owners assigned; pilot users have usable instructions; eligibility and commercial gates are recorded separately from software readiness. A successful demonstration does not authorize supplier contracting.

Each implemented workflow also needs reviewed, release-compatible `wiki/` help and representative CP questions. Planned starter guides are not evidence of completed behavior. Publication and retrieval follow `docs/13_architecture.md` and `wiki/README.md`.

## M21 · Consumer bill history implementation slice (26 September 2026)

Use OpenAI for first bill extraction. Support multiple bills per consumer and separate service accounts/houses. Preserve originals and extraction independently of corrected, consumer-confirmed fields. Require authenticated active consumer access and private owner-scoped Storage/database rules. Match declared name/account/address to original extraction but never equate consistency or possession with ownership. Store all initial records as unverified authority; independent verification is an unresolved release requirement for any account-authority-dependent action. Missing fields remain unknown, currency is explicit, and credits remain negative. Initial market language targets: English and Filipino (Tagalog). Local implementation is gated; migration, live isolation tests, model evaluation and release review are pending. See `apps/web/README.md` for exact limits and enablement steps.

## CP feature navigation acceptance update · 27 September 2026

M11/M20: CP must explain each implemented feature's actual location and availability, provide only existing route links, and state when a requested workflow is planned or gated. Feature navigation is not authorization. Maintain a release-specific wiki catalog and test its links/question coverage alongside UI changes. The current catalog is public draft preview material; production retrieval still requires reviewed release-compatible articles and audience/community filters. No private bills or personal data are inputs to scripted navigation help.

## M22 · Private conversation history and optional recall

Store conversations/messages under current user and community access, separately from wiki articles and structured bill/account truth. Vector recall is optional per conversation; indexing is globally disabled until provider/data-handling/worker budgets are approved. Deletion/withdrawal removes derived vectors and pending work; stale workers cannot restore them. No default admin access. Local history APIs/UI now support private saved scripted exchanges, rename, pagination, confirmed deletion and recall controls. Trusted assistant writes must be atomic with the user's question and deduplicated on retry; the browser cannot supply owner, assistant content or role. Follow-up SQL application, hosted API verification, deployment, worker, retrieval integration, retention policy and Sandz adaptation remain pending. See docs/19_private_conversation_rag.md.

## M23 · Future service interest preview

Provide a dashboard entry to future-service cards with brief descriptions and explicit unavailable status; demonstrate optional consumer notes and a manager request list/add-service modal. This slice is synthetic browser-only, never a real order, notification or provider commitment. Before production, require community-scoped request storage, authenticated consumer/manager boundaries, retention and communication decisions. Preserve energy-first MVP scope.
