// Playing on the page (milestone 2): the original's application (src/app.ts) in headless Chromium runs a scenario
// with a player as the page starts it (test/browser/play-entry.ts), and the test plays it through the page's events.
//
// * Controls: Tutorial01 opens with the guide's message and the player's controls switched off (its Script.c:
//   DisablePlrControls until the intro is through). Three clicks on the script GUI's "Next message" button finish the
//   intro (C4ScriptGuiWindow's OnClick through C4GUI::MouseMove), then D held walks the clonk to the right
//   (Game.DoKeyboardInput, the default control set's CON_Right, C4ControlPlayerControl, the clonk's script).
// * Sound: Shiver Peak plays the wind loop from its Initialize (Sound("Environment::WindLoop", true, 40, nil, +1)) and
//   the music system plays the content's music: through rt/al.ts on the page's AudioContext the game's output is not
//   silent. With NONCOMMERCIAL_FILES off the scenario runs the same without the wind sound, which is then missing
//   from the sound system as the original misses a file it does not find.
// Chromium as web/scripts/e2e.mjs finds it, or $CHROME; the packed content (re/openclonk/tools/pack.sh).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NONCOMMERCIAL_PATHS } from '../src/settings.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const assets = path.join(here, '../assets');
// the four non-commercial files are not in the shipped assets (NONCOMMERCIAL_FILES=false); the setting-on run takes them
// from beside the packed groups, where pack.sh keeps them
const noncommercial = path.join(here, '../../../../re/openclonk/work/pack/noncommercial');
const chrome = process.env.CHROME ?? ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find((p) => fs.existsSync(p));
const BASE = ['System.ocg', 'Graphics.ocg', 'Material.ocg', 'Sound.ocg', 'Objects.ocd', 'Decoration.ocd'];
const need = [...BASE, 'Tutorials.ocf', 'Parkour.ocf', 'Music.ocg'];
const skip = !chrome ? 'no Chromium (set CHROME)'
  : need.some((g) => !fs.existsSync(path.join(assets, g))) ? 'no packed content (re/openclonk/tools/pack.sh --out web/games/openclonk/assets)'
  : !fs.existsSync(noncommercial) ? 'no non-commercial files (re/openclonk/tools/pack.sh keeps them in work/pack/noncommercial)'
  : false;
const WIDTH = 1024, HEIGHT = 768;

interface Result {
  log: string[]; frame: number; error: string; cursor: { frame: number; x: number; y: number }[];
  audio: { blocks: number; loud: number; peak: number } | null; sounds: { name: string; instances: number }[]; music: string;
}

async function play(runs: object[]): Promise<Result[]> {
  const esbuild = await import('esbuild');
  const bundle = await esbuild.build({ entryPoints: [path.join(here, 'browser/play-entry.ts')], bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2022' });
  const server = http.createServer((req, res) => {
    const u = decodeURIComponent((req.url ?? '/').split('?')[0]);
    if (u === '/') { res.setHeader('content-type', 'text/html'); res.end('<!doctype html><body style="margin:0"><script src="/b.js"></script>'); return; }
    if (u === '/b.js') { res.setHeader('content-type', 'text/javascript'); res.end(bundle.outputFiles[0].text); return; }
    const nc = u.startsWith('/assets/noncommercial/');
    const root = nc ? noncommercial : assets;
    const f = path.join(root, path.normalize(u.replace(nc ? /^\/assets\/noncommercial\// : /^\/assets\//, '')));
    if (u.startsWith('/assets/') && f.startsWith(root) && fs.existsSync(f) && fs.statSync(f).isFile()) { res.end(fs.readFileSync(f)); return; }
    res.statusCode = 404;
    res.end();
  }).listen(0);
  const port = (server.address() as { port: number }).port;
  const puppeteer = (await import('puppeteer-core')).default;
  const browser = await puppeteer.launch({ executablePath: chrome, headless: true, protocolTimeout: 1_200_000,
    args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  try {
    const out: Result[] = [];
    for (const run of runs) {
      const page = await browser.newPage();
      await page.setViewport({ width: WIDTH, height: HEIGHT });
      await page.goto(`http://localhost:${port}/`);
      out.push(await page.evaluate((r) => (globalThis as any).ocPlay(r), { width: WIDTH, height: HEIGHT, ...run }) as Result);
      await page.close();
    }
    return out;
  } finally {
    await browser.close();
    server.close();
  }
}

test('Tutorial01 plays with the original\'s mouse and keys: the guide is clicked through, D walks the clonk', { skip, timeout: 1_200_000 }, async () => {
  // "Next message" of the guide's dialog at 1024x768 (its script GUI window, top right of the dialog)
  const next: [number, number] = [745, 165];
  const [r] = await play([{
    groups: [...BASE, 'Tutorials.ocf'], scenario: 'Tutorials.ocf/Tutorial01.ocs', frames: 330,
    actions: [{ frame: 100, click: next }, { frame: 140, click: next }, { frame: 180, click: next },
      { frame: 220, key: 'KeyD', down: true }, { frame: 300, key: 'KeyD', down: false }],
  }]);
  assert.equal(r.error, '', `the engine stopped:\n${r.error}\n${r.log.slice(-10).join('\n')}`);
  assert.ok(r.frame >= 330, `ran to frame ${r.frame}`);
  const [, , , down, up] = r.cursor;
  assert.equal(down.x, 60, 'the clonk stands where Tutorial01 puts it (60, 606) until the intro is through');
  assert.ok(up.x > down.x + 50, `D walks the clonk to the right: x ${down.x} -> ${up.x}`);
});

test('the original\'s sounds and music come out of the page\'s AudioContext; NONCOMMERCIAL_FILES off runs without the wind', { skip, timeout: 1_200_000 }, async () => {
  const run = { groups: [...BASE, 'Parkour.ocf', 'Music.ocg'], scenario: 'Parkour.ocf/ShiverPeak.ocs', frames: 300, audio: true };
  const [on, off] = await play([
    { ...run, noncommercial: true, files: NONCOMMERCIAL_PATHS },
    { ...run, noncommercial: false, files: [] },
  ]);
  for (const [name, r] of [['on', on], ['off', off]] as const) {
    assert.equal(r.error, '', `NONCOMMERCIAL_FILES ${name}: the engine stopped:\n${r.error}\n${r.log.slice(-10).join('\n')}`);
    assert.ok(r.frame >= 300, `NONCOMMERCIAL_FILES ${name}: ran to frame ${r.frame}`);
    assert.ok(r.audio && r.audio.blocks > 0, `NONCOMMERCIAL_FILES ${name}: the AudioContext rendered (${JSON.stringify(r.audio)})`);
    assert.ok(r.audio!.loud > 0 && r.audio!.peak > 0.01, `NONCOMMERCIAL_FILES ${name}: the game's output is not silent (${JSON.stringify(r.audio)})`);
    assert.ok(r.music, `NONCOMMERCIAL_FILES ${name}: the music system plays a piece`);
  }
  const wind = (r: Result) => r.sounds.find((s) => s.name.replace(/\\/g, '/').endsWith('Environment.ocg/WindLoop.ogg') || /WindLoop/.test(s.name));
  assert.ok(wind(on) && wind(on)!.instances > 0, `on: the wind loop plays (sounds: ${on.sounds.map((s) => s.name).join(', ')})`);
  assert.equal(wind(off), undefined, 'off: there is no wind sound');
});
