// Screenshots of a port for its game page: the built site on the real server, headless Chromium.
//   npm run build && node scripts/screenshots.mjs <id>
// web/games/<id>/screenshots.mjs exports `default async (page, shot) => { ... }`: drive the game with
// puppeteer's `page` and call `await shot('file.png')` (saved to web/games/<id>/screenshots/).
// The viewport is 1024x768 with the site's bar; shots are of the game area only.
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const id = process.argv[2];
if (!id) throw new Error('usage: node scripts/screenshots.mjs <game id>');
const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const steps = join(web, 'games', id, 'screenshots.mjs');
const jar = join(web, '..', 'server', 'target', 'freegames-server.jar');
const chrome = process.env.CHROME ?? ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find(existsSync);
for (const [f, what] of [[steps, 'screenshot steps'], [join(web, 'dist', 'index.html'), 'a build (npm run build)'], [jar, 'the server jar']]) {
  if (!existsSync(f)) throw new Error(`missing ${what}: ${f}`);
}
const out = join(web, 'games', id, 'screenshots');
mkdirSync(out, { recursive: true });

const port = await new Promise((resolve) => {
  const s = createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); });
});
const java = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', 'java') : 'java';
const server = spawn(java, ['-jar', jar], {
  env: { ...process.env, PORT: String(port), WEB_ROOT: join(web, 'dist'), DATA_DIR: mkdtempSync(join(tmpdir(), 'fg-shots-')) },
  stdio: ['ignore', 'ignore', 'inherit'],
});
const base = `http://localhost:${port}/`;
for (let i = 0; ; i++) {
  try { if ((await fetch(base)).ok) break; } catch { /* starting */ }
  if (i > 150) throw new Error('server did not start');
  await new Promise((r) => setTimeout(r, 100));
}
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 804 });
  await page.goto(`${base}#/${id}/play`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.player-host');
  const shot = async (file) => {
    const host = await page.$('.player-host');
    await host.screenshot({ path: join(out, file) });
    console.log(`saved ${join(out, file)}`);
  };
  const run = (await import(pathToFileURL(steps).href)).default;
  await run(page, shot);
} finally {
  await browser.close();
  server.kill();
}
