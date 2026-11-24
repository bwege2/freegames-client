// The picture against the original's (milestone 2): the original's full game replays a record on a virtual X display
// with Mesa's software OpenGL and is stopped after it drew a frame (re/openclonk/oracle/screenshot.sh: Xvfb, gdb in
// C4FullScreen::Execute, the X screen saved); the port replays the same record in headless Chromium (WebGL2 on
// SwiftShader) through the page's own code (src/app.ts) and its canvas is read after it drew the same frame. A record
// fixes the scenario, the seed, the players and their control, so both show the same game at that frame. The two
// pictures are compared pixel by pixel with a tolerance: the renderers differ (Mesa llvmpipe and SwiftShader rasterize,
// filter and blend with their own rounding; multisampling), and some of what is drawn is not synchronized (the
// landscape shader's time uniform, unsynchronized random numbers of particles). The comparison and both pictures are
// written to re/openclonk/work/shot/. Runs when the original's game (oracle/build-full.sh), nix (Xvfb, Mesa, gdb),
// Chromium and the packed content (tools/pack.sh) are there.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { re } from './oracle.ts';
import { decodePng } from '../src/rt/png.ts';
import { encodePng } from './png.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const assets = path.join(here, '../assets');
const game = path.join(re, 'work/full/openclonk');
const chrome = process.env.CHROME ?? ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find((p) => fs.existsSync(p));
const nix = spawnSync('sh', ['-c', 'command -v nix-shell'], { encoding: 'utf8' }).status === 0;
const GROUPS = ['System.ocg', 'Graphics.ocg', 'Material.ocg', 'Sound.ocg', 'Objects.ocd', 'Decoration.ocd'];
const skip = !fs.existsSync(game) ? 'no full game (re/openclonk/oracle/build-full.sh)'
  : !nix ? 'no nix-shell (Xvfb, Mesa and gdb for the original)'
  : !chrome ? 'no Chromium (set CHROME)'
  : GROUPS.some((g) => !fs.existsSync(path.join(assets, g))) ? 'no packed content (re/openclonk/tools/pack.sh --out web/games/openclonk/assets)'
  : false;

/** Acid Drilling with a local player who walks and jumps (test/input.test.ts wrote it, the original replays it) */
const RECORD = path.join(here, 'data/input-record.ocs');
const FRAME = 300;
const WIDTH = 1024, HEIGHT = 768;
/** the share of pixels whose largest channel difference is below NEAR, and the mean difference, the test requires */
const NEAR = 48, MIN_NEAR_SHARE = 0.8, MAX_MEAN = 16;

function rgbaOf(png: Uint8Array): { width: number; height: number; rgba: Uint8Array } {
  const img = decodePng(png);
  if (!img) throw new Error('not a PNG the test can read');
  return img;
}

test(`the port's picture of a replay at frame ${FRAME} is the original's (within a tolerance)`, { skip, timeout: 900_000 }, async () => {
  const out = path.join(re, 'work/shot');
  fs.mkdirSync(out, { recursive: true });
  // the original
  const original = path.join(out, `original-${FRAME}.png`);
  if (!fs.existsSync(original) || fs.statSync(original).mtimeMs < fs.statSync(RECORD).mtimeMs) {
    const r = spawnSync('bash', [path.join(re, 'oracle/screenshot.sh'), RECORD, String(FRAME), original, `${WIDTH}x${HEIGHT}`], { encoding: 'utf8', timeout: 600_000 });
    assert.equal(r.status, 0, `oracle/screenshot.sh: ${r.stderr}`);
  }
  // the port
  const esbuild = await import('esbuild');
  const bundle = await esbuild.build({ entryPoints: [path.join(here, 'browser/app-entry.ts')], bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2022' });
  const server = http.createServer((req, res) => {
    const u = decodeURIComponent((req.url ?? '/').split('?')[0]);
    if (u === '/') { res.setHeader('content-type', 'text/html'); res.end('<!doctype html><body style="margin:0"><script src="/b.js"></script>'); return; }
    if (u === '/b.js') { res.setHeader('content-type', 'text/javascript'); res.end(bundle.outputFiles[0].text); return; }
    if (u === '/record') { res.end(fs.readFileSync(RECORD)); return; }
    const f = path.join(assets, path.basename(u));
    if (u.startsWith('/assets/') && fs.existsSync(f)) { res.end(fs.readFileSync(f)); return; }
    res.statusCode = 404;
    res.end();
  }).listen(0);
  const port = (server.address() as { port: number }).port;
  const puppeteer = (await import('puppeteer-core')).default;
  const browser = await puppeteer.launch({ executablePath: chrome, headless: true, protocolTimeout: 900_000,
    args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  let port_png: Uint8Array;
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT });
    await page.goto(`http://localhost:${port}/`);
    const r = await page.evaluate((run) => (globalThis as any).ocShot(run), { groups: GROUPS, record: path.basename(RECORD), frame: FRAME, width: WIDTH, height: HEIGHT });
    assert.ok(r.frame >= FRAME, `the port stopped at frame ${r.frame}:\n${r.log.slice(-20).join('\n')}`);
    port_png = Buffer.from(r.png.split(',')[1], 'base64');
  } finally {
    await browser.close();
    server.close();
  }
  fs.writeFileSync(path.join(out, `port-${FRAME}.png`), port_png);
  // the comparison
  const a = rgbaOf(fs.readFileSync(original)), b = rgbaOf(port_png);
  assert.deepEqual([b.width, b.height], [a.width, a.height], 'the same size');
  const n = a.width * a.height;
  const diff = new Uint32Array(n);
  let near = 0, sum = 0;
  for (let i = 0; i < n; i++) {
    let d = 0;
    for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(a.rgba[i * 4 + c] - b.rgba[i * 4 + c]));
    sum += d;
    if (d < NEAR) near++;
    diff[i] = (0xff000000 | (d << 16) | (d << 8) | d) >>> 0;
  }
  fs.writeFileSync(path.join(out, `diff-${FRAME}.png`), encodePng(a.width, a.height, diff));
  const share = near / n, mean = sum / n;
  fs.writeFileSync(path.join(out, `compare-${FRAME}.json`), JSON.stringify({ frame: FRAME, nearShare: share, mean, near: NEAR }, null, 1));
  assert.ok(share >= MIN_NEAR_SHARE && mean <= MAX_MEAN,
    `pixels within ${NEAR}: ${(share * 100).toFixed(1)} % (at least ${MIN_NEAR_SHARE * 100} %), mean difference ${mean.toFixed(1)} (at most ${MAX_MEAN})`);
});
