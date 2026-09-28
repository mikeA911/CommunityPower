// Defaults to a no-network preview. Explicit --apply uses only the named pilot.
import { createClient } from '@supabase/supabase-js';
import { randomBytes, createHash } from 'node:crypto';
import { seedTag, seedUsers, seedBills, seedImageSvg } from './beta-seed-data.mjs';
const expectedUrl = 'https://mzlzxcgoxkdquoitiojm.supabase.co';
const apply = process.argv.includes('--apply');
if (process.argv.some(arg => arg.startsWith('--') && arg !== '--apply')) throw new Error('Only --apply is supported; omit it for a no-network preview.');
console.log('Seed: two synthetic consumers, three accounts, nine bill records/images. All ownership unverified. No emails or AI calls.');
if (!apply) {
  console.log('PREVIEW ONLY: no credentials read and no remote requests. Run with --apply only after configuring the documented environment.');
} else {
  const url = process.env.SUPABASE_COMMUNITY_URL?.replace(/\/$/,'');
  const secret = process.env.SUPABASE_COMMUNITY_SERVICE_ROLE_KEY;
  if (url !== expectedUrl || process.env.BETA_SEED_TARGET !== 'mzlzxcgoxkdquoitiojm') throw new Error('Target mismatch: this seed is scoped to the explicitly named pilot project.');
  if (!secret || secret.includes('YOUR_')) throw new Error('Configure SUPABASE_COMMUNITY_SERVICE_ROLE_KEY privately; never paste it into chat.');
  const client = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const must = (result, step) => { if (result.error) throw new Error(`${step} failed; stopped without modifying unrelated records. Review the project privately.`); return result.data; };
  try {
    const config = must(await client.from('community_config').select('id').single(), 'Community lookup');
    must(await client.from('consumer_bills').select('id').limit(0), 'Bill schema preflight (apply the reviewed migration first)');
    const bucket = must(await client.storage.getBucket('consumer-bills'), 'Private bucket preflight');
    if (bucket.public) throw new Error('Refusing to seed a public bill bucket.');
    const { default: sharp } = await import('sharp');
    // Enumerate privately to find only exact seed addresses; never print user lists.
    const found = new Map();
    for (let page=1;;page++) {
      const data = must(await client.auth.admin.listUsers({page,perPage:1000}), 'Seed identity lookup');
      for (const user of data.users) if (seedUsers.some(s => s.email === user.email)) found.set(user.email,user);
      if (data.users.length < 1000) break;
      if (page >= 100) throw new Error('Identity lookup exceeded safe scan limit.');
    }
    // Preflight every existing identity before any mutation; never repurpose a real user.
    for (const record of found.values()) if (record.app_metadata?.seed_tag !== seedTag) throw new Error('An existing identity occupies a seed address without the seed marker. No identities changed.');
    let created = 0, skipped = 0;
    for (const [index, fixture] of seedUsers.entries()) {
      let user = found.get(fixture.email);
      if (!user) {
        const result = must(await client.auth.admin.createUser({email:fixture.email,password:randomBytes(48).toString('base64url'),email_confirm:true,app_metadata:{seed_tag:seedTag},user_metadata:{display_name:fixture.name}}), 'Synthetic identity creation');
        user = result.user;
      }
      const membership = must(await client.from('memberships').select('community_id,status').eq('user_id',user.id).maybeSingle(), 'Seed membership lookup');
      if (membership && (membership.community_id !== config.id || membership.status !== 'active')) throw new Error('Existing seed membership changed; it will not be overwritten or reactivated.');
      if (!membership) must(await client.from('memberships').insert({user_id:user.id,community_id:config.id,status:'active'}), 'Seed membership');
      const roles = must(await client.from('role_assignments').select('role,revoked_at').eq('user_id',user.id), 'Seed role lookup');
      if (roles.some(r => r.role !== 'consumer' || r.revoked_at)) throw new Error('Existing seed roles changed; no automatic grants or reactivation.');
      if (!roles.length) must(await client.from('role_assignments').insert({user_id:user.id,role:'consumer'}), 'Synthetic consumer role');
      for (const fixtureBill of seedBills(index)) {
        const { id, fields } = fixtureBill;
        const existing = must(await client.from('consumer_bills').select('id,user_id,object_path').eq('id',id).maybeSingle(), 'Seed bill lookup');
        const path = `${user.id}/${seedTag}/${id}.png`;
        if (existing) {
          if (existing.user_id !== user.id || existing.object_path !== path) throw new Error('Seed bill ID collision; existing record preserved.');
          skipped++; continue;
        }
        const png = await sharp(Buffer.from(seedImageSvg(fields))).png().toBuffer();
        // A prior partial run may already have uploaded this image. Reuse only identical bytes.
        const old = await client.storage.from('consumer-bills').download(path);
        if (old.data) {
          if (!Buffer.from(await old.data.arrayBuffer()).equals(png)) throw new Error('Seed image collision; existing file preserved.');
        } else must(await client.storage.from('consumer-bills').upload(path,png,{contentType:'image/png',upsert:false}), 'Synthetic image upload');
        must(await client.from('consumer_bills').insert({id,user_id:user.id,object_path:path,sha256:createHash('sha256').update(png).digest('hex'),extraction:fields,reviewed:fields,declaration:{name:fields.accountName,account:fields.accountNumber,address:fields.address,seed_tag:seedTag},ownership:'unverified',ownership_note:'SYNTHETIC seed; no human or independent verification.',status:'confirmed',account_key:fields.supplier.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'')+':'+fields.accountNumber.toLowerCase().replace(/[^\p{L}\p{N}]/gu,''),period_start:fields.periodStart,period_end:fields.periodEnd,confirmed_at:'2026-09-27T00:00:00Z'}), 'Synthetic bill insert');
        created++;
      }
    }
    console.log(`Seed completed: ${created} bill rows inserted, ${skipped} existing seed rows preserved. Synthetic login passwords are random and not exposed.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Seed stopped. Inspect the project privately.');
    process.exitCode = 1;
  }
}
