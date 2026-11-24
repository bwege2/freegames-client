// The original's local multiplayer on the page (milestone 3), in headless Chromium: a parkour (Shiver Peak, which takes
// several players; the Arena's melees start their clonks in relaunch containers) with two players on one computer, as the original's player selection lets them join: one with the keyboard
// and mouse set, one with the gamepad set (System.ocg/PlayerControls.txt has these two). The gamepad is the browser's
// (rt/sdl.ts on the Gamepad API, here a stand-in): its stick walks the second player's clonk, D the first player's.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const assets = path.join(here, '../assets');
const chrome = process.env.CHROME ?? ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find((p) => fs.existsSync(p));
const GROUPS = ['System.ocg', 'Graphics.ocg', 'Material.ocg', 'Sound.ocg', 'Objects.ocd', 'Decoration.ocd', 'Parkour.ocf'];
const skip = !chrome ? 'no Chromium (set CHROME)'
  : GROUPS.some((g) => !fs.existsSync(path.join(assets, g))) ? 'no packed content (re/openclonk/tools/pack.sh)' : false;

test('two players on one computer: keyboard and gamepad, each walks its own clonk', { skip, timeout: 1_200_000 }, async () => {
  const esbuild = await import('esbuild');
  const bundle = await esbuild.build({ entryPoints: [path.join(here, 'browser/multi-entry.ts')], bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2022' });
  const server = http.createServer((req, res) => {
    const u = decodeURIComponent((req.url ?? '/').split('?')[0]);
    if (u === '/') { res.setHeader('content-type', 'text/html'); res.end('<!doctype html><body style="margin:0"><script src="/b.js"></script>'); return; }
    if (u === '/b.js') { res.setHeader('content-type', 'text/javascript'); res.end(bundle.outputFiles[0].text); return; }
    const f = path.join(assets, path.normalize(u.replace(/^\/assets\//, '')));
    if (u.startsWith('/assets/') && f.startsWith(assets) && fs.existsSync(f) && fs.statSync(f).isFile()) { res.end(fs.readFileSync(f)); return; }
    res.statusCode = 404;
    res.end();
  }).listen(0);
  const port = (server.address() as { port: number }).port;
  const puppeteer = (await import('puppeteer-core')).default;
  const browser = await puppeteer.launch({ executablePath: chrome, headless: true, protocolTimeout: 1_200_000,
    args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 768 });
    await page.goto(`http://localhost:${port}/`);
    const r = await page.evaluate((x) => (globalThis as any).ocMulti(x), { groups: GROUPS, scenario: 'Parkour.ocf/ShiverPeak.ocs', width: 1024, height: 768 }) as any;
    assert.equal(r.error, undefined, `${r.error}\n${r.log.slice(-15).join('\n')}`);
    console.log(JSON.stringify({ start: r.start, afterKeys: r.afterKeys, afterPad: r.afterPad }));
    assert.ok(r.log.some((l: string) => /Gamepad #0 connected/.test(l)), `the original found the gamepad:\n${r.log.slice(-30).join('\n')}`);
    assert.ok(!r.log.some((l: string) => /No gamepad available/.test(l)), 'the gamepad player has its gamepad');
    assert.ok(Number.isFinite(r.start.keys) && Number.isFinite(r.start.pad), `both players have a clonk (${JSON.stringify(r.start)})`);
    assert.ok(r.afterKeys.keys > r.start.keys + 10, `D walks the keyboard player's clonk (${r.start.keys} -> ${r.afterKeys.keys})`);
    assert.ok(Math.abs(r.afterKeys.pad - r.start.pad) < 2, `and not the gamepad player's (${r.start.pad} -> ${r.afterKeys.pad})`);
    assert.ok(r.afterPad.pad > r.afterKeys.pad + 10, `the stick walks the gamepad player's clonk (${r.afterKeys.pad} -> ${r.afterPad.pad})`);
    assert.ok(Math.abs(r.afterPad.keys - r.afterKeys.keys) < 2, `and not the keyboard player's (${r.afterKeys.keys} -> ${r.afterPad.keys})`);
  } finally {
    await browser.close();
    server.close();
  }
});
