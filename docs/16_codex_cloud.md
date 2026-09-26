# Codex Cloud setup and tablet workflow

Version 0.1 · 26 September 2026

This guide makes Community Power usable from Codex Cloud on an Android tablet without relying on the desktop checkout. Codex Cloud checks out the GitHub repository into an isolated environment, runs the configured setup, and returns a reviewable diff or pull request. The public alpha remains a prototype, and ordinary cloud tasks must not operate on live Supabase data or Vercel production.

## One-time account setup

1. Open [Codex Cloud](https://chatgpt.com/codex) in the tablet browser and sign in with the ChatGPT account that should perform the work.
2. Connect GitHub when prompted. Grant access to `mikeA911/CommunityPower`; repository access can be limited to this repository.
3. Create a cloud environment for `mikeA911/CommunityPower` using the default branch `main`.
4. Pin Node.js **24** and Python **3.14** in the environment package-version settings.
5. Use this setup script command:

   ```bash
   bash scripts/codex-cloud-setup.sh
   ```

6. Use this maintenance script command for cached environments:

   ```bash
   bash scripts/codex-cloud-maintenance.sh
   ```

7. Leave agent-phase internet access off for normal implementation work. Setup scripts already have internet access for dependency installation. Enable restricted access for a task only when current external documentation is required.

The setup installs the pinned npm dependency tree and Playwright Chromium. Public pages, synthetic dashboards, the production build and repository checks need no environment variables.

## Environment variables and credentials

Do not copy the desktop `.env.local` into Codex Cloud. Do not add the pilot Supabase service-role key, an OpenAI API key, personal email addresses or real bill data to a task prompt or repository file.

For routine development, configure **no variables or secrets**. The application fails closed for login when Supabase is absent, while its public and synthetic paths remain testable. When an integration task needs configuration, use a disposable non-production project and the variable names documented in `apps/web/.env.example`.

Codex Cloud environment variables remain available during the agent phase. Cloud secrets are encrypted but are removed after setup, so they are unsuitable as runtime credentials for an application test started by the agent. Live application secrets belong in the approved hosting secret store. Tests for AI bill reading should mock the provider and use synthetic or fully redacted bill images.

## Work from the tablet

For each change:

1. Start a cloud task against `main` and ask Codex to create a `codex/<short-task>` branch.
2. Keep the requested outcome and acceptance criteria narrow.
3. Require `npm run check`; require `npm run check:full` for changed browser interactions.
4. Review the summary and diff in Codex Cloud.
5. Ask Codex to open a pull request. Review its checks and preview before merging.
6. Apply migrations or deploy only in a separately reviewed step when the task explicitly calls for it.

Vercel deploys the production branch after merge. Supabase schema changes must first be represented as reviewed files under `supabase/community/migrations` or `supabase/control/migrations`. A cloud task must not make an unrecorded dashboard-only schema change.

## First cloud task

Copy this prompt into the new Community Power cloud environment:

> Prepare a cloud-readiness smoke report for Community Power. Read `AGENTS.md`, `README.md`, `codex/PROJECT_CONTEXT.md`, and `docs/00_provenance.md`. Confirm the active branch and create `codex/cloud-smoke` if a change is required. Run `npm run check`, inspect the version-controlled Supabase migrations, and verify that no tracked `.env.local`, credential, personal bill, or browser artifact is present. Do not use live Supabase or Vercel, do not deploy, and do not add secrets. If a repository fix is necessary, keep it minimal, rerun the affected checks, explain why the CP wiki is or is not affected, and open a pull request. Otherwise return the verification results without changing files.

After that succeeds, future tasks can request product work. A bill-reading task should specify synthetic or redacted fixtures, server-side provider access, structured extraction with confidence and provenance, human confirmation before saving, tenant isolation, wiki updates and mocked tests. It should not include the API key or a real household bill.

## What the repository already supplies

- Root and nested agent guidance in `AGENTS.md` and `codex/AGENTS.md`.
- Durable product context, architecture, ontology, backlog and evidence boundaries under `codex/` and `docs/`.
- Locked npm dependencies, Node/Python version expectations and a one-command standard check.
- Version-controlled Supabase migrations for the community and future Sandz control projects.
- GitHub Actions for Linux and Windows model checks plus the full web build and browser suite.
- Pull-request and issue templates with evidence, privacy, wiki and verification requirements.
- A credential-free synthetic UI path suitable for cloud development.

## Remaining administrative setup

Repository files cannot themselves connect the GitHub account or enforce repository rules. In GitHub settings, require pull requests for `main` and require the `Model checks (ubuntu-latest)`, `Model checks (windows-latest)` and `Web application` checks when the repository plan permits it. Assign actual reviewers when maintainers are selected.

Official setup references checked 26 September 2026: [Codex Cloud](https://learn.chatgpt.com/docs/cloud), [cloud environments](https://learn.chatgpt.com/docs/environments/cloud-environment), and [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
