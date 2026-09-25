---
id: community-admin-guide
title: Community administration
version: 1
status: draft
audience: [community_admin]
scope: global
availability: planned
required_features: [consumer_imports]
release_ids: []
owner: community_operations
reviewer: null
reviewed_at: null
updated_at: 2026-09-25
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
