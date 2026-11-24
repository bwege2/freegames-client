// 0 A.D. online 1v1, end to end: the built site on the real server, two headless Chromium contexts.
//   npm run build && node games/0ad/e2e.mjs       (needs ../server/target/freegames-server.jar)
// Two browsers create and join a room, start the round, command their own units (a box selection and a
// right click, a HUD train button), and are shown to run the same World turn by turn (the state hashes).
// One browser reloads, rejoins the running room from the lobby and replays the checked turns; then it
// leaves the match, which ends the round for the other seat with a victory. Screenshots go to
// $E2E_SHOTS (default: dist-e2e/0ad/).
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const jar = join(web, '..', 'server', 'target', 'freegames-server.jar');
const shots = process.env.E2E_SHOTS ?? join(web, 'dist-e2e', '0ad');
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
  env: { ...process.env, PORT: String(port), WEB_ROOT: join(web, 'dist'), DATA_DIR: mkdtempSync(join(tmpdir(), '0ad-e2e-')) },
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
  const open = async () => {
    const p = await (await browser.createBrowserContext()).newPage();
    await p.setViewport({ width: 1280, height: 800 });
    p.on('pageerror', (e) => { console.log(`page error: ${e.message}`); failed = true; });
    p.on('console', (m) => { if (m.type() === 'error') console.log(`console error: ${m.text()}`); });
    p.on('response', (r) => { if (r.status() === 404) console.log(`404 ${r.url()}`); });
    await p.goto(`${base}#/0ad`, { waitUntil: 'networkidle0' });
    await p.click('.page .play');
    await p.waitForFunction(() => window.__0ad?.world && window.__0ad?.scene && document.querySelector('.ad'), { timeout: 180000 });
    await p.waitForFunction(() => [...document.querySelectorAll('.ad-buttons button')].some((x) => x.textContent === 'Play online 1v1'), { timeout: 30000 });
    return p;
  };
  const clickText = (p, text) => p.evaluate((t) => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent === t);
    if (!b) throw new Error(`no button "${t}"`);
    b.click();
  }, text);
  const lobbyReady = (p) => p.waitForSelector('.fg-lobby', { timeout: 15000 });
  const online = (p) => p.waitForFunction(() => window.__0ad.online && window.__0ad.scene?.world === window.__0ad.world && !document.querySelector('.fg-lobby'), { timeout: 60000 });
  const turnOf = (p) => p.evaluate(() => window.__0ad.online?.turn ?? -1);
  const hashAt = (p, turn) => p.evaluate((t) => window.__0ad.online?.hash(t), turn);
  const waitTurn = (p, n, ms = 20000) => p.waitForFunction((t) => (window.__0ad.online?.turn ?? -1) >= t, { timeout: ms }, n);
  /** the text of the visible overlay layer (menu, pause, end), not a hidden one */
  const visibleTitle = (p) => p.evaluate(() => [...document.querySelectorAll('.ad-menu')]
    .filter((m) => m.style.display !== 'none').map((m) => m.querySelector('h1')?.textContent).join('|'));
  const sameAt = async (a, b) => {
    // wait until both have passed a common turn, then compare that turn's hash
    await wait(200);
    const turn = Math.min(await turnOf(a), await turnOf(b));
    if (turn < 1) return { ok: false, turn };
    await waitTurn(a, turn);
    await waitTurn(b, turn);
    const [ha, hb] = [await hashAt(a, turn), await hashAt(b, turn)];
    return { ok: ha !== undefined && ha === hb, turn, ha, hb };
  };

  // ---- a single-player skirmish: start as Carthage, train from the HUD, save and load
  const a = await open(), b = await open();
  await a.select('.ad-menu select', 'cart');
  await clickText(a, 'Start skirmish');
  await a.waitForFunction(() => (window.__0ad.world?.turn ?? 0) >= 5, { timeout: 20000 });
  check(await a.evaluate(() => window.__0ad.world.entitiesOf(1).every((e) => e.template.startsWith('structures/cart/') || e.template.startsWith('units/cart/'))), 'single player: the chosen Carthaginians start with Punic buildings and units');
  check(await a.evaluate(() => window.__0ad.world.entitiesOf(1).some((e) => e.template === 'units/cart/infantry_archer_b')), 'single player: Carthaginian archers, not Athenian slingers');
  await a.evaluate(() => {
    const cc = window.__0ad.world.entitiesOf(1).find((e) => e.kind === 'building' && e.info.classes.includes('ConquestCritical'));
    window.__0ad.select(cc.id);
  });
  await a.waitForSelector('.ad-cmd .ad-cmdbtn.train:not(:disabled)', { timeout: 5000 });
  await a.evaluate(() => document.querySelector('.ad-cmd .ad-cmdbtn.train:not(:disabled)').click());
  await a.waitForFunction(() => window.__0ad.world.entitiesOf(1).some((e) => e.kind === 'building' && e.production.length > 0), { timeout: 5000 });
  check(true, 'single player: the HUD trains a unit');
  await a.screenshot({ path: join(shots, 'single-player.png') });
  await a.keyboard.press('Escape');
  await a.waitForFunction(() => [...document.querySelectorAll('.ad-menu')].some((m) => m.style.display !== 'none' && m.querySelector('h1')?.textContent === 'Paused'));
  await clickText(a, 'Save game');
  await a.waitForFunction(() => document.querySelector('.ad-toast')?.textContent.includes('Game saved'), { timeout: 15000 });
  const savedTurn = await a.evaluate(() => window.__0ad.world.turn);
  await clickText(a, 'Main menu');
  await a.waitForFunction(() => [...document.querySelectorAll('.ad-menu')].some((m) => m.style.display !== 'none' && m.querySelector('h1')?.textContent === '0 A.D.'));
  await clickText(a, 'Load game');
  await a.waitForFunction(() => document.querySelector('.ad-toast')?.textContent.includes('Loaded the saved game'), { timeout: 30000 });
  const loadedTurn = await a.evaluate(() => window.__0ad.world.turn);
  check(loadedTurn >= savedTurn && loadedTurn <= savedTurn + 5, `single player: the saved world loads (turn ${savedTurn} -> ${loadedTurn})`);
  check(await a.evaluate(() => window.__0ad.world.players[1].civ === 'cart'
    && window.__0ad.world.entitiesOf(1).some((e) => e.template === 'structures/cart/civil_centre')), 'single player: the loaded save keeps the chosen Carthaginians');
  await a.keyboard.press('Escape');
  await clickText(a, 'Main menu');
  await a.waitForFunction(() => [...document.querySelectorAll('.ad-menu')].some((m) => m.style.display !== 'none' && m.querySelector('h1')?.textContent === '0 A.D.'));
  await a.screenshot({ path: join(shots, 'menu.png') });

  // ---- online: meet in a room
  for (const [p, name] of [[a, 'Anna'], [b, 'Bert']]) {
    await clickText(p, 'Play online 1v1');
    await lobbyReady(p);
    await p.$eval('.fg-lobby input[placeholder="Your name"]', (e, n) => { e.value = n; e.dispatchEvent(new Event('change')); }, name);
  }
  await a.$eval('.fg-lobby input[placeholder="Room name"]', (e) => { e.value = 'farmland duel'; });
  await clickText(a, 'Create room');
  await a.waitForFunction(() => document.querySelector('.fg-lobby h2')?.textContent === 'farmland duel');
  await b.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('farmland duel')), { timeout: 10000 });
  await clickText(b, 'Join');
  await b.waitForFunction(() => document.querySelector('.fg-lobby h2')?.textContent === 'farmland duel');
  await clickText(b, 'Ready');
  await a.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('ready ✓')));
  await a.screenshot({ path: join(shots, 'online-room.png') });
  await clickText(a, 'Start');
  await online(a);
  await online(b);
  await waitTurn(a, 8); await waitTurn(b, 8);
  const seats = await Promise.all([a.evaluate(() => window.__0ad.me), b.evaluate(() => window.__0ad.me)]);
  check(seats[0] === 1 && seats[1] === 2, `the seats are the two players (${seats})`);
  check(await a.evaluate(() => window.__0ad.world.entitiesOf(1).some((e) => e.template.startsWith('structures/cart/'))), 'online: the host (seat 0) plays the Carthaginians it chose');
  check(await b.evaluate(() => window.__0ad.world.entitiesOf(1).some((e) => e.template.startsWith('structures/cart/'))), 'online: the guest builds the same Carthaginian world');
  check(await a.evaluate(() => window.__0ad.online.seat) === 0 && await b.evaluate(() => window.__0ad.online.seat) === 1, 'seat 0 and seat 1');
  let same = await sameAt(a, b);
  check(same.ok, `the same World on both screens at turn ${same.turn} (${same.ha} / ${same.hb})`);
  await a.screenshot({ path: join(shots, 'online-start-anna.png') });
  await b.screenshot({ path: join(shots, 'online-start-bert.png') });

  // ---- a real command: select a villager, right-click the ground; both worlds carry it out
  const worker = await a.evaluate(() => {
    const e = window.__0ad.world.entitiesOf(1).find((x) => x.kind === 'unit' && x.role === 'civilian');
    window.__0ad.select(e.id);
    return { id: e.id, x: e.x, z: e.z };
  });
  const box = await a.$eval('.ad canvas', (c) => { const r = c.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; });
  const clickTurn = Math.min(await turnOf(a), await turnOf(b));
  await a.mouse.click(box[0] + box[2] * 0.5, box[1] + box[3] * 0.56, { button: 'right' });
  await waitTurn(a, clickTurn + 8);
  await waitTurn(b, clickTurn + 8);
  const moved = await Promise.all([a, b].map((p) => p.evaluate((id) => { const e = window.__0ad.world.entity(id); return { x: e.x, z: e.z, order: e.order?.type ?? null }; }, worker.id)));
  check((Math.hypot(moved[0].x - worker.x, moved[0].z - worker.z) > 1 || moved[0].order === 'move'), `Anna's right click moved the villager (${worker.x.toFixed(1)},${worker.z.toFixed(1)} -> ${moved[0].x.toFixed(1)},${moved[0].z.toFixed(1)})`);
  same = await sameAt(a, b);
  check(Math.hypot(moved[1].x - worker.x, moved[1].z - worker.z) > 1 && same.ok, `Bert's simulation moved the villager too (${moved[1].x.toFixed(1)},${moved[1].z.toFixed(1)}; hashes ${same.ha}/${same.hb})`);

  // ---- a HUD command: select the Civic Centre and click its train button
  const cc = await a.evaluate(() => {
    const e = window.__0ad.world.entitiesOf(1).find((x) => x.kind === 'building' && x.info.classes.includes('ConquestCritical'));
    window.__0ad.select(e.id);
    return e.id;
  });
  await a.waitForSelector('.ad-cmd .ad-cmdbtn.train:not(:disabled)', { timeout: 5000 });
  const trained = await a.evaluate(() => {
    const btn = document.querySelector('.ad-cmd .ad-cmdbtn.train:not(:disabled)');
    if (!btn) return null;
    btn.click();
    return btn.querySelector('span')?.textContent ?? '';
  });
  await waitTurn(a, 20);
  await waitTurn(b, 20);
  const queues = await Promise.all([a, b].map((p) => p.evaluate((id) => window.__0ad.world.entity(id).production.length, cc)));
  check(!!trained && queues[0] > 0 && queues[0] === queues[1], `the HUD train button reached both simulations (${trained}, queue ${queues})`);
  same = await sameAt(a, b);
  check(same.ok, `still the same World at turn ${same.turn}`);

  // ---- Bert reloads, the lobby offers his running seat, the checked turns replay
  const beforeTurn = await turnOf(a);
  await b.reload({ waitUntil: 'domcontentloaded' });
  // the reloaded page comes back on the game's play route (or its game page): play if asked, then the menu
  await b.waitForFunction(() => !!document.querySelector('.page .play') || (window.__0ad?.world && window.__0ad?.scene && document.querySelector('.ad')), { timeout: 180000 });
  if (await b.$('.page .play')) await b.click('.page .play');
  await b.waitForFunction(() => window.__0ad?.world && window.__0ad?.scene && document.querySelector('.ad'), { timeout: 180000 });
  await clickText(b, 'Play online 1v1');
  await lobbyReady(b);
  await b.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('farmland duel') && li.textContent.includes('(your game)')), { timeout: 10000 });
  await b.screenshot({ path: join(shots, 'online-rejoin-room.png') });
  await clickText(b, 'Rejoin');
  await online(b);
  await b.waitForFunction(() => window.__0ad.online?.synced && window.__0ad.online.turn > 0, { timeout: 60000 });
  const replayed = await turnOf(b);
  check(replayed >= Math.min(beforeTurn, 10), `the reloaded page replayed the round (${replayed} turns)`);
  await waitTurn(a, replayed);
  const [ra, rb] = [await hashAt(a, replayed), await hashAt(b, replayed)];
  check(ra !== undefined && ra === rb, `the replayed World is Anna's World at turn ${replayed} (${ra} / ${rb})`);
  await wait(500);
  same = await sameAt(a, b);
  check(same.ok, `the reloaded client plays on equal at turn ${same.turn}`);
  await b.screenshot({ path: join(shots, 'online-rejoined-bert.png') });

  // ---- Bert leaves the match: Anna's round ends with her victory
  await b.keyboard.press('Escape');
  await wait(300);
  await clickText(b, 'Leave match');
  await a.waitForFunction(() => [...document.querySelectorAll('.ad-menu')]
    .some((m) => m.style.display !== 'none' && m.querySelector('h1')?.textContent === 'Victory'), { timeout: 20000 });
  const reason = await a.evaluate(() => [...document.querySelectorAll('.ad-menu')]
    .find((m) => m.style.display !== 'none' && m.querySelector('h1')?.textContent === 'Victory')?.querySelector('p')?.textContent ?? '');
  check(reason.includes('left') || reason.includes('win'), `Anna sees the round's result: "${reason}"`);
  await a.screenshot({ path: join(shots, 'online-victory-anna.png') });

  // ---- back to the menu, and Back stops the game
  await clickText(a, 'Back to menu');
  await a.waitForFunction(() => [...document.querySelectorAll('.ad-menu')]
    .some((m) => m.style.display !== 'none' && m.querySelector('h1')?.textContent === '0 A.D.'), { timeout: 20000 });
  check(true, 'Back to menu returns to the main menu');
  const f1 = await a.evaluate(() => window.__freegames.stats.running);
  await clickText(a, 'Leave game');
  await a.waitForSelector('.page .play');
  await wait(300);
  const f2 = await a.evaluate(() => window.__freegames.stats.running);
  check(f1 === 1 && f2 === 0, `Leave game stopped the game (${f1} -> ${f2})`);
} finally {
  await browser?.close();
  server.kill();
}
console.log(failed ? 'e2e FAILED' : 'e2e passed');
process.exit(failed ? 1 : 0);
