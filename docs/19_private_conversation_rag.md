# Private conversation storage and RAG foundation

27 September 2026. User reported successful foundation migration application; 44 hosted consumer-session checks subsequently passed. Local code now connects saved scripted CP conversations with history/deletion/recall controls. A follow-up migration and hosted API/deployment checks remain pending. No worker or embedding provider is connected.

## Provider decision

Use OpenAI `text-embedding-3-small`, 1,536 dimensions, as the initial candidate. It can use the server-side `OPENAI_API_KEY` already used by the planned OpenAI integration; no key is needed to apply or test this migration. Model and dimensions are constrained in the database so incompatible vectors cannot silently mix. The larger `text-embedding-3-large` is an alternative to evaluate, not an automatic fallback: changing models requires a versioned schema/reindex plan. English and Filipino retrieval quality still needs human-labeled evaluation; synthetic numeric-vector tests do not establish semantic quality.

Official sources checked 27 September 2026: [OpenAI embeddings](https://developers.openai.com/api/docs/guides/embeddings), [Supabase pgvector](https://supabase.com/docs/guides/database/extensions/pgvector), [PGlite vector extension](https://pglite.dev/extensions/). OpenAI documents 1,536 default dimensions for the small model and 3,072 for the large model. Provider data handling, cost budgets and token limits must be reviewed before enabling personal-data processing.

## Apply the prepared migration

In the intended community project's SQL Editor, review and run:

`supabase/community/migrations/202609270001_private_conversation_rag.sql`

It requires the community Auth foundation. It creates `vector` in the `extensions` schema; if vector already lives elsewhere, the transaction stops rather than moving it silently. Do not rerun an already applied migration. It does not modify existing bill records, grant new membership, provision users, schedule cron jobs or enable indexing. A user-applied migration still needs hosted acceptance evidence.

The migration covers active users with a current community role, including consumers and community admins, **only for their own conversations**. It does not give admins access to member chat. The separate Sandz control project uses a different Auth schema and needs a separate adaptation; do not run this community migration there.

## Tables

| Table | Purpose / access |
|---|---|
| `conversations` | User/community owner, title and `memory_enabled=false` by default. Owner can rename, opt in/out and delete. |
| `conversation_messages` | Immutable user/assistant text, linked to exact conversation/user/community by a composite FK. Owners can read/delete their messages and insert only `user` messages. Trusted server writes assistant responses; clients cannot impersonate CP. |
| `conversation_chunks` | One 1,536-dimensional vector per bounded immutable message in v1; text stays in the source message. Owner can read eligible vectors; only trusted worker can write. |
| `conversation_index_jobs` | One durable job per message; no copied text or provider responses. Worker-only, no client reads/writes. |
| `conversation_rag_settings` | Fixed model/dimensions and `indexing_enabled=false` default. No public/authenticated updates; privileged operations only. |

Account creation alone creates no conversation, vectors or API requests. Once the future UI saves a message, a trigger queues it **only if** that conversation has recall enabled. Opting in later queues existing messages. Queue insertion is atomic with the message write; the disabled global switch prevents worker claims. It does not discard history or disable retrieval of already indexed eligible messages. Turning off a conversation's memory removes its chunks and jobs immediately. Message/conversation deletion cascades to dependent vectors/jobs. Revoked/suspended membership prevents reads/search and worker claims. Database service-role access remains privileged and must stay server-side.

No summaries are stored in v1. Future summaries/caches must inherit the same deletion and consent rules. History is reference material, never authorization, verified ownership, current bill truth or permission to execute a tool. Keep wiki retrieval and private-history retrieval separate.

## Worker contract (worker not implemented)

1. A bounded trusted worker calls `claim_conversation_index_jobs(batch_size)` using a server-only worker credential. Default 5, capped at 20; it returns message text, model/dimensions, message ID and a fresh lease token. Disabled indexing returns no rows. SQL row locks with `SKIP LOCKED` avoid duplicate live claims.
2. Before any outbound API request, recheck current eligibility/settings and enforce per-user/community/global spend and token budgets. Each message is capped at 4,000 characters, but the worker must still tokenize for the provider limit; character count is not a token guarantee. Do not log texts, vectors, provider bodies, credentials or lease tokens. Already-dispatched requests cannot be recalled by deleting a message.
3. Send the source text to OpenAI's embeddings endpoint, with the exact model and 1,536 dimensions. Treat it as data; never run instructions found in the text. There are no model-controlled tools in this worker.
4. Call `complete_conversation_index_job(message_id, lease_token, vector)`. Completion checks settings, current scope, opt-in, live source and unexpired token before saving. Stale or deleted work returns false; discard the result. Vectors with wrong dimensions/zero norm cannot be stored.
5. Call `fail_conversation_index_job(message_id, lease_token)` on a handled failure. It records no raw error text, schedules bounded backoff, and stops at five attempts. Expired leases become reclaimable after five minutes with a new token; old workers cannot overwrite a later attempt. Expired fifth attempts become failed on the next claim pass. Future operations UI should expose redacted counts and a scoped retry procedure.

Queue concurrency logic is exercised sequentially with synthetic expired leases locally; concurrent hosted workers, deadlock retry, outages and cancellation timing still need integration tests. No worker/scheduler is installed by this migration. Do not enable the database switch until these controls and privacy review are ready.

## Retrieval contract

`match_private_conversation_chunks(query_embedding, match_count)` runs as the caller with RLS. Call it with the requesting user's verified session, never a browser-supplied user ID or a service-role client. It returns only currently accessible source messages; result count is capped at 20. An embedding made with another model must not be submitted even if it has the same dimension; the future server enforces that model contract.

V1 performs exact cosine search over the eligible owner scope, with a B-tree ownership index. An approximate vector index is intentionally deferred until owner-filtered recall and performance are measured. Private retrieval never substitutes for a structured bill/account query. The future UI must show past-conversation references and handle no-match results rather than fabricate memory.

## Verification and next work

`npm run test:rag` applies the actual foundation and RAG migrations in disposable PostgreSQL with the real vector extension and synthetic Auth schema. It checks owner isolation, no admin bypass, forged assistant/foreign scope rejection, disabled indexing, vector matching, lease fencing, backoff/attempt limits, opt-out, deletion and suspended/anonymous denial. No network, service key or OpenAI key is needed. Included in `npm test`/CI.

Hosted verification: `node --env-file=apps/web/.env.local scripts/test-hosted-conversation-isolation.mjs --apply` passed 44 assertions on 27 September using only the publishable key and two existing synthetic consumer logins from ignored private storage. The script creates temporary conversations/messages, verifies own reads and cross-owner/forged-assistant/worker/vector-write denial, checks the empty vector-search RPC and anonymous denial, then deletes its own temporary conversations and verifies message cascade cleanup. It never opts in, changes indexing settings or calls OpenAI. Run only against the named pilot with those dedicated synthetic accounts; this is an explicit integration command, not part of routine CI.

Remaining: apply the saved-turn migration below; hosted saved-chat API/browser acceptance; populated-vector retrieval, worker lifecycle, concurrency, admin and suspension tests; worker/token/spend controls; processing/retention notices; English/Filipino retrieval evaluation; separately reviewed production wiki retrieval. The 44-check integration run does not inspect the privileged global setting or prove queue processing. B12 in the beta tracker owns this follow-up.

## Saved conversations implementation

Hosted update: user applied `202609270002_saved_chat_turns.sql`; the hosted suite with `--apply --turns` passed 69 assertions. This optional mode requires the existing server-only community service key for synthetic RPC calls and retains consumer-session reads. It verifies trusted saves, atomic rollback on invalid replies, retry deduplication, changed-retry rejection, owner mismatch and client/anonymous denial. Cleanup verified all temporary conversations/messages removed. The command does not enable recall/indexing or call OpenAI. Earlier preparation instructions below are retained for fresh environments; the named pilot no longer needs this migration applied again. Hosted application API/browser acceptance and deployment remain pending.

Apply `supabase/community/migrations/202609270002_saved_chat_turns.sql` after the foundation in the intended community project; it is prepared, not remotely applied. It adds only `save_conversation_turn`, executable by service_role, not anonymous or authenticated clients. Configure the existing server-only `SUPABASE_COMMUNITY_SERVICE_ROLE_KEY` alongside community Auth configuration. No OpenAI key is needed for scripted saved conversations. No new feature flag enables the indexing worker.

The local `/conversations` page is linked from dashboard CP help. It provides new chats, paginated history (30 conversations, 50 messages per request), rename, reopen, optional recall and confirmed deletion. Private APIs validate active community sessions with `getUser` and current scope; read/update/delete use that session's RLS client. Mutation requests require same origin, JSON and a streamed 20 KB limit. Questions are bounded to 500 characters. Owner, role and assistant content are never accepted from client input. Server-generated replies use the explicitly draft scripted preview guide and record its version/source in the saved text. They do not read private history into an LLM or access bill data. Historical answers can become stale; the page links current guidance.

Only saving a turn uses a server service client, through the constrained RPC. The RPC locks the owned conversation, checks current membership/role, and atomically inserts user/assistant messages. A failed second insert rolls back the first and its queue effects. Reusing a request UUID with the same question succeeds without duplicating the exchange; different content fails. Browser retries retain the UUID while the pending question is unchanged; after a full page reload, review saved history before resending an uncertain exchange. Deletion/recall changes serialize with turn insertion. Multi-tab updates, quotas and operational monitoring need hosted release validation.

Recall defaults off; the toggle queues existing/future messages for later work. Turning it off deletes vectors/jobs but keeps chat history. Deleting a conversation removes messages/vectors/jobs from application storage, with an explicit UI confirmation. Backup retention and account-erasure policies remain separate release requirements. The embedding worker remains absent and must not be enabled as part of this UI setup. Public demo and dashboard quick-help chats are unchanged and session-only. Sandz control accounts are not supported on this community route.
