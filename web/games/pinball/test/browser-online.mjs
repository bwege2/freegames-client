// Pinball online in two headless Chromium pages against the real server (not part of npm test):
//   npm run build && node games/pinball/test/browser-online.mjs   (needs ../server/target/freegames-server.jar)
// Anna builds a table and saves it with the disk menu, opens a room on it, Bert joins, and a whole
// game of five balls each runs; at the end both pages must have run the same steps to the same RAM.
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const web = join(import.meta.dirname, '../../..');
const jar = join(web, '..', 'server', 'target', 'freegames-server.jar');
const chrome = ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(existsSync);
const port = await new Promise((resolve) => {
  const s = createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); });
});
const java = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', 'java') : 'java';
const server = spawn(java, ['-jar', jar], {
  env: { ...process.env, PORT: String(port), WEB_ROOT: join(web, 'dist'), DATA_DIR: mkdtempSync(join(tmpdir(), 'fg-pb-')) },
  stdio: ['ignore', 'ignore', 'inherit'],
});
const base = `http://localhost:${port}/`;
for (let i = 0; ; i++) {
  try { if ((await fetch(base)).ok) break; } catch { /* starting */ }
  if (i > 150) throw new Error('server did not start');
  await new Promise((r) => setTimeout(r, 100));
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
let failed = false;
const check = (ok, what) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`); if (!ok) failed = true; };
try {
  const open = async (name) => {
    const p = await (await browser.createBrowserContext()).newPage();
    await p.setViewport({ width: 1024, height: 804 });
    p.on('pageerror', (e) => console.log(`${name} page error: ${e.message}`));
    await p.goto(`${base}#/pinball/play`, { waitUntil: 'networkidle0' });
    await p.waitForSelector('.player-host canvas');
    await sleep(300);
    await p.keyboard.press('Enter');
    await sleep(800);
    return p;
  };
  const a = await open('anna');
  const b = await open('bert');
  const box = await (await a.$('.player-host canvas')).boundingBox();
  const at = (x, y) => [box.x + ((x + 0.5) * box.width) / 280, box.y + ((y + 0.5) * box.height) / 192];
  const go = async (p, x, y) => { await p.mouse.move(...at(x, y), { steps: 4 }); await sleep(700); };
  const click = async (p, x, y) => { await go(p, x, y); await p.mouse.down(); await sleep(200); await p.mouse.up(); await sleep(400); };
  const drag = async (p, from, to) => { await go(p, ...from); await p.mouse.down(); await sleep(150); await go(p, ...to); await p.mouse.up(); await sleep(300); };

  // anna builds a table (the ball, a bumper) and saves it with the disk menu
  await drag(a, [247, 7], [70, 20]);
  await drag(a, [174, 54], [60, 80]);
  await click(a, 262, 177);
  await sleep(500);
  await click(a, 170, 90);
  await sleep(500);
  await a.keyboard.press('T');
  await sleep(300);
  await a.keyboard.press('Enter');
  await sleep(2500);
  await click(a, 170, 100);
  await sleep(1000);
  const button = (p, text) => p.evaluateHandle((t) => [...document.querySelectorAll('button')].find((x) => x.textContent === t), text);
  // anna: Play online, her table, a room
  await (await button(a, 'Play online')).click();
  await a.waitForFunction(() => document.querySelector('.pb-choose select, .pb-choose button'), { timeout: 8000 });
  const tables = await a.$$eval('.pb-choose option', (o) => o.map((x) => x.value));
  check(tables.includes('T.PB'), `anna's saved table is offered (${tables.join(', ')})`);
  await (await button(a, 'Go to the lobby')).click();
  await a.waitForSelector('.fg-lobby');
  await a.$eval('.fg-lobby input[placeholder="Your name"]', (e) => { e.value = 'Anna'; e.dispatchEvent(new Event('change')); });
  await a.$eval('.fg-lobby input[placeholder="Room name"]', (e) => { e.value = 'pinball duel'; });
  await (await button(a, 'Create room')).click();
  await a.waitForFunction(() => document.querySelector('.fg-lobby h2')?.textContent === 'pinball duel', { timeout: 8000 });
  // bert joins
  await (await button(b, 'Play online')).click();
  await b.waitForFunction(() => [...document.querySelectorAll('button')].some((x) => x.textContent === 'Go to the lobby'), { timeout: 8000 });
  await (await button(b, 'Go to the lobby')).click();
  await b.waitForSelector('.fg-lobby');
  await b.$eval('.fg-lobby input[placeholder="Your name"]', (e) => { e.value = 'Bert'; e.dispatchEvent(new Event('change')); });
  await b.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('pinball duel')), { timeout: 8000 });
  await (await button(b, 'Join')).click();
  await b.waitForFunction(() => document.querySelector('.fg-lobby h2')?.textContent === 'pinball duel');
  await (await button(b, 'Ready')).click();
  await a.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('ready ✓')));
  await (await button(a, 'Start')).click();
  for (const p of [a, b]) await p.waitForFunction(() => window.__pinball?.online, { timeout: 8000 });
  check(true, 'the round started in both');
  await sleep(1500);
  const sa = await a.$eval('.pb-ui span', (e) => e.textContent);
  const sb = await b.$eval('.pb-ui span', (e) => e.textContent);
  console.log(`     anna: ${sa} / bert: ${sb}`);
  check(sa.startsWith('Online: your turn'), 'anna plays the first ball');
  check(sb.includes("Anna's turn"), 'bert watches anna');
  await a.screenshot({ path: join(tmpdir(), 'pb-online-a.png') });
  await b.screenshot({ path: join(tmpdir(), 'pb-online-b.png') });
  // turns go on by themselves (the ball falls); wait for bert's turn, then for the end
  await b.waitForFunction(() => window.__pinball.online.current === 1, { timeout: 60000 });
  check(true, "bert's turn came");
  const sb2 = await b.$eval('.pb-ui span', (e) => e.textContent);
  console.log(`     bert: ${sb2}`);
  for (const p of [a, b]) await p.waitForFunction(() => window.__pinball.online.done || window.__pinball.online.error, { timeout: 300000, polling: 500 });
  const hash = (p) => p.evaluate(() => {
    const m = window.__pinball.ram();
    let h = 0x811c9dc5;
    for (let i = 0; i < 0xb000; i++) {
      if (i === 0x100) i = 0x200;
      h ^= m[i];
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    const g = window.__pinball.online;
    return { h, step: g.step, error: g.error ? String(g.error) : null };
  });
  const ha = await hash(a);
  const hb = await hash(b);
  console.log(`     anna ${JSON.stringify(ha)} bert ${JSON.stringify(hb)}`);
  check(!ha.error && !hb.error, 'no errors');
  check(ha.step === hb.step && ha.h === hb.h, 'the same game in both: same steps, same RAM at the end');
  const ea = await a.$eval('.pb-end p', (e) => e.textContent).catch(() => '');
  check(ea === 'Game over.', `anna sees: ${ea}`);
  await a.screenshot({ path: join(tmpdir(), 'pb-online-end.png') });
  await (await button(a, 'Back to the construction set')).click();
  await sleep(500);
  check(await a.evaluate(() => !window.__pinball.online), 'back in the construction set');
} catch (e) {
  console.log('FAIL', e);
  failed = true;
} finally {
  await browser.close();
  server.kill();
}
process.exit(failed ? 1 : 0);
