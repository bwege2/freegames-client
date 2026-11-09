// Shattered Pixel Dungeon end to end: the built site on the real server, headless Chromium.
//   npm run build && node games/shatteredpixeldungeon/e2e.mjs     (needs ../server/target/freegames-server.jar)
// Play starts the game: a new player gets the welcome screen, then the hero selection; a new game as the warrior
// (its region's story, then the first floor); the hero moves with the keys (W A S D) and with a tap on a cell (the
// guidebook next to him, which he picks up); the game menu goes back to the title screen, which saves the game.
// After a reload of the page, Play shows the title screen (no welcome: the settings were kept) and "Enter the
// Dungeon" offers the saved game, which continues on the same floor and cell. Back stops the game (nothing of it
// keeps running). Errors on the page fail the test. Screenshots go to $E2E_SHOTS (default: dist-e2e/shatteredpixeldungeon/).
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const web = join(here, '..', '..');
const jar = join(web, '..', 'server', 'target', 'freegames-server.jar');
const shots = process.env.E2E_SHOTS ?? join(web, 'dist-e2e', 'shatteredpixeldungeon');
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
  env: { ...process.env, PORT: String(port), WEB_ROOT: join(web, 'dist'), DATA_DIR: mkdtempSync(join(tmpdir(), 'spd-e2e-')) },
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

try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(base)).ok) break; } catch { /* starting */ }
    if (i > 150) throw new Error('server did not start');
    await wait(100);
  }
  browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 804 });
  page.on('pageerror', (e) => { console.log(`page error: ${e.message}`); failed = true; });
  page.on('console', (m) => {
    const t = m.text();
    if (m.type() === 'error' && !/WebGL|GPU stall|404/.test(t)) { console.log(`console error: ${t}`); failed = true; }
  });

  const spd = (f, ...a) => page.evaluate((f, a) => window.shatteredpixeldungeon?.[f]?.(...a), f, a);
  const until = async (what, pred, ms = 60000) => {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      const v = await pred().catch(() => null);
      if (v) return v;
      await wait(100);
    }
    throw new Error('not in time: ' + what);
  };
  const scene = (name) => until(name, async () => (await spd('scene')) === name);
  const canvasAt = () => page.evaluate(() => { const r = document.querySelector('.player-host canvas').getBoundingClientRect(); return { x: r.left, y: r.top }; });
  const click = async (b) => { const c = await canvasAt(); await page.mouse.click(c.x + b.x + b.w / 2, c.y + b.y + b.h / 2); };
  const button = (pred, what) => until(what, async () => (await spd('buttons')).find(pred));
  // the hero waits for the player, no window open (the guide's windows, a message: closed with Esc)
  const ready = () => until('the hero is ready', async () => {
    if ((await spd('windows')).length > 0) { await page.keyboard.press('Escape'); await wait(400); return false; }
    return (await spd('hero'))?.ready;
  });
  const play = async () => {
    await page.goto(`${base}#/shatteredpixeldungeon`, { waitUntil: 'networkidle0', timeout: 60000 }).catch(() => {});
    const t0 = Date.now();
    await page.click((await page.$('.page .try-anyway')) ? '.page .try-anyway' : '.page .play');
    await page.waitForSelector('.player-host canvas', { timeout: 300000 });
    await until('the game', async () => typeof (await spd('scene')) === 'string', 300000);
    return t0;
  };

  // ---- first start: a new player
  const t0 = await play();
  check(await page.evaluate(() => crossOriginIsolated), 'the page is cross-origin isolated');
  check((await spd('scene')) === 'WelcomeScene', 'a new player gets the welcome screen');
  console.log(`     started after ${((Date.now() - t0) / 1000).toFixed(1)} s (download and start)`);
  await wait(1000);
  await page.screenshot({ path: join(shots, 'welcome.png') });
  await click(await button((b) => b.cls.startsWith('WelcomeScene'), 'the welcome button'));
  await scene('HeroSelectScene');
  check(true, 'the welcome screen leads to the hero selection');
  await click(await button((b) => b.cls.endsWith('HeroBtn'), 'a hero'));
  await click(await button((b) => b.cls.startsWith('HeroSelectScene') && /start/i.test(b.text ?? ''), 'the start button'));
  await click(await button((b) => b.cls.startsWith('InterlevelScene') && /continue/i.test(b.text ?? ''), 'the story'));
  await scene('GameScene');
  await ready();
  const h0 = await spd('hero');
  check(h0.depth === 1 && h0.hp === 20, `a new game: floor ${h0.depth}, ${h0.hp} HP`);

  // keys: some step must move the hero (walls stop single steps)
  const moved = [];
  for (const k of ['KeyS', 'KeyD', 'KeyW', 'KeyA', 'ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft']) {
    const before = (await spd('hero')).pos;
    await page.keyboard.press(k);
    await wait(200);
    await ready();
    if ((await spd('hero')).pos !== before) moved.push(k);
  }
  check(moved.length >= 2, `the hero moves with the keys (${moved.join(' ')})`);

  // a tap on the cell of the nearest item (the guidebook): he walks there and picks it up
  const h1 = await spd('hero');
  const w = h1.width;
  const dist = (a) => Math.hypot((a % w) - (h1.pos % w), Math.floor(a / w) - Math.floor(h1.pos / w));
  const target = (await spd('heaps')).sort((a, b) => dist(a) - dist(b))[0];
  const c = await canvasAt(), p = await spd('cell', target);
  await page.mouse.click(c.x + p.x, c.y + p.y);
  await until('the hero there', async () => (await spd('hero')).pos === target, 30000).catch(() => null);
  await ready();
  check((await spd('hero')).pos === target, `a tap walks the hero to cell ${target}`);
  check(!(await spd('heaps')).includes(target), 'and he picks up what lies there');
  await page.screenshot({ path: join(shots, 'dungeon.png') });
  const saved = await spd('hero');

  // the guide: read the picked-up book in the journal (J); a new player's game menu then offers the main menu
  await page.keyboard.press('KeyJ');
  await wait(1500);
  await ready();

  // the game menu, back to the title screen: the game is saved
  await page.keyboard.press('Escape');
  await until('the game menu', async () => (await spd('windows')).includes('WndGame'));
  await click(await button((b) => /main menu/i.test(b.text ?? ''), 'main menu'));
  await scene('TitleScene');
  check(true, 'the game menu goes back to the title screen');
  await wait(3000); // the files reach the server

  // ---- reload: the saved game is there
  await page.goto('about:blank');
  await play();
  check((await spd('scene')) === 'TitleScene', 'after a reload: the title screen (the settings were kept)');
  await click(await button((b) => b.cls.startsWith('TitleScene') && /enter/i.test(b.text ?? ''), 'the play button'));
  await until('the games in progress', async () => ['StartScene', 'HeroSelectScene'].includes(await spd('scene')));
  check((await spd('scene')) === 'StartScene', 'Enter the Dungeon offers the saved game');
  await page.screenshot({ path: join(shots, 'saved-games.png') });
  await click(await button((b) => b.cls.includes('SaveSlotButton'), 'the saved game'));
  await wait(1000);
  if ((await spd('windows')).length) await click(await button((b) => /continue/i.test(b.text ?? ''), 'continue'));
  await scene('GameScene');
  await ready();
  const back = await spd('hero');
  check(back.depth === saved.depth && back.pos === saved.pos && back.hp === saved.hp,
    `the saved game continues: floor ${back.depth}, cell ${back.pos} (was ${saved.depth}, ${saved.pos})`);

  // ---- Back: the game stops
  await page.click('.player-bar .bar-button');
  await page.waitForSelector('.page .play, .page .try-anyway');
  await wait(500);
  check(!(await page.$('.player-host canvas')) && (await page.evaluate(() => window.shatteredpixeldungeon === undefined)), 'Back stops the game');
} catch (e) {
  console.log('FAIL', e?.stack ?? e);
  failed = true;
} finally {
  await browser?.close();
  server.kill();
}
writeFileSync(join(shots, 'result.txt'), failed ? 'failed\n' : 'ok\n');
process.exit(failed ? 1 : 0);
