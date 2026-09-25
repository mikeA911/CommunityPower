# Community Power
Reconstructed planning package · 24 September 2026 · v0.1

Community Power is a proposed supplier-neutral platform helping Philippine communities understand energy costs, organize demand, compare suitable offers, and track benefits. This is a planning and feasibility package, not a launched service or an approved electricity aggregation arrangement.

## Start here
1. Read [project context](codex/PROJECT_CONTEXT.md) and [source limitations](docs/00_provenance.md).
2. Review the [concept paper](docs/01_concept_paper.md), [MVP specification](docs/02_mvp_specification.md), and [go/no-go brief](docs/04_go_no_go.md).
3. Edit [model assumptions](model/assumptions.csv), then run `python model/calculate.py` from this folder. Python 3 and its standard library are sufficient. CSV outputs are snapshots; they do not recalculate inside a spreadsheet app.
4. Use [Codex handoff instructions](docs/09_codex_handoff.md) to continue development.

## Package map
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
- `model/`: editable CSV inputs, reproducible calculator, generated forecast and scenario summary.
- `codex/AGENTS.md` and `codex/PROJECT_CONTEXT.md`: operating guidance and durable context.
- root `AGENTS.md`: makes the project-wide guidance discoverable at the project root.
- `MANIFEST.json`: file hashes for this delivered snapshot; edits will change hashes.

## Planning anchors to preserve
Supplier-neutral positioning; community message board in MVP; free consumer tier with optional paid upgrades; feasibility before a controlled 1–3 community pilot; indicative 8–10 week build and PHP 400,000–700,000 MVP budget. These are planning assumptions, not quotations or commitments.

All numeric inputs other than those stated anchors are new illustrative assumptions. No prior workbook, supplier offers, customer bill data, signed partners, or validated unit economics were recovered. The prior artifact inventory mentioned a September 23 update, but those underlying versions were unavailable.

## Model outputs
`forecast.csv` gives monthly cohort and economics calculations for downside, base, and upside cases. `scenario_summary.csv` summarizes the same builds. `mvp_budget.csv` reconciles the indicated low/base/high build envelopes. Read `model/README.md` before interpreting any amounts. Savings are hypothetical and separate from platform revenue.

This package does not contain a working application, signed agreements, legal approval, or an XLSX recovery. It provides the requested Markdown and CSV source files, plus an executable calculator.
