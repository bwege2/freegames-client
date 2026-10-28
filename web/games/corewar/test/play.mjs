// Plays Core War once in headless Chromium against the real server (npm run build and the server jar
// first): a local battle with its results, then an online battle of two browser contexts through
// the lobby (both enter a warrior, both run the battle, the server module agrees on the result).
//   node games/corewar/test/play.mjs     (screenshots in $E2E_SHOTS, default dist-e2e/)
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const web = join(import.meta.dirname, '..', '..', '..');
const jar = join(web, '..', 'server', 'target', 'freegames-server.jar');
const shots = process.env.E2E_SHOTS ?? join(web, 'dist-e2e');
const chrome = process.env.CHROME ?? ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(existsSync);
mkdirSync(shots, { recursive: true });
const port = await new Promise((resolve) => {
  const s = createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); });
});
const java = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', 'java') : 'java';
const server = spawn(java, ['-jar', jar], {
  env: { ...process.env, PORT: String(port), WEB_ROOT: join(web, 'dist'), DATA_DIR: mkdtempSync(join(tmpdir(), 'fg-cw-')) },
  stdio: ['ignore', 'ignore', 'inherit'],
});
let browser = null, failed = false;
const check = (ok, what) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`); if (!ok) failed = true; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
try {
  const base = `http://localhost:${port}/`;
  for (let i = 0; ; i++) {
    try { if ((await fetch(base)).ok) break; } catch { /* starting */ }
    if (i > 150) throw new Error('server did not start');
    await wait(100);
  }
  browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
  const pages = [];
  for (let i = 0; i < 2; i++) {
    const p = await (await browser.createBrowserContext()).newPage();
    await p.setViewport({ width: 1100, height: 800 });
    p.on('pageerror', (e) => { console.log(`page error: ${e.message}`); failed = true; });
    await p.goto(`${base}#/corewar/play`, { waitUntil: 'networkidle0' });
    await p.waitForSelector('.cw-cmd');
    pages.push(p);
  }
  const [a, b] = pages;
  const button = (p, text) => p.evaluateHandle((t) => [...document.querySelectorAll('button')].find((x) => x.textContent === t), text);
  const term = (p) => p.evaluate(() => [...document.querySelectorAll('.cw-term .fg-term-line')].map((e) => e.textContent).join('\n'));
  const panel = (p) => p.evaluate(() => document.querySelector('.cw-xwin-panel')?.textContent ?? '');
  const until = async (p, f, ms, what) => {
    for (let t = 0; t < ms; t += 200) { if (await f()) return true; await wait(200); }
    console.log(`timeout: ${what}`);
    return false;
  };

  // ---- a local battle: a warrior saved to account storage against an example
  await a.$eval('.cw-edit-row input', (e) => { e.value = 'mine.red'; });
  await a.$eval('.cw-edit textarea', (e) => { e.value = ';redcode-94\n;name Mine\n;author e2e\n;assert 1\nstep equ 4\nloop add.ab #step, 3\n mov.i 2, @2\n jmp loop\n dat #0, #0\n end loop\n'; });
  await (await button(a, 'Save')).click();
  check(await until(a, async () => (await a.$$eval('.cw-files li span', (s) => s.map((x) => x.textContent))).includes('mine.red'), 3000, 'saved file listed'), 'a warrior is saved in account storage');
  await a.$eval('.cw-cmd', (e) => { e.value = '-r 2 mine.red warriors/imp.red'; });
  await (await button(a, 'Run')).click();
  check(await until(a, async () => !!(await a.$('.cw-xhost.cw-open canvas')), 5000, 'window'), 'the core window opens');
  check(await until(a, async () => (await panel(a)).includes('Press any key'), 60000, 'end of battle'), 'the battle ends with "Press any key .."');
  await a.screenshot({ path: join(shots, 'corewar-local.png') });
  await a.keyboard.press('Enter');
  check(await until(a, async () => /Mine by e2e scores \d+/.test(await term(a)) && /Results: \d+ \d+ \d+/.test(await term(a)), 5000, 'results'), 'pMARS prints the results');
  console.log(`     ${(await term(a)).split('\n').filter((l) => /scores|Results/.test(l)).join(' | ')}`);

  // ---- an online battle: a creates the room (1 round), b joins
  await a.click('.cw-bar button:nth-of-type(3)'); // Options
  await a.$eval('.cw-opts input[type=number]', (e) => { e.value = '1'; e.dispatchEvent(new Event('change')); });
  await (await button(a, 'Online battle')).click();
  await a.waitForSelector('.fg-lobby');
  await a.$eval('.fg-lobby input[placeholder="Your name"]', (e) => { e.value = 'Anna'; e.dispatchEvent(new Event('change')); });
  await a.$eval('.fg-lobby input[placeholder="Room name"]', (e) => { e.value = 'core war e2e'; });
  await (await button(a, 'Create room')).click();
  await a.waitForFunction(() => document.querySelector('.fg-lobby h2')?.textContent === 'core war e2e');
  await (await button(b, 'Online battle')).click();
  await b.waitForSelector('.fg-lobby');
  await b.$eval('.fg-lobby input[placeholder="Your name"]', (e) => { e.value = 'Bert'; e.dispatchEvent(new Event('change')); });
  await b.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('core war e2e')), { timeout: 8000 });
  await (await button(b, 'Join')).click();
  await b.waitForFunction(() => document.querySelector('.fg-lobby h2')?.textContent === 'core war e2e');
  await (await button(b, 'Ready')).click();
  await a.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('ready ✓')));
  await (await button(a, 'Start')).click();
  for (const p of pages) await p.waitForFunction(() => document.querySelector('.cw-box h2')?.textContent === 'Core War online', { timeout: 8000 });
  await a.screenshot({ path: join(shots, 'corewar-enter.png') });
  await a.select('.cw-box select', 'mine.red');
  await b.select('.cw-box select', 'warriors/dwarf.red');
  await (await button(a, 'Enter this warrior')).click();
  await wait(300);
  check(!(await a.$('.cw-xhost.cw-open')), 'no battle before every seat entered a warrior');
  await (await button(b, 'Enter this warrior')).click();
  for (const p of pages) check(await until(p, async () => !!(await p.$('.cw-xhost.cw-open canvas')), 8000, 'online window'), 'the battle runs on both clients');
  await b.screenshot({ path: join(shots, 'corewar-online.png') });
  for (const p of pages) {
    check(await until(p, async () => (await panel(p)).includes('Press any key'), 60000, 'online end'), 'the online battle ends');
    await p.keyboard.press('Enter');
  }
  for (const p of pages) check(await until(p, async () => /Every client agrees on the result/.test(await term(p)), 10000, 'agreement'), 'the server module announces the agreed result');
  const ta = (await term(a)).split('\n'), tb = (await term(b)).split('\n');
  const res = (t) => t.filter((l) => /scores \d+|^Results:/.test(l)).slice(-3).join(' | ');
  console.log(`     anna: ${res(ta)}\n     bert: ${res(tb)}`);
  check(res(ta) === res(tb) && res(ta).length > 0, 'both clients printed the same results');
  await a.screenshot({ path: join(shots, 'corewar-agreed.png') });

  // ---- Back stops it
  await (await button(a, '← Back')).click();
  await a.waitForSelector('.page .play');
  check(await a.evaluate(() => window.__freegames.stats.running === 0), 'Back stops the game');
} catch (e) {
  console.log(`FAIL ${e.stack ?? e}`);
  failed = true;
} finally {
  await browser?.close();
  server.kill();
}
console.log(failed ? 'play FAILED' : 'play passed');
process.exit(failed ? 1 : 0);
