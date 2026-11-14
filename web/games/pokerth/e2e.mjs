// PokerTH end to end: the built site on the real server, headless Chromium.
//   npm run build && node games/pokerth/e2e.mjs     (needs ../server/target/freegames-server.jar)
// A local game (a few hands with the player on auto check/call), then an online game of three players in
// three browser contexts: the settings, the lobby, the game; every player on auto check/call any, and after
// several hands every client must have seen the same cash for every player at the start of every hand
// (the lockstep engine fed by the server's dealer). Screenshots go to $E2E_SHOTS (default: dist-e2e/pokerth/).
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const jar = join(web, '..', 'server', 'target', 'freegames-server.jar');
const shots = process.env.E2E_SHOTS ?? join(web, 'dist-e2e', 'pokerth');
const chrome = process.env.CHROME ?? ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(existsSync);
if (!existsSync(join(web, 'dist', 'index.html'))) throw new Error('build the site first: npm run build');
if (!existsSync(jar)) throw new Error(`no server jar at ${jar}`);
mkdirSync(shots, { recursive: true });

const port = await new Promise((resolve) => {
  const s = createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); });
});
const java = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', 'java') : 'java';
const server = spawn(java, ['-jar', jar], {
  env: { ...process.env, PORT: String(port), WEB_ROOT: join(web, 'dist'), DATA_DIR: mkdtempSync(join(tmpdir(), 'pth-e2e-')) },
  stdio: ['ignore', 'ignore', 'inherit'],
});
const base = `http://localhost:${port}/`;
let failed = false;
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failed = true;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const state = (p) => p.evaluate(() => window.__pokerth?.state() ?? null);
let browser;

try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(base)).ok) break; } catch { /* starting */ }
    if (i > 150) throw new Error('server did not start');
    await wait(100);
  }
  browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
  const open = async (ctx) => {
    const p = await ctx.newPage();
    await p.setViewport({ width: 1100, height: 760 });
    p.on('pageerror', (e) => { console.log(`page error: ${e.message}`); failed = true; });
    p.on('console', (m) => { if (m.type() === 'error') console.log(`console error: ${m.text()}`); });
    await p.goto(`${base}#/pokerth`, { waitUntil: 'networkidle0' });
    await p.click('.page .play');
    await p.waitForSelector('.pth-start button.big', { timeout: 30000 });
    return p;
  };
  const button = async (p, label) => {
    await p.waitForFunction((l) => [...document.querySelectorAll('button')].some((b) => b.textContent.trim() === l && !b.disabled), { timeout: 15000 }, label);
    await p.evaluate((l) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === l && !b.disabled).click(), label);
  };

  // ---- local
  const local = await open(await browser.createBrowserContext());
  await local.click('.pth-start button.big');
  await local.waitForSelector('.pth-dialog');
  await button(local, 'OK');
  await local.waitForSelector('.pth');
  await local.keyboard.press('F8');
  await local.waitForFunction(() => (window.__pokerth?.state()?.hand ?? 0) >= 3, { timeout: 240000 });
  check(true, 'local game: three hands against nine computer opponents');
  await local.screenshot({ path: join(shots, 'local.png') });
  await local.close();

  // ---- online, three players
  const names = ['Anna', 'Bert', 'Cleo'];
  const pages = [];
  for (const n of names) {
    const p = await open(await browser.createBrowserContext());
    await p.evaluate(() => [...document.querySelectorAll('.pth-start button.big')][1].click());
    await p.waitForSelector('.pth-dialog input[type=text]');
    await p.$eval('.pth-dialog input[type=text]', (e, v) => { e.value = v; }, n);
    // a short action time-out: a player who misses his turn is checked or folded by the server's time-out
    await p.$$eval('.pth-dialog input[type=number]', (es) => { for (const e of es) if (e.min === '5' && e.max === '60') e.value = '5'; });
    await button(p, 'OK');
    await p.waitForSelector('.fg-lobby');
    await p.$eval('.fg-lobby input[placeholder="Your name"]', (e, v) => { e.value = v; e.dispatchEvent(new Event('change')); }, n);
    pages.push(p);
  }
  const [a, ...others] = pages;
  await a.$eval('.fg-lobby input[placeholder="Room name"]', (e) => { e.value = 'holdem'; });
  await button(a, 'Create room');
  await a.waitForFunction(() => document.querySelector('.fg-lobby h2')?.textContent === 'holdem');
  for (const p of others) {
    await p.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('holdem')), { timeout: 8000 });
    await button(p, 'Join');
    await p.waitForFunction(() => document.querySelector('.fg-lobby h2')?.textContent === 'holdem');
    await button(p, 'Ready');
  }
  await a.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].filter((li) => li.textContent.includes('ready ✓')).length >= 2, { timeout: 8000 });
  await button(a, 'Start');
  for (const p of pages) await p.waitForSelector('.pth', { timeout: 15000 });
  check(true, 'three players at the online table');
  // auto check/call any; a player asked before that times out
  await Promise.all(pages.map((p) => p.keyboard.press('F8')));
  const HANDS = 4;
  try {
    for (const p of pages) {
      await p.waitForFunction((h) => (window.__pokerth?.state()?.hand ?? 0) >= h, { timeout: Number(process.env.E2E_WAIT ?? 300000) }, HANDS);
    }
  } catch (e) {
    for (const [i, p] of pages.entries()) {
      console.log(`--- ${names[i]}: ${JSON.stringify(await state(p))}`);
      console.log((await p.evaluate(() => [...document.querySelectorAll('.pth .log div')].slice(-12).map((d) => d.textContent).join('\n'))));
      await p.screenshot({ path: join(shots, `stuck-${i}.png`) });
    }
    throw e;
  }
  await a.screenshot({ path: join(shots, 'online.png') });
  const hs = await Promise.all(pages.map(state));
  const same = hs.every((s) => s.history.slice(0, HANDS).join('|') === hs[0].history.slice(0, HANDS).join('|'));
  check(same, `all three clients saw the same cash at the start of hands 1 to ${HANDS}: ${hs[0].history.slice(0, HANDS).join(' | ')}`);
  const moved = hs[0].history[HANDS - 1] !== hs[0].history[0];
  check(moved, 'money changed hands');
} catch (e) {
  console.log(`FAIL ${e.stack ?? e}`);
  failed = true;
} finally {
  await browser?.close();
  server.kill();
}
process.exit(failed ? 1 : 0);
