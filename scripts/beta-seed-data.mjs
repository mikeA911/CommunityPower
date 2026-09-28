import { createHash } from 'node:crypto';
export const seedTag = 'cp-beta-seed-v1';
export const seedUsers = [
  { email: 'cp-beta-one@example.invalid', name: 'SYNTHETIC Consumer One' },
  { email: 'cp-beta-two@example.invalid', name: 'SYNTHETIC Consumer Two' },
];
export function seedBills(userIndex) {
  const accounts = userIndex === 0 ? ['SYNTHETIC-HOUSE-A','SYNTHETIC-HOUSE-B'] : ['SYNTHETIC-HOUSE-C'];
  return accounts.flatMap((accountNumber, house) => [6,7,8].map((month, index) => {
    const kwh = userIndex === 1 && index === 2 ? null : 100 + house * 80 + index * 20;
    const amountDue = userIndex === 0 && house === 1 && index === 2 ? -100 : (kwh ?? 140) * 10;
    const periodStart = `2026-0${month}-01`;
    const periodEnd = `2026-0${month}-${month === 6 ? '30' : '31'}`;
    const fields = { supplier: 'SYNTHETIC Utility - not a supplier offer', accountNumber, accountName: seedUsers[userIndex].name, address: `${house + 1} Synthetic Test Street`, periodStart, periodEnd, dueDate: `2026-0${month + 1}-15`, currency: 'PHP', kwh, subtotal: amountDue, amountDue };
    const hex = createHash('sha256').update(`${seedTag}:${userIndex}:${accountNumber}:${periodStart}`).digest('hex');
    const id = `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;
    return { id, fields };
  }));
}
export function seedImageSvg(fields) {
  const lines = ['SYNTHETIC TEST BILL - NOT A REAL ACCOUNT', ...Object.entries(fields).map(([key,value]) => `${key}: ${value ?? 'UNKNOWN'}`)];
  const escape = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="750"><rect width="100%" height="100%" fill="white"/>${lines.map((line,index) => `<text x="30" y="${50 + index * 45}" font-family="sans-serif" font-size="22" fill="black">${escape(line)}</text>`).join('')}</svg>`;
}
