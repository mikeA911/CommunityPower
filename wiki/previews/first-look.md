---
id: first-look
title: Community Power first-look guide
version: 2
status: draft
audience: [public, consumer, community_admin, platform_admin]
scope: global
availability: available
required_features: [synthetic_preview]
release_ids: [preview-0.2.0]
owner: product
reviewer: null
reviewed_at: null
updated_at: 2026-09-25
review_due: null
sources: [apps/web/src/components/auth-dialog.tsx, apps/web/src/components/workspace.tsx, apps/web/src/lib/demo.ts, apps/web/src/lib/preview-help.ts]
---

# Explore the first look

This guide describes a local, synthetic interface preview, not a live service. It is a draft development guide exposed only by the explicit preview experience. It is not part of a published production knowledge index.

## Try the preview

You can explore consumer, community-admin and Sandz views using the preview-role selector. Review a synthetic bill, stage sample invitations, write a session-only board note, or ask CP about this preview. The role selector is a design-review tool, not authentication or an access-control system. Every record is made up.

## Login and password reset

The landing page has a **Sign up / Log in** dialog. Consumers and community admins choose **My community**; Sandz platform admins choose **Sandz platform**. Public sign-up is invitation-only during the pilot. The pilot community project is connected for login and password recovery. Forgot password sends a neutral response so it does not reveal whether an email has an account. The separate Sandz control project is not connected yet. Successful community login currently routes to the public synthetic role preview, so it does not yet grant access to real records.

## Bills and AI

Open “Let’s look at a bill” or “My energy” to edit sample kWh and a sample rate. The total is simple illustrative arithmetic. Submitting marks the example in this browser session only; it is not verified or saved to a database. Real file upload, camera capture and AI bill analysis are not connected yet. Do not supply a personal bill. A payment receipt without usage cannot establish kWh.

## Demo invitations

In the community-admin view, open “Import consumers” or “Invite your community”. Use one email per row with an optional email header, up to 25 rows, and only made-up addresses ending in .example. Preview shows valid and duplicate rows. Confirming stages demo invitations only; no email is sent and no account is created. Editing the input requires a new preview.

## Privacy and storage

Bill edits, staged invitation counts, chat history and board notes reset on reload or changing the preview role. They are not saved to a database or browser storage. Questions typed to CP are sent to this local application's scripted-help endpoint, not an AI provider. Use synthetic examples and never enter a password, API key, bill or personal information. The community Auth project and initial role tables are active, but dashboard records remain synthetic. Account recovery must not be treated as a role grant.

## CP and the wiki

CP currently selects scripted responses from this preview guide and links to the relevant section. There is no live AI connection. Production CP will use reviewed, role-appropriate, release-compatible wiki content and permission-checked tools. If this guide does not answer your question, CP says so instead of inventing live platform behavior.

## Savings and eligibility

This preview does not calculate verified savings or check eligibility. Its sample amount is not a supplier quote. Community membership does not qualify an electricity account, and savings are not guaranteed. Planned comparisons must show negative outcomes, uncertainty and complete fee/charge coverage.

## AI settings

The Sandz view explains the future AI configuration workflow but accepts no credentials. A secure server-side settings form, capability checks and MFA must be connected before a real key can be supplied. Never paste a key into CP chat. No provider or live model is configured here.

## What comes next

Next steps are the separate Sandz control project, protected dashboards, session refresh/isolation tests and repeatable migrations; then account authority, private bill storage, AI integration and a reviewed knowledge publisher. This preview does not process real bills or switch electricity service.

## Example questions

- “What can I try?” → explain sample tasks and the preview role selector.
- “How do I log in or reset my password?” → explain workspace selection, invitation-only access and the forgot-password link.
- “Can I scan a bill?” → explain sample review and that real scanning is not connected.
- “Is my data saved?” → explain session-only state and local scripted-help requests.
- “Will I save money?” → no guarantee or eligibility claim; distinguish sample arithmetic.
- Unsupported question → say the guide does not cover it and link to this page.
