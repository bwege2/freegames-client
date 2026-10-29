// FreeCol end to end: the built site on the real server, headless Chromium.
//   npm run build && node games/freecol/e2e.mjs     (needs ../server/target/freegames-server.jar)
// The game area is made 1280x800, as the oracle's screen (test/oracle/screens.json). Play starts the two
// workers; the main menu's component tree is the original's (test/oracle/main.tree) and its pixels are
// compared with the original's (re/freecol/work/client/main.png, if re/freecol/tools/client-trees.sh made it);
// New shows the new game panel (new.tree); OK starts a single player game against the computer, whose map
// shows; a turn ends (Enter, the end turn dialog) and is autosaved to the site's storage. Back stops the game. A
// second Play loads nothing over the network (the browser's cache has it all) and offers to continue the game.
// Online: two players (two browser contexts) choose "Start multiplayer game" and "Join multiplayer game", which
// open the site's lobby; the round starts both games, both players are in FreeCol's start panel, the game
// starts and the first player's turn ends: the other player is on turn (the module took the browsers' reports).
// Screenshots go to $E2E_SHOTS (default: dist-e2e/freecol/).
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const web = join(here, '..', '..');
const jar = join(web, '..', 'server', 'target', 'freegames-server.jar');
const shots = process.env.E2E_SHOTS ?? join(web, 'dist-e2e', 'freecol');
const chrome = process.env.CHROME ?? ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(existsSync);
if (!existsSync(join(web, 'dist', 'index.html'))) throw new Error('build the site first: npm run build');
if (!existsSync(jar)) throw new Error(`no server jar at ${jar}`);
if (!chrome) throw new Error('no Chromium found (set CHROME)');
mkdirSync(shots, { recursive: true });
const oracle = join(here, 'test', 'oracle');
const [W, H] = JSON.parse(readFileSync(join(oracle, 'screens.json'), 'utf8')).size.split('x').map(Number);

const port = await new Promise((resolve) => {
  const s = createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); });
});
const java = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', 'java') : 'java';
const server = spawn(java, ['-jar', jar], {
  env: { ...process.env, PORT: String(port), WEB_ROOT: join(web, 'dist'), DATA_DIR: mkdtempSync(join(tmpdir(), 'freecol-e2e-')) },
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

/** The tree's components with screen coordinates (as test/workers.ts parseTree). */
function parseTree(tree) {
  const out = [];
  const stack = [];
  for (const line of tree.split('\n')) {
    const m = /^( *)(\S+) (-?\d+),(-?\d+) (\d+)x(\d+)( hidden)?.*?(?: "(.*)")?$/.exec(line);
    if (!m) continue;
    const depth = m[1].length / 2;
    stack.length = depth;
    const parent = depth > 0 ? stack[depth - 1] : null;
    const n = { cls: m[2], x: (parent?.x ?? 0) + +m[3], y: (parent?.y ?? 0) + +m[4], w: +m[5], h: +m[6], hidden: !!m[7] || !!parent?.hidden, text: m[8] ?? null };
    stack[depth] = n;
    out.push(n);
  }
  return out;
}

try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(base)).ok) break; } catch { /* starting */ }
    if (i > 150) throw new Error('server did not start');
    await wait(100);
  }
  browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  // the default context: an incognito context keeps its HTTP cache in memory, too small for the game's code
  const page = await browser.newPage();
  page.on('pageerror', (e) => { console.log(`page error: ${e.message}`); failed = true; });
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') console.log(`console ${m.type()}: ${m.text()}`); });
  let network = [];
  page.on('response', (r) => { if (!r.fromCache() && r.url().includes('/assets/')) network.push(r.url().replace(/.*\//, '') + ' ' + r.status() + ' ' + r.request().resourceType()); });

  const tree = (p = page) => p.evaluate(() => window.freecolTree());
  const waitTree = async (pred, ms = 120000, p = page) => {
    const end = Date.now() + ms;
    let t = '';
    while (Date.now() < end) {
      t = await Promise.race([tree(p), wait(15000).then(() => '')]);
      const n = parseTree(t).find((x) => !x.hidden && pred(x));
      if (n) return { tree: t, node: n };
      await wait(500);
    }
    throw new Error('not on the screen in time:\n' + t);
  };
  const click = async (n, p = page) => {
    const r = await p.evaluate(() => { const b = document.querySelector('.player-host canvas').getBoundingClientRect(); return { x: b.left, y: b.top }; });
    await p.mouse.click(r.x + n.x + (n.w >> 1), r.y + n.y + (n.h >> 1));
  };
  const hostSize = () => page.evaluate(() => { const h = document.querySelector('.player-host'); return { w: h.clientWidth, h: h.clientHeight }; });
  const play = async (p = page) => {
    await p.goto(`${base}#/freecol`, { waitUntil: 'networkidle0' });
    const t0 = Date.now();
    await p.click('.page .play');
    await p.waitForSelector('.player-host canvas', { timeout: 300000 });
    return t0;
  };
  const back = async () => {
    await page.click('.player-bar .bar-button');
    await page.waitForSelector('.page .play');
  };

  // the game area exactly 1280x800: the viewport is the area plus the site's bar
  await page.setViewport({ width: W, height: H + 60 });
  await play();
  const s = await hostSize();
  await back();
  await page.setViewport({ width: W + (W - s.w), height: H + 60 + (H - s.h) });

  // ---- first start: the main menu
  network = [];
  const t0 = await play();
  check(await page.evaluate(() => crossOriginIsolated), 'the page is cross-origin isolated');
  const main = await waitTree((n) => n.cls === 'net.sf.freecol.client.gui.panel.MainPanel');
  console.log(`     main menu after ${((Date.now() - t0) / 1000).toFixed(1)} s (download and start)`);
  await wait(1500);
  const mainTree = await tree();
  check(mainTree === readFileSync(join(oracle, 'main.tree'), 'utf8'), 'the main menu\'s component tree is the original\'s');
  const shot = await (await page.$('.player-host canvas')).screenshot({ path: join(shots, 'main.png') });
  const orig = join(web, '..', 're', 'freecol', 'work', 'client', 'main.png');
  if (existsSync(orig)) {
    const diff = await page.evaluate(async (a, b) => {
      const load = async (b64) => {
        const bm = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob());
        const c = new OffscreenCanvas(bm.width, bm.height);
        const x = c.getContext('2d');
        x.drawImage(bm, 0, 0);
        return x.getImageData(0, 0, bm.width, bm.height);
      };
      const p = await load(a), o = await load(b);
      if (p.width !== o.width || p.height !== o.height) return { size: `${p.width}x${p.height} vs ${o.width}x${o.height}` };
      let off = 0, far = 0;
      for (let i = 0; i < p.data.length; i += 4) {
        const d = Math.max(Math.abs(p.data[i] - o.data[i]), Math.abs(p.data[i + 1] - o.data[i + 1]), Math.abs(p.data[i + 2] - o.data[i + 2]));
        if (d > 8) off++;
        if (d > 96) far++;
      }
      const n = p.data.length / 4;
      return { off: off / n, far: far / n };
    }, Buffer.from(shot).toString('base64'), readFileSync(orig).toString('base64'));
    if (diff.size) check(false, `the main menu's pixels: sizes differ (${diff.size})`);
    else {
      console.log(`     main menu pixels: ${(diff.off * 100).toFixed(2)}% differ (by more than 8), ${(diff.far * 100).toFixed(2)}% by more than 96`);
      check(diff.far < 0.02, 'the main menu looks like the original\'s (under 2% of the pixels far off)');
    }
  } else {
    console.log('     (no original main.png: run re/freecol/tools/client-trees.sh for the pixel comparison)');
  }

  // ---- New: the new game panel
  await click(parseTree(mainTree).find((n) => n.text === 'New'));
  const np = await waitTree((n) => n.cls === 'net.sf.freecol.client.gui.panel.NewPanel');
  await wait(1500);
  check(await tree() === readFileSync(join(oracle, 'new.tree'), 'utf8'), 'the new game panel\'s component tree is the original\'s');
  await page.screenshot({ path: join(shots, 'new.png') });

  // ---- OK: the start game panel (the server worker has started a server); Start Game: a single player game
  await click(parseTree(np.tree).find((n) => n.text === 'OK'));
  const sp = await waitTree((n) => n.cls === 'net.sf.freecol.client.gui.panel.StartGamePanel');
  await wait(1500);
  check(await tree() === readFileSync(join(oracle, 'start.tree'), 'utf8'), 'the start game panel\'s component tree is the original\'s');
  await page.screenshot({ path: join(shots, 'start.png') });
  await click(parseTree(sp.tree).find((n) => n.text === 'Start Game'));
  const t1 = Date.now();
  await waitTree((n) => n.cls.endsWith('.MapControls') || n.cls.endsWith('.InfoPanel') || n.cls.endsWith('MiniMap'), 300000);
  console.log(`     the game's map after ${((Date.now() - t1) / 1000).toFixed(1)} s`);
  check(true, 'a single player game started: the map shows');
  await wait(3000);
  await page.screenshot({ path: join(shots, 'game.png') });

  // ---- the end of the turn: the end turn dialog, the computer's turns, the autosave in the site's storage
  await click((await waitTree((n) => n.text === 'OK' && n.cls.endsWith('FreeColButton'))).node); // the welcome
  await wait(1000);
  await page.keyboard.press('Enter');
  await click((await waitTree((n) => n.text === 'OK' && n.cls === 'javax.swing.JButton', 30000)).node);
  await wait(15000); // the computer's turns and the autosave
  await page.screenshot({ path: join(shots, 'turn2.png') });

  // ---- Back stops the game; a second start loads nothing over the network
  await back();
  await wait(2000); // what the stopped game had asked for is done
  network = [];
  const since = await page.evaluate(() => performance.now());
  await play();
  await waitTree((n) => n.cls === 'net.sf.freecol.client.gui.panel.MainPanel');
  check(parseTree(await tree()).some((n) => n.text === 'Continue Playing'), 'the next start finds the autosave in the site\'s storage (Continue Playing)');
  // the page's requests (Play's download) by the browser's cache flag; the workers' scripts by their transfer size
  // (a script a worker loads is reported to the page without the flag)
  const transferred = await page.evaluate((t) => performance.getEntriesByType('resource')
    .filter((e) => e.startTime >= t && e.name.includes('/assets/') && e.transferSize > 0).map((e) => e.name.replace(/.*\//, '') + ' ' + e.transferSize), since);
  const fetched = network.filter((n) => !/ script$/.test(n));
  check(fetched.length === 0 && transferred.length === 0,
    `a second start loads nothing over the network (${fetched.length + transferred.length} files: ${[...fetched, ...transferred].slice(0, 5).join(', ')})`);
  await back();

  // ---- online: Anna starts a multiplayer game, Bert joins one; both go through the site's lobby
  const page2 = await (await browser.createBrowserContext()).newPage();
  page2.on('pageerror', (e) => { console.log(`page 2 error: ${e.message}`); failed = true; });
  page2.on('console', (m) => { if (m.type() === 'error') console.log(`console 2 ${m.type()}: ${m.text()}`); });
  await page2.setViewport(page.viewport());
  // the workers' warnings (FreeCol's log), for a failure's story
  for (const [p, who] of [[page, 1], [page2, 2]]) {
    p.on('workercreated', (w) => w.on('console', (m) => { if (process.env.E2E_VERBOSE || m.type() === 'error') console.log(`worker ${who} ${m.type()}: ${m.text().slice(0, 300)}`); }));
  }
  const button = async (p, label) => {
    await p.waitForFunction((l) => [...document.querySelectorAll('button')].some((b) => b.textContent.trim() === l && !b.disabled), { timeout: 20000 }, label);
    await p.evaluate((l) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === l && !b.disabled).click(), label);
  };
  for (const [p, name, choice] of [[page, 'Anna', 'Start multiplayer game'], [page2, 'Bert', 'Join multiplayer game']]) {
    await play(p);
    await click((await waitTree((n) => n.text === 'New', 300000, p)).node, p);
    await click((await waitTree((n) => n.text === choice && n.cls.endsWith('RadioButton'), 60000, p)).node, p);
    await wait(500);
    await click((await waitTree((n) => n.text === 'OK', 60000, p)).node, p);
    await p.waitForSelector('.fg-lobby', { timeout: 30000 });
    await p.$eval('.fg-lobby input[placeholder="Your name"]', (e, n) => { e.value = n; e.dispatchEvent(new Event('change')); }, name);
  }
  check(true, 'Start and Join multiplayer game open the site\'s lobby');
  await page.$eval('.fg-lobby input[placeholder="Room name"]', (e) => { e.value = 'colonies'; });
  await button(page, 'Create room');
  await page2.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('colonies')), { timeout: 10000 });
  await button(page2, 'Join');
  await button(page2, 'Ready');
  await page.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('ready ✓')), { timeout: 10000 });
  await button(page, 'Start');
  for (const p of [page, page2]) await waitTree((n) => n.cls === 'net.sf.freecol.client.gui.panel.StartGamePanel', 300000, p);
  check(true, 'the round starts both players\' games: FreeCol\'s start panel');
  await page.screenshot({ path: join(shots, 'online-start.png') });
  for (const p of [page2, page]) {
    await click((await waitTree((n) => n.text === "I'm Ready", 60000, p)).node, p);
    await wait(1500);
  }
  // the game's admin is the player whose client logged in first: his Start Game is the enabled one
  for (const p of [page, page2]) await click((await waitTree((n) => n.text === 'Start Game', 60000, p)).node, p);
  for (const p of [page, page2]) {
    await waitTree((n) => n.cls.endsWith('.InfoPanel'), 300000, p).catch(async (e) => {
      await page.screenshot({ path: join(shots, 'online-fail-1.png') });
      await page2.screenshot({ path: join(shots, 'online-fail-2.png') });
      for (const q of [page, page2]) {
        console.log(JSON.stringify(await q.evaluate(() => window.freecolOnline)));
      }
      throw e;
    });
  }
  check(true, 'the online game started: both maps show');
  await wait(3000);
  await page.screenshot({ path: join(shots, 'online-game.png') });
  // the turns: the player on turn ends it (Enter, OK in the end turn dialog), then the other player is on turn
  const ended = [];
  for (let turn = 0; turn < 2; turn++) {
    let done = null;
    for (let i = 0; i < 30 && !done; i++) {
      for (const p of [page, page2]) {
        const nodes = parseTree(await tree(p)).filter((n) => !n.hidden);
        const welcome = nodes.find((n) => n.text === 'OK' && n.cls.endsWith('FreeColButton'));
        const dialog = nodes.find((n) => n.text === 'OK' && n.cls === 'javax.swing.JButton');
        if (dialog) {
          await click(dialog, p);
          done = p;
          break;
        }
        if (welcome) await click(welcome, p);
        await p.focus('.player-host canvas');
        await p.keyboard.press('Enter');
      }
      await wait(2000);
    }
    if (!done) throw new Error('no end turn dialog');
    ended.push(done === page ? 'Anna' : 'Bert');
    await wait(5000);
  }
  check(ended[0] !== ended[1], `the players are on turn in turn: ${ended.join(', then ')} ended a turn`);
  await wait(5000);
  check(!(await page.$('.player-host div div')) && !(await page2.$('.player-host div div')), 'no stop: both browsers\' games agree');
  await page2.screenshot({ path: join(shots, 'online-turn.png') });
} catch (e) {
  console.log('FAIL', e?.stack ?? e);
  failed = true;
} finally {
  await browser?.close();
  server.kill();
}
writeFileSync(join(shots, 'result.txt'), failed ? 'failed\n' : 'ok\n');
process.exit(failed ? 1 : 0);
