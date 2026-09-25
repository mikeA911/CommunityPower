# Project context
Last updated: 25 September 2026. Status: reconstructed planning package with repository harness; feasibility not completed.

## Objective
Validate and, if justified, build a supplier-neutral Philippine community energy coordination platform. The package covers concept, MVP, economics, benefits, competition, pilot decisions and future vision.

## Established planning decisions
Supplier-neutral; community message board in MVP; free consumers with optional upgrades; feasibility then 1–3 community pilot; indicative 8–10 week / PHP 400k–700k build assumption. The inventory also includes bill/energy data, aggregation, supplier matching, savings dashboard and AI assistance.

## Evidence boundaries
Original documents and spreadsheet were unavailable. The prior conversation provides an artifact inventory, not complete content. All detailed requirements, model inputs beyond explicit anchors, budget allocations and gate thresholds are newly proposed. No customers, suppliers, licenses, live data, revenue or eligibility have been verified.

## Current implementation
Markdown planning documents, a standard-library Python CSV calculator, and a local/GitHub repository harness. The harness verifies model boundaries and snapshot freshness and includes CI plus issue/PR templates. The user-selected external repository is https://github.com/mikeA911/CommunityPower; it was empty when inspected on 25 September 2026. No application, chosen application stack, hosted deployment, integrations or authentication service exist yet. The model has 12 post-build operating months and three illustrative scenarios. Disabled optional revenue streams default to zero. Feasibility/other launch costs are unbudgeted zero placeholders.

## Next work
Assign sponsor and reviewers; identify a candidate community and meter/account structure; resolve route and authority; obtain supplier interest and comparable terms; validate demand; secure a scoped quote and operating runway. Do not treat software development as a substitute for these gates.

## Open decisions
Pilot location and community type; actual account eligibility; legal role and business entity; authority and consent; providers and fee terms; pricing; build team/stack; privacy arrangements; acquisition/support costs; moderation owner; AI provider and approved knowledge; pilot success thresholds.

## Decision log
| Date | Decision | Basis | Status |
|---|---|---|---|
| 2026-09-24 | Preserve listed planning anchors | Current user instruction | Preserved |
| 2026-09-24 | Deliver Markdown and CSV package plus calculator | Current user request; executable model added for reproducibility | Delivered planning artifact |
| 2026-09-24 | Separate feasibility and operations from build envelope | Reconstruction convention; not a recovered historical allocation | Proposed |
| 2026-09-24 | Use manual offer review/referral during MVP | Scope-control proposal | Proposed |
| 2026-09-25 | Add repository setup, automated checks, and PR/issue templates; use Python 3.14 for CI | User clarification in current task; implementation by Codex | Implemented locally; GitHub destination and remote settings pending |
| 2026-09-25 | Use mikeA911/CommunityPower as the GitHub destination | Repository URL supplied by user; empty remote confirmed with Git | Destination selected; branch protection and reviewer assignment remain pending |

Add new entries with owner, evidence and status as decisions are made. User decisions take priority over this draft.
