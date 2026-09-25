# Codex handoff
The portable source of truth is this folder, not remembered chat history.

## Transfer
1. Download and extract the ZIP to a normal local working directory. Preserve the inner `CommunityPower` folder and its paths.
2. Open that folder as the project in Codex. The original reconstruction did not create Git metadata. The subsequent repository harness setup initializes local Git; follow `CONTRIBUTING.md` to connect a private GitHub destination and commit the reviewed package. Exported copies may need `git init -b main` first.
3. Keep root `AGENTS.md` in place. It directs work across the project and explicitly points to `codex/AGENTS.md` and `codex/PROJECT_CONTEXT.md`. A nested `codex/AGENTS.md` alone should not be relied upon to govern sibling `docs/` or `model/` directories. See [official instruction discovery guidance](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
4. Start with the review prompt below. Update `codex/PROJECT_CONTEXT.md` and the decision log after approved decisions. Keep unknowns open until evidence resolves them.
5. Recalculate the model with `python model/calculate.py`; run `python model/calculate.py --check` after model changes. No third-party packages or service credentials are needed for the model.

## First task prompt
Read README.md, AGENTS.md, codex/AGENTS.md and codex/PROJECT_CONTEXT.md. Review docs/ and model/. Summarize preserved decisions, proposed implementation choices and unresolved feasibility gates. Check document/model consistency. Recommend the next bounded feasibility task and identify the evidence needed before building. Do not assume any community is eligible, any supplier is a partner, or any projected revenue is validated.

## Feasibility task prompt
Using docs/08_validation_register.md, prepare a community interview guide and a supplier information request for one proposed pilot community. Keep legal questions for qualified review, identify the meter/account evidence needed and distinguish common-area from individual accounts. Draft materials locally; do not send them or contact anyone without instruction.

## Prototype task prompt
Implement a local prototype from docs/02_mvp_specification.md using synthetic data. Start with membership, bill records, savings explanations and the community message board. Preserve supplier neutrality and useful free-tier features. Make unknown eligibility and hypothetical savings visible. Propose a stack with a short rationale before implementation, record it in PROJECT_CONTEXT.md, and add tests for permissions and financial calculations. Do not connect live bills, payments, suppliers or utility accounts as part of this prototype.

## Model task prompt
Review model/README.md and assumptions.csv. Replace only assumptions supported by evidence I provide, retaining sources and status. Recalculate all three cases, compare old/new funding need and member benefit, and explain the sensitivity. Keep feasibility and operating costs distinct from the MVP build budget.

## Data and ongoing work
Do not commit bill scans, personal information, credentials or signed confidential supplier terms to a public repository. Store approved synthetic examples in a separate development folder. If adding recovered project sources later, retain originals as read-only references and document differences. The delivery manifest describes the initial package; regenerate it when deliberately releasing a new version rather than expecting hashes to remain unchanged during editing.
