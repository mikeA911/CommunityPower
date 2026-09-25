# Delivery plan and indicative budget
Status: proposed work breakdown. The 8–10 week and PHP 400k–700k anchors are preserved; allocations are reconstructed estimates.

The [current epic/story backlog](14_product_backlog.md) reflects the accepted architecture baseline, CP interface, AI bill reading and ongoing wiki maintenance. Its slices replace the older high-level backlog below for detailed sequencing. The week table remains an indicative reconstruction, not a re-estimated commitment for the expanded requirements.

## Preconditions and schedule
Feasibility happens first, with duration and budget to be scoped. The build clock starts only after a lawful pilot path, sponsor, consent design, agreed scope and delivery team are available. Supplier response and regulatory processes can extend elapsed time. Pilot operation and evidence gathering follow the build.

| Build weeks | Deliverable | Exit evidence |
|---|---|---|
| 1 | Confirm journeys, data model, privacy boundaries and acceptance plan | Reviewed prototype and scope baseline |
| 2–3 | Authentication, community membership, consent, bill records | Isolated access and usable sample bill flow |
| 4–5 | Review workflow, aggregation, offer comparison, savings engine | Traced deterministic estimates and eligibility statuses |
| 6 | Message board, moderation, manager view | Community isolation and report-handling demo |
| 7 | Bounded AI assistant and optional upgrade entitlements | Approved-source answers, fallback and entitlement tests |
| 8 | Integrated testing, operator training, pilot readiness | Acceptance evidence and outstanding defect list |
| 9–10 | Contingency, fixes and staged rollout | Gate B approval and handover |

An 8-week outcome requires scope stability and minimal rework; 10 weeks supplies limited contingency. This is not a staffing commitment or fixed-price quote. Team roles may be combined: product/operations owner, full-stack developer(s), design support, QA/security reviewer, and external legal/commercial reviewers.

## Build envelope
See `model/mvp_budget.csv`. Low/base/high totals are PHP 400,000 / 550,000 / 700,000. They cover proposed discovery/design, engineering, testing/security, pilot setup/training and contingency. They exclude feasibility legal work, license/registration costs, supplier deposits, acquisition campaigns, taxes, and post-build operations unless a future quote explicitly includes them. Replace exclusions with estimates before funding. `assumptions.csv` carries separate feasibility and other launch cost inputs; zeros mean unbudgeted, not free.

## Prioritized backlog
P0: feasibility evidence and consent boundaries; membership/roles; bill entry and review; eligibility state; manually reviewed offers; auditable savings; message board/moderation; bounded AI help; free/paid entitlement; administration; security and recovery.
User-added MVP scope now includes AI-assisted bill reading (no dedicated OCR service), CP as the main interface, separate community databases, admin invitations/bulk consumer onboarding and a maintained CP wiki. See the current backlog for acceptance criteria.
P1 after pilot evidence: notification sophistication, automated upgrade billing, improved analytics, supplier integration and expanded manager tools. Any P1 item included in the initial build requires an explicit scope/budget tradeoff.
Later: solar, EV, parking, payments and broader community services, each with its own feasibility case.

## Change control
Record requested change, customer value, acceptance criterion, cost/time impact and owner. Preserve the message board and basic AI assistance; simplify their implementation before silently removing them. Re-estimate when regulatory requirements, integrations or handling of money change. Pilot learning and commercial contracting are separate workstreams from software delivery.
