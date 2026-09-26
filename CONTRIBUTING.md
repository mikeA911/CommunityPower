# Contributing

Read `AGENTS.md`, `codex/AGENTS.md`, `codex/PROJECT_CONTEXT.md`, and `docs/00_provenance.md` first. This repository contains planning artifacts and an illustrative calculator; feasibility remains unresolved.

## Local workflow

Use Python 3.14 (the model CI version), Git, and no third-party Python packages for the model. The web application uses Node 24 and pinned npm workspace dependencies; run `npm ci` at the root.

1. Create a focused branch: `git switch -c your-task-name`.
2. Make a bounded change using synthetic data.
3. When inputs or formulas change, run `python model/calculate.py`.
4. Run `python scripts/check.py` from the repository root.
5. Review `git diff` and `git status --short`, commit the intended files, and open a pull request using the supplied template.

Run `npm run check` for the standard web and model verification. For interaction changes run `npm run check:full` after installing Playwright Chromium. See `apps/web/README.md`. Keep demo data synthetic and update its preview wiki. Production article approval is separate from preview help.

The check command runs the existing model validations in a temporary directory and compares both generated snapshots with the repository copies. It leaves working files unchanged and ignores platform line-ending differences. A failure requires fixing the inputs/calculator or regenerating and reviewing the snapshots. Arithmetic checks do not establish commercial or regulatory validity.

Keep assumptions in `model/assumptions.csv`, formulas in `model/calculate.py`, and explanations in `model/README.md`. Record material decisions in project context. Preserve original sources as read-only; source and private-data directories are ignored by default. Ignore rules are not a secret scanner: review every staged file.

## CP wiki maintenance

Maintain [the CP wiki](wiki/README.md) alongside implementation. Any change affecting user behavior, permissions, onboarding, assistant tools, bill interpretation or support procedures must update the relevant articles and example questions in the same PR. If there is no wiki impact, explain why. Review article accuracy against demonstrated behavior; drafts and planned features must not be published as live instructions. Release acceptance includes compatible, reviewed wiki content and CP retrieval/answer tests once implemented.

## GitHub and Codex Cloud workflow

The repository is hosted at `mikeA911/CommunityPower`. Local and Codex Cloud work should start on a focused branch such as `codex/bill-reading`, pass the required checks, and open a pull request. Review the diff and deployment impact before merging. Do not push routine development directly to `main` or apply Supabase migrations from an unreviewed task.

For a fresh Codex Cloud environment and tablet workflow, follow `docs/16_codex_cloud.md`. The repository installs and verifies without secrets. Configure live integrations only for a task that explicitly requires them, and never include credentials in a prompt, file, log or pull request.

After the first successful Actions run, configure the default branch to require pull requests and these status checks where repository settings support enforcement:

- `Model checks (ubuntu-latest)`
- `Model checks (windows-latest)`

Choose reviewers once maintainers are known. Branch protection and reviewer assignment are remote settings, not enabled by these files. Actions runs on pushes, pull requests, and manual dispatch with read-only repository permissions. Dependabot proposes weekly GitHub Actions updates. There is no deployment workflow.

Workflow references checked on 25 September 2026: [GitHub workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax), [checkout](https://github.com/actions/checkout), and [setup-python](https://github.com/actions/setup-python).

`MANIFEST.json` remains the original delivered-snapshot manifest. Update it only when deliberately releasing a new package version.
