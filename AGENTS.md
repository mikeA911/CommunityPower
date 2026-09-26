# Community Power agent instructions
Read README.md and codex/PROJECT_CONTEXT.md before substantive changes. Use docs/00_provenance.md to distinguish evidence from reconstruction.

- Preserve supplier-neutral positioning, MVP community message board, a useful free consumer tier with optional paid upgrades, and feasibility before a 1–3 community pilot.
- Treat 8–10 weeks and PHP 400k–700k as indicative build assumptions. Do not present them as an approved quote or include unrelated costs silently.
- Do not claim households qualify, suppliers are partners, savings are guaranteed, or fees are permitted without current evidence for the specific scope.
- Cite authoritative dated sources for regulatory/commercial facts. Leave unanswered questions explicit; do not invent original document contents.
- Treat original sources as read-only. Do not edit synced sources/ files or recovered references.
- Keep assumptions in model/assumptions.csv, formulas in model/calculate.py and explanations in model/README.md. Recalculate after changes and run the model checks. CSV outputs are generated snapshots.
- Keep participant benefits separate from platform revenue. Show negative savings. Apply one-time fees only to new activations and avoid double counting allocations.
- Use synthetic data for development. Never commit personal bills, credentials or confidential contracts. Enforce community and role boundaries in any future application.
- Record material decisions and their evidence in PROJECT_CONTEXT.md. Update requirements and model documentation when behavior changes.
- Maintain `wiki/` as CP's platform-help source throughout development. Update affected articles and example questions in the same change as behavior, permissions, onboarding or support changes; otherwise explain no wiki impact. Follow `wiki/README.md`; keep planned/unreviewed content out of published CP answers and never store secrets or personal records in the wiki.
- Follow the user’s authorized task scope. Drafting and analysis do not authorize contacting members/suppliers, signing agreements, deploying publicly, collecting money or switching electricity service.
- Report what changed, verification performed, and material remaining uncertainty. Do not describe a plan or prototype as a production service.

For further project context explicitly read `codex/AGENTS.md` and `codex/PROJECT_CONTEXT.md`. Root guidance applies across this package.

## Reproducible setup and verification

- Use Node.js 24, npm 11 and Python 3.14. Install JavaScript dependencies from the repository root with `npm ci`.
- Run `npm run check` before every pull request. It performs type checking, linting, domain tests, a production build and the Python model/snapshot checks.
- Run `npm run check:full` when browser-visible behavior changes. Install Chromium first with `npm exec --workspace @community-power/web -- playwright install --with-deps chromium`.
- Public pages and synthetic demos require no environment variables. Copy `apps/web/.env.example` only when testing an integration that needs local configuration.
- Never place credentials in prompts, source files, test fixtures, logs, screenshots or commits. Use synthetic or redacted bills. Do not use service-role or AI keys for routine checks.

## Cloud and pull-request workflow

- In Codex Cloud, work on a `codex/<short-task>` branch and open a pull request. Do not push directly to `main`, merge a pull request, deploy, mutate a live Supabase project or send external messages unless the task explicitly authorizes that action.
- Keep each task bounded. Review `git diff`, `git status --short` and the staged file list before committing. Confirm no `.env*`, real bills, email lists, access tokens or generated browser artifacts are included.
- Treat Vercel production and the pilot Supabase project as live external systems. Prefer repository changes, migrations and synthetic tests; leave application of migrations and deployment as explicit reviewed steps.
- Include the commands run, results, wiki impact and remaining limitations in the pull-request description. A documentation or tooling-only change may state that CP wiki content is unaffected.
