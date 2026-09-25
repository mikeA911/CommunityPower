---
id: consumer-guide
title: Consumer onboarding and bills
version: 1
status: draft
audience: [consumer]
scope: global
availability: planned
required_features: [consumer_onboarding, bill_capture]
release_ids: []
owner: product
reviewer: null
reviewed_at: null
updated_at: 2026-09-25
review_due: null
sources: [docs/02_mvp_specification.md, docs/12_domain_ontology.md, docs/13_architecture.md]
---

# Consumer onboarding and bills

Draft of the intended experience; login screens and bill tools are not implemented yet.

Your community admin invites you by email. The intended flow is to verify the invitation, join the community and set up your login. An invitation does not grant control of an electricity account or consent to provider sharing. The initial architecture proposes separate logins for separate communities; this choice remains under review.

To add a bill, ask CP for help or use the direct bill task. Capture a clear image, select a supported file, or enter supported information manually. You need authority to manage the account. CP uses AI to suggest bill fields; you check and correct them. Human reviewer verification is separate from your confirmation.

A payment receipt may show an amount paid without usage. CP must leave missing kWh unknown and ask for the full bill or supported information. Neither a scan nor community membership proves electricity-service eligibility.

Your community admin can coordinate membership and see approved aggregates, but cannot read raw bills through that role alone. Data-sharing choices have their own scope and withdrawal process. Ask support when access or a calculation seems wrong; do not post a private bill on the community board.

## Example question

“CP could not read my bill. What happens next?”

Answer points: retry with a legible full bill or use manual entry; missing values remain unknown; no reviewed result or savings claim is created from failed extraction.
