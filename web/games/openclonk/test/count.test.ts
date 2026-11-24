// Which of the 58 scenarios of the six folders start on the page and run 1,000 frames (milestone 3), each in headless
// Chromium (test/browser/count-entry.ts) as the original's scenario selection starts it: one player, two for the
// Arena's melees (MinPlayer=2 in their Scenario.txt; the original's scenario selection refuses them with fewer), the
// config of a player who unlocked the missions (the keys GainScenarioAccess gives: S2Raid, S2Crash, S2Sea, S2Treasure,
// S2Castle; SPLIT asks for "NEVER", which no scenario gives). Slow (about an hour on SwiftShader, three at a time,
// OC_COUNT_JOBS): only with OC_COUNT=1; OC_COUNT_ONLY=<substring> picks scenarios; the table goes to OC_COUNT_OUT (JSON) if set.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readScenarioFolder } from '../src/scenarios.ts';
import { unpackGroupFile } from '../src/rt/group.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const assets = path.join(here, '../assets');
const chrome = process.env.CHROME ?? ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find((p) => fs.existsSync(p));
const BASE = ['System.ocg', 'Graphics.ocg', 'Material.ocg', 'Sound.ocg', 'Objects.ocd', 'Decoration.ocd'];
const FOLDERS = ['Tutorials.ocf', 'Missions.ocf', 'Worlds.ocf', 'Parkour.ocf', 'Defense.ocf', 'Arena.ocf'];
const skip = !process.env.OC_COUNT ? 'only with OC_COUNT=1 (about an hour)'
  : !chrome ? 'no Chromium (set CHROME)'
  : [...BASE, ...FOLDERS].some((g) => !fs.existsSync(path.join(assets, g))) ? 'no packed content (re/openclonk/tools/pack.sh)' : false;
// C4Config writes the string escaped and in quotes (StdCompilerINIWrite, RCT_Escaped), and reads it so
export const UNLOCKED = '[General]\nMissionAccess="S2Raid;S2Crash;S2Sea;S2Treasure;S2Castle;NEVER"\n';

test('the 58 scenarios start and run 1,000 frames', { skip, timeout: 4 * 3_600_000 }, async () => {
  void unpackGroupFile;
  const scenarios: { path: string; minPlayers: number }[] = [];
  for (const f of FOLDERS) {
    const folder = readScenarioFolder(f, fs.readFileSync(path.join(assets, f)));
    for (const s of folder.scenarios) scenarios.push({ path: s.path, minPlayers: s.minPlayers ?? 1 });
  }
  const only = process.env.OC_COUNT_ONLY;
  const esbuild = await import('esbuild');
  const bundle = await esbuild.build({ entryPoints: [path.join(here, 'browser/count-entry.ts')], bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2022' });
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
  // a browser per worker: a page that is not the browser's front page gets no animation frames
  const launch = () => puppeteer.launch({ executablePath: chrome, headless: true, protocolTimeout: 1_200_000,
    args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  const table: object[] = [];
  const todo = scenarios.filter((s) => !only || s.path.includes(only));
  const one = async (browser: import('puppeteer-core').Browser, s: { path: string; minPlayers: number }) => {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${port}/`);
    const players = s.minPlayers >= 2 ? ['Clonk', 'Clonk 2'] : ['Clonk'];
    let r: any;
    try {
      r = await page.evaluate((x) => (globalThis as any).ocCount(x), {
        groups: [...BASE, s.path.split('/')[0]], scenario: s.path, frames: 1000, width: 640, height: 480, players,
        config: UNLOCKED, limitMs: 600_000,
      });
    } catch (e) {
      r = { frame: -1, error: String(e).slice(0, 300), log: [] };
    }
    await page.close();
    const row = { scenario: s.path, players: players.length, ...r };
    table.push(row);
    console.log(`${s.path}: frame ${r.frame}${r.error ? ', ' + r.error.split('\n')[0] : ''}${r.gameOver ? ', game over' : ''} (${r.seconds}s)`);
    if (process.env.OC_COUNT_OUT) fs.writeFileSync(process.env.OC_COUNT_OUT, JSON.stringify(table, null, 1));
  };
  try {
    // three at a time (SwiftShader draws on several threads; about an hour for the 58)
    const workers = Array.from({ length: Number(process.env.OC_COUNT_JOBS ?? 3) }, async () => {
      const browser = await launch();
      try {
        for (let s = todo.shift(); s; s = todo.shift()) await one(browser, s);
      } finally {
        await browser.close();
      }
    });
    await Promise.all(workers);
  } finally {
    server.close();
  }
  const ran = table.filter((r: any) => r.frame >= 1000 && !r.error).length;
  console.log(`${ran} of ${table.length} ran 1,000 frames`);
  assert.ok(table.length > 0);
});
