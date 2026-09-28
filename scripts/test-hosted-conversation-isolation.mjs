// Explicit integration check: synthetic consumers only. --turns uses service role for the trusted RPC; no AI calls.
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { seedTag, seedUsers } from './beta-seed-data.mjs';

const sessions = [];
let checks = 0;
let stage = 'configuration';
const expect = value => { if (!value) throw new Error('Assertion failed'); checks++; };
const denied = result => expect(result.error?.code === '42501');
const empty = result => expect(!result.error && result.data.length === 0);
try {
  expect(process.argv.includes('--apply'));
  const credentials = JSON.parse(await readFile(new URL('../private/beta-test-logins.json', import.meta.url), 'utf8'));
  const url = process.env.SUPABASE_COMMUNITY_URL?.replace(/\/$/, '');
  expect(url === 'https://mzlzxcgoxkdquoitiojm.supabase.co' && credentials.target === url && credentials.seedTag === seedTag && credentials.users.length === 2);
  const makeClient = () => createClient(url, process.env.SUPABASE_COMMUNITY_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  for (const [index, user] of credentials.users.entries()) {
    stage = `consumer ${index + 1} login`;
    expect(user.email === seedUsers[index].email);
    const client = makeClient();
    const session = { client, user, conversation: randomUUID(), message: randomUUID() };
    sessions.push(session);
    const login = await client.auth.signInWithPassword({ email: user.email, password: user.password });
    expect(!login.error && login.data.user?.id === user.userId);
    const identity = await client.auth.getUser();
    expect(!identity.error && identity.data.user?.id === user.userId);
    stage = `consumer ${index + 1} synthetic writes`;
    const conversation = await client.from('conversations').insert({ id: session.conversation, community_id: 'pilot', title: 'Synthetic isolation check — delete after test' }).select('id,memory_enabled,user_id');
    expect(!conversation.error && conversation.data.length === 1 && !conversation.data[0].memory_enabled && conversation.data[0].user_id === user.userId);
    const message = await client.from('conversation_messages').insert({ id: session.message, conversation_id: session.conversation, community_id: 'pilot', role: 'user', content: 'Synthetic test message. No personal data.' }).select('id');
    expect(!message.error && message.data.length === 1);
  }
  const ids = sessions.map(s => s.conversation);
  const messageIds = sessions.map(s => s.message);
  const vector = `[${[1, ...Array(1535).fill(0)].join(',')}]`;
  for (const [index, session] of sessions.entries()) {
    stage = `consumer ${index + 1} isolation`;
    const { client, user, conversation, message } = session;
    const foreign = sessions[1 - index];
    const own = await client.from('conversations').select('id').in('id', ids);
    expect(!own.error && own.data.length === 1 && own.data[0].id === conversation);
    const messages = await client.from('conversation_messages').select('id').in('id', messageIds);
    expect(!messages.error && messages.data.length === 1 && messages.data[0].id === message);
    empty(await client.from('conversations').update({ title: 'Synthetic isolation check — delete after test' }).eq('id', foreign.conversation).select('id'));
    denied(await client.from('conversations').insert({ user_id: foreign.user.userId, community_id: 'pilot' }));
    denied(await client.from('conversation_messages').insert({ conversation_id: conversation, community_id: 'pilot', role: 'assistant', content: 'Synthetic forged assistant' }));
    const foreignInsert = await client.from('conversation_messages').insert({ conversation_id: foreign.conversation, user_id: foreign.user.userId, community_id: 'pilot', role: 'user', content: 'Synthetic foreign message' });
    denied(foreignInsert);
    denied(await client.from('conversation_messages').update({ content: 'Synthetic edit' }).eq('id', message));
    denied(await client.from('conversation_index_jobs').select('message_id').limit(1));
    denied(await client.from('conversation_rag_settings').select('indexing_enabled'));
    denied(await client.rpc('claim_conversation_index_jobs', { batch_size: 1 }));
    denied(await client.from('conversation_chunks').insert({ message_id: message, conversation_id: conversation, user_id: user.userId, community_id: 'pilot', embedding: vector }));
    // No opt-in: avoid creating jobs if an operator has enabled a worker separately.
    empty(await client.from('conversation_chunks').select('message_id').in('message_id', messageIds));
    empty(await client.rpc('match_private_conversation_chunks', { query_embedding: vector, match_count: 5 }));
    console.log(`Consumer ${index + 1}: own synthetic chats readable; foreign scope, forged assistant, vector writes and worker access denied.`);
  }
  stage = 'anonymous denial';
  const anonymous = makeClient();
  for (const table of ['conversations', 'conversation_messages', 'conversation_chunks', 'conversation_index_jobs', 'conversation_rag_settings']) {
    denied(await anonymous.from(table).select('*').limit(1));
  }
  denied(await anonymous.rpc('match_private_conversation_chunks', { query_embedding: vector }));
  if (process.argv.includes('--turns')) {
    stage = 'trusted saved-turn configuration';
    expect(!!process.env.SUPABASE_COMMUNITY_SERVICE_ROLE_KEY);
    const writer = createClient(url, process.env.SUPABASE_COMMUNITY_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    for (const [index, session] of sessions.entries()) {
      stage = `consumer ${index + 1} saved-turn checks`;
      const args = { owner_id: session.user.userId, scope_id: 'pilot', chat_id: session.conversation, request_id: randomUUID(), question: 'Synthetic saved question', answer: 'Synthetic scripted reply' };
      denied(await session.client.rpc('save_conversation_turn', args));
      denied(await anonymous.rpc('save_conversation_turn', args));
      const foreign = await writer.rpc('save_conversation_turn', { ...args, owner_id: sessions[1 - index].user.userId });
      expect(!foreign.error && foreign.data === false);
      const invalid = await writer.rpc('save_conversation_turn', { ...args, answer: '' });
      expect(invalid.error?.code === '23514');
      empty(await session.client.from('conversation_messages').select('id').eq('id', args.request_id));
      const saved = await writer.rpc('save_conversation_turn', args);
      expect(!saved.error && saved.data === true);
      const retry = await writer.rpc('save_conversation_turn', args);
      expect(!retry.error && retry.data === true);
      const changed = await writer.rpc('save_conversation_turn', { ...args, question: 'Changed retry' });
      expect(!changed.error && changed.data === false);
      const rows = await session.client.from('conversation_messages').select('id,role,content').eq('conversation_id', session.conversation);
      expect(!rows.error && rows.data.length === 3);
      expect(rows.data.filter(r => r.role === 'assistant' && r.content === args.answer).length === 1);
      expect(rows.data.filter(r => r.id === args.request_id && r.content === args.question).length === 1);
      empty(await sessions[1 - index].client.from('conversation_messages').select('id').eq('conversation_id', session.conversation));
    }
    console.log('Trusted saved-turn checks passed: atomic rollback, retry deduplication, owner matching and client/anonymous denial.');
  }
  console.log(`PASS: ${checks} hosted conversation assertions using two synthetic consumer sessions. No embedding API calls or indexing changes.`);
} catch {
  console.error(`Hosted conversation check failed at ${stage}, after ${checks} assertions. Sensitive values omitted.`);
  process.exitCode = 1;
} finally {
  let cleanupFailed = false;
  for (const { client, conversation } of sessions) {
    try {
      const removed = await client.from('conversations').delete().eq('id', conversation);
      const parent = await client.from('conversations').select('id').eq('id', conversation);
      const child = await client.from('conversation_messages').select('id').eq('conversation_id', conversation);
      if (removed.error || parent.error || child.error || parent.data.length || child.data.length) cleanupFailed = true;
      await client.auth.signOut({ scope: 'local' });
    } catch { cleanupFailed = true; }
  }
  if (cleanupFailed) {
    console.error('Synthetic cleanup could not be confirmed; inspect marked test conversations before release.');
    process.exitCode = 1;
  } else if (sessions.length) console.log('Cleanup verified: temporary conversations and their messages removed.');
}
