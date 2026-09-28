// Executes the actual migrations in ephemeral PostgreSQL; no network or credentials.
// Auth/Storage schemas below are test doubles, NOT a Supabase service integration.
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const db = new PGlite();
const owner = '10000000-0000-4000-8000-000000000001';
const other = '10000000-0000-4000-8000-000000000002';
const admin = '10000000-0000-4000-8000-000000000003';
const bill = '20000000-0000-4000-8000-000000000001';
let assertions = 0;
async function check(sql, expected, params = []) { const result = await db.query(sql, params); assert.deepEqual(result.rows, expected); assertions++; }
async function denied(sql, params = []) { await assert.rejects(db.query(sql, params), e => ['42501','23505','23514'].includes(e.code)); assertions++; }
async function asUser(id, role = 'authenticated') {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
  await db.exec(`set role ${role}`);
}
try {
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text, name text, unique(bucket_id,name));
    alter table storage.objects enable row level security;
    create function storage.foldername(text) returns text[] language sql immutable as $$ select (string_to_array($1,'/'))[1:array_length(string_to_array($1,'/'),1)-1] $$;
    grant usage on schema auth,storage,public to authenticated,anon;
    grant select,insert,update,delete on storage.objects to authenticated,anon;
  `);
  for (const file of ['202609250001_auth_foundation.sql','202609260001_consumer_bills.sql']) {
    await db.exec(await readFile(new URL(`../supabase/community/migrations/${file}`, import.meta.url), 'utf8'));
  }
  await db.exec("insert into public.community_config(id,display_name) values('test-community','Synthetic community')");
  for (const [id, role] of [[owner,'consumer'],[other,'consumer'],[admin,'community_admin']]) {
    await db.query('insert into auth.users(id) values($1)', [id]);
    await db.query("insert into public.memberships(user_id,community_id) values($1,'test-community')", [id]);
    await db.query('insert into public.role_assignments(user_id,role) values($1,$2)', [id,role]);
  }
  await asUser(owner);
  await db.query("insert into storage.objects(bucket_id,name) values('consumer-bills',$1)", [`${owner}/bill.png`]);
  await db.query('insert into public.consumer_bills(id,user_id,object_path,sha256,extraction) values($1,$2,$3,$4,$5)', [bill,owner,`${owner}/bill.png`,'a'.repeat(64),{supplier:'Synthetic Utility'}]);
  await check('select id from public.consumer_bills', [{id:bill}]);
  await check('select name from storage.objects', [{name:`${owner}/bill.png`}]);
  await denied("update public.consumer_bills set ownership='verified' where id=$1", [bill]);
  await denied("update public.consumer_bills set extraction='{}' where id=$1", [bill]);
  await check('delete from storage.objects returning name', []); // referenced original cannot be removed
  await denied('insert into public.consumer_bills(id,user_id,object_path,sha256,extraction) values(gen_random_uuid(),$1,$2,$3,\'{}\')', [owner,`${owner}/duplicate.png`,'a'.repeat(64)]);
  await denied("update public.consumer_bills set status='confirmed', reviewed='{}', declaration='{}', account_key='synthetic:001',period_start='2026-08-01',confirmed_at=now() where id=$1", [bill]);
  await db.query("update public.consumer_bills set status='confirmed', reviewed='{}', declaration='{}', account_key='synthetic:001',period_start='2026-08-01',period_end='2026-08-31',confirmed_at=now() where id=$1", [bill]);
  await denied("insert into public.consumer_bills(id,user_id,object_path,sha256,extraction,status,reviewed,declaration,account_key,period_start,period_end,confirmed_at) values(gen_random_uuid(),$1,$2,$3,'{}','confirmed','{}','{}','synthetic:001','2026-08-01','2026-08-31',now())", [owner,`${owner}/same-period.png`,'c'.repeat(64)]);
  await check("update storage.objects set name=$1 where name=$2 returning name", [], [`${owner}/changed.png`,`${owner}/bill.png`]);
  for (let i=0;i<10;i++) await check('select public.consume_bill_read() as allowed', [{allowed:true}]);
  await check('select public.consume_bill_read() as allowed', [{allowed:false}]);
  await denied('update public.bill_read_limits set attempts=0');
  for (const id of [other,admin]) {
    await asUser(id);
    await check('select id from public.consumer_bills', []);
    await check('select name from storage.objects', []);
    await check("update public.consumer_bills set reviewed='{}' where id=$1 returning id", [], [bill]);
    await denied("insert into storage.objects(bucket_id,name) values('consumer-bills',$1)", [`${owner}/foreign.png`]);
    await denied('insert into public.consumer_bills(id,user_id,object_path,sha256,extraction) values(gen_random_uuid(),$1,$2,$3,\'{}\')', [owner,`${owner}/foreign.png`,'b'.repeat(64)]);
  }
  await check('select public.consume_bill_read() as allowed', [{allowed:false}]);
  await db.exec('reset role');
  await db.query('update public.role_assignments set revoked_at=now() where user_id=$1', [other]);
  await asUser(other);
  await denied("insert into storage.objects(bucket_id,name) values('consumer-bills',$1)", [`${other}/revoked.png`]);
  await check('select public.consume_bill_read() as allowed', [{allowed:false}]);
  await db.exec('reset role');
  await db.query("update public.memberships set status='suspended' where user_id=$1", [owner]);
  await asUser(owner);
  await check('select id from public.consumer_bills', []);
  await check('select name from storage.objects', []);
  await check('select public.consume_bill_read() as allowed', [{allowed:false}]);
  await asUser('', 'anon');
  await denied('select * from public.consumer_bills');
  await check('select name from storage.objects', []);
  console.log(`PASS: ${assertions} bill policy assertions using actual migrations and synthetic Auth/Storage schemas.`);
  console.log('Hosted JWT validation, Storage HTTP service, concurrency and cross-project isolation remain separate release gates.');
} finally { await db.close(); }
