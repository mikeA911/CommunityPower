// Uses publishable key + real consumer sessions only. Never uses the service-role key.
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { seedBills, seedTag, seedUsers } from './beta-seed-data.mjs';
const clients=[];
let checks=0;
const expect = condition => { if (!condition) throw new Error('Isolation assertion failed'); checks++; };
try {
  const credentials=JSON.parse(await readFile(new URL('../private/beta-test-logins.json',import.meta.url),'utf8'));
  const url=process.env.SUPABASE_COMMUNITY_URL?.replace(/\/$/,'');
  expect(url==='https://mzlzxcgoxkdquoitiojm.supabase.co' && credentials.target===url && credentials.seedTag===seedTag && credentials.users.length===2);
  const makeClient=()=>createClient(url,process.env.SUPABASE_COMMUNITY_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  for (const [index,user] of credentials.users.entries()) {
    expect(user.email===seedUsers[index].email);
    const client=makeClient(); clients.push(client);
    const login=await client.auth.signInWithPassword({email:user.email,password:user.password});
    expect(!login.error && login.data.user?.id===user.userId);
    const identity=await client.auth.getUser();
    expect(!identity.error && identity.data.user?.id===user.userId);
    // Deliberately omit owner filter to test database policy rather than application filtering.
    const all=await client.from('consumer_bills').select('id,user_id,object_path,sha256');
    expect(!all.error && all.data.length===seedBills(index).length);
    expect(all.data.every(row=>row.user_id===user.userId));
    expect(JSON.stringify(all.data.map(r=>r.id).sort())===JSON.stringify(seedBills(index).map(r=>r.id).sort()));
    for (const row of all.data) {
      const image=await client.storage.from('consumer-bills').download(row.object_path);
      expect(!image.error && !!image.data);
      expect(createHash('sha256').update(Buffer.from(await image.data.arrayBuffer())).digest('hex')===row.sha256);
    }
    const foreignUser=credentials.users[1-index];
    for (const foreign of seedBills(1-index)) {
      const read=await client.from('consumer_bills').select('id').eq('id',foreign.id);
      expect(!read.error && read.data.length===0);
      // Identical-value write probe: if a policy is broken this cannot damage fixture content.
      const update=await client.from('consumer_bills').update({reviewed:foreign.fields}).eq('id',foreign.id).select('id');
      expect((!update.error && update.data.length===0) || update.error?.code==='42501');
      const path=`${foreignUser.userId}/${seedTag}/${foreign.id}.png`;
      const download=await client.storage.from('consumer-bills').download(path);
      expect(!!download.error && !download.data && ['400','403','404'].includes(String(download.error.statusCode)));
      const signed=await client.storage.from('consumer-bills').createSignedUrl(path,60);
      expect(!!signed.error && !signed.data?.signedUrl && ['400','403','404'].includes(String(signed.error.statusCode)));
    }
    const listing=await client.storage.from('consumer-bills').list(`${foreignUser.userId}/${seedTag}`);
    expect(!listing.error && listing.data.length===0);
    console.log(`Consumer ${index+1}: own ${all.data.length} bills/images readable; all foreign reads, writes, image downloads, signed URLs and listings denied.`);
  }
  const anon=makeClient();
  const anonymous=await anon.from('consumer_bills').select('id');
  expect(anonymous.error?.code==='42501' || (!anonymous.error && anonymous.data.length===0));
  const path=`${credentials.users[0].userId}/${seedTag}/${seedBills(0)[0].id}.png`;
  const anonymousImage=await anon.storage.from('consumer-bills').download(path);
  expect(!!anonymousImage.error && !anonymousImage.data);
  console.log(`PASS: ${checks} hosted consumer-session isolation assertions. No record values, credentials or session tokens logged.`);
  console.log('Scope: two synthetic consumers in one project; not cross-project, admin, suspension, concurrency or browser-dashboard acceptance.');
} catch {
  console.error(`Hosted isolation verification failed after ${checks} assertions. No sensitive values logged. Investigate before release.`);
  process.exitCode=1;
} finally {
  for (const client of clients) await client.auth.signOut({scope:'local'});
}
