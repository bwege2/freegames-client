// GNU Chess end to end: the built site on the real server, headless Chromium.
//   npm run build && node games/gnuchess/e2e.mjs     (needs ../server/target/freegames-server.jar)
// A local game against the engine (its Web Worker, pondering, the hint, a game saved with pgnsave and
// read back after a reload, quitting back to the game page), then an online game in two browser
// contexts: the lobby, a move of each side carried into the other program, a refused command, a
// resignation, and Back stopping the game. Screenshots go to $E2E_SHOTS (default: dist-e2e/gnuchess/).
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const jar = join(web, '..', 'server', 'target', 'freegames-server.jar');
const shots = process.env.E2E_SHOTS ?? join(web, 'dist-e2e', 'gnuchess');
const chrome = process.env.CHROME ?? ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(existsSync);
if (!existsSync(join(web, 'dist', 'index.html'))) throw new Error('build the site first: npm run build');
if (!existsSync(jar)) throw new Error(`no server jar at ${jar}`);
if (!chrome) throw new Error('no Chromium found (set CHROME)');
mkdirSync(shots, { recursive: true });

const port = await new Promise((resolve) => {
  const s = createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); });
});
const java = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', 'java') : 'java';
const server = spawn(java, ['-jar', jar], {
  env: { ...process.env, PORT: String(port), WEB_ROOT: join(web, 'dist'), DATA_DIR: mkdtempSync(join(tmpdir(), 'gc-e2e-')) },
  stdio: ['ignore', 'ignore', 'inherit'],
});
const base = `http://localhost:${port}/`;
let failed = false;
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failed = true;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let browser;

/** the terminal's text */
const text = (p) => p.evaluate(() => window.__gnuchess?.text() ?? '');
/** waits until the program waits for a line and the terminal shows `what` (a string or RegExp) after `from` characters */
async function until(p, what, from = 0, ms = 60000) {
  const t0 = Date.now();
  for (;;) {
    const t = (await text(p)).slice(from);
    const ok = typeof what === 'string' ? t.includes(what) : what.test(t);
    if (ok && (await p.evaluate(() => window.__gnuchess?.waiting() ?? false))) return t;
    if (Date.now() - t0 > ms) throw new Error(`timeout waiting for ${what}; the terminal ends with:\n${t.slice(-600)}`);
    await wait(100);
  }
}
/** types a line into the terminal and waits for `what` in what follows */
async function type(p, line, what, ms) {
  const from = (await text(p)).length;
  await p.keyboard.type(line);
  await p.keyboard.press('Enter');
  return until(p, what, from, ms);
}

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
    p.on('console', (m) => { if (m.type() === 'error' || process.env.E2E_CONSOLE) console.log(`console ${m.type()}: ${m.text()}`); });
    await p.goto(`${base}#/gnuchess`, { waitUntil: 'networkidle0' });
    await p.click('.page .play');
    await p.waitForFunction(() => !!window.__gnuchess);
    await until(p, 'White (1) : ');
    return p;
  };

  // ---- a local game against the engine
  const ctxA = await browser.createBrowserContext();
  const a = await open(ctxA);
  const start = await text(a);
  check(start.startsWith('GNU Chess\n'), 'the program starts with its banner');
  check(start.includes('Can\'t open file "(null)": Bad address - using defaults'), 'and its message about the missing gnuchess.ini');
  await type(a, 'depth 4', 'Search to a depth of 4.');
  let t = await type(a, 'e4', 'My move is : ');
  check(t.includes('Thinking...'), 'e4: the engine thinks (in its worker)');
  const reply = /My move is : (\S+)/.exec(t)?.[1];
  check(!!reply, `the engine answers ${reply}`);
  // the engine ponders now; a move it expects or not: either way it answers
  t = await type(a, 'Nf3', 'My move is : ');
  check(/2\. Nf3/.test(t) || /Invalid move: Nf3/.test(t), 'a second move against the pondering engine');
  await a.screenshot({ path: join(shots, 'local.png') });
  t = await type(a, 'show game', 'White   Black');
  check(t.includes('1.  e4'), 'show game lists the moves');
  // analyze: an infinite search in the worker, ended by exit (the worker is stopped and started again)
  {
    const from = (await text(a)).length;
    await a.keyboard.type('analyze');
    await a.keyboard.press('Enter');
    await until(a, /\n\d+ [+-]\d+ \d+ \d+ /, from);
    await wait(1500);
    await type(a, 'exit', 'White (', 10000);
    // exit leaves both sides to the player (the adapter's force mode, as in the original): go
    await type(a, 'depth 4', 'Search to a depth of 4.');
    t = await type(a, 'go', 'My move is : ');
    check(true, 'analyze shows the thinking, exit ends it, and go lets the engine play on');
  }
  await type(a, 'book on', 'Book is now on.');
  await type(a, 'graphic', 'Graphic mode is enabled.');
  t = await type(a, 'show board', '♚');
  check(t.includes('♔') && t.includes('♚'), 'the graphic board shows Unicode pieces');
  await a.screenshot({ path: join(shots, 'graphic.png') });
  await type(a, 'nographic', 'Graphic mode is disabled.');
  await type(a, 'pgnsave e2e.pgn', /(White|Black) \(\d+\) : /);
  // the file is in the account's storage: after a reload it can be read back
  await wait(500);
  await a.reload({ waitUntil: 'networkidle0' }); // #/gnuchess/play: the game starts again at once
  await a.waitForFunction(() => !!window.__gnuchess);
  await until(a, 'White (1) : ');
  t = await type(a, 'pgnload e2e.pgn', 'White (');
  check(/1\.\s+e4/.test(await type(a, 'show game', 'White   Black')), 'pgnload reads the saved game back after a reload');
  t = await type(a, 'pgnload nothere.pgn', 'Cannot open file nothere.pgn');
  check(true, 'a missing file gives the original\'s message');
  await a.evaluate(() => [...document.querySelectorAll('.gc-bar button')].find((b) => b.textContent === 'Files').click());
  await a.waitForSelector('.gc-files');
  check((await a.$eval('.gc-files', (e) => e.textContent)).includes('e2e.pgn'), 'Files lists the saved game');
  await a.screenshot({ path: join(shots, 'files.png') });
  await a.evaluate(() => [...document.querySelectorAll('.gc-files button')].find((b) => b.textContent === 'Close').click());
  await a.waitForFunction(() => !document.querySelector('.gc-files'));
  await a.keyboard.type('quit');
  await a.keyboard.press('Enter');
  await a.waitForFunction(() => !location.hash.endsWith('/play') && !window.__gnuchess, { timeout: 10000 });
  check(!!(await a.$('.page .play')), 'quit returns to the game page and stops the game');

  // ---- online: two players
  const ctxB = await browser.createBrowserContext();
  const p1 = await open(ctxA);
  const p2 = await open(ctxB);
  /** clicks the (first enabled) button with this text */
  const button = async (p, label) => {
    await p.waitForFunction((l) => [...document.querySelectorAll('button')].some((b) => b.textContent.trim() === l && !b.disabled), { timeout: 10000 }, label);
    await p.evaluate((l) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === l && !b.disabled).click(), label);
  };
  for (const [p, name] of [[p1, 'Anna'], [p2, 'Bert']]) {
    await button(p, 'Play online');
    await p.waitForSelector('.fg-lobby');
    await p.$eval('.fg-lobby input[placeholder="Your name"]', (e, n) => { e.value = n; e.dispatchEvent(new Event('change')); }, name);
  }
  await p1.$eval('.fg-lobby input[placeholder="Room name"]', (e) => { e.value = 'chess'; });
  await button(p1, 'Create room');
  await p1.waitForFunction(() => document.querySelector('.fg-lobby h2')?.textContent === 'chess');
  await p2.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('chess')), { timeout: 8000 });
  await button(p2, 'Join');
  await p2.waitForFunction(() => document.querySelector('.fg-lobby h2')?.textContent === 'chess');
  await button(p2, 'Ready');
  await p1.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('ready ✓')));
  await p1.screenshot({ path: join(shots, 'online-room.png') });
  await button(p1, 'Start');
  await until(p1, 'you play White');
  await until(p2, 'you play Black');
  check(true, 'both players are in the game: White and Black');
  await type(p1, 'e4', 'Black (1) : ');
  t = await until(p2, /e2e4\n1\. e2e4/);
  check(true, 'White\'s e4 reaches Black\'s program as e2e4');
  t = await type(p2, 'e5', 'White (2) : ');
  await until(p1, /e7e5\n1\. e7e5/);
  check(true, 'Black\'s e5 reaches White\'s program');
  t = await type(p1, 'undo', 'not in an online game');
  check(true, 'undo is refused while the game runs');
  t = await type(p2, 'Nc6', 'It is not your move.');
  check(true, 'a move out of turn is refused');
  await p1.screenshot({ path: join(shots, 'online.png') });

  // Black reloads the page: the lobby offers the running game, and its moves come back
  await p2.reload({ waitUntil: 'networkidle0' });
  await p2.waitForFunction(() => !!window.__gnuchess);
  await until(p2, 'White (1) : ');
  await button(p2, 'Play online');
  await p2.waitForSelector('.fg-lobby');
  await button(p2, 'Rejoin');
  t = await until(p2, /e2e4\n1\. e2e4[\s\S]*e7e5\n1\. e7e5/);
  check(t.includes('you play Black'), 'after a reload Black rejoins and gets the moves played so far');
  await type(p1, 'Nf3', 'Black (2) : ');
  await until(p2, /g1f3\n2\. g1f3/);
  check(true, 'and the game goes on: White\'s Nf3 reaches the new program');
  // a draw: offered by Black, accepted by White
  await type(p2, 'draw', 'You offer a draw.');
  await until(p1, 'offers a draw');
  await p1.keyboard.type('draw');
  await p1.keyboard.press('Enter');
  for (const p of [p1, p2]) await p.waitForFunction(() => document.querySelector('.gc-status')?.textContent.includes('Draw by agreement'), { timeout: 10000 });
  check(true, 'a draw offered and accepted: both see 1/2-1/2 {Draw by agreement}');

  // another round in the same room: Black resigns
  for (const p of [p1, p2]) await button(p, 'Play again');
  await p2.waitForSelector('.fg-lobby');
  await p1.waitForSelector('.fg-lobby');
  await button(p2, 'Ready');
  await p1.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('ready ✓')));
  const mark2 = (await text(p2)).length;
  await button(p1, 'Start');
  await until(p2, 'you play Black', mark2);
  await until(p2, 'White (1) : ', mark2);
  await p2.keyboard.type('resign');
  await p2.keyboard.press('Enter');
  await p1.waitForFunction(() => document.querySelector('.gc-status')?.textContent.includes('Black resigns'), { timeout: 10000 });
  check(true, 'a second round: Black resigns, White sees the result');
  check((await p2.$eval('.gc-status', (e) => e.textContent)).includes('1-0'), 'Black sees it too');

  // ---- Back stops the game
  await p1.goBack();
  await p1.waitForFunction(() => !window.__gnuchess, { timeout: 10000 });
  check(true, 'Back stops the game');
} catch (e) {
  console.log(`FAIL ${e.message}`);
  failed = true;
} finally {
  await browser?.close();
  server.kill();
}
process.exit(failed ? 1 : 0);
