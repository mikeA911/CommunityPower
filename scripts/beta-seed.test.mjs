import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { seedUsers, seedBills, seedImageSvg } from './beta-seed-data.mjs';
import { parseBill, imageMime } from '../apps/web/src/lib/bills.ts';
test('seed has distinct stable records for two consumers and three accounts', () => {
  const all = seedUsers.flatMap((_,i) => seedBills(i));
  assert.equal(all.length,9);
  assert.equal(new Set(all.map(b => b.id)).size,9);
  assert.equal(new Set(all.map(b => b.fields.accountNumber)).size,3);
  assert.deepEqual(seedBills(0),seedBills(0));
  assert.ok(seedUsers.every(u => u.email.endsWith('@example.invalid')));
  for (const bill of all) assert.deepEqual(parseBill(bill.fields),bill.fields);
  assert.ok(all.some(b => b.fields.kwh === null));
  assert.ok(all.some(b => b.fields.amountDue < 0));
});
test('synthetic bill images are valid bounded PNGs with explicit synthetic labels', async () => {
  for (const bill of seedUsers.flatMap((_,i) => seedBills(i))) {
    const svg = seedImageSvg(bill.fields);
    assert.match(svg,/SYNTHETIC TEST BILL - NOT A REAL ACCOUNT/);
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    assert.equal(imageMime(png),'image/png');
    assert.ok(png.length < 3_000_000);
    assert.equal((await sharp(png).metadata()).height,750);
  }
});
