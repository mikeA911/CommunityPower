---
id: consumer-guide
title: Consumer onboarding and bills
version: 6
status: draft
audience: [consumer]
scope: global
availability: planned
required_features: [consumer_onboarding, bill_capture]
release_ids: []
owner: product
reviewer: null
reviewed_at: null
updated_at: 2026-09-28
review_due: null
sources: [docs/02_mvp_specification.md, docs/12_domain_ontology.md, docs/13_architecture.md, apps/web/README.md, apps/web/src/components/bills-dashboard.tsx, apps/web/src/app/api/bills/route.ts]
---

# Consumer onboarding and bills

Draft help. Login is implemented; the new private bill flow is implemented locally but remains disabled pending migration and release review.

Your community admin invites you by email. The intended flow is to verify the invitation, join the community and set up your login. An invitation does not grant control of an electricity account or consent to provider sharing. The initial architecture proposes separate logins for separate communities; this choice remains under review.

To add a bill, ask CP for help or use the direct bill task. Capture a clear image, select a supported file, or enter supported information manually. You need authority to manage the account. CP uses AI to suggest bill fields; you check and correct them. Human reviewer verification is separate from your confirmation.

A payment receipt may show an amount paid without usage. CP must leave missing kWh unknown and ask for the full bill or supported information. Neither a scan nor community membership proves electricity-service eligibility.

Your community admin can coordinate membership and see approved aggregates, but cannot read raw bills through that role alone. Data-sharing choices have their own scope and withdrawal process. Ask support when access or a calculation seems wrong; do not post a private bill on the community board.

## Example question

“CP could not read my bill. What happens next?”

Answer points: retry with a legible full bill or use manual entry; missing values remain unknown; no reviewed result or savings claim is created from failed extraction.

## Bill capture implementation update · 26 September 2026

Local code now adds `/dashboard` for consumers: select several bill images, consent to OpenAI processing/private storage, review each extracted bill, declare account authority, and confirm it into private history. JPEG/PNG only, 3 MB per image, one complete bill per image. The migration and enablement switch are pending deployment review; do not describe this as available in the public alpha. English and Filipino (Tagalog) are initial target languages; Khmer is additional test coverage, not a validated supported locale.

The original image can be opened from the review form. Check dates, account, currency, usage and payable amount. Several houses remain separate by supplier/account/currency. Uploads start as drafts; confirmed history survives reload through database storage when configured. Exact-image duplicates and duplicate confirmed account/period records are rejected. Unknown usage stays unknown and credit amounts remain negative.

Enter your own full name, service account number and address independently of corrections. CP compares them with the original extraction. A matching name/address/account is only a consistency check. Every record remains **ownership unverified**; differences need independent review. Being a tenant, family member or community member does not automatically grant authority. Independent verification and evidence-review procedures have not been implemented.

Additional example questions:

- “Can I add bills for two houses?” — Yes in the configured local feature; upload each bill and review separately. History separates supplier/account/currency.
- “Does matching my name prove ownership?” — No. Declaration and OCR matching never change the unverified status; no supplier sharing or switching is authorized.
- “Why is this bill missing from history?” — It may still be a draft; review and confirm required fields. History displays at most 500 recent uploads.
- “Who can see my original image?” — Active consumer owner only under the new API/database/Storage policies; admin roles do not grant raw-bill access. Deployment isolation checks remain required.
- “Can I use a PDF?” — This first slice accepts JPEG/PNG only. Use a clear image of the complete bill.

## Local beta navigation update · 27 September 2026

The bill dashboard now includes **Ask CP about features and navigation**. Ask where to find history, review, account selection or other features. Replies are scripted from the public preview guide/catalog and link to existing screens; they do not inspect your bills or perform actions. Planned export, deletion, authority review and support workflows are explicitly marked unfinished. Do not enter personal data in this help box.

Example: “Where is my bill history?” — Link to /dashboard and explain upload → review → confirm → House / electricity account, noting enablement and unverified ownership. “Can CP delete my bill?” — Explain that deletion-request workflow is planned and no action has been performed.

The configured local beta adds /conversations for active community accounts, linked from dashboard CP help as **Open saved CP conversations**. New conversation → Send and save stores your question and scripted CP reply. Your history reopens exchanges; Save title renames; Older messages and More conversations load further pages. Delete conversation → Delete permanently requires confirmation and removes messages and recall data from application storage. Backup retention and account erasure still require an operational policy. Public demo and dashboard quick help stay session-only. Deployment and the follow-up saved-chat-turn migration remain pending.

**Allow recall for this conversation** is optional, initially off, and queues messages for future indexing. The worker is not connected; no semantic recall happens. Turning recall off clears vectors/jobs but retains messages. Example: “Can my admin search my CP conversations?” — No default admin bypass; private history remains owner-scoped. “Does turning off recall delete my chat?” — No; use the confirmed conversation deletion control. Past statements never verify bill ownership or change permissions. Older CP replies can be outdated; consult current help.

## Future service examples · 28 September 2026

Select **Explore future services** on the consumer dashboard to open /services. Cards describe possible food/grocery/water delivery, home maintenance and laundry pickup. Every card is labeled Future service. Request a card, optionally enter a made-up note, then **Add example request**. The request appears in the same-tab manager example only; no one is contacted. Changes persist in that browser tab until it closes or Reset examples is used. These are public previews, not available services or private live requests.

Example: “Can I order food?” — No ordering is available; you can try the example interest-request flow. “Was my manager notified?” — No; this is a browser-only example.
