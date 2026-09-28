import { PGlite } from '@electric-sql/pglite';
import { vector } from '@electric-sql/pglite-pgvector';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const db=new PGlite({extensions:{vector}});
const a='10000000-0000-4000-8000-000000000001', b='10000000-0000-4000-8000-000000000002', admin='10000000-0000-4000-8000-000000000003';
const ca='20000000-0000-4000-8000-000000000001', cb='20000000-0000-4000-8000-000000000002';
const ma='30000000-0000-4000-8000-000000000001', mb='30000000-0000-4000-8000-000000000002';
const embedding='['+[1,...Array(1535).fill(0)].join(',')+']';
let checks=0;
async function eq(sql,rows,params=[]) { assert.deepEqual((await db.query(sql,params)).rows,rows); checks++; }
async function deny(sql,params=[]) { await assert.rejects(db.query(sql,params),e=>['42501','23503','23514','22000','22023','23505'].includes(e.code)); checks++; }
async function user(id,role='authenticated') { await db.exec('reset role'); await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]); await db.exec(`set role ${role}`); }
async function worker() { await user('','service_role'); }
async function insertMessage(id,conversation,owner) { await db.query("insert into public.conversation_messages(id,conversation_id,user_id,community_id,role,content) values($1,$2,$3,'pilot','user','Synthetic conversation only')",[id,conversation,owner]); }
try {
 await db.exec(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
 create schema auth; create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema public,auth to anon,authenticated,service_role;`);
 for(const name of ['202609250001_auth_foundation.sql','202609270001_private_conversation_rag.sql','202609270002_saved_chat_turns.sql']) await db.exec(await readFile(new URL(`../supabase/community/migrations/${name}`,import.meta.url),'utf8'));
 await db.exec("insert into public.community_config(id,display_name) values('pilot','Synthetic pilot')");
 for(const [id,role] of [[a,'consumer'],[b,'consumer'],[admin,'community_admin']]) {
  await db.query('insert into auth.users(id) values($1)',[id]);
  await db.query("insert into public.memberships(user_id,community_id) values($1,'pilot')",[id]);
  await db.query('insert into public.role_assignments(user_id,role) values($1,$2)',[id,role]);
 }
 for(const [id,c,m] of [[a,ca,ma],[b,cb,mb]]) {
  await user(id);
  await db.query("insert into public.conversations(id,community_id) values($1,'pilot')",[c]);
  await insertMessage(m,c,id);
  await eq('select id from public.conversation_messages',[{id:m}]);
 }
 await worker();
 await eq('select count(*)::integer as n from public.conversation_index_jobs',[{n:0}]);
 await user(a);
 await db.query('update public.conversations set memory_enabled=true where id=$1',[ca]);
 await deny("insert into public.conversation_messages(conversation_id,user_id,community_id,role,content) values($1,$2,'pilot','assistant','forged response')",[ca,a]);
 await deny("update public.conversation_messages set content='edited'");
 await deny("insert into public.conversations(user_id,community_id) values($1,'pilot')",[b]);
 await deny("insert into public.conversations(community_id) values('foreign')");
 await deny("insert into public.conversation_messages(conversation_id,user_id,community_id,role,content) values($1,$2,'pilot','user','foreign parent')",[cb,a]);
 await deny('select * from public.conversation_index_jobs');
 await deny('select * from public.claim_conversation_index_jobs()');
 await deny('update public.conversation_rag_settings set indexing_enabled=true');
 await worker();
 await eq('select count(*)::integer as n from public.conversation_index_jobs',[{n:1}]);
 await eq('select * from public.claim_conversation_index_jobs()',[]); // disabled default
 await db.exec('update public.conversation_rag_settings set indexing_enabled=true');
 const first=(await db.query('select * from public.claim_conversation_index_jobs()')).rows[0];
 assert.equal(first.message_id,ma); checks++;
 await eq('select * from public.claim_conversation_index_jobs()',[]); // lease prevents duplicate claim
 await eq('select public.complete_conversation_index_job($1,$2,$3) as ok',[{ok:false}],[ma,mb,embedding]);
 await eq('select public.complete_conversation_index_job($1,$2,$3) as ok',[{ok:true}],[ma,first.lease_token,embedding]);
 await eq('select public.complete_conversation_index_job($1,$2,$3) as ok',[{ok:false}],[ma,first.lease_token,embedding]);
 await user(a);
 await eq('select message_id from public.match_private_conversation_chunks($1)',[{message_id:ma}],[embedding]);
 await deny('insert into public.conversation_chunks(message_id,conversation_id,user_id,community_id,embedding) values($1,$2,$3,\'pilot\',$4)',[ma,ca,a,embedding]);
 for(const id of [b,admin]) {
  await user(id);
  await eq('select id from public.conversation_messages where id=$1',[],[ma]);
  await eq('select message_id from public.match_private_conversation_chunks($1)',[],[embedding]);
  await eq('delete from public.conversations where id=$1 returning id',[],[ca]);
 }
 await user(a);
 await db.query('update public.conversations set memory_enabled=false where id=$1',[ca]);
 await eq('select message_id from public.match_private_conversation_chunks($1)',[],[embedding]);
 await worker();
 await eq('select count(*)::integer as n from public.conversation_chunks',[{n:0}]);
 await eq('select count(*)::integer as n from public.conversation_index_jobs',[{n:0}]);
 await user(a);
 await db.query('update public.conversations set memory_enabled=true where id=$1',[ca]);
 await worker();
 const leased=(await db.query('select * from public.claim_conversation_index_jobs()')).rows[0];
 await user(a);
 await db.query('delete from public.conversation_messages where id=$1',[ma]);
 await worker();
 await eq('select public.complete_conversation_index_job($1,$2,$3) as ok',[{ok:false}],[ma,leased.lease_token,embedding]);
 await eq('select count(*)::integer as n from public.conversation_index_jobs',[{n:0}]);
 // Expired leases receive a new token; stale workers cannot overwrite the result.
 await user(b);
 await db.query('update public.conversations set memory_enabled=true where id=$1',[cb]);
 await worker();
 const old=(await db.query('select * from public.claim_conversation_index_jobs()')).rows[0];
 await db.exec("update public.conversation_index_jobs set lease_until=now()-interval '1 second'");
 const fresh=(await db.query('select * from public.claim_conversation_index_jobs()')).rows[0];
 assert.notEqual(old.lease_token,fresh.lease_token); checks++;
 await eq('select public.complete_conversation_index_job($1,$2,$3) as ok',[{ok:false}],[mb,old.lease_token,embedding]);
 await eq('select public.fail_conversation_index_job($1,$2) as ok',[{ok:true}],[mb,fresh.lease_token]);
 await eq('select * from public.claim_conversation_index_jobs()',[]); // backoff
 await db.exec("update public.conversation_index_jobs set available_at=now()-interval '1 second',attempts=4");
 const last=(await db.query('select * from public.claim_conversation_index_jobs()')).rows[0];
 await eq('select public.fail_conversation_index_job($1,$2) as ok',[{ok:true}],[mb,last.lease_token]);
 await eq("select state,attempts from public.conversation_index_jobs",[{state:'failed',attempts:5}]);
 await eq('select * from public.claim_conversation_index_jobs()',[]);
 // Opt-out removes failed work; opt-in queues a fresh generation. Completion enforces vector width.
 await user(b);
 await db.query('update public.conversations set memory_enabled=false where id=$1',[cb]);
 await db.query('update public.conversations set memory_enabled=true where id=$1',[cb]);
 await worker();
 const requeued=(await db.query('select * from public.claim_conversation_index_jobs()')).rows[0];
 await deny('select public.complete_conversation_index_job($1,$2,$3)',[mb,requeued.lease_token,'[1,0,0]']);
 await eq('select public.complete_conversation_index_job($1,$2,$3) as ok',[{ok:true}],[mb,requeued.lease_token,embedding]);
 await user(b);
 await eq('select message_id from public.match_private_conversation_chunks($1)',[{message_id:mb}],[embedding]);
 // Current membership blocks both worker indexing and retrieval.
 await db.exec('reset role');
 await db.query("update public.memberships set status='suspended' where user_id=$1",[b]);
 await user(b);
 await eq('select id from public.conversations',[]);
 await eq('select message_id from public.match_private_conversation_chunks($1)',[],[embedding]);
 await user('','anon');
 await deny('select * from public.conversation_messages');
 await deny('select * from public.match_private_conversation_chunks($1)',[embedding]);
 await db.exec('reset role');
 await db.query("update public.memberships set status='active' where user_id=$1",[b]);
 await user(b);
 await db.query('delete from public.conversations where id=$1',[cb]);
 await worker();
 await eq('select count(*)::integer as n from public.conversation_index_jobs',[{n:0}]);
 await eq('select count(*)::integer as n from public.conversation_messages',[{n:0}]);
 await eq('select count(*)::integer as n from public.conversation_chunks',[{n:0}]);
 await user(a);
 await db.query("update public.conversations set memory_enabled=true where id=$1",[ca]);
 const turnSql="select public.save_conversation_turn($1,'pilot',$2,$3,$4,$5) as ok";
 const turn=[a,ca,ma,'Synthetic question','Synthetic answer'];
 await deny(turnSql,turn);
 await worker();
 await eq(turnSql,[{ok:false}],[b,ca,ma,'Synthetic question','Synthetic answer']);
 await deny(turnSql,[a,ca,ma,'Synthetic question','']);
 await eq('select count(*)::integer as n from public.conversation_messages',[{n:0}]);
 await eq(turnSql,[{ok:true}],turn);
 await eq(turnSql,[{ok:true}],turn);
 await eq(turnSql,[{ok:false}],[a,ca,ma,'Changed retry','Synthetic answer']);
 await eq("select role,content from public.conversation_messages order by created_at",[{role:'user',content:'Synthetic question'},{role:'assistant',content:'Synthetic answer'}]);
 await eq('select count(*)::integer as n from public.conversation_index_jobs',[{n:2}]);
 await db.exec('reset role');
 await db.query("update public.memberships set status='suspended' where user_id=$1",[a]);
 await worker();
 await eq(turnSql,[{ok:false}],turn);
 await db.exec('reset role');
 await db.query("update public.memberships set status='active' where user_id=$1",[a]);
 await user(a);
 await db.query('delete from public.conversations where id=$1',[ca]);
 await worker();
 await eq(turnSql,[{ok:false}],turn);
 await eq('select count(*)::integer as n from public.conversation_index_jobs',[{n:0}]);
 console.log(`PASS: ${checks} private conversation/vector/queue assertions using actual migrations and pgvector. No external API calls.`);
} finally { await db.close(); }
