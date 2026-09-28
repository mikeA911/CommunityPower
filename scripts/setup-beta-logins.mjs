import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { seedUsers, seedBills, seedTag } from './beta-seed-data.mjs';
const target = 'https://mzlzxcgoxkdquoitiojm.supabase.co';
const file = new URL('../private/beta-test-logins.json', import.meta.url);
try {
  if (process.env.SUPABASE_COMMUNITY_URL?.replace(/\/$/,'') !== target || process.env.BETA_SEED_TARGET !== 'mzlzxcgoxkdquoitiojm') throw new Error();
  const admin = createClient(target, process.env.SUPABASE_COMMUNITY_SERVICE_ROLE_KEY, {auth:{persistSession:false,autoRefreshToken:false}});
  const identities = [];
  for (const [index, fixture] of seedUsers.entries()) {
    const row = await admin.from('consumer_bills').select('user_id').eq('id',seedBills(index)[0].id).single();
    if (row.error) throw new Error();
    const identity = await admin.auth.admin.getUserById(row.data.user_id);
    if (identity.error || identity.data.user.email !== fixture.email || identity.data.user.app_metadata?.seed_tag !== seedTag) throw new Error();
    identities.push(identity.data.user.id);
  }
  let saved;
  try { saved = JSON.parse(await readFile(file,'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (!saved) {
    saved = { target, seedTag, users:seedUsers.map((u,i) => ({email:u.email,userId:identities[i],password:randomBytes(36).toString('base64url')})) };
    await mkdir(new URL('../private/',import.meta.url),{recursive:true});
    // Persist before provisioning so an interrupted run can reuse, rather than lose, credentials.
    await writeFile(file,JSON.stringify(saved,null,2)+'\n',{flag:'wx',mode:0o600});
  }
  if (saved.target !== target || saved.seedTag !== seedTag || saved.users.length !== 2) throw new Error();
  for (const [i,user] of saved.users.entries()) {
    if (user.email !== seedUsers[i].email || user.userId !== identities[i] || typeof user.password !== 'string' || user.password.length < 32) throw new Error();
    const result = await admin.auth.admin.updateUserById(user.userId,{password:user.password});
    if (result.error) throw new Error();
  }
  console.log('Test login access configured for the two marked synthetic consumers. Credentials saved only in ignored private/beta-test-logins.json. No emails sent.');
} catch {
  console.error('Synthetic login setup stopped. No credential values are logged. Check the target, seed identities and private credential file locally.');
  process.exitCode=1;
}
