// The port's screenshots of the scenes of re/teeworlds/golden/render/scene.json (the original client's), taken
// the same way: a 1280x720 window, the player "tee" with the default skin, alone on a server with the scene's
// settings, <wait> seconds after entering the game; then compared with re/teeworlds/oracle/render/compare.mjs.
// Needs `npm run build` and the server jar.
//   node games/teeworlds/render.mjs <out dir> [scene ...]      (default: dm1-spawn ctf1-spawn)
import puppeteer from 'puppeteer-core';
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const re = join(web, '..', 're', 'teeworlds');
const jar = join(web, '..', 'server', 'target', 'freegames-server.jar');
const chrome = process.env.CHROME ?? ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(existsSync);
const [out, ...names] = process.argv.slice(2);
if (!out) throw new Error('usage: node games/teeworlds/render.mjs <out dir> [scene ...]');
mkdirSync(out, { recursive: true });
const scenes = JSON.parse(readFileSync(join(re, 'golden', 'render', 'scene.json'), 'utf8')).scenes;
const todo = names.length ? names : ['dm1-spawn', 'ctf1-spawn'];

const port = await new Promise((resolve) => {
  const s = createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); });
});
const java = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', 'java') : 'java';
const server = spawn(java, ['-jar', jar], {
  env: { ...process.env, PORT: String(port), WEB_ROOT: join(web, 'dist'), DATA_DIR: mkdtempSync(join(tmpdir(), 'fg-teeworlds-render-')) },
  stdio: ['ignore', 'ignore', 'inherit'],
});
const base = `http://localhost:${port}/`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let browser, failed = false;
try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(base)).ok) break; } catch { /* starting */ }
    if (i > 150) throw new Error('server did not start');
    await wait(100);
  }
  browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const name of todo) {
    const sc = scenes[name];
    const p = await (await browser.createBrowserContext()).newPage();
    p.on('pageerror', (e) => { console.log(`${name}: page error: ${e.message}`); failed = true; });
    // the site's bar is 36 px high: the game's area is then 1280x720
    await p.setViewport({ width: 1280, height: 756, deviceScaleFactor: 1 });
    await p.goto(base, { waitUntil: 'networkidle0' });
    await p.evaluate(() => localStorage.setItem('freegames-name', 'tee'));
    await p.goto(`${base}#/teeworlds/play`, { waitUntil: 'networkidle0' });
    await p.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => b.textContent === 'Create room'), { timeout: 30000 });
    // the scene's server settings in the options panel
    await p.evaluate((sc) => {
      const set = (label, value) => {
        for (const l of document.querySelectorAll('label')) {
          if (l.firstChild?.textContent !== label) continue;
          const i = l.querySelector('select, input');
          if (i.type === 'checkbox') i.checked = value === '1'; else i.value = value;
          i.dispatchEvent(new Event('change'));
        }
      };
      set('Game type', sc.gametype);
      set('Map', sc.map);
      set('Warmup (seconds)', '0');
    }, sc);
    for (const b of await p.$$('button')) if ((await b.evaluate((e) => e.textContent)) === 'Create room') { await b.click(); break; }
    await p.waitForFunction(() => [...document.querySelectorAll('button')].some((b) => b.textContent === 'Start'), { timeout: 10000 });
    for (const b of await p.$$('button')) if ((await b.evaluate((e) => e.textContent)) === 'Start') { await b.click(); break; }
    await p.waitForFunction(() => { const s = window.__teeworlds?.snapshot(); return s && s.state === 3 && s.localId >= 0; }, { timeout: 30000 });
    await wait(sc.wait * 1000);
    const r = await p.evaluate(() => { const c = document.querySelector('canvas'); const b = c.getBoundingClientRect(); return { x: b.x, y: b.y, w: c.width, h: c.height }; });
    const file = join(out, `${name}.png`);
    await p.screenshot({ path: file, clip: { x: r.x, y: r.y, width: r.w, height: r.h } });
    const res = execFileSync('node', [join(re, 'oracle', 'render', 'compare.mjs'), join(re, 'golden', 'render', `${name}.png`), file, join(out, `${name}-side.png`)], { encoding: 'utf8' }).trim();
    console.log(`${name} (${r.w}x${r.h}): ${res}`);
    await p.close();
  }
} catch (e) {
  console.log('FAIL', e);
  failed = true;
} finally {
  await browser?.close();
  server.kill();
}
process.exit(failed ? 1 : 0);
