// Read-only verification of the exact synthetic fixture IDs; never prints credentials or records.
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';
import { seedUsers, seedBills, seedTag } from './beta-seed-data.mjs';
const target = 'https://mzlzxcgoxkdquoitiojm.supabase.co';
if (process.env.SUPABASE_COMMUNITY_URL?.replace(/\/$/,'') !== target || process.env.BETA_SEED_TARGET !== 'mzlzxcgoxkdquoitiojm') throw new Error('Seed target mismatch.');
const client = createClient(target, process.env.SUPABASE_COMMUNITY_SERVICE_ROLE_KEY, { auth: { persistSession:false, autoRefreshToken:false } });
const requireResult = (result, label) => { if (result.error || !result.data) throw new Error(`${label} could not be verified.`); return result.data; };
try {
  const bucket = requireResult(await client.storage.getBucket('consumer-bills'), 'Bucket');
  if (bucket.public) throw new Error('Bill bucket is public.');
  const owners = new Set();
  let images = 0;
  for (const [index, user] of seedUsers.entries()) {
    let owner;
    for (const fixture of seedBills(index)) {
      const row = requireResult(await client.from('consumer_bills').select('*').eq('id',fixture.id).single(), 'Seed bill');
      owner ??= row.user_id;
      if (row.user_id !== owner || row.ownership !== 'unverified' || row.status !== 'confirmed' || row.declaration?.seed_tag !== seedTag) throw new Error('Seed ownership/status mismatch.');
      for (const [key,value] of Object.entries(fixture.fields)) if (row.extraction[key] !== value || row.reviewed[key] !== value) throw new Error('Seed field mismatch.');
      if (row.period_start !== fixture.fields.periodStart || row.period_end !== fixture.fields.periodEnd || row.object_path !== `${owner}/${seedTag}/${fixture.id}.png`) throw new Error('Seed period/image path mismatch.');
      const blob = requireResult(await client.storage.from('consumer-bills').download(row.object_path), 'Seed image');
      const bytes = Buffer.from(await blob.arrayBuffer());
      if (createHash('sha256').update(bytes).digest('hex') !== row.sha256) throw new Error('Seed image hash mismatch.');
      images++;
    }
    const identity = requireResult(await client.auth.admin.getUserById(owner), 'Seed identity').user;
    if (identity.email !== user.email || identity.app_metadata?.seed_tag !== seedTag) throw new Error('Synthetic identity marker mismatch.');
    const membership = requireResult(await client.from('memberships').select('status,community_id').eq('user_id',owner).single(), 'Membership');
    const roles = requireResult(await client.from('role_assignments').select('role,revoked_at').eq('user_id',owner), 'Roles');
    if (membership.status !== 'active' || membership.community_id !== (process.env.SUPABASE_COMMUNITY_ID || 'pilot') || roles.length !== 1 || roles[0].role !== 'consumer' || roles[0].revoked_at) throw new Error('Seed membership/role mismatch.');
    owners.add(owner);
  }
  if (owners.size !== 2) throw new Error('Synthetic consumers are not distinct.');
  console.log(`VERIFIED: 2 distinct synthetic consumers, 3 accounts, 9 matching bill records, ${images} private images with matching hashes. All ownership unverified.`);
  console.log('Administrative consistency check only; consumer-session RLS and cross-project isolation remain separate tests.');
} catch {
  console.error('Seed verification failed. Inspect the synthetic fixture privately; no records were changed.');
  process.exitCode = 1;
}
