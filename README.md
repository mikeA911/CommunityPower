# Community Power
Planning package, deployed alpha and local beta development · 27 September 2026

Community Power is a proposed supplier-neutral platform helping Philippine communities understand energy costs, organize demand, compare suitable offers, and track benefits. This is a planning and feasibility package, not a launched service or an approved electricity aggregation arrangement.

## Start here
From a fresh clone, use Node 24, npm 11 and Python 3.14. Run `npm ci`, then `npm run dev`, and open `http://127.0.0.1:3000`. Run `npm run check` for the standard repository verification. See [web implementation notes](apps/web/README.md) for integration boundaries and browser tests. No credentials are needed for public pages, synthetic demos, builds or standard checks; this is not a production service.

1. Read [project context](codex/PROJECT_CONTEXT.md) and [source limitations](docs/00_provenance.md).
2. Review the [concept paper](docs/01_concept_paper.md), [MVP specification](docs/02_mvp_specification.md), and [go/no-go brief](docs/04_go_no_go.md).
3. Edit [model assumptions](model/assumptions.csv), then run `python model/calculate.py` from this folder. Python 3 and its standard library are sufficient. CSV outputs are snapshots; they do not recalculate inside a spreadsheet app.
4. Follow the [beta roadmap and task tracker](docs/17_beta_roadmap.md) for current priorities, evidence and release gates.
5. Use [Codex handoff instructions](docs/09_codex_handoff.md) to continue development.

## Codex Cloud from a tablet

The repository is prepared for a fresh Codex Cloud checkout without files from the desktop. Connect the GitHub repository, create its cloud environment, and use the setup values and copy-ready first task in [the Codex Cloud guide](docs/16_codex_cloud.md). Cloud work should use a `codex/*` branch and a pull request. Runtime keys and personal bills do not belong in the repository or a task prompt.

## Package map
- `apps/web/`: runnable Next.js/React interface preview, domain checks and browser tests.
- `CONTRIBUTING.md`: local checks, contribution workflow, and GitHub connection steps.
- `.github/`: automated model checks, issue/PR templates, and Actions dependency updates.
- `scripts/check.py`: non-mutating model and generated-snapshot verification; run `python scripts/check.py`.
- `docs/00_provenance.md`: evidence boundaries and reconstruction status.
- `docs/01_concept_paper.md`: opportunity, audience, proposition, operating model.
- `docs/02_mvp_specification.md`: scope, user journeys, requirements, acceptance criteria.
- `docs/03_business_model.md`: revenue logic, costs, formulas, interpretation.
- `docs/04_go_no_go.md`: feasibility decision and pilot gates.
- `docs/05_market_competition.md`: market context and competitor research agenda.
- `docs/06_community_benefits.md`: consumer value and measurement rules.
- `docs/07_delivery_plan.md`: indicative build schedule, budget, and backlog.
- `docs/08_validation_register.md`: regulatory, commercial, privacy, and operational unknowns.
- `docs/09_codex_handoff.md`: transfer steps and ready-to-use task prompts.
- `docs/10_long_term_vision.md`: sequenced expansion hypotheses.
- `docs/12_domain_ontology.md`: proposed actors, relationships, actions, permissions, and service-category extensions.
- `docs/13_architecture.md`: Next.js/Supabase PWA, CP assistant, per-community databases, invitations, AI bill reading, tables and RLS.
- `docs/14_product_backlog.md`: editable draft feature list, epics, user stories, acceptance criteria and build slices.
- `docs/16_codex_cloud.md`: Android/tablet workflow, cloud environment setup, secrets boundary and first-task prompt.
- `wiki/`: maintained CP platform-help source, article template, starter guides and review/publishing rules; initial content is draft.
- `model/`: editable CSV inputs, reproducible calculator, generated forecast and scenario summary.
- `codex/AGENTS.md` and `codex/PROJECT_CONTEXT.md`: operating guidance and durable context.
- root `AGENTS.md`: makes the project-wide guidance discoverable at the project root.
- `MANIFEST.json`: file hashes for this delivered snapshot; edits will change hashes.

## Planning anchors to preserve
Supplier-neutral positioning; community message board in MVP; free consumer tier with optional paid upgrades; feasibility before a controlled 1–3 community pilot; indicative 8–10 week build and PHP 400,000–700,000 MVP budget. These are planning assumptions, not quotations or commitments.

All numeric inputs other than those stated anchors are new illustrative assumptions. No prior workbook, supplier offers, customer bill data, signed partners, or validated unit economics were recovered. The prior artifact inventory mentioned a September 23 update, but those underlying versions were unavailable.

## Model outputs
`forecast.csv` gives monthly cohort and economics calculations for downside, base, and upside cases. `scenario_summary.csv` summarizes the same builds. `mvp_budget.csv` reconciles the indicated low/base/high build envelopes. Read `model/README.md` before interpreting any amounts. Savings are hypothetical and separate from platform revenue.

The deployed alpha has a community Auth foundation and public synthetic demos. Local beta code adds gated OpenAI bill ingestion and private history; the user has now applied the bill migration, and synthetic seed records/images have passed administrative verification. Live provider and consumer-session isolation validation remain pending. CP feature/navigation guidance is maintained in wiki/previews/navigation.json. This is not a production service or evidence of feasibility, signed agreements or legal approval.

## Beta development and verification

See [the beta task tracker](docs/17_beta_roadmap.md). `npm run test:policies` runs the actual community migrations and access-policy assertions in disposable PostgreSQL using synthetic Auth/Storage schemas; it needs no Docker, service-role key or network. `npm test`, `npm run check` and CI include these policy tests. Hosted JWT/Storage and cross-project acceptance remain separate gates. Run `npm run check:full` for browser changes.

For every implementation slice, update the tracker and affected wiki/CP navigation, revise setup/status here when needed, and record material behavior decisions in project context and requirements. Preview guides are explicitly draft; they are not published production knowledge.

## Synthetic beta seed

See [the seed guide](docs/18_beta_seed.md). `npm run seed:beta` previews two synthetic consumers, three house accounts and nine historical bills/images without network access. `npm run test:seed` validates fixtures locally and is included in `npm test`. Applying is an explicit command requiring administrative access and the reviewed bill schema/private bucket; it does not run migrations or enable uploads. The seed was applied on 27 September 2026: two synthetic consumers, three accounts and nine bills/images passed administrative consistency checks. Consumer-session isolation is not yet verified.

Synthetic consumer test logins are configured; credentials are in ignored `private/beta-test-logins.json` (never share/commit). On 27 September, 71 live checks verified own-record/image access and foreign/anonymous denial using two consumer sessions. See the seed guide for commands and scope; broader B02 checks and web deployment remain pending.

## Private conversation RAG

Latest verification: the user applied the saved-turn follow-up SQL, and 69 hosted assertions passed, including atomic save/rollback, retry deduplication and access denial. Synthetic records were cleaned up. Authenticated web-flow verification and deployment are still pending; the embedding worker remains unconnected.

See [the private-history/RAG guide](docs/19_private_conversation_rag.md). The user applied foundation migration `202609270001_private_conversation_rag.sql` on 27 September; 44 hosted checks passed using two synthetic consumers, with temporary records cleaned up. Local code now adds `/conversations` for private saved scripted CP exchanges, history, rename, confirmed deletion and recall controls. Apply follow-up migration `202609270002_saved_chat_turns.sql` and configure the existing server-only community service-role key before using saved replies. The follow-up migration and web deployment are pending. Public demos and dashboard quick help remain session-only. Initial embedding candidate: OpenAI text-embedding-3-small (1,536 dimensions); no worker or external embedding call is enabled. `npm run test:rag` uses synthetic local vectors and is included in `npm test`. Hosted worker lifecycle and populated-vector retrieval remain unverified.

## Future-services showcase

Local /services and /services/manage pages demonstrate future service cards, consumer notes and a manager Add service modal. Dashboard links and CP preview guidance are included. This is public synthetic UI only: same-tab session storage, no Supabase migration, live requests, provider connection, notifications or orders. Reset examples restores the fixtures. See B13 in docs/17_beta_roadmap.md; deployment is pending.
