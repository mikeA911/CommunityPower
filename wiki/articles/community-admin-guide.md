---
id: community-admin-guide
title: Community administration
version: 3
status: draft
audience: [community_admin]
scope: global
availability: planned
required_features: [consumer_imports]
release_ids: []
owner: community_operations
reviewer: null
reviewed_at: null
updated_at: 2026-09-28
review_due: null
sources: [docs/02_mvp_specification.md, docs/12_domain_ontology.md, docs/13_architecture.md]
---

# Community administration

Draft describing the planned workflow; these controls are not implemented yet.

Provide your email and community details to Sandz's platform admin. Sandz verifies the request and initiates your email invitation. Your admin role is limited to the assigned community.

The planned consumer import accepts a CSV with `email` and optional `display_name`. Review the preview, including invalid, duplicate and existing-member rows, then explicitly confirm sending invitations. Uploading the CSV alone sends nothing. The import can invite consumers only, not grant administrator roles. Invitation and failure statuses remain visible for follow-up.

Inviting consumers does not establish their account authority, data-sharing consent or energy eligibility. Your dashboard provides coordination and approved aggregates, not unrestricted household bills. Board moderation requires a separate moderator assignment.

## Example question

“Can I upload a spreadsheet and make everyone an admin?”

Answer points: consumer imports cannot grant elevated roles; use the Sandz-authorized role process; no prompt or CSV field can bypass it.

## Service requests and catalog preview · 28 September 2026

The community-admin demo dashboard links **Service requests · example** to /services/manage. Read sample household requests and notes, plus example consumer requests made in the same browser tab. **Add service example** opens a modal for the service name and brief description. **Add future service** adds a card to the consumer preview, always marked Future service. This does not activate a service, partner a provider, contact anyone or grant management access. Use made-up notes only. Reset examples restores the fixtures; closing the tab clears its session storage.

Example: “How do I add food delivery?” — Show the example modal; explain that provider onboarding, fulfillment and live requests are not connected. “Can another manager see my example?” — No shared backend exists; the example is confined to the tab.

## Tavily connection diagnostic

Open Integration checks from the community-admin demo dashboard or /admin/integrations. An active community-admin login is required to run Test Tavily connection; public demo roles confer no permissions. The server uses TAVILY_API_KEY, sends a fixed public documentation query and shows a sanitized result. No personal data is sent, and no key is entered in the browser. This consumes search allowance and does not enable CP research. Example: “Why is access denied?” — Sign in with an active community-admin account; do not grant roles through the demo.
