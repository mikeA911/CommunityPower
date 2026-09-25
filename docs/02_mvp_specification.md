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
| Platform administrator | Account/role management and audited exceptional access |
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
| M11 | AI assistant and dashboard explanations | Answers use approved FAQs and authorized user data; provide source/version; admit unknowns; no legal eligibility decision, guaranteed savings or autonomous contracting |
| M12 | Free tier plus paid-upgrade entitlement | Free bill overview, basic comparison and board stay usable; upgrade terms visible; trial entitlement can be managed manually |
| M13 | Operations dashboard and export | Consent-aware CSV export, status filters, audit trail, and role restrictions demonstrated |
| M14 | Privacy and recovery | Access revocation tested; deletion/retention workflow documented; backup restoration demonstrated before live pilot |

## Screens
Landing/interest; sign-in/invite; community join and consent; bill entry/review; member dashboard; offer details/comparison; referral status; message board with report flow; AI help with human escalation; manager aggregate view; operations review queue; settings/consent/data requests.

## Data design (proposed)
Use stable IDs and UTC timestamps, with local display timezone explicit. Every community-scoped row carries `community_id`. Relational entities: User, Community, Membership, ConsentRecord, MeterAccount, Bill, BillLineItem, EligibilityReview, Supplier, Offer, OfferCharge, Estimate, Referral, SubscriptionEntitlement, BoardPost, BoardReply, ModerationReport, AuditEvent. Each estimate references bill/offer versions and a calculation version. Store money as fixed-decimal values and retain units; never sum currency and energy quantities. Keep private bill files outside the public web path.

## Workflow states
Bills: draft → submitted → needs correction or reviewed. Eligibility: unknown → in review → verified for a specific route or not eligible; expiry or changed facts returns it to review. Offers: draft → reviewed → published → expired/withdrawn. Referral: interest → consented handoff → supplier acknowledged → contracted → active, with evidence at each later stage. Board reports: open → triaged → actioned/dismissed with reason. Maintain history rather than overwriting material status evidence.

## Proposed architecture and boundaries
Choose a maintainable web stack during technical scoping. A single web application, relational database, private object storage, authentication service, and background tasks should suffice for the pilot. No stack or vendor has been selected. Compute bills and savings in deterministic code; the AI explains outputs rather than inventing financial calculations. Use fake data for development. Do not send raw bills to an AI provider until data handling and provider terms are reviewed.

The MVP supports manually reviewed offers and referrals. Automated utility integration, settlement, power procurement, wallets, energy resale, autonomous switching, complex OCR, native mobile apps, and a broad marketplace are outside the initial build. The message board and bounded AI assistant remain in scope. AI availability failures must fall back to FAQs and human support.

## Quality and pilot release
Test role/community isolation, withdrawn consent, bad uploads, duplicate bills, missing data, expired offers, zero/negative savings, fee reconciliation, prompt injection in uploaded content, moderation abuse, and backup restore. Proposed performance target: core pages load within 3 seconds on the agreed pilot test connection for 95% of a recorded test sample; confirm a realistic load profile before implementation. Support mobile layouts, readable contrast, keyboard navigation, clear labels, and accessible error messages. Record incidents and service ownership.

Definition of done: each requirement has a demonstrated acceptance result; no unresolved critical access-control or data-loss defects; support and moderation owners assigned; pilot users have usable instructions; eligibility and commercial gates are recorded separately from software readiness. A successful demonstration does not authorize supplier contracting.
