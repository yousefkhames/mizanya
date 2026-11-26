const test = require('node:test'); const assert = require('node:assert');
const MZ = require('../logic.js');
const mk = '2026-11';
function fresh(income) { const s = MZ.defaultState(); MZ.getMonth(s, mk).income = income; return s; }

test('50/30/20 bucket amounts', () => {
  const s = fresh(10000);
  assert.equal(MZ.bucketAmount(s, mk, 'needs'), 5000);
  assert.equal(MZ.bucketAmount(s, mk, 'wants'), 3000);
  assert.equal(MZ.bucketAmount(s, mk, 'save'), 2000);
});
test('envelope allocations sum to bucket amounts', () => {
  const s = fresh(12345.67); const st = MZ.envelopeStats(s, mk);
  const sum = MZ.summary(s, mk);
  assert.ok(Math.abs(sum.alloc - 12345.67) < 0.1);
  assert.equal(st.rent.alloc, MZ.r2(MZ.bucketAmount(s, mk, 'needs') * 0.4));
});
test('expense reduces envelope, income adds', () => {
  const s = fresh(10000);
  MZ.addTx(s, mk, { env: 'food', amount: 500, type: 'expense' });
  assert.equal(MZ.envelopeStats(s, mk).food.left, 1500 - 500);
  MZ.addTx(s, mk, { env: 'food', amount: 200, type: 'income' });
  assert.equal(MZ.envelopeStats(s, mk).food.left, 1200);
});
test('overspend flagged', () => {
  const s = fresh(1000); MZ.addTx(s, mk, { env: 'fun', amount: 9999 });
  const o = MZ.envelopeStats(s, mk).fun; assert.ok(o.over); assert.ok(o.left < 0); assert.equal(o.pct, 0);
});
test('rejects bad amounts and envelopes', () => {
  const s = fresh(1000);
  assert.throws(() => MZ.addTx(s, mk, { env: 'food', amount: 0 }));
  assert.throws(() => MZ.addTx(s, mk, { env: 'food', amount: -5 }));
  assert.throws(() => MZ.addTx(s, mk, { env: 'nope', amount: 5 }));
});
test('transfer moves money and blocks overdraw', () => {
  const s = fresh(10000);
  MZ.transfer(s, mk, 'fun', 'food', 100);
  const st = MZ.envelopeStats(s, mk);
  assert.equal(st.fun.left, 1200 - 100); assert.equal(st.food.left, 1500 + 100);
  assert.throws(() => MZ.transfer(s, mk, 'fun', 'food', 999999));
  assert.throws(() => MZ.transfer(s, mk, 'fun', 'fun', 1));
});
test('split must total 100', () => {
  const s = fresh(1000);
  assert.throws(() => MZ.setSplit(s, { needs: 60, wants: 30, save: 20 }));
  MZ.setSplit(s, { needs: 60, wants: 20, save: 20 });
  assert.equal(MZ.bucketAmount(s, mk, 'needs'), 600);
});
test('new month inherits last income, empty tx', () => {
  const s = fresh(8000); MZ.addTx(s, mk, { env: 'food', amount: 10 });
  const m2 = MZ.getMonth(s, MZ.shiftMonth(mk, 1));
  assert.equal(m2.income, 8000); assert.equal(m2.tx.length, 0);
  assert.equal(MZ.shiftMonth('2026-12', 1), '2027-01'); assert.equal(MZ.shiftMonth('2026-01', -1), '2025-12');
});
test('remove envelope reassigns transactions, keeps last one', () => {
  const s = fresh(1000); MZ.addTx(s, mk, { env: 'out', amount: 10 });
  MZ.removeEnvelope(s, 'out');
  assert.ok(!s.envelopes.find(e => e.id === 'out'));
  assert.ok(MZ.getMonth(s, mk).tx.every(t => s.envelopes.some(e => e.id === t.env)));
  MZ.removeEnvelope(s, 'goal'); assert.throws(() => MZ.removeEnvelope(s, 'emerg'));
});
test('add envelope', () => {
  const s = fresh(1000); const e = MZ.addEnvelope(s, { name: 'Gym', bucket: 'wants', share: 20 });
  assert.ok(MZ.envelopeStats(s, mk)[e.id]); assert.throws(() => MZ.addEnvelope(s, { name: ' ', bucket: 'wants' }));
});
test('CSV escapes quotes and formula injection', () => {
  const s = fresh(1000); MZ.addTx(s, mk, { env: 'food', amount: 5, note: '=HYPERLINK("x")' });
  const c = MZ.toCSV(s, mk, 'en'); assert.ok(c.includes("\"'=HYPERLINK(\"\"x\"\")\""));
});
test('import validation', () => {
  const s = fresh(1000);
  assert.ok(MZ.validateImport(JSON.parse(JSON.stringify(s))));
  assert.ok(!MZ.validateImport({})); assert.ok(!MZ.validateImport(null));
  const bad = JSON.parse(JSON.stringify(s)); bad.split.needs = 90; assert.ok(!MZ.validateImport(bad));
  const bad2 = JSON.parse(JSON.stringify(s)); bad2.months[mk].tx.push({ env: 'ghost', amount: 5 }); assert.ok(!MZ.validateImport(bad2));
});
test('money formatting', () => {
  assert.ok(MZ.money(1234.5, 'EGP', 'en').startsWith('1,234.5'));
  assert.ok(/EGP$/.test(MZ.money(0, 'EGP', 'ar')));
});

test('safe per day: current month only, needs+wants', () => {
  const s = MZ.defaultState(); const m = '2026-11'; MZ.getMonth(s, m).income = 3000;
  assert.equal(MZ.daysInMonth(m), 30);
  assert.equal(MZ.safePerDay(s, m, new Date(2026, 10, 1)), 80 * 1 * 30 / 30 * 1 === 80 ? 80 : 80); // 2400 over 30 days
  assert.equal(MZ.safePerDay(s, m, new Date(2026, 10, 30)), 2400);
  assert.equal(MZ.safePerDay(s, m, new Date(2026, 9, 5)), null);
  MZ.addTx(s, m, { env: 'fun', amount: 5000 });
  assert.ok(MZ.safePerDay(s, m, new Date(2026, 10, 15)) >= 0);
});
test('leap-year month length', () => { assert.equal(MZ.daysInMonth('2028-02'), 29); assert.equal(MZ.daysInMonth('2027-02'), 28); });
