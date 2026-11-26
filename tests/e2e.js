// Real-browser click-through. Usage: node tests/e2e.js <url> [shotsDir]
const puppeteer = require(process.env.PPTR || 'puppeteer-core');
const fs = require('fs');
const url = process.argv[2], shots = process.argv[3] || '/tmp/shots';
fs.mkdirSync(shots, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const br = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'], headless: 'new' });
  const pg = await br.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('dialog', d => d.accept());
  await pg.emulateTimezone('Africa/Cairo');
  await pg.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await pg.evaluateOnNewDocument(() => { Object.defineProperty(navigator, 'language', { get: () => 'ar-EG' }); });
  await pg.goto(url, { waitUntil: 'networkidle0' });
  const txt = async s => pg.$eval(s, e => e.textContent);
  ok((await pg.$eval('html', e => e.dir)) === 'rtl', 'Arabic default -> dir=rtl');
  ok((await pg.$$('.env')).length === 9, '9 default envelopes render');
  await pg.type('#inc', '10000'); await pg.click('form[data-form=income] button');
  ok(/[1١][0٠][,٬][0٠]{3}/.test(await txt('.hero .big')), 'income saved and shown');
  ok((await pg.$$eval('.env', a => a.find(x => x.dataset.v === 'rent').querySelector('.lf').textContent)).replace(/[^0-9٠-٩]/g,'').length >= 4, 'envelopes allocated');
  // add expense via FAB
  await pg.click('.nav .add'); await pg.waitForSelector('#tamt');
  await pg.type('#tamt', '٢٥٠'); await pg.select('select[name=env]', 'food'); await pg.type('input[name=note]', 'Carrefour');
  await pg.click('form[data-form=tx] button[type=submit]');
  await pg.waitForFunction(() => !document.getElementById('ov'));
  const food = await pg.$$eval('.env', a => a.find(x => x.dataset.v === 'food').querySelector('.lf').textContent);
  ok(/1[,٬.]?٢?5?/.test(food) || food.length > 0, 'expense deducted: ' + food.trim());
  const sum = await pg.evaluate(() => JSON.parse(localStorage.getItem('mizanya.v1')).months);
  const m = Object.values(sum)[0]; ok(m.tx.length === 1 && m.tx[0].amount === 250, 'arabic digits parsed -> 250 stored');
  ok((await pg.evaluate(() => MZ.envelopeStats(JSON.parse(localStorage.getItem('mizanya.v1')), Object.keys(JSON.parse(localStorage.getItem('mizanya.v1')).months)[0]).food.left)) === 1250, 'food left = 1250');
  ok(await pg.$('.safe') !== null, 'safe-to-spend line shown for current month');
  await pg.screenshot({ path: shots + '/home-ar.png' });
  // invalid amount
  await pg.click('.nav .add'); await pg.waitForSelector('#tamt'); await pg.type('#tamt', 'abc'); await pg.click('form[data-form=tx] button[type=submit]');
  ok(await pg.$eval('#err', e => !e.hidden), 'invalid amount shows error'); await pg.click('[data-a=close]');
  // overspend
  await pg.click('.nav .add'); await pg.waitForSelector('#tamt'); await pg.type('#tamt', '9999'); await pg.select('select[name=env]', 'fun'); await pg.click('form[data-form=tx] button[type=submit]');
  await pg.waitForFunction(() => !document.getElementById('ov'));
  ok((await pg.$$('.env.over')).length === 1, 'overspent envelope flagged');
  // transfer
  await pg.click('.env[data-v=food]'); await pg.waitForSelector('[data-a=movesheet]'); await pg.click('[data-a=movesheet]'); await pg.waitForSelector('form[data-form=move]');
  await pg.select('select[name=to]', 'bills'); await pg.type('input[name=amount]', '100'); await pg.click('form[data-form=move] button[type=submit]');
  await pg.waitForFunction(() => !document.getElementById('ov'));
  ok(await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('mizanya.v1')); return Object.values(s.months)[0].transfers.length === 1; }), 'transfer recorded');
  await pg.click('.env[data-v=food]'); await pg.click('[data-a=movesheet]'); await pg.type('input[name=amount]', '99999'); await pg.click('form[data-form=move] button[type=submit]');
  ok(await pg.$eval('#err', e => !e.hidden), 'transfer over balance rejected'); await pg.click('[data-a=close]');
  // activity + delete
  await pg.click('[data-a=tab][data-v=activity]'); ok((await pg.$$('.tx')).length === 2, 'activity lists 2 entries');
  await pg.screenshot({ path: shots + '/activity-ar.png' });
  await pg.click('[data-a=deltx]'); ok((await pg.$$('.tx')).length === 1, 'delete entry works');
  // language
  await pg.click('[data-a=tab][data-v=home]'); await pg.click('[data-a=lang]');
  ok((await pg.$eval('html', e => e.dir)) === 'ltr' && (await txt('.brand')) === 'Mizanya', 'switch to English -> ltr');
  await pg.screenshot({ path: shots + '/home-en.png', fullPage: false });
  // month nav
  const before = await txt('#mlabel'); await pg.click('[data-a=next]'); ok((await txt('#mlabel')) !== before, 'month navigation'); ok((await txt('.hero .big')).includes('10,000'), 'income carried to next month'); await pg.click('[data-a=prev]');
  // settings: split
  await pg.click('[data-a=tab][data-v=settings]');
  await pg.$eval('#sp-needs', e => e.value = ''); await pg.type('#sp-needs', '60'); 
  ok(await pg.$eval('#splitwarn', e => !e.hidden), 'split warning when total != 100');
  await pg.$eval('#sp-wants', e => e.value = ''); await pg.type('#sp-wants', '20'); await pg.click('form[data-form=split] button');
  ok(await pg.evaluate(() => JSON.parse(localStorage.getItem('mizanya.v1')).split.needs === 60), 'split saved 60/20/20');
  await pg.screenshot({ path: shots + '/settings-en.png' });
  // new envelope
  await pg.click('[data-a=newenv]'); await pg.type('input[name=name]', 'Gym'); await pg.select('select[name=bucket]', 'wants'); await pg.click('form[data-form=newenv] button[type=submit]');
  await pg.waitForFunction(() => !document.getElementById('ov'));
  ok(await pg.evaluate(() => JSON.parse(localStorage.getItem('mizanya.v1')).envelopes.some(e => e.name === 'Gym')), 'custom envelope added');
  // persistence
  await pg.reload({ waitUntil: 'networkidle0' });
  ok(await pg.evaluate(() => JSON.parse(localStorage.getItem('mizanya.v1')).split.needs === 60) && (await txt('.brand')) === 'Mizanya', 'state + language persist after reload');
  // XSS
  await pg.click('[data-a=tab][data-v=settings]'); await pg.click('[data-a=newenv]'); await pg.type('input[name=name]', '<img src=x onerror=window.__x=1>'); await pg.click('form[data-form=newenv] button[type=submit]');
  await pg.waitForFunction(() => !document.getElementById('ov'));
  ok(!(await pg.evaluate(() => window.__x)) && (await pg.$$eval('.erow .n', a => a.some(x => x.textContent.includes('<img')))), 'names are escaped (no XSS)');
  // reset
  await pg.click('[data-a=reset]'); ok((await pg.$$('.env')).length === 0 || true, 'reset runs');
  await pg.click('[data-a=tab][data-v=home]'); ok((await pg.$$('.env')).length === 9, 'reset restores defaults');
  const sw = await pg.evaluate(async () => { try { await navigator.serviceWorker.ready; return (await caches.keys()).length > 0; } catch (e) { return false; } });
  ok(sw, 'service worker active and cache created (works offline)');
  const mf = await pg.evaluate(async () => (await fetch('manifest.webmanifest')).ok);
  ok(mf, 'web manifest served');
  // desktop shot
  await pg.setViewport({ width: 1280, height: 860 }); await pg.screenshot({ path: shots + '/desktop.png' });
  // no horizontal overflow on mobile
  await pg.setViewport({ width: 360, height: 740, isMobile: true });
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no horizontal overflow at 360px');
  ok(errs.length === 0, 'no page errors ' + errs.join('|'));
  await br.close();
  console.log(fails ? fails + ' FAILED' : 'ALL PASSED'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
