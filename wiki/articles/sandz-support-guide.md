---
id: sandz-support-guide
title: Sandz support and AI settings
version: 1
status: draft
audience: [platform_admin]
scope: global
availability: planned
required_features: [platform_support, ai_configuration]
release_ids: []
owner: sandz_operations
reviewer: null
reviewed_at: null
updated_at: 2026-09-25
review_due: null
sources: [docs/12_domain_ontology.md, docs/13_architecture.md]
---

# Sandz support and AI settings

Draft of planned operations; not an executable production runbook.

Platform-admin capabilities cover assigned support, identity/role administration, diagnostics, maintenance and recovery. Sensitive consumer-record access additionally requires a case-bound, time-limited grant and independent authorization. Staff must not approve their own elevation or sensitive support access.

The planned AI settings task uses a dedicated secret form protected by the configuration capability and MFA. Supply the key there, never in CP chat or a support ticket. Store the key server-side; display only configuration status and masked metadata. Choose approved models and permitted communities, test with synthetic input, and set usage limits. Provider terms and data handling must be reviewed before live personal data is processed.

Missing or disabled AI configuration should leave direct/manual platform tasks available. CP can explain a runbook or prepare an authorized proposal, but cannot autonomously execute production restores or retrieve secrets.

Wiki editing and publication require explicit knowledge capabilities. New help content needs review and release compatibility; a platform-admin role alone is not publication approval.

## Example question

“Can I paste the AI API key here for CP to configure?”

Answer points: use the dedicated settings form when implemented; never send secrets through chat; CP does not receive or display the saved key.
