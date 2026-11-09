// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// End-to-end: the built site served by the real server, two headless Chromium players.
//   npm run build && node scripts/e2e.mjs          (needs ../server/target/freegames-server.jar and Chromium)
// Checks: the list shows every listed game; a game page has one Play button; Play starts the game in the
// same window; two players race online through the shared lobby (over WebTransport where the browser
// can); Back and browser-back stop the game (no running play, the frame loop stops); the players now
// (every play counts, shown on the list, its filter, the game page and the player bar); the legal pages
// (Impressum, privacy, licenses with the links to the source of this release).
// Screenshots go to $E2E_SHOTS (default: dist-e2e/).
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { request as httpRequest } from 'node:http';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const web = join(here, '..');
const jar = join(web, '..', 'server', 'target', 'freegames-server.jar');
const shots = process.env.E2E_SHOTS ?? join(web, 'dist-e2e');
const chrome = process.env.CHROME ?? ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(existsSync);
if (!existsSync(join(web, 'dist', 'index.html'))) throw new Error('build the site first: npm run build');
if (!existsSync(jar)) throw new Error(`no server jar at ${jar}`);
if (!chrome) throw new Error('no Chromium found (set CHROME)');
mkdirSync(shots, { recursive: true });

const port = await new Promise((resolve) => {
  const s = createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); });
});
const java = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', 'java') : 'java';
// the dashboard's password for this run, hashed as tools/deploy.sh --admin-password does (AdminAuth)
const ADMIN = `e2e-${randomBytes(8).toString('hex')}`;
const salt = randomBytes(16);
const adminHash = `pbkdf2-sha256:200000:${salt.toString('base64url')}:${pbkdf2Sync(ADMIN, salt, 200000, 32, 'sha256').toString('base64url')}`;
const server = spawn(java, ['-jar', jar], {
  env: { ...process.env, PORT: String(port), SITE_HOST: 'freegames.stream', WEB_ROOT: join(web, 'dist'), DATA_DIR: mkdtempSync(join(tmpdir(), 'fg-e2e-')), ADMIN_PASSWORD_HASH: adminHash },
  stdio: ['ignore', 'ignore', 'inherit'],
});
const base = `http://localhost:${port}/`;
for (let i = 0; ; i++) {
  try { if ((await fetch(base)).ok) break; } catch { /* starting */ }
  if (i > 150) throw new Error('server did not start');
  await new Promise((r) => setTimeout(r, 100));
}

const listed = readdirSync(join(web, 'games')).filter((d) => {
  const f = join(web, 'games', d, 'game.json');
  return existsSync(f) && JSON.parse(readFileSync(f, 'utf8')).listed !== false;
});

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
let failed = false;
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failed = true;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  const a = await (await browser.createBrowserContext()).newPage();
  const b = await (await browser.createBrowserContext()).newPage();
  for (const p of [a, b]) {
    await p.setViewport({ width: 1100, height: 760 });
    p.on('pageerror', (e) => { console.log(`page error: ${e.message}`); failed = true; });
  }

  // ---- the list
  await a.goto(base, { waitUntil: 'networkidle0' });
  const cards = await a.$$eval('.card', (els) => els.map((e) => e.getAttribute('href')));
  check(cards.length === listed.length, `list shows ${cards.length} games (${listed.length} listed folders)`);
  check(!cards.includes('#/example'), 'the example game is not listed');
  await a.screenshot({ path: join(shots, 'list.png'), fullPage: true });
  await a.setViewport({ width: 390, height: 844, isMobile: true });
  await a.screenshot({ path: join(shots, 'list-phone.png'), fullPage: true });
  await a.setViewport({ width: 1100, height: 760 });

  // ---- search, filter and sort; the choices live in the URL
  {
    const manifests = listed.map((d) => JSON.parse(readFileSync(join(web, 'games', d, 'game.json'), 'utf8')));
    const hrefs = () => a.$$eval('.card', (els) => els.map((e) => e.getAttribute('href')));
    const settle = () => new Promise((r) => setTimeout(r, 100));
    const first = [...manifests].sort((x, y) => x.title.localeCompare(y.title))[0];
    await a.type('.search', first.title.toUpperCase());
    await settle();
    check(JSON.stringify(await hrefs()) === JSON.stringify([`#/${first.id}`]), `typing "${first.title.toUpperCase()}" finds ${first.id}`);
    check((await a.evaluate(() => location.hash)).includes('q='), 'the search is in the URL');
    await a.reload({ waitUntil: 'networkidle0' });
    check(await a.$eval('.search', (e) => e.value) === first.title.toUpperCase(), 'a reload keeps the search');
    check((await hrefs()).length === 1, 'a reload keeps the result');
    await a.click('.clear');
    await settle();
    check((await hrefs()).length === listed.length && (await a.evaluate(() => location.hash)) === '#/', 'Clear shows every game again');

    const playable = manifests.filter((m) => existsSync(join(web, 'games', m.id, 'src', 'index.ts')));
    await a.click('.chip[data-key="playable"]');
    await settle();
    check((await hrefs()).length === playable.length, `"Playable now" shows the ${playable.length} playable games`);
    check(await a.$eval('.chip[data-key="playable"]', (e) => e.getAttribute('aria-pressed')) === 'true', 'the chip shows it is on');
    check(await a.evaluate(() => document.activeElement?.getAttribute('data-key')) === 'playable', 'the chip keeps the focus');
    const genre = playable[0].genres[0];
    await a.click(`.chip[data-key="genre:${genre}"]`);
    await a.select('.sort-select', 'year');
    await settle();
    const want = playable.filter((m) => m.genres.includes(genre)).sort((x, y) => x.original.year - y.original.year || x.title.localeCompare(y.title)).map((m) => `#/${m.id}`);
    check(JSON.stringify(await hrefs()) === JSON.stringify(want), `playable + ${genre}, by year: ${want.join(' ')}`);
    const filteredHash = await a.evaluate(() => location.hash);
    await a.click('.card');
    await a.waitForSelector('.page .back-link');
    check(await a.$eval('.page .back-link', (e) => e.getAttribute('href')) === filteredHash, 'the game page leads back to the filtered list');
    await a.goBack({ waitUntil: 'networkidle0' });
    await a.waitForSelector('.card');
    check(JSON.stringify(await hrefs()) === JSON.stringify(want), 'Back returns to the filtered list');

    await a.goto(`${base}#/?q=zzqx`, { waitUntil: 'networkidle0' });
    check(await a.$eval('.empty', (e) => e.textContent.includes('No games match')), 'no match says so');
    await a.click('.empty .reset');
    await settle();
    check((await hrefs()).length === listed.length, '"Show all games" resets the search');
    // a phone: the filters are a button away, and nothing scrolls sideways
    const phone = await (await browser.createBrowserContext()).newPage();
    phone.on('pageerror', (e) => { console.log(`page error: ${e.message}`); failed = true; });
    await phone.setViewport({ width: 390, height: 844, isMobile: true });
    await phone.goto(`${base}#/?q=zzqx`, { waitUntil: 'networkidle0' });
    check(await phone.$eval('.chips', (e) => e.hidden) && await phone.$eval('.filters-toggle', (e) => e.getAttribute('aria-expanded')) === 'false', 'on a phone the filters start folded');
    await phone.click('.filters-toggle');
    check(!(await phone.$eval('.chips', (e) => e.hidden)), 'the Filters button opens them');
    check(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'the toolbar fits a phone (no sideways scroll)');
    await phone.close();
    await a.goto(base, { waitUntil: 'networkidle0' });
  }

  // ---- a game page (from a click on a card)
  await a.click('.card');
  await a.waitForSelector('.page .play');
  check((await a.$$('.page .play')).length === 1, 'a game page has one Play button');
  check(await a.$eval('.page h1', (e) => e.textContent.length > 0), 'the game page has a title');
  check(await a.$$eval('.summary p', (els) => els.length > 0), 'the game page has a summary');
  await a.screenshot({ path: join(shots, 'page.png'), fullPage: true });

  // ---- play the example in the same window
  const targets = browser.targets().length;
  for (const p of [a, b]) {
    await p.goto(`${base}#/example`, { waitUntil: 'networkidle0' });
    await p.click('.page .play');
    await p.waitForSelector('.player .ex');
  }
  check(a.url().endsWith('#/example/play'), 'Play switched to #/example/play');
  check(browser.targets().length === targets, 'no new tab or window');
  check(await a.evaluate(() => window.__freegames.stats.running === 1), 'one play is running');

  // ---- online race through the lobby
  await a.click('.ex button');
  await a.waitForSelector('.fg-lobby');
  await a.screenshot({ path: join(shots, 'lobby.png') });
  // by mouse and keyboard, as a player: a click puts the caret into the lobby's fields, whatever the game
  // around them does with the pointer
  const typeInto = async (p, sel, text) => {
    await p.click(sel);
    const focused = await p.$eval(sel, (e) => document.activeElement === e);
    await p.keyboard.down('Control');
    await p.keyboard.press('KeyA');
    await p.keyboard.up('Control');
    await p.keyboard.type(text);
    await p.keyboard.press('Tab');
    return focused && (await p.$eval(sel, (e) => e.value)) === text;
  };
  const typed = [await typeInto(a, '.fg-lobby input[placeholder="Your name"]', 'Anna'),
    await typeInto(a, '.fg-lobby input[placeholder="Room name"]', 'e2e race')];
  check(typed.every(Boolean), `the lobby's fields take a click and typing (${typed.join(', ')})`);
  const button = (p, text) => p.evaluateHandle((t) => [...document.querySelectorAll('button')].find((x) => x.textContent === t), text);
  await (await button(a, 'Create room')).click();
  await a.waitForFunction(() => document.querySelector('.fg-lobby h2')?.textContent === 'e2e race');

  await b.click('.ex button');
  await b.waitForSelector('.fg-lobby');
  await b.$eval('.fg-lobby input[placeholder="Your name"]', (e) => { e.value = 'Bert'; e.dispatchEvent(new Event('change')); });
  await b.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('e2e race')), { timeout: 8000 });
  await (await button(b, 'Join')).click();
  await b.waitForFunction(() => document.querySelector('.fg-lobby h2')?.textContent === 'e2e race');
  await (await button(b, 'Ready')).click();
  await a.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('ready ✓')));
  await a.screenshot({ path: join(shots, 'room.png') });
  await (await button(a, 'Start')).click();
  for (const p of [a, b]) await p.waitForFunction(() => document.querySelector('.ex h2')?.textContent.startsWith('Race'));
  const transport = await a.$eval('.ex .ex-muted:last-child', (e) => e.textContent);
  console.log(`     transport: ${transport}`);
  check(/^(wt|ws) /.test(transport), 'connected to the server');
  check(transport.startsWith('wt'), 'WebTransport in Chromium');

  // ---- a reload in the middle of the round: the lobby offers the seat back
  await b.reload({ waitUntil: 'networkidle0' });
  await b.waitForSelector('.player .ex');
  await b.click('.ex button');
  await b.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('e2e race (your game)')), { timeout: 8000 });
  check(await b.evaluate(() => document.querySelector('.fg-lobby li')?.textContent.includes('(your game)')), 'after a reload the lobby lists the running round first, as yours');
  await (await button(b, 'Rejoin')).click();
  await b.waitForFunction(() => document.querySelector('.ex h2')?.textContent.startsWith('Race'), { timeout: 8000 });
  check(true, 'Rejoin brings the reloaded page back into its round');

  for (let i = 0; i < 40; i++) {
    const done = await a.evaluate(() => !document.querySelector('.ex h2')?.textContent.startsWith('Race'));
    if (done) break;
    await (await button(a, 'Roll')).click();
    await wait(120);
  }
  await a.waitForFunction(() => document.querySelector('.ex h2')?.textContent === 'Dice race', { timeout: 8000 });
  const note = await a.$eval('.ex-box p:nth-of-type(2)', (e) => e.textContent);
  console.log(`     ${note}`);
  check(/won in \d+ rolls/.test(note), 'the round ended with a winner');
  check(note.includes('place 1'), 'the winner entered the score table');
  check(note.startsWith('Anna won'), 'the name typed in the lobby reached the server');
  await a.screenshot({ path: join(shots, 'example-after-race.png') });

  // ---- Back stops the game
  const frames = await b.evaluate(() => window.__exampleFrames);
  await (await button(a, '← Back')).click();
  await a.waitForSelector('.page .play');
  check(a.url().endsWith('#/example'), 'Back returned to the game page');
  check(await a.evaluate(() => window.__freegames.stats.running === 0 && !document.querySelector('.player')), 'Back stopped the game');
  await b.goBack();
  await b.waitForSelector('.page .play');
  const f1 = await b.evaluate(() => window.__exampleFrames);
  await wait(400);
  const f2 = await b.evaluate(() => window.__exampleFrames);
  check(frames > 0 && f1 === f2, `browser back stopped the frame loop (${f1} frames, still ${f2})`);
  check(await b.evaluate(() => window.__freegames.stats.running === 0), 'browser back stopped the game');

  // ---- Back clicked twice goes back once, as does a game that exits while it is being stopped: a second
  // history.back() would leave the site (a fresh tab, where the game page is the first entry)
  {
    const ctx = await browser.createBrowserContext();
    const t = await ctx.newPage();
    await t.goto(`${base}#/example`, { waitUntil: 'networkidle0' });
    await t.click('.page .play');
    await t.waitForSelector('.player .ex');
    await t.evaluate(() => { const back = document.querySelector('.player-bar .bar-button'); back.click(); back.click(); })
      .catch(() => { /* the page navigated away: checked below */ });
    await t.waitForFunction(() => window.__freegames?.stats.running === 0, { timeout: 5000 }).catch(() => {});
    await wait(500);
    check(t.url().endsWith('#/example') && !!(await t.$('.page .play')), `Back clicked twice goes back once (at ${t.url()})`);
    await ctx.close();
  }

  // ---- deep link straight into a game
  await b.goto(`${base}#/example/play`, { waitUntil: 'networkidle0' });
  check(!!(await b.waitForSelector('.player .ex', { timeout: 5000 })), 'a deep link to #/<id>/play starts the game');

  // ---- the SDK's terminal and pixel screen (example menu)
  const termText = () => b.evaluate(() => [...document.querySelectorAll('.fg-term-page')].pop().textContent);
  await (await button(b, 'Terminal')).click();
  await b.waitForSelector('.fg-term-page');
  await b.keyboard.type('hello');
  await b.keyboard.press('Enter');
  await b.waitForFunction(() => [...document.querySelectorAll('.fg-term-page')].pop()?.textContent.includes('YOU SAID HELLO.'), { timeout: 3000 });
  check((await termText()).includes('? HELLO'), 'teletype: typed line echoed in upper case');
  // keys the browser would use (scrolling, find) are the game's: the terminal prevents their default
  await b.evaluate(() => {
    window.__prevented = [];
    window.addEventListener('keydown', (e) => setTimeout(() => window.__prevented.push([e.key, e.defaultPrevented])), true);
  });
  await b.keyboard.press('Space');
  await b.keyboard.press('PageDown');
  await b.keyboard.press('Backspace');
  await b.keyboard.press('Backspace');
  await wait(100);
  const prevented = await b.evaluate(() => window.__prevented);
  check(prevented.length === 4 && prevented.every(([, p]) => p), `teletype: game keys are the game's (${JSON.stringify(prevented)})`);
  // copy: select text with the mouse in the site's focusable host and copy it
  const line = await b.evaluate(() => {
    const el = [...document.querySelectorAll('.fg-term-line')].find((e) => e.textContent.includes('TELETYPE DEMO'));
    const r = el.getBoundingClientRect();
    return { x: r.left + 2, y: r.top + r.height / 2, w: r.width };
  });
  await b.evaluate(() => { window.__copied = null; document.addEventListener('copy', () => { window.__copied = document.getSelection().toString(); }, { once: true }); });
  await b.mouse.move(line.x, line.y);
  await b.mouse.down();
  await b.mouse.move(line.x + line.w * 0.6, line.y, { steps: 8 });
  await b.mouse.up();
  const selected = await b.evaluate(() => document.getSelection().toString());
  await b.keyboard.down('Control');
  await b.keyboard.press('c');
  await b.keyboard.up('Control');
  const copied = await b.evaluate(() => window.__copied);
  check(selected.includes('TELETYPE') && copied?.includes('TELETYPE'), `teletype: text can be selected and copied in the site's host (${JSON.stringify(copied)})`);
  // a click that selects nothing gives the keyboard back
  await b.mouse.click(line.x + 4, line.y + 40);
  // an IME: the finished composition arrives whole, and the paper stays scrolled to the bottom
  const cdp = await b.createCDPSession();
  await cdp.send('Input.imeSetComposition', { text: 'か', selectionStart: 1, selectionEnd: 1 });
  await cdp.send('Input.imeSetComposition', { text: '仮名', selectionStart: 2, selectionEnd: 2 });
  await cdp.send('Input.insertText', { text: '仮名' });
  await b.keyboard.press('Enter');
  await b.waitForFunction(() => [...document.querySelectorAll('.fg-term-page')].pop()?.textContent.includes('YOU SAID 仮名.'), { timeout: 3000 }).catch(() => null);
  const ime = await b.evaluate(() => {
    const v = [...document.querySelectorAll('.fg-term-view')].pop();
    return { said: [...document.querySelectorAll('.fg-term-page')].pop().textContent.includes('YOU SAID 仮名.'), bottom: v.scrollTop + v.clientHeight >= v.scrollHeight - 2 };
  });
  check(ime.said && ime.bottom, `teletype: an IME composition arrives whole, the view stays at the bottom (${JSON.stringify(ime)})`);
  await b.keyboard.type('screen');
  await b.keyboard.press('Enter');
  await b.waitForFunction(() => [...document.querySelectorAll('.fg-term-page')].pop()?.textContent.includes('TextScreen demo'), { timeout: 3000 });
  await b.keyboard.press('ArrowRight');
  await b.waitForFunction(() => [...document.querySelectorAll('.fg-term-page')].pop()?.textContent.includes('position 11,41'), { timeout: 3000 });
  check(true, 'text screen: arrow keys reach the game');
  check(await b.evaluate(() => { const r = [...document.querySelectorAll('.fg-term-r')].find((e) => e.textContent.includes('TextScreen')); return !!r && getComputedStyle(r).backgroundColor !== 'rgba(0, 0, 0, 0)'; }), 'text screen: reverse video has a background');
  await b.screenshot({ path: join(shots, 'textscreen.png') });
  await b.keyboard.press('q');
  await b.waitForFunction(() => [...document.querySelectorAll('.fg-term-page')].pop()?.textContent.includes('? '), { timeout: 3000 });
  await b.keyboard.type('bye');
  await b.keyboard.press('Enter');
  await b.waitForFunction(() => !document.querySelector('.fg-term') && document.querySelector('.ex h2')?.textContent === 'Dice race', { timeout: 3000 });
  check(true, 'terminal demo returns to the menu and removes itself');
  await (await button(b, 'Pixel screen')).click();
  await b.waitForSelector('.player-host canvas');
  const css = await b.$eval('.player-host canvas', (c) => [c.width, c.height, parseFloat(c.style.width), parseFloat(c.style.height)]);
  console.log(`     pixel screen ${css[0]}x${css[1]} shown at ${css[2]}x${css[3]}`);
  check(css[2] % (css[0] * 2) === 0 && css[3] % css[1] === 0, 'pixel screen: whole-number scale with double-wide pixels');
  await b.screenshot({ path: join(shots, 'pixelscreen.png') });
  await b.keyboard.press('Escape');
  await b.waitForFunction(() => !document.querySelector('.player-host canvas'), { timeout: 3000 });
  check(true, 'pixel demo leaves on Esc');

  // ---- the players now: a play of a game that never needs the server counts too (every play connects,
  // anonymously);
  // the player bar, /stats, the list filtered by "Playing now", and the game page show it; Back counts it down
  {
    const games = async () => (await (await fetch(`${base}stats`, { cache: 'no-store' })).json()).games ?? {};
    const vctx = await browser.createBrowserContext(), pctx = await browser.createBrowserContext();
    const viewer = await vctx.newPage(), player = await pctx.newPage();
    await viewer.setViewport({ width: 1100, height: 900 });
    await player.setViewport({ width: 1024, height: 768 });
    // an open page sees a change at its next poll (every 20 s, live.ts)
    const shows = (p, fn, arg) => p.waitForFunction(fn, { timeout: 25000 }, arg).then(() => true, () => false);
    check((await games()).wumpus?.playing === 0, 'players now: nobody plays Hunt the Wumpus yet');
    await viewer.goto(`${base}#/?playing=1`, { waitUntil: 'networkidle0' });
    check(await shows(viewer, () => document.querySelector('.empty')?.textContent.includes('No games match')), 'players now: "Playing now 1+" shows no game while nobody plays');
    await player.goto(`${base}#/wumpus`, { waitUntil: 'networkidle0' });
    await player.click('.page .play');
    check(await shows(player, () => document.querySelector('.player-live')?.textContent === '1 playing'), 'players now: the player bar shows "1 playing"');
    check(await player.$eval('.player-legal', (a) => a.getAttribute('href') === 'impressum.html' && a.target === '_blank'), 'legal: the player bar links the Impressum, in a new tab');
    const w = (await games()).wumpus;
    check(w?.playing === 1 && w.online === 0, `players now: /stats counts the play (${JSON.stringify(w)})`);
    // counted anonymously: a game that needs no server leaves nothing in the browser (§ 25 TDDDG)
    check(await player.evaluate(() => localStorage.length === 0), `players now: the play is counted without anything stored in the browser (${await player.evaluate(() => Object.keys(localStorage).join(', ') || 'nothing')})`);
    check(await shows(viewer, () => {
      const cs = [...document.querySelectorAll('.cards .card')];
      return cs.length === 1 && cs[0].getAttribute('href') === '#/wumpus' && cs[0].querySelector('.card-live')?.textContent === '1 playing';
    }), 'players now: the list filtered by "Playing now 1+" shows the game, "1 playing"');
    check(await viewer.$eval('[data-key="playing:1"]', (b) => b.getAttribute('aria-pressed') === 'true' && b.textContent.endsWith('1')), 'players now: the chip is on and counts 1 game');
    await viewer.screenshot({ path: join(shots, 'playing-now.png') });
    await viewer.goto(`${base}#/wumpus`, { waitUntil: 'networkidle0' });
    check(await shows(viewer, () => document.querySelector('.live-line')?.textContent === '1 playing'), 'players now: the game page shows "1 playing"');
    await player.click('.player-bar .bar-button');
    check(await shows(viewer, () => document.querySelector('.live-line')?.textContent === 'Nobody is playing right now'), 'players now: after Back the game page shows "Nobody is playing right now"');
    check((await games()).wumpus?.playing === 0, 'players now: /stats counted the play down');
    await vctx.close();
    await pctx.close();
  }

  // ---- the usage statistics: a visitor's page loads, views and plays end up as daily sums on the dashboard
  // (a browser's own user agent: the headless one counts as a robot); the most played game sorts first
  {
    const uctx = await browser.createBrowserContext();
    const u = await uctx.newPage();
    await u.setUserAgent('Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0');
    await u.setViewport({ width: 1100, height: 900 });
    await u.goto(base, { waitUntil: 'networkidle0' });
    await u.goto(`${base}#/passage`, { waitUntil: 'networkidle0' });
    await u.click('.page .play');
    await u.waitForSelector('.player-host');
    await wait(800);
    await u.click('.player-bar .bar-button');
    await u.waitForSelector('.page .play');
    await wait(500);
    const auth = { Authorization: `Basic ${Buffer.from(`admin:${ADMIN}`).toString('base64')}` };
    check((await fetch(`${base}admin/stats.json`)).status === 401, 'statistics: the dashboard asks for its password');
    const day = (await (await fetch(`${base}admin/stats.json`, { headers: auth })).json()).days.at(-1).sums;
    const has = (k) => (day[k] ?? 0) >= 1;
    check(has('load:/') && has('device:desktop') && has('browser:Firefox') && has('system:Linux'), `statistics: the page load with its kind of device, browser and system (${['load:/', 'device:desktop', 'browser:Firefox', 'system:Linux'].map((k) => `${k} ${day[k] ?? 0}`).join(', ')})`);
    check(has('view:list') && has('view:game:passage') && has('view:play:passage'), `statistics: the views (list ${day['view:list'] ?? 0}, game ${day['view:game:passage'] ?? 0}, play ${day['view:play:passage'] ?? 0})`);
    check(has('play:passage:started') && has('play:wumpus:started'), 'statistics: the plays (passage now, wumpus above)');
    check((day.bots ?? 0) >= 1, `statistics: the headless browsers of this test count as robots (${day.bots ?? 0})`);
    check(!JSON.stringify(day).match(/\d+\.\d+\.\d+\.\d+|127\.0\.0\.1|::1/), 'statistics: no address in the sums');
    const dash = await fetch(`${base}admin/stats`, { headers: auth });
    check(dash.ok && (await dash.text()).includes('Nutzung von freegames.stream'), 'statistics: the dashboard page');
    // popularity: wumpus and passage were played, nothing else listed
    await u.goto(`${base}#/?sort=popular`, { waitUntil: 'networkidle0' });
    const first = await u.waitForFunction(() => {
      const cs = [...document.querySelectorAll('.cards .card')].map((c) => c.getAttribute('href'));
      return cs.length > 2 && ['#/passage', '#/wumpus'].every((h) => cs.slice(0, 2).includes(h)) ? cs.slice(0, 3) : false;
    }, { timeout: 9000 }).then((h) => h.jsonValue(), () => null);
    check(!!first, `statistics: "Most popular" puts the played games first (${first ? first.join(', ') : 'not so'})`);
    await u.goto(`${base}#/passage`, { waitUntil: 'networkidle0' });
    check(await u.waitForFunction(() => /^\d+ plays? in the last 30 days$/.test(document.querySelector('.popular-line')?.textContent ?? ''), { timeout: 9000 }).then(() => true, () => false),
      'statistics: the game page shows its plays of the last 30 days');
    await uctx.close();
  }

  // ---- the legal pages: one click from the list, a game page and the player bar; the contact data only as an
  // image; the licenses page offers the source of what the browser gets, without the game server
  {
    const lctx = await browser.createBrowserContext();
    const l = await lctx.newPage();
    await l.goto(base, { waitUntil: 'networkidle0' });
    const foot = await l.$$eval('.site-foot a', (as) => as.map((a) => a.getAttribute('href')));
    check(foot.join() === 'impressum.html,datenschutz.html,nutzungsbedingungen.html,licenses.html', `legal: the list's foot links the legal pages (${foot.join(', ')})`);
    await l.goto(`${base}#/wumpus`, { waitUntil: 'networkidle0' });
    check((await l.$$('.page .site-foot a')).length === 4, 'legal: a game page has the same foot');
    await l.click('.site-foot a[href="impressum.html"]');
    await l.waitForSelector('h1');
    const imp = await l.evaluate(() => ({ h1: document.querySelector('h1').textContent, img: document.querySelector('img.contact')?.naturalWidth ?? 0, text: document.body.innerText }));
    check(imp.h1 === 'Impressum' && imp.img > 0, 'legal: the Impressum opens and shows the contact image');
    check(!/@|\+49|\d{4,} ?\d{4,}|Uhlman/.test(imp.text), 'legal: no e-mail address, phone number or street as text');
    for (const [path, h1] of [['datenschutz.html', 'Datenschutzerklärung'], ['nutzungsbedingungen.html', 'Nutzungsbedingungen'], ['licenses.html', 'Licenses & source code']]) {
      await l.goto(`${base}${path}`, { waitUntil: 'networkidle0' });
      check(await l.$eval('h1', (e) => e.textContent) === h1, `legal: ${path} has its heading`);
    }
    check(!/@/.test(await l.goto(`${base}datenschutz.html`).then(() => l.evaluate(() => document.body.innerText))), 'legal: the privacy policy has no e-mail address as text either');
    await l.goto(`${base}licenses.html`, { waitUntil: 'networkidle0' });
    // the source: one release's tag in the public repository, every game's folder in it, and the offer for earlier versions
    const repoTree = /^https:\/\/github\.com\/bwege2\/freegames-client\/tree\/(main|release-\d{4}-\d{2}-\d{2}(?:\.\d+)?)(?:\/|$)/;
    const source = (await l.$$eval('a', (as) => as.map((a) => a.href))).filter((h) => repoTree.test(h));
    const tags = new Set(source.map((h) => repoTree.exec(h)[1]));
    const noSource = listed.filter((id) => !source.some((h) => h.endsWith(`/web/games/${id}`)));
    check(tags.size === 1 && noSource.length === 0 && source.some((h) => h.endsWith('/web/src')),
      `legal: the licenses page links one release's source (${[...tags].join(', ')}), the website's and every game's folder${noSource.length ? ` (missing ${noSource.join(', ')})` : ''}`);
    check(/last three years, free of charge/.test(await l.evaluate(() => document.body.innerText)), 'legal: the licenses page offers the source of earlier versions on request');
    for (const t of ['GPL-2.0', 'GPL-3.0', 'LGPL-3.0', 'capnp-es', 'xpilot', 'freegames']) {
      const r = await fetch(`${base}licenses/${t}.txt`);
      check(r.ok && (await r.text()).length > 200, `legal: licenses/${t}.txt`);
    }
    await lctx.close();
  }

  // ---- another site's page gets no connection and no JSON: a page of http://127.0.0.2 (another origin, on
  // this machine) against the server at 127.0.0.1; the same from a page of 127.0.0.1 as the control
  {
    const wt = await (await fetch(`${base}wt-info`)).json().catch(() => null);
    const octx = await browser.createBrowserContext();
    const tryAll = async (pageHost) => {
      const p = await octx.newPage();
      await p.goto(`http://${pageHost}:${port}/impressum.html`, { waitUntil: 'networkidle0' });
      return p.evaluate(async (port, wt) => {
        const ws = await new Promise((r) => {
          const w = new WebSocket(`ws://127.0.0.1:${port}/ws`);
          w.onopen = () => { w.close(); r('open'); };
          w.onerror = () => r('refused');
        });
        let t = 'no WebTransport';
        if (wt && typeof WebTransport === 'function') {
          const hash = Uint8Array.from(atob(wt.certHash), (c) => c.charCodeAt(0));
          const s = new WebTransport(`https://127.0.0.1:${wt.port}${wt.path}`, { serverCertificateHashes: [{ algorithm: 'sha-256', value: hash }] });
          t = await Promise.race([s.ready.then(() => 'open', () => 'refused'), new Promise((r) => setTimeout(() => r('timeout'), 5000))]);
          try { s.close(); } catch { /* not open */ }
        }
        const json = await fetch(`http://127.0.0.1:${port}/stats`).then(() => 'read', () => 'blocked');
        return [ws, t, json].join(' ');
      }, port, wt);
    };
    const own = await tryAll('127.0.0.1'), other = await tryAll('127.0.0.2');
    check(own === `open ${wt ? 'open' : 'no WebTransport'} read`, `origins: the site's own page connects and reads the JSON (${own})`);
    check(other === `refused ${wt ? 'refused' : 'no WebTransport'} blocked`, `origins: another site's page gets no WebSocket, no WebTransport session and no JSON (${other})`);
    await octx.close();
  }

  // ---- the pages are cross-origin isolated (workers may share memory: SharedArrayBuffer, Atomics.wait)
  {
    const ip = await browser.newPage();
    await ip.goto(base, { waitUntil: 'networkidle0' });
    check(await ip.evaluate(() => crossOriginIsolated && typeof SharedArrayBuffer === 'function'), 'isolation: the site is cross-origin isolated (SharedArrayBuffer)');
    await ip.close();
  }

  // ---- what search engines read: robots.txt, the sitemap, a plain page per game, the list as links
  {
    const key = (await (await fetch(`${base}indexnow.txt`)).text()).trim();
    check(/^[A-Za-z0-9-]{8,128}$/.test(key), 'seo: the site serves its IndexNow key (indexnow.txt)');
    const robots = await (await fetch(`${base}robots.txt`)).text();
    check(/Sitemap: https:\/\/freegames\.stream\/sitemap\.xml/.test(robots) && /Disallow: \/admin\//.test(robots), 'seo: robots.txt names the sitemap and keeps out /admin/');
    check(/User-agent: Yandex\nDisallow: \/\n/.test(robots), 'seo: robots.txt keeps Yandex out');
    const sm = await fetch(`${base}sitemap.xml`);
    check(sm.headers.get('content-type')?.startsWith('application/xml'), `seo: the sitemap is served as XML (${sm.headers.get('content-type')})`);
    const sitemap = await sm.text();
    const missing = listed.filter((id) => !sitemap.includes(`<loc>https://${id}.freegames.stream/</loc>`));
    check(!/<loc>https:\/\/freegames\.stream\/[a-z0-9-]+\/<\/loc>/.test(sitemap), 'seo: the sitemap names no game page at the old address (freegames.stream/<id>/)');
    check(missing.length === 0, `seo: the sitemap lists every game's page${missing.length ? ` (missing ${missing.join(', ')})` : ''}`);
    const raw = await (await fetch(base)).text();
    check(listed.every((id) => raw.includes(`<a href="https://${id}.freegames.stream/">`)) && /<meta name="description"/.test(raw),
      'seo: the start page holds a description and every game as a plain link');
    for (const path of ['wumpus/', 'wumpus']) {
      const r = await fetch(`${base}${path}`);
      const html = await r.text();
      const img = /<img src="([^"]+)"/.exec(html)?.[1];
      const imgOk = img ? (await fetch(new URL(img, `${base}${path}`))).headers.get('content-type') === 'image/png' : false;
      check(r.ok && /<h1>Hunt the Wumpus<\/h1>/.test(html) && html.includes('href="https://freegames.stream/#/wumpus/play"')
        && html.includes('<link rel="canonical" href="https://wumpus.freegames.stream/">') && /"@type":"VideoGame"/.test(html) && imgOk,
        `seo: /${path} holds the game's text, its screenshots and a Play link for search engines`);
    }
    const sp = await browser.newPage();
    await sp.goto(`${base}wumpus/`, { waitUntil: 'networkidle0' });
    await sp.waitForSelector('.page .play');
    check(sp.url() === `${base}#/wumpus`, `seo: without game hosts (localhost) /wumpus/ is the site's #/wumpus (${sp.url()})`);
    await sp.click('.page .play');
    const started = await sp.waitForFunction(() => location.hash === '#/wumpus/play' && document.querySelector('.player-host canvas, .player-host .fg-term-page'), { timeout: 10000 }).then(() => true, () => false);
    check(started, "seo: the game page's Play link starts the game in the site");
    await sp.close();
  }

  // ---- every game's page at its own host (<id>.freegames.stream): a browser that takes these names (and a foreign
  // one) for this machine, so that the site runs at its real names over plain HTTP on the test's port
  {
    const site = `freegames.stream:${port}`, at = (id) => `http://${id}.${site}/`;
    const secure = ['', 'wumpus.', 'netrek.'].map((p) => `http://${p}${site}`).join(',');
    const hb = await puppeteer.launch({
      executablePath: chrome, headless: true,
      args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required',
        '--host-resolver-rules=MAP freegames.stream 127.0.0.1, MAP *.freegames.stream 127.0.0.1, MAP evil.example 127.0.0.1',
        `--unsafely-treat-insecure-origin-as-secure=${secure}`],
    });
    try {
      const h = await hb.newPage();
      await h.setViewport({ width: 1100, height: 760 });
      h.on('pageerror', (e) => { console.log(`page error: ${e.message}`); failed = true; });
      await h.goto(`http://${site}/`, { waitUntil: 'networkidle0' });
      const hrefs = await h.$$eval('.card', (els) => els.map((e) => e.getAttribute('href')));
      check(hrefs.length === listed.length && listed.every((id) => hrefs.includes(at(id))), "hosts: at freegames.stream every card leads to the game's own host");

      // the page at its host: its text, its icon, its canonical address, its Play link into the site
      await Promise.all([h.waitForNavigation({ waitUntil: 'networkidle0' }), h.click(`a.card[href="${at('wumpus')}"]`)]);
      check(h.url() === at('wumpus') && await h.$eval('h1', (e) => e.textContent) === 'Hunt the Wumpus', `hosts: the card opens ${h.url()}`);
      await h.waitForSelector('.page .play');
      const head = await h.evaluate(() => ({
        canonical: document.querySelector('link[rel=canonical]')?.href, icon: document.querySelector('link[rel=icon]')?.href,
        back: document.querySelector('.page .back-link')?.href, legal: document.querySelector('.site-foot a[href*="impressum"]')?.href,
        isolated: crossOriginIsolated,
      }));
      check(head.canonical === 'https://wumpus.freegames.stream/', `hosts: the page's canonical address is its host (${head.canonical})`);
      check(head.icon === `${at('wumpus')}wumpus/icon.png`, `hosts: the page's icon is the game's own PNG (${head.icon})`);
      check(head.back === `http://${site}/#/` && head.legal === `http://${site}/impressum.html`,
        `hosts: the game's page (the website) leads back to the site's list and legal pages (${head.back}, ${head.legal})`);
      // the screenshots: a click opens one, the arrow keys step to the next and back, Escape closes it
      await h.click('.shot');
      await h.waitForSelector('dialog.zoom img');
      const shotFirst = await h.$eval('dialog.zoom img', (e) => e.src);
      await h.keyboard.press('ArrowRight');
      const shotNext = await h.$eval('dialog.zoom img', (e) => e.src);
      await h.keyboard.press('ArrowLeft');
      const shotBack = await h.$eval('dialog.zoom img', (e) => e.src);
      check(shotNext !== shotFirst && shotBack === shotFirst, 'hosts: the screenshots step with the arrow keys, and back');
      await h.keyboard.press('Escape');
      await h.waitForSelector('dialog.zoom', { hidden: true });

      const plain = await h.evaluate(() => fetch('/').then((r) => r.text()));
      check(plain.includes('<a class="play" href="https://freegames.stream/#/wumpus/play">') && plain.includes('<a href="https://ballerburg.freegames.stream/">Ballerburg</a>')
        && plain.includes('<script type="module" crossorigin src="/assets/'), "hosts: the page's plain content (for search engines) links Play into the site and the other games to their hosts");
      check(head.isolated, 'hosts: the page at its own host is cross-origin isolated too');
      const netrek = await hb.newPage();
      await netrek.goto(at('netrek'), { waitUntil: 'networkidle0' });
      // the favicon Google Search shows (a PNG; it shows no SVG) and the touch icon, both served by the game's host
      const nIcon = await netrek.evaluate(async () => Promise.all(['link[rel=icon]', 'link[rel=apple-touch-icon]'].map(async (sel) => {
        const l = document.querySelector(sel);
        const r = await fetch(l.href);
        const b = await createImageBitmap(await r.blob());
        return { href: l.getAttribute('href'), sizes: l.getAttribute('sizes'), type: r.headers.get('content-type'), w: b.width, h: b.height };
      })));
      check(nIcon[0].href === '/netrek/icon.png' && nIcon[0].type === 'image/png' && nIcon[0].w === 48 && nIcon[0].h === 48 && nIcon[0].sizes === '48x48'
        && nIcon[1].href === '/netrek/apple-touch-icon.png' && nIcon[1].type === 'image/png' && nIcon[1].w === 180 && nIcon[1].h === 180 && nIcon[1].sizes === '180x180',
        `hosts: a game's page has its PNG icons, 48x48 and 180x180 (${JSON.stringify(nIcon)})`);
      await netrek.close();

      // Play: in the site at freegames.stream (the account stays there); Back returns to the game's page
      await Promise.all([h.waitForNavigation({ waitUntil: 'networkidle0' }), h.click('.page .play')]);
      const played = await h.waitForFunction(() => location.hash === '#/wumpus/play' && document.querySelector('.player-host canvas, .player-host .fg-term-page'), { timeout: 10000 }).then(() => true, () => false);
      check(played && h.url() === `http://${site}/#/wumpus/play`, `hosts: Play starts the game at the site (${h.url()})`);
      check(await h.evaluate(() => crossOriginIsolated), 'hosts: the site where it plays is cross-origin isolated');
      await Promise.all([h.waitForNavigation({ waitUntil: 'networkidle0' }), h.click('.player-bar .bar-button')]);
      check(h.url() === at('wumpus'), `hosts: Back leads to the game's page at its host (${h.url()})`);

      // a report from the game's page at its own host reaches the operator
      await h.waitForSelector('.feedback summary');
      await h.click('.feedback summary');
      const report = `e2e from the game's host ${Date.now()}`;
      await h.type('.feedback textarea', report);
      await h.click('.feedback-send');
      const sent = await h.waitForFunction(() => /Thank you/.test(document.querySelector('.feedback-status')?.textContent ?? ''), { timeout: 10000 }).then(() => true, () => false);
      check(sent, "hosts: the game's page at its own host takes a report");

      // the old addresses
      await h.goto(`http://${site}/#/wumpus`, { waitUntil: 'networkidle0' });
      await h.waitForFunction((u) => location.href === u, { timeout: 5000 }, at('wumpus')).catch(() => {});
      check(h.url() === at('wumpus'), `hosts: the old freegames.stream/#/wumpus leads to the game's host (${h.url()})`);
      await h.goto(`http://${site}/wumpus/`, { waitUntil: 'networkidle0' });
      check(h.url() === at('wumpus'), `hosts: the old freegames.stream/wumpus/ is redirected there (${h.url()})`);
      const local = await fetch(`${base}wumpus/`, { redirect: 'manual' }).catch(() => null);
      check(local?.status === 200, 'hosts: at another name (localhost) /wumpus/ stays a page of its own');
      await h.goto(`http://${site}/#/example`, { waitUntil: 'networkidle0' });
      check(h.url() === `http://${site}/#/example` && !!(await h.$('.page .play')), 'hosts: an unlisted game keeps its page inside the site');
      await h.goto(`${at('wumpus')}impressum.html`, { waitUntil: 'networkidle0' });
      check(h.url() === `http://${site}/impressum.html`, `hosts: the legal pages have one address, at the site (${h.url()})`);
      const robots = await h.goto(`${at('wumpus')}robots.txt`).then((r) => r.text());
      check(robots.includes('Sitemap: https://freegames.stream/sitemap.xml'), "hosts: a game's host names the site's sitemap in its robots.txt");

      // which pages may use the server: the site's, its games' hosts (at the site's host or their own), no others
      await h.goto(at('wumpus'), { waitUntil: 'networkidle0' });
      const probe = (p, urls) => p.evaluate((list) => Promise.all(list.map((u) => new Promise((res) => {
        const ws = new WebSocket(u);
        const t = setTimeout(() => res('timeout'), 5000);
        ws.onopen = () => { clearTimeout(t); ws.close(); res('open'); };
        ws.onerror = () => { clearTimeout(t); res('refused'); };
      }))), urls);
      const fromGame = await probe(h, [`ws://${site}/ws`, `ws://wumpus.${site}/ws`, `ws://ballerburg.${site}/ws`]);
      check(JSON.stringify(fromGame) === '["open","open","refused"]', `hosts: a game's page connects to the site's server and to its own host, not to another game's (${fromGame})`);
      const stats = await h.evaluate((u) => fetch(u).then((r) => r.ok, () => 'refused'), `http://${site}/stats`);
      check(stats === true, "hosts: a game's page may read the site's /stats");
      const evil = await hb.newPage();
      await evil.goto(`http://evil.example:${port}/robots.txt`);
      const fromEvil = await probe(evil, [`ws://${site}/ws`, `ws://wumpus.${site}/ws`]);
      const evilStats = await evil.evaluate((u) => fetch(u).then((r) => r.ok, () => 'refused'), `http://${site}/stats`);
      check(JSON.stringify(fromEvil) === '["refused","refused"]' && evilStats === 'refused', `hosts: another site's page gets no connection and no /stats (${fromEvil}, ${evilStats})`);
      await evil.close();
      const upgrade = (origin) => new Promise((res) => {
        const req = httpRequest({ host: '127.0.0.1', port, path: '/ws', agent: false, headers: { Host: site, Origin: origin, Upgrade: 'websocket', Connection: 'Upgrade', 'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==', 'Sec-WebSocket-Version': '13' } });
        req.on('response', (r) => { res(r.statusCode); r.resume(); });
        req.on('upgrade', (r, sock) => { res(r.statusCode); sock.destroy(); });
        req.on('error', () => res('error'));
        req.end();
      });
      const codes = [await upgrade(`http://wumpus.${site}`), await upgrade('https://evil.example'), await upgrade(`http://wumpus.freegames.stream.evil.example:${port}`)];
      check(JSON.stringify(codes) === '[101,403,403]', `hosts: the WebSocket handshake: 101 for a game's host, 403 for foreign origins (${codes})`);
      const ask = async (d) => (await fetch(`${base}tls-ask?domain=${d}`)).status;
      check(await ask('wumpus.freegames.stream') === 200 && await ask('nosuch.freegames.stream') === 404 && await ask('freegames.stream.evil.example') === 404,
        "hosts: certificates on demand only for the games' hosts (/tls-ask)");
    } finally {
      await hb.close();
    }
  }

  // ---- a broken game says so; every game's page takes a report, which only the operator reads
  {
    const fctx = await browser.createBrowserContext();
    const f = await fctx.newPage();
    const brokenIds = listed.filter((id) => JSON.parse(readFileSync(join(web, 'games', id, 'game.json'), 'utf8')).broken);
    if (brokenIds.length) {
      const id = brokenIds[0];
      await f.goto(base, { waitUntil: 'networkidle0' });
      const badge = await f.$eval(`a.card[href="#/${id}"]`, (a) => !!a.querySelector('.badge-broken')).catch(() => false);
      await f.goto(`${base}#/${id}`, { waitUntil: 'networkidle0' });
      const page = await f.evaluate(() => ({ note: !!document.querySelector('.broken-note'), off: document.querySelector('.page .play')?.disabled, again: !!document.querySelector('.try-anyway') }));
      check(badge && page.note && page.off && page.again, `broken: ${id} is marked on its card and its page, Play only on "Try anyway"`);
    }
    await f.goto(`${base}#/wumpus`, { waitUntil: 'networkidle0' });
    await f.click('.feedback summary');
    const text = `e2e report ${Date.now()}`;
    await f.select('.feedback select', 'idea');
    await f.type('.feedback textarea', text);
    await f.type('.feedback input[name="contact"]', 'e2e@example.org');
    await f.click('.feedback-send');
    const thanked = await f.waitForFunction(() => /Thank you/.test(document.querySelector('.feedback-status')?.textContent ?? ''), { timeout: 10000 }).then(() => true, () => false);
    const list = await (await fetch(`${base}admin/feedback.json`, { headers: { Authorization: `Basic ${Buffer.from(`admin:${ADMIN}`).toString('base64')}` } })).json().catch(() => []);
    const mine = list.find((r) => r.text === text);
    check(thanked && mine?.game === 'wumpus' && mine.kind === 'idea' && mine.contact === 'e2e@example.org' && /^dev|^release-/.test(mine.release),
      `feedback: a game page sends a report, and the operator reads it (${mine ? `${mine.kind}, ${mine.browser}` : 'not found'})`);
    check((await fetch(`${base}admin/feedback.json`)).status === 401, 'feedback: the reports only behind the password');
    await fctx.close();
  }

  // ---- the download before a game starts: its size on the page, then progress (amount, percent, time left)
  {
    const dl = await (await fetch(`${base}downloads.json`)).json();
    const playableIds = listed.filter((d) => existsSync(join(web, 'games', d, 'src', 'index.ts')));
    const missing = playableIds.filter((id) => !(dl[id]?.bytes > 0));
    check(missing.length === 0 && dl.frozenbubble.files.some(([f]) => /fb-data-.*\.bin$/.test(f)),
      `downloads: every game's start-up files are listed${missing.length ? ` (missing ${missing.join(', ')})` : ''} (Frozen Bubble ${(dl.frozenbubble.bytes / 1e6).toFixed(1)} MB)`);
    const dctx = await browser.createBrowserContext();
    const dp = await dctx.newPage();
    // a slow line, so that the progress shows: 20 Mbit/s
    const cdp = await dp.createCDPSession();
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 20, downloadThroughput: 2.5e6, uploadThroughput: 1e6 });
    await dp.goto(`${base}#/frozenbubble`, { waitUntil: 'networkidle0' });
    const fact = await dp.waitForFunction(() => [...document.querySelectorAll('.facts dd')].map((d) => d.textContent).find((t) => /MB for the first start/.test(t ?? '')), { timeout: 5000 }).then((h) => h.jsonValue(), () => null);
    check(!!fact, `downloads: the game page says how much Play downloads (${fact})`);
    await dp.click('.page .play');
    const seen = await dp.waitForFunction(() => document.querySelector('.player-loading-text')?.textContent, { timeout: 10000 }).then(() => true, () => false);
    await new Promise((r) => setTimeout(r, 2500));
    const text = await dp.$eval('.player-loading-text', (e) => e.textContent).catch(() => '');
    check(seen && /^[\d.]+ of [\d.]+ MB \(\d+ %\) · about .* left$/.test(text), `downloads: the player shows amount, percent and time left (${text})`);
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    const started = await dp.waitForFunction(() => !document.querySelector('.player-loading') && document.querySelector('.player-host canvas'), { timeout: 60000 }).then(() => true, () => false);
    check(started, 'downloads: after the download the game starts');
    await dctx.close();
  }

  // ---- HyperRogue online (web/games/hyperrogue/ONLINE.md): two browsers play the turn-based multiplayer mode in
  // lockstep through the lobby, with the game's own keys; their games stay equal round by round (the hash of each
  // round's state); a reloaded page rejoins and replays the game; a player who leaves is out for the other
  if (listed.includes('hyperrogue')) {
    const hctx = [await browser.createBrowserContext(), await browser.createBrowserContext()];
    const [ha, hb] = await Promise.all(hctx.map((c) => c.newPage()));
    const herr = [];
    for (const p of [ha, hb]) {
      await p.setViewport({ width: 1000, height: 720 });
      p.on('pageerror', (e) => herr.push(e.message));
    }
    const info = (p) => p.evaluate(() => window.__hyperrogue_online?.info() ?? null);
    const hbutton = (p, text) => p.evaluateHandle((t) => [...document.querySelectorAll('button')].find((x) => x.textContent === t), text);
    /** Play, then the start menu's "online multiplayer" (n) and the online menu's "find or create a room" (n) */
    const toLobby = async (p, play = true) => {
      if (play) {
        await p.goto(`${base}#/hyperrogue`, { waitUntil: 'networkidle0' });
        await p.click('.page .play');
      }
      await p.waitForFunction(() => !!window.__hyperrogue_online && !!document.querySelector('.player-host canvas'), { timeout: 30000 });
      await wait(1500);
      for (let i = 0; i < 2 && !(await p.$('.fg-lobby')); i++) {
        await p.keyboard.press('n');
        await wait(400);
      }
      await p.waitForSelector('.fg-lobby', { timeout: 8000 });
    };
    /** both press `key` (a move with the game's controls) and wait until round `r` is applied in both */
    const hround = async (keys, r) => {
      for (const [p, k] of keys) await p.keyboard.press(k);
      for (const [p] of keys) await p.waitForFunction((r) => (window.__hyperrogue_online?.info()?.round ?? -1) >= r, { timeout: 8000 }, r);
    };
    try {
      await toLobby(ha);
      await ha.$eval('.fg-lobby input[placeholder="Your name"]', (e) => { e.value = 'Hypatia'; e.dispatchEvent(new Event('change')); });
      await ha.$eval('.fg-lobby input[placeholder="Room name"]', (e) => { e.value = 'e2e hyperbolic'; e.dispatchEvent(new Event('input')); e.dispatchEvent(new Event('change')); });
      await (await hbutton(ha, 'Create room')).click();
      await ha.waitForFunction(() => document.querySelector('.fg-lobby h2')?.textContent === 'e2e hyperbolic', { timeout: 8000 });
      await toLobby(hb);
      await hb.$eval('.fg-lobby input[placeholder="Your name"]', (e) => { e.value = 'Euclid'; e.dispatchEvent(new Event('change')); });
      await hb.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('e2e hyperbolic')), { timeout: 8000 });
      await (await hbutton(hb, 'Join')).click();
      await hb.waitForFunction(() => document.querySelector('.fg-lobby h2')?.textContent === 'e2e hyperbolic', { timeout: 8000 });
      await (await hbutton(hb, 'Ready')).click();
      await ha.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('ready ✓')), { timeout: 8000 });
      await (await hbutton(ha, 'Start')).click();
      for (const p of [ha, hb]) await p.waitForFunction(() => window.__hyperrogue_online?.info()?.players === 2 && !document.querySelector('.fg-lobby'), { timeout: 15000 });
      const i0 = await info(ha);
      check(i0.round === 0 && i0.you === 0 && (await info(hb)).you === 1, 'hyperrogue online: the lobby started a game of two players');
      // five rounds with the game's keys: wait (s), moves (vi keys l, h, numpad), wait
      const plan = [['s', 's'], ['l', 'h'], ['k', 'j'], ['s', 'l'], ['h', 's']];
      for (let r = 0; r < plan.length; r++) await hround([[ha, plan[r][0]], [hb, plan[r][1]]], r + 1);
      const [a5, b5] = [await info(ha), await info(hb)];
      check(a5.round === 5 && JSON.stringify(a5.log) === JSON.stringify(b5.log) && a5.turn === b5.turn && a5.turn > 0,
        `hyperrogue online: five rounds played by keys, both games equal round by round (turn ${a5.turn}, ${a5.played} played)${a5.round === 5 && JSON.stringify(a5.log) === JSON.stringify(b5.log) ? '' : `: ${JSON.stringify([a5, b5])}`}`);
      await ha.screenshot({ path: join(shots, 'hyperrogue-online.png') });
      // a reload: the lobby offers the running game back; the page replays it
      // (a page that draws every frame is never network-idle)
      await hb.reload({ waitUntil: 'load' });
      await hb.waitForSelector('.page .play, .player-host', { timeout: 10000 });
      if (await hb.$('.page .play')) await hb.click('.page .play');
      await toLobby(hb, false);
      await hb.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('(your game)')), { timeout: 8000 });
      await (await hbutton(hb, 'Rejoin')).click();
      await hb.waitForFunction(() => (window.__hyperrogue_online?.info()?.round ?? -1) >= 5, { timeout: 15000 });
      {
        const [ra, rb] = [await info(ha), await info(hb)];
        check(JSON.stringify(rb.log) === JSON.stringify(ra.log), `hyperrogue online: a reloaded page rejoins and replays the game, equal${JSON.stringify(rb.log) === JSON.stringify(ra.log) ? '' : `: ${JSON.stringify([ra, rb])}`}`);
      }
      await hround([[ha, 's'], [hb, 's']], 6);
      check(JSON.stringify((await info(hb)).log) === JSON.stringify((await info(ha)).log), 'hyperrogue online: and plays on, equal');
      // the first player leaves: the other plays on alone
      await (await hbutton(ha, 'Leave')).click();
      await hb.waitForFunction(() => (window.__hyperrogue_online?.info()?.left ?? []).length === 1, { timeout: 8000 });
      await hround([[hb, 's']], 7);
      check((await info(hb)).round === 7 && (await info(ha)) === null, 'hyperrogue online: a player who leaves is out, the other plays on');
      check(herr.length === 0, `hyperrogue online: no page errors${herr.length ? ` (${herr.join('; ')})` : ''}`);
    } catch (e) {
      check(false, `hyperrogue online: ${e.message}`);
    } finally {
      for (const c of hctx) await c.close();
    }
    // three players: a room of three seats, three rounds by keys
    const tctx = [await browser.createBrowserContext(), await browser.createBrowserContext(), await browser.createBrowserContext()];
    try {
      const ps = await Promise.all(tctx.map((c) => c.newPage()));
      for (const p of ps) { await p.setViewport({ width: 900, height: 640 }); p.on('pageerror', (e) => herr.push(e.message)); }
      const [p0, ...rest] = ps;
      await toLobby(p0);
      await p0.$eval('.fg-lobby input[placeholder="Room name"]', (e) => { e.value = 'e2e three'; e.dispatchEvent(new Event('input')); e.dispatchEvent(new Event('change')); });
      await p0.select('.fg-lobby select', '3');
      await (await hbutton(p0, 'Create room')).click();
      await p0.waitForFunction(() => document.querySelector('.fg-lobby h2')?.textContent === 'e2e three', { timeout: 8000 });
      for (const [i, p] of rest.entries()) {
        await toLobby(p);
        await p.waitForFunction(() => [...document.querySelectorAll('.fg-lobby li')].some((li) => li.textContent.includes('e2e three')), { timeout: 8000 });
        await (await hbutton(p, 'Join')).click();
        await p.waitForFunction(() => document.querySelector('.fg-lobby h2')?.textContent === 'e2e three', { timeout: 8000 });
        await (await hbutton(p, 'Ready')).click();
        await p0.waitForFunction((n) => [...document.querySelectorAll('.fg-lobby li')].filter((li) => li.textContent.includes('ready ✓')).length >= n, { timeout: 8000 }, i + 1);
      }
      await (await hbutton(p0, 'Start')).click();
      for (const p of ps) await p.waitForFunction(() => window.__hyperrogue_online?.info()?.players === 3 && !document.querySelector('.fg-lobby'), { timeout: 15000 });
      const plan = [['s', 's', 's'], ['l', 'h', 's'], ['s', 's', 's']];
      for (let r = 0; r < plan.length; r++) await hround(ps.map((p, i) => [p, plan[r][i]]), r + 1);
      const is = await Promise.all(ps.map(info));
      check(is[0].turn > 0 && is.every((x) => x.round === 3 && x.players === 3 && JSON.stringify(x.log) === JSON.stringify(is[0].log)),
        `hyperrogue online: three players, three rounds by keys, all games equal (turn ${is[0].turn})${is.every((x) => JSON.stringify(x.log) === JSON.stringify(is[0].log)) ? '' : `: ${JSON.stringify(is)}`}`);
      check(herr.length === 0, `hyperrogue online (three): no page errors${herr.length ? ` (${herr.join('; ')})` : ''}`);
    } catch (e) {
      check(false, `hyperrogue online (three): ${e.message}`);
    } finally {
      for (const c of tctx) await c.close();
    }
  }

  // ---- every playable game: Play from its page, it draws, takes keys, Back stops it
  const playable = listed.filter((d) => existsSync(join(web, 'games', d, 'src', 'index.ts')));
  for (const id of playable) {
    const ctx = await browser.createBrowserContext();
    const g = await ctx.newPage();
    await g.setViewport({ width: 1024, height: 768 });
    const errors = [];
    g.on('pageerror', (e) => errors.push(e.message));
    await g.goto(`${base}#/${id}`, { waitUntil: 'networkidle0' });
    // a game marked broken plays on its deliberate second button
    await g.click((await g.$('.page .try-anyway')) ? '.page .try-anyway' : '.page .play');
    const drew = await g.waitForFunction(() => {
      const host = document.querySelector('.player-host');
      // a game that opens in the lobby (Netrek: its client connects only once a round starts) shows .fg-lobby;
      // a DOM game (2048) shows .game-root
      const el = host?.querySelector('canvas, .fg-term-page, .fg-lobby, .game-root');
      return !!el && el.getBoundingClientRect().width > 100;
    }, { timeout: 5000 }).then(() => true, () => false);
    for (const k of ['Space', 'ArrowRight', 'ArrowUp', 'Enter', 'y', 'Enter']) {
      await g.keyboard.press(k);
      await wait(80);
    }
    await wait(500);
    const stillPlaying = await g.evaluate(() => !!document.querySelector('.player-host'));
    if (stillPlaying) await g.click('.bar-button');
    // stopped (a game may take a moment, e.g. for its last save), and still on the game's page
    await g.waitForFunction(() => window.__freegames?.stats.running === 0, { timeout: 5000 }).catch(() => {});
    await wait(300);
    const running = await g.evaluate(() => window.__freegames?.stats.running ?? 'gone');
    const page = g.url().endsWith(`#/${id}`) && !!(await g.$('.page .play'));
    check(drew && errors.length === 0 && running === 0 && page, `${id}: starts and draws, takes keys, Back stops it${errors.length ? ` (errors: ${errors.join('; ')})` : ''}${running ? ` (running ${running})` : ''}${page ? '' : ` (left the game page: ${g.url()})`}`);
    await ctx.close();
  }
} finally {
  await browser.close();
  server.kill();
}
console.log(failed ? 'e2e FAILED' : 'e2e passed');
process.exit(failed ? 1 : 0);
