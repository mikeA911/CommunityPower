# Community Power features, epics and user stories

Draft v0.1 · 25 September 2026 · For sponsor review and editing.

The user accepted the [architecture](13_architecture.md) as the planning baseline and requested this backlog. Stories translate that design and [MVP requirements M01–M20](02_mvp_specification.md) into reviewable work. Priorities, story boundaries and sequence below are proposals. All stories are **Draft**, unassigned and unestimated; none is implemented or automatically approved for release. Explicit open architecture and feasibility decisions remain open.

## How to edit this draft
Implementation began on 25 September 2026. `apps/web` delivers an initial synthetic preview covering parts of CP-0103, E02, CP-0501–CP-0503/CP-0505, and sample flows related to E04/E08/E10. Scripted preview help is connected to `wiki/previews/first-look.md`; production E09 is not complete. Stories are not marked Done: no live Auth, databases, invitations, RLS, AI or real-data workflows have been connected. See `apps/web/README.md` for the exact implemented boundary.


Refer to an ID when changing scope, for example: “Move E10 to the first demo,” “Split CP-0803,” or “Add a consumer story for …”. Keep existing IDs stable; mark removed stories Deferred or Dropped rather than reusing their IDs. Add new stories under the relevant epic.

- **MVP:** proposed functionality or operational work required for the initial pilot.
- **Later:** candidate extensions, listed separately; excluded from the initial build.
- **Blocked:** use when a specific decision or evidence prevents a story from progressing; synthetic prototyping may still be possible.
- Suggested status progression: Draft → Ready → In progress → Review → Done. Ready means scope, dependencies, owner and acceptance criteria are agreed. Done requires demonstrated behavior and reviewed help, not just merged code.

Add a named owner, estimate and target iteration when a story becomes Ready. No dates or story points are invented here. The existing 8–10 week / PHP 400k–700k figures remain indicative assumptions and need re-estimation against the agreed scope.

## Feature overview

| Epic | Feature / outcome | Primary users | Scope | Requirements |
|---|---|---|---|---|
| E01 | Shared PWA and isolated community environments | All users, Sandz | MVP | M01, M14, M18 |
| E02 | Public website and community entry | Visitors | MVP | Product outcome, M01 |
| E03 | Admin invitations, login and role lifecycle | Consumers, community admins, Sandz | MVP | M01, M15, M16 |
| E04 | Consumer imports and membership coordination | Community admins, consumers | MVP | M01, M16 |
| E05 | CP assistant and three minimalist dashboards | Consumers, community admins, Sandz | MVP | M11, M13 |
| E06 | Account authority, consent and privacy | Consumers, reviewers | MVP | M02, M03, M14 |
| E07 | Sandz AI configuration and usage controls | Sandz | MVP | M15, M19 |
| E08 | AI-assisted bill capture, correction and review | Consumers, reviewers | MVP | M03, M04, M17 |
| E09 | CP wiki and grounded platform answers | All users, knowledge editors | MVP | M11, M20 |
| E10 | Community board and moderation | Consumers, community admins, moderators | MVP | M10 |
| E11 | Opportunities, eligibility, offers and benefits | Consumers, admins, reviewers, provider contacts | MVP | M05–M09, M13 |
| E12 | Free features and optional upgrade entitlements | Consumers, Sandz | MVP | M12 |
| E13 | Sandz support and maintenance | All users, Sandz | MVP | M13–M15 |
| E14 | Quality, recovery and pilot readiness | Delivery team, Sandz, sponsor | MVP | M14, M18, M20; cross-cutting |

## E01 — Shared PWA and community isolation

**Outcome:** one maintained application serves communities without mixing their data or sessions.

| Story | User story | Acceptance criteria |
|---|---|---|
| CP-0101 | As Sandz, I want to provision a community from a shared baseline so each community has its own environment. | Community project has standard schema, RLS, private Storage and configuration; provisioning records status/failures; it stays unavailable until baseline checks pass. |
| CP-0102 | As a member, I want my community URL to open only my community so my information stays isolated. | Trusted host selects the configured project; unknown host, wrong-project token and foreign resource IDs fail; concurrent requests cannot swap clients or credentials. |
| CP-0103 | As a user, I want an installable, mobile-friendly app so I can use it comfortably on my phone. | Manifest/icons and supported-browser installation work; ordinary browser use works; private pages, chat and files never enter offline caches; offline state explains unavailable actions. |
| CP-0104 | As a maintainer, I want one migration/release process so communities receive consistent updates. | Control/tenant migrations are versioned separately; clean install and upgrade fixtures pass; schema version is recorded; incompatible tenant operations are blocked during a failed rollout. |

**Dependencies / decisions:** domain, hosting, Supabase organization/region, project topology and runtime versions; use two synthetic tenants for isolation tests. **Wiki:** platform availability, installation and separate-community login guidance; Sandz provisioning/update runbooks.

## E02 — Public website and community entry

**Outcome:** visitors understand Community Power and can find the correct next step.

| Story | User story | Acceptance criteria |
|---|---|---|
| CP-0201 | As a visitor, I want a clear landing page so I understand the platform's purpose. | Explains bill understanding, voluntary coordination, comparison and board; preserves supplier neutrality; no guaranteed savings, verified-partner or eligibility claims without scoped evidence. |
| CP-0202 | As a visitor, I want About, How it works and FAQ pages so I understand who operates the platform and what to expect. | Uses sponsor-provided or reviewed copy; Sandz support role is clear; planned features are labeled; draft legal/privacy text is not presented as approved. |
| CP-0203 | As a visitor, I want sign-in and inquiry entry points so I can join the appropriate process. | Sign-in routes to a known community; no public member directory; inquiry shows an approved contact process; inquiry does not create membership or send outreach automatically. |

**Dependencies / decisions:** final copy, organization/contact details and approved notices. **Wiki:** overview and joining guidance; public FAQs use the same reviewed knowledge as CP.

## E03 — Admin invitations, login and role lifecycle

**Outcome:** people receive only the account and roles they are authorized to hold.

| Story | User story | Acceptance criteria |
|---|---|---|
| CP-0301 | As a Sandz platform admin, I want to invite a community admin using their supplied email so they can manage the verified community. | Records authority basis and target community; server initiates Supabase invitation; records pending role and delivery/reconciliation state; neither CP nor client metadata can select an unauthorized role/project. |
| CP-0302 | As an invited user, I want to activate my invitation so I can access my assigned role. | Verifies the intended Auth identity; valid invitation activates exactly once; expired, revoked, replayed or wrong-identity acceptance fails; existing Auth users retain their identity. |
| CP-0303 | As a user, I want reliable login, logout and recovery so I can regain legitimate access. | No access from an Auth account alone; verified sessions and current membership checked; logout/recovery tested; privileged operations require MFA; no password or login token appears in CP/logs. |
| CP-0304 | As an authorized Sandz admin, I want to grant or revoke scoped roles so access follows responsibility. | Grants require delegation authority and evidence; no self-approved elevation; revoked roles lose access despite an unexpired session; changes are audited; community admin cannot grant platform roles. |

**Dependencies / decisions:** E01, initial Sandz grantor, admin identity evidence, SMTP/sender, login method and invitation expiry. **Wiki:** invitation, login, recovery and role boundaries.

## E04 — Consumer import and membership coordination

**Outcome:** community admins invite their consumers efficiently without silently enrolling or over-authorizing them.

| Story | User story | Acceptance criteria |
|---|---|---|
| CP-0401 | As a community admin, I want to preview an email CSV so I can fix mistakes before inviting consumers. | Accepts `email` and optional `display_name`; shows valid, invalid, duplicate and existing-member/invitation rows; elevated-role fields cannot grant privileges; upload sends no email. |
| CP-0402 | As a community admin, I want to confirm and track an import so I know which invitations succeeded. | Confirmation binds the preview; jobs use consumer role only; bounded dispatch, retries and partial results visible; revoked inviter/cancelled import stops unsent work; retries do not duplicate membership. |
| CP-0403 | As a community admin, I want a scoped member roster so I can manage participation. | Own-community roster only; invitation resend/revoke and membership suspension have reasons/history; suspension revokes community access and relevant queued actions; no raw bills appear in roster. |
| CP-0404 | As a consumer, I want to accept or leave my community so participation remains voluntary. | Invitation acceptance follows E03; leaving removes community access; explains separate consent/data-retention effects; import/acceptance never implies service eligibility or provider-sharing consent. |

**Dependencies / decisions:** E03, batch/rate limits and authority to contact members; retention for import files. **Wiki:** CSV fields, preview/dispatch, retry, membership and leaving.

## E05 — CP and minimalist dashboards

**Outcome:** CP helps people complete role-appropriate tasks while direct controls remain available.

| Story | User story | Acceptance criteria |
|---|---|---|
| CP-0501 | As a consumer, I want a simple CP home screen so I can ask for help and see my next tasks. | Shows own bill/review status, relevant actions and board entry; chat is private; clearly identifies CP as AI; keyboard/mobile/screen-reader paths work. |
| CP-0502 | As a community admin, I want CP and a concise coordination dashboard so I can manage my community. | Shows permitted import/member statuses, opportunities and safe aggregates; sensitive underlying records stay inaccessible; moderator controls require a separate grant. |
| CP-0503 | As a Sandz admin, I want CP and an operations dashboard so I can find platform tasks quickly. | Shows capability-appropriate community health, onboarding, support and maintenance; AI settings use a dedicated form; no default global household-bill or consumer-chat browser. |
| CP-0504 | As a user, I want CP to explain an action before I approve it so I stay in control. | Allowlisted tool arguments are server-validated; sensitive actions show exact payload in a confirmation card; approval binds identity/project/payload/version/expiry; reauthorization and idempotency prevent stale or duplicate execution. |
| CP-0505 | As a user, I want useful direct controls when CP cannot help so I can still complete core tasks. | AI outage/limits have a clear state; bill entry, board and supported direct tasks remain usable; CP admits unknowns and offers support; streamed answers never claim success before a tool succeeds. |

**Dependencies / decisions:** E01/E03 for shell; E07/E09 for live AI answers; each action depends on its domain story. **Wiki:** CP capabilities, confirmation cards, privacy and fallback/error explanations.

## E06 — Account authority, consent and privacy

**Outcome:** community membership is kept separate from permission to manage or share an electricity account.

| Story | User story | Acceptance criteria |
|---|---|---|
| CP-0601 | As a consumer, I want to register an account and submit authority evidence so I can manage the correct bills. | Account type/identity and scope recorded; individual and common-area accounts distinct; membership alone grants no control; competing authority claims remain unresolved until review. |
| CP-0602 | As an assigned reviewer, I want to review account authority so access has an evidence basis. | Only assigned evidence accessible; accepted/rejected/needs-information outcome and validity recorded; review history preserved; expired/revoked authority blocks related operations. |
| CP-0603 | As a consumer, I want to grant and withdraw specific permissions so I control approved data uses. | Purpose, recipient, resources, notice version and time captured; no blanket admin consent; withdrawal blocks future uses under the grant including queued work; prior disclosure limits are explained. |
| CP-0604 | As a consumer, I want export and deletion-request options so I can understand and manage my records. | Export is scoped and audited; deletion/retention process shows request status; files and chat copies considered; no promise of instant erasure of required retained records. |

**Dependencies / decisions:** E03; reviewed authority evidence, privacy/retention and processing policy. **Wiki:** account vs membership, consent, export/deletion and support escalation.

## E07 — Sandz AI settings and usage controls

**Outcome:** AI can be configured and operated without exposing credentials or leaving core functions dependent on it.

| Story | User story | Acceptance criteria |
|---|---|---|
| CP-0701 | As an authorized Sandz admin, I want to configure the AI provider and key so CP and bill reading can run. | Dedicated MFA-protected form; key stored server-side; only secret reference and masked metadata in application tables; synthetic test checks configured models; no key enters CP/context/logs/browser bundles. |
| CP-0702 | As an authorized Sandz admin, I want to rotate or disable the key so I can respond to changes or exposure. | Changes scoped to environment/permitted communities and audited; disabled/revoked configuration blocks new calls; in-flight work has a defined cancellation/failure outcome; secret is never read back to the UI. |
| CP-0703 | As Sandz, I want usage limits and operational visibility so AI use is controlled. | Community and global limits enforced server-side; track requests/tokens/jobs without bill text; retries respect budgets; quota/rate-limit/provider failures are visible and trigger manual fallback. |

**Dependencies / decisions:** E01/E03, provider/models, hosting secret-store integration, processing terms and usage budgets. **Wiki:** Sandz configuration/troubleshooting plus safe consumer explanations of AI limits.

## E08 — AI-assisted bill capture and review

**Outcome:** consumers turn a bill image into traceable structured data without treating AI output as verified truth.

| Story | User story | Acceptance criteria |
|---|---|---|
| CP-0801 | As a consumer, I want to photograph/upload a bill or enter it manually so I can use the platform on my device. | Camera/file/manual paths available; authority checked; private immutable upload path; type/size validation and unsupported-format feedback; nothing posted to the board or public Storage. |
| CP-0802 | As a consumer, I want CP to suggest bill fields so I do less manual typing. | Durable job with visible status; authorized AI input and schema-validated candidates; source/model versions recorded; missing remains null; receipt-only documents do not invent kWh; injected document instructions cannot invoke tools. |
| CP-0803 | As a consumer, I want to check and correct extracted details so mistakes do not become accepted records. | Shows candidates, uncertainty and source reference; explicit corrections/submission create a version; amount paid/due/billed distinct; invalid periods/units and duplicate account-period records flagged for review. |
| CP-0804 | As an assigned reviewer, I want to verify submitted bills so downstream comparisons use supported inputs. | Assignment limits access; approve/request-correction records evidence; consumer confirmation alone cannot set reviewed; changes preserve prior versions and calculation references. |
| CP-0805 | As a consumer, I want recoverable processing errors so a failed analysis does not lose my work. | Retry/manual-entry options; worker restart/retry cannot duplicate result versions; cancellation/deletion/withdrawal rechecked before processing and committing results; no unreviewed data silently enters verified calculations. |

**Dependencies / decisions:** E06/E07; supported formats, extraction schema, file limits, synthetic test layouts and evaluation thresholds. **Wiki:** capture, receipts vs bills, confirmation vs review, missing fields and troubleshooting.

## E09 — CP wiki and grounded answers

**Outcome:** CP answers platform questions from current, reviewed, audience-appropriate help maintained with the code.

| Story | User story | Acceptance criteria |
|---|---|---|
| CP-0901 | As a contributor, I want a standard wiki workflow so help evolves with each feature. | Article metadata and links validated; behavior-changing PR updates article/question cases or explains no impact; unimplemented behavior stays planned; source/reviewer/release evidence required before publication. |
| CP-0902 | As a knowledge publisher, I want to publish or retire reviewed versions so CP uses the right help. | Explicit publishing capability; immutable compatible release manifest; atomic activation and tested rollback; drafts/expired/retired versions excluded; retirement invalidates caches. |
| CP-0903 | As a user, I want CP to cite the relevant help so I can check his answer. | Server filters audience, tenant, release/features and review status before retrieval; answer links/title/version match retrieved source; private links enforce access; unknown/conflicting information yields uncertainty and support. |
| CP-0904 | As a support owner, I want to review unanswered questions so the wiki improves safely. | Minimal anonymized gap feedback; no private transcripts copied into Git; proposed improvements reviewed by people; CP cannot approve/publish his own answer; restricted-question and injection evaluations pass. |

**Dependencies / decisions:** maintain source wiki immediately; runtime publishing/retrieval needs E01/E03/E07 and named reviewers/release policies. **Wiki:** this epic builds the wiki process itself; each other epic supplies its task help and test questions.

## E10 — Community board and moderation

**Outcome:** members have a useful shared communication space separate from private CP chats.

| Story | User story | Acceptance criteria |
|---|---|---|
| CP-1001 | As a member, I want to read, post and reply so I can participate in my community. | Active membership enforced on reads/writes; authors/timestamps visible; private bill attachments prohibited; other-community access fails; works without paid entitlement or AI. |
| CP-1002 | As a member, I want to report content so concerns reach a moderator. | Report references accessible same-community content; receipt/status visible to permitted parties; report does not itself hide content or expose other reporters. |
| CP-1003 | As an assigned moderator, I want to pin/hide content and resolve reports so the board remains useful. | Community-scoped grant; reason and audit history; actioned/dismissed outcomes recorded; community-admin/Sandz role alone gives no moderation right. |

**Dependencies / decisions:** E03/E04; moderation rules and named owner. **Wiki:** posting, privacy, reporting and moderator procedures; posts are not contractual consent or binding votes.

## E11 — Energy opportunities, offers and benefits

**Outcome:** communities can explore evidence-based options while consumers understand uncertainty and retain control.

| Story | User story | Acceptance criteria |
|---|---|---|
| CP-1101 | As a community admin, I want to create a voluntary energy opportunity so interested members can coordinate. | Category/scope/period recorded; consumers explicitly join/withdraw for authorized accounts; joining does not imply contract, sharing consent or eligibility. |
| CP-1102 | As a community admin, I want safe participation/usage summaries so I can understand collective interest. | Only reviewed authorized records included; coverage and account types shown; suppression policy applied; account-period deduplicated; unresolved privacy threshold means suppress. |
| CP-1103 | As an assigned reviewer, I want to record scoped eligibility evidence so consumers see what is known. | Unknown/in-review/verified/not-eligible with exact account/group, route/date/evidence; expiry/changed facts reopen review; kWh alone cannot verify eligibility. |
| CP-1104 | As a provider contact working with operations, I want my offer recorded accurately so consumers can review its actual terms. | Attributed manual submission; provider/category evidence and complete charges, validity, deposit/term/exit conditions and compensation disclosures; assigned review before publication; changes versioned; expiry/withdrawal enforced. |
| CP-1105 | As a consumer, I want comparable offers and explainable benefits so I can assess my options. | Authorized reviewed bill/offer/calculation versions; deterministic math, coverage and assumptions; estimated/measured outcomes distinct; negative savings visible; fees/transfers/revenue not double counted; incomplete inputs identified. |
| CP-1106 | As a consumer, I want to request a referral and see evidence-backed progress so I know what happened. | Own explicit interest; handoff requires current recipient-specific permission and applicable eligibility/offer checks at dispatch; acknowledged/contracted/active states need evidence; no autonomous contract/switch. |
| CP-1107 | As an assigned operations reviewer, I want status filters and scoped exports so I can resolve issues efficiently. | Authorized queue/filter results only; permission/consent rechecked on export; exports audited and private; disputed calculations route to correction without overwriting evidence. |

**Dependencies / decisions:** E06/E08; feasibility V01–V08 and supplier evidence before live publication/handoff; suppression, ranking and complete cost-comparison rules. Prototype with synthetic offers. **Wiki:** participation, eligibility uncertainty, comparisons, loss/fee explanations, referrals and disputes.

## E12 — Free tier and optional upgrades

**Outcome:** consumers receive useful free value while optional entitlements can be managed transparently.

| Story | User story | Acceptance criteria |
|---|---|---|
| CP-1201 | As a consumer, I want usable free bill overview, basic comparison and board features so participation does not require a subscription. | Free features remain available without paid entitlement; AI allowance exhaustion does not disable direct core workflows; upgrade messaging is clear and optional. |
| CP-1202 | As an authorized Sandz admin, I want to record trial/approved upgrade entitlements so optional access can be tested. | Explicit feature set/validity/evidence; activation/expiry audited; no automatic fee collection; entitlement does not affect community membership, account authority or service-contract status. |

**Dependencies / decisions:** relevant core features; optional feature package and terms need product review. **Wiki:** free vs optional access, expiry and entitlement support; no invented pricing or permitted-fee claims.

## E13 — Sandz support and maintenance

**Outcome:** Sandz supports users and maintains the service through explicit, auditable capabilities.

| Story | User story | Acceptance criteria |
|---|---|---|
| CP-1301 | As a user, I want to raise and follow a support case so problems can be resolved. | Own/authorized case visibility; assigned staff, status and resolution recorded; referencing a bill does not automatically grant staff access to it. |
| CP-1302 | As assigned Sandz support staff, I want temporary authorized access so I can investigate a specific problem. | Tenant-local identity/MFA and independently approved resource/action scope; no self-approval; current staff status checked; expiry/revocation/case closure denies further access; sensitive reads audited. |
| CP-1303 | As authorized Sandz staff, I want health and maintenance controls so I can keep communities operational. | Redacted diagnostics, capability/environment checks, approved change/runbook, outcome and rollback evidence; CP may guide but cannot autonomously restore/deploy or obtain secrets. |
| CP-1304 | As Sandz, I want staff offboarding to reach every community so former staff lose access. | Revoke control access and tenant bindings/grants/sessions; partial failures tracked/retried; unverifiable status fails closed for support access; no default emergency bypass. |

**Dependencies / decisions:** E01/E03; named support approvers, infrastructure permissions, maintenance and incident procedures. **Wiki:** requester help plus staff-only runbooks; never include keys or personal case content.

## E14 — Quality, recovery and pilot readiness

**Outcome:** demonstrated software quality and separately recorded feasibility support a controlled pilot decision.

| Story | User story | Acceptance criteria |
|---|---|---|
| CP-1401 | As a maintainer, I want automated domain, RLS and integration checks so changes cannot silently break access or financial behavior. | CI adds type/lint/build and meaningful tests as code appears; direct Data/Storage API attacks and cross-tenant roles tested; existing model checks retained; failures block release. |
| CP-1402 | As Sandz, I want a tested recovery process so data and privacy state can be restored together. | Restore DB and Storage in isolation; check integrity; reconcile subsequent deletions/consent/role revocations before opening access; agreed recovery targets and results documented. |
| CP-1403 | As a user, I want accessible and resilient core journeys so the platform works on my device and during partial failures. | Mobile/keyboard/screen-reader scenarios demonstrated; camera/AI failures have fallbacks; private caching and unsafe retries excluded; agreed performance/load criteria measured. |
| CP-1404 | As the sponsor, I want a pilot-readiness record so the launch decision uses both technical and feasibility evidence. | M01–M20 trace to results; wiki matches release; critical access/data-loss issues resolved; support/moderation owners and notices ready; outstanding commercial/legal gates explicit; pilot authorized separately. |

**Dependencies / decisions:** testing begins with E01 and accompanies every epic; final readiness depends on all selected MVP stories and feasibility evidence. **Wiki:** operating limitations, recovery/support instructions and release-compatible task guides.

## Suggested build order

These are reviewable slices, not time estimates or reductions in MVP scope. Wiki authoring and tests accompany every slice.

| Slice | Demonstration | Main stories / dependencies |
|---|---|---|
| A | Public shell and two isolated synthetic communities | E01/E02, CP-0901, CP-1401; decide hosting/Auth configuration |
| B | Sandz invites admin; admin imports consumers; users reach role-specific home | E03/E04, CP-0501–CP-0503 shells; reviewed email/configuration |
| C | Consumer submits a private bill manually and uses the board | E06, CP-0801/CP-0803/CP-0804, E10; authority and privacy design |
| D | CP answers from reviewed help and assists bill reading/actions | E07/E09, CP-0802/CP-0805, CP-0504/CP-0505; permitted AI processing and action contracts |
| E | Reviewed synthetic offer comparison, benefit explanation and referral tracking | E11/E12; operational calculations and scoped evidence |
| F | Support, recovery and full pilot acceptance | E13/E14 complete; separate feasibility and release authorization |

**Recommended first vertical slice after scaffolding:** Sandz creates a synthetic community → invites its admin → admin previews/confirms two synthetic consumer rows → consumer accepts → sees a private CP/dashboard shell. Include negative tests for another community, an expired invitation and an attempted role escalation. Add its wiki explanation in the same work. Actual external emails require an authorized implementation step.

## Feasibility and external dependencies

The [validation register](08_validation_register.md) remains a separate workstream. V01–V04 concern route, authority and account structure; V05–V08 concern providers, comparability, fees and privacy; V09–V13 concern demand, delivery economics, independence, operations and finance. Software completion does not close these questions. Synthetic development is possible while they are open; collecting real data, publishing real offers, charging fees and running a pilot each depend on the relevant evidence and authorization.

Confirm next: initial community/account type, named reviewers/owners, hosting/domain, repeat-login choice, sender/SMTP, AI provider/models and limits, consent/retention/suppression rules, optional upgrades and operational targets. Preserve the architecture baseline; explicitly log changes to its open implementation decisions as they are resolved.

## Later candidates — not initial scope

| ID | Candidate | Decision needed before adding |
|---|---|---|
| L01 | Provider self-service portal | Representation verification, capabilities and provider support workflow |
| L02 | One login across communities | Supported identity federation, revocation and cross-community UX |
| L03 | Push notifications and richer reminders | User preferences, sensitive content handling and delivery costs |
| L04 | Automated paid-upgrade billing | Permitted fees, terms, payments, refund/tax/support arrangements |
| L05 | Utility/provider integrations | Authorized APIs/contracts and data reconciliation |
| L06 | Other service categories | Separate category feasibility, authority, terms and data rules |
| L07 | Offline private bill capture/sync | Device storage, conflict resolution and sensitive-data controls |

AI-assisted bill reading, the community board and maintained CP wiki are MVP items, not later candidates. Autonomous switching/contracting, wallets and electricity settlement remain outside the initial build; they are not implicit extensions of L04/L05.

## Definition of done for every story

- Agreed acceptance criteria demonstrated with synthetic fixtures; relevant denial, failure and retry paths tested.
- Applicable identity, role, community, account-authority and consent checks work at the server/database boundary.
- No secrets or personal data in source, wiki, routine logs or test fixtures.
- Related wiki help and representative CP questions updated and reviewed for the release, or a justified no-impact statement recorded.
- Requirements, ontology/architecture and decision log updated when behavior changes; evidence and unresolved limits remain explicit.
- Reviewer records test evidence and outstanding issues. An unfinished external gate is not reported as implemented or validated.

## Copyable story template

```markdown
### CP-XXXX — Short feature title
Epic: E__
Scope: MVP / Later
Status: Draft
Owner: Unassigned
Estimate / target iteration: Not estimated

As a [role], I want [action/outcome], so that [benefit].

Acceptance criteria:
- Given [state], when [action], then [observable result].
- Given [invalid/unauthorized state], when [action], then [safe failure].

Dependencies / open decisions:
Requirement IDs:
Wiki articles / example questions:
Out of scope:
Sponsor edits / notes:
```

This draft creates no GitHub issues or project-board entries. Once reviewed, each story can be copied into a scoped issue while retaining its ID.
