---
id: first-look
title: Community Power first-look guide
version: 8
status: draft
audience: [public, consumer, community_admin, platform_admin]
scope: global
availability: available
required_features: [synthetic_preview]
release_ids: [preview-0.2.0]
owner: product
reviewer: null
reviewed_at: null
updated_at: 2026-09-28
review_due: null
sources: [apps/web/src/components/auth-dialog.tsx, apps/web/src/components/workspace.tsx, apps/web/src/lib/demo.ts, apps/web/src/lib/preview-help.ts]
---

# Explore the first look

This guide describes a local, synthetic interface preview, not a live service. It is a draft development guide exposed only by the explicit preview experience. It is not part of a published production knowledge index.

## Try the preview

You can explore consumer, community-admin and Sandz views using the preview-role selector. Review a synthetic bill, stage sample invitations, write a session-only board note, or ask CP about this preview. The role selector is a design-review tool, not authentication or an access-control system. Every record is made up.

## Login and password reset

The landing page has a **Sign up / Log in** dialog. Consumers and community admins choose **My community**; Sandz platform admins choose **Sandz platform**. Public sign-up is invitation-only during the pilot. The pilot community project is connected for login and password recovery. Forgot password sends a neutral response so it does not reveal whether an email has an account. The separate Sandz control project is not connected yet. In the current local code, consumer login routes to /dashboard; community-admin login still routes to its synthetic preview. Private bill data requires an active consumer session and completed storage setup. This does not describe a new production deployment.

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

The Sandz view explains the future AI configuration workflow but accepts no credentials. A secure server-side settings form, capability checks and MFA must be connected before a real key can be supplied. Never paste a key into CP chat. The demo has no model connection. OpenAI is selected for the separate, gated bill-reading flow; the key is configured server-side, never in this dialog.

## What comes next

Next steps are executable access tests, hosted synthetic bill verification, independent authority review and privacy controls, onboarding, persistent board and reviewed CP help. The beta roadmap tracks these gates. This preview does not process real bills or switch electricity service.

## Example questions

- “What can I try?” → explain sample tasks and the preview role selector.
- “How do I log in or reset my password?” → explain workspace selection, invitation-only access and the forgot-password link.
- “Can I scan a bill?” → explain sample review and that real scanning is not connected.
- “Is my data saved?” → explain session-only state and local scripted-help requests.
- “Will I save money?” → no guarantee or eligibility claim; distinguish sample arithmetic.
- Unsupported question → say the guide does not cover it and link to this page.

## Private bill dashboard · local development only

The new `/dashboard` consumer flow is separate from the synthetic `/demo/consumer` sample. It supports multiple JPEG/PNG bills, OpenAI extraction, review and private account-specific history when its migration, server configuration and enablement switch are in place. It remains disabled pending release review. All ownership stays unverified; consumer declarations are not independent proof. Public demo bill tools remain synthetic and do not accept real bills.

Example: “Can the preview save my actual bills?” — No. The public demo cannot. The new authenticated flow requires separately reviewed deployment setup; do not upload actual bills to the demo.

## Feature navigation

The maintained catalog is `wiki/previews/navigation.json`. CP uses it for feature and navigation questions in the demo and bill dashboard. Links are navigation only: the server still checks access. Available means the page or preview exists, not that a beta was released. Gated-local features require setup and release review. Synthetic features use made-up session-only records. Planned features have no action link.

From Home, open About or Sign up / Log in. Consumers reach /dashboard after login in the local code. There, use Bill images → Read and save drafts → Review bill → Confirm and add to history → House / electricity account. Open Ask CP about features and navigation for guidance. The public consumer demo has My energy and Community board; on mobile use Open menu. The admin demo has Members and Import consumers. The Sandz demo has Communities and an AI settings explanation. These demos never grant real role access.

Independent authority review, export/deletion, live invitations, persistent board moderation, offers/referrals, paid upgrades, support cases and full offline support remain unfinished. CP must explain their status rather than invent a working screen. All published production help still requires review and release binding; this catalog is an explicit public development preview only.

Example questions: “Where is my bill history?”, “How do I open the board?”, “What features are available?”, “Can I delete my bills?”, “Where do I buy an upgrade?”, “Does this prove ownership?” Expected answers name the actual navigation and current limitation, with no invented actions or access grants.

## Saved conversations and optional recall · local beta

After community login, open /conversations or use **Open saved CP conversations** inside the dashboard's CP help. This local beta requires the saved-chat-turn migration and server configuration before deployment. Choose **New conversation**, enter a question, and select **Send and save**. Use **Your history** to reopen saved exchanges, **Save title** to rename, and **Older messages** or **More conversations** for additional history. CP replies remain scripted preview help and do not read bills. Public demo and dashboard quick help remain session-only.

**Allow recall for this conversation** defaults off. Enabling it queues existing and future messages for later indexing; the embedding worker is not connected and no recall search happens yet. Turning it off removes vectors and queued work while retaining saved messages. **Delete conversation** asks for confirmation; **Delete permanently** removes the conversation, messages and associated recall data from application storage. This does not describe backup retention or a completed account-erasure process. Old replies are historical; open current guidance for current features. No private chats belong in the wiki.

Examples: “Where is my chat history?” — Link to /conversations and explain the configured local beta. “How do I delete a chat?” — Choose it in Your history, select Delete conversation, then confirm or cancel. “Will CP remember our last conversation?” — You can reopen saved messages; semantic recall is not connected. “Does turning off recall delete my messages?” — No; use Delete conversation to delete the saved conversation.

## Future services preview · 28 September 2026

Consumers: select **Explore future services** on /dashboard or the consumer demo. /services shows food, grocery and water delivery, home maintenance and laundry pickup, each marked **Future service**. Select Request, enter an optional made-up note, and choose **Add example request**. Nothing is sent to a community manager or provider.

Managers: select **Service requests · example** on the community-admin demo, or open /services/manage. It shows sample requests and those added in the consumer preview in the same tab. **Add service example** opens a modal for a name and description; **Add future service** adds a preview card. It does not activate a service. Changes use browser session storage, survive navigation/reload in that tab, and disappear when the tab closes or **Reset examples** is used. These are public synthetic pages with no live role privileges or database integration.

Example questions: “Can I request food delivery?” — Explain the preview request and no delivery/order or message being sent. “Where does the manager see requests?” — Link to /services/manage, explain same-tab examples. “Does adding a service launch it?” — No, the card remains Future service. Use made-up comments and no personal data.

## Tavily connectivity · local diagnostic

Community administrators can open **Integration checks** from their demo dashboard, then **Test Tavily connection**. Sign in to My community with an active administrator account first; the demo role selector grants no access. /admin/integrations sends one fixed public documentation query using server configuration. It consumes search allowance, returns a connection status, and never sends bills or chats. There is no key input field. Consumers and anonymous visitors cannot run it. CP web research is not connected yet.

Example: “Can CP search the internet?” — Not yet; the administrator connection check only tests Tavily access. “Where do I test Tavily?” — /admin/integrations after community-admin sign-in. No live success is claimed until that check passes in the deployed environment.

The catalog also includes **Solar-charged home battery**: explore buying a Powerwall-style battery to store solar energy. Compatibility, sizing, installation and costs need assessment; no supplier or savings are confirmed. Example: “Can I buy a Powerwall?” — Open the future-service card and try the example request; no order or purchase is placed.
