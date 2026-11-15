// GNU Go end to end: the built site on the real server, headless Chromium.
//   npm run build && node games/gnugo/e2e.mjs     (needs ../server/target/freegames-server.jar)
// Two players with the "Two players" box and with clicks on the board, a move against the computer (its
// Web Worker), a game saved with `save` and loaded again after a reload (the account storage), `quit`
// back to the game page, and Back stopping the game.
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const jar = join(web, '..', 'server', 'target', 'freegames-server.jar');
const chrome = process.env.CHROME ?? ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(existsSync);
if (!existsSync(join(web, 'dist', 'index.html'))) throw new Error('build the site first: npm run build');
if (!existsSync(jar)) throw new Error(`no server jar at ${jar}`);
if (!chrome) throw new Error('no Chromium found (set CHROME)');

const port = await new Promise((resolve) => {
  const s = createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); });
});
const java = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', 'java') : 'java';
const server = spawn(java, ['-jar', jar], {
  env: { ...process.env, PORT: String(port), WEB_ROOT: join(web, 'dist'), DATA_DIR: mkdtempSync(join(tmpdir(), 'gg-e2e-')) },
  stdio: ['ignore', 'ignore', 'inherit'],
});
const base = `http://localhost:${port}/`;
for (let i = 0; ; i++) {
  try { if ((await fetch(base)).ok) break; } catch { /* starting */ }
  if (i > 150) throw new Error('server did not start');
  await new Promise((r) => setTimeout(r, 100));
}

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
const check = (ok, what) => {
  if (!ok) throw new Error(`FAILED: ${what}`);
  console.log(`ok: ${what}`);
};
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 804 });
  const text = () => page.evaluate(() => window.__gnugo?.text() ?? '');
  const atPrompt = (t) => /(black|white)\(\d+\): $/.test(t.trimEnd() + ' ');
  const waitFor = async (pred, what) => {
    for (let i = 0; i < 1200; i++) {
      if (pred(await text())) return;
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error(`waited in vain for ${what}; the screen ends with:\n${(await text()).slice(-800)}`);
  };
  const type = async (line, what) => {
    const n = (await text()).length;
    await page.keyboard.type(line);
    await page.keyboard.press('Enter');
    await waitFor((t) => (what ? t.slice(n).includes(what) : t.length > n + line.length + 1 && atPrompt(t)), what ?? `the prompt after ${line}`);
  };
  const open = async () => {
    await page.goto(`${base}#/gnugo/play`, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => !!window.__gnugo);
    await waitFor(atPrompt, 'the first prompt');
  };

  await open();
  check((await text()).includes('Board Size:   9'), 'starts with --boardsize 9');
  // two players: the box types force
  await page.click('.gg-bar input[type=checkbox]');
  await type('e5');
  await type('d4');
  let t = await text();
  check(t.includes('force e5') || /\(X\)/.test(t), 'Two players: Black E5 played');
  check(/white\(2\): force d4|black\(3\): $/.test(t.trimEnd() + ' ') && !t.includes('GNU Go is thinking...\nwhite('), 'Two players: no computer move');
  // a click on C3 of the last board types c3
  const point = await page.evaluate(() => {
    const lines = [...document.querySelectorAll('.fg-term-line')];
    for (let i = lines.length - 1; i >= 0; i--) {
      if (/^ {2}3 /.test(lines[i].textContent)) {
        const node = lines[i].firstChild;
        const r = document.createRange();
        r.setStart(node, 8);
        r.setEnd(node, 9);
        const b = r.getBoundingClientRect();
        return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
      }
    }
    return null;
  });
  check(!!point, 'the board is on the screen');
  const n = (await text()).length;
  await page.mouse.click(point.x, point.y);
  await waitFor((s) => s.length > n && atPrompt(s), 'the prompt after the click');
  t = (await text()).slice(n);
  check(/Last move: Black C3/.test(t), 'a click on C3 played C3');
  // against the computer
  await page.click('.gg-bar input[type=checkbox]');
  await type('level 1', 'Set level to 1');
  await type('g5', 'GNU Go is thinking...');
  await waitFor(atPrompt, 'the computer answered');
  check(/GNU Go is thinking\.\.\.\n(white|black)\(\d+\): ([A-J]\d|PASS)\n/.test(await text()), 'the computer answered a move');
  await type('save e2e.sgf', 'or load e2e.sgf');
  // reload: the file comes back from the server
  await open();
  await type('load e2e.sgf');
  await type('info', 'Move Number:  5');
  check(true, 'the saved game loads after a reload (move 5)');
  // quit: back to the game page
  await page.keyboard.type('quit');
  await page.keyboard.press('Enter');
  await page.waitForSelector('.play', { timeout: 10000 });
  check(!(await page.evaluate(() => !!window.__gnugo)), 'quit returns to the game page');
  // Back stops the game
  await open();
  await page.click('.player-bar .bar-button');
  await page.waitForSelector('.play');
  check(!(await page.evaluate(() => !!window.__gnugo)), 'Back stops the game');
} finally {
  await browser.close();
  server.kill();
}
