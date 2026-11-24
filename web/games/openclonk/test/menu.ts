// The start menu's tests in headless Chromium (menu.test.ts, savegame.test.ts): a browser with test/browser/menu-entry.ts,
// the original's application started as the page starts it, and helpers that drive the original's GUI with the page's
// mouse and keys.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NONCOMMERCIAL_PATHS } from '../src/settings.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const assets = path.join(here, '../assets');
// the four non-commercial files are not part of the shipped assets (NONCOMMERCIAL_FILES=false); pack.sh keeps them
// beside the packed groups, and the tests that run the setting on take them from there
const noncommercial = path.join(here, '../../../../re/openclonk/work/pack/noncommercial');
const chrome = process.env.CHROME ?? ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'].find((p) => fs.existsSync(p));
export const GROUPS = ['System.ocg', 'Graphics.ocg', 'Material.ocg', 'Sound.ocg', 'Objects.ocd', 'Decoration.ocd',
  'Tutorials.ocf', 'Missions.ocf', 'Worlds.ocf', 'Parkour.ocf', 'Defense.ocf', 'Arena.ocf'];
export const skip = !chrome ? 'no Chromium (set CHROME)'
  : GROUPS.some((g) => !fs.existsSync(path.join(assets, g))) ? 'no packed content (re/openclonk/tools/pack.sh --out web/games/openclonk/assets)'
  : !fs.existsSync(noncommercial) ? 'no non-commercial files (re/openclonk/tools/pack.sh keeps them in work/pack/noncommercial)'
  : false;
const WIDTH = 1024, HEIGHT = 768;

type Page = import('puppeteer-core').Page;
export interface State {
  dialog: string; dialogs: string[]; modal: number; appState: number; frame: number; players: string[]; quit: boolean;
  error: string; log: string[]; participants: string; missionAccess: string; paper: { w: number; h: number } | null;
  storage: Record<string, number>;
}

/** a browser with the menu entry; each run gets a page */
export async function withBrowser(fn: (open: () => Promise<Page>) => Promise<void>): Promise<void> {
  const esbuild = await import('esbuild');
  const bundle = await esbuild.build({ entryPoints: [path.join(here, 'browser/menu-entry.ts')], bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2022' });
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
  const browser = await puppeteer.launch({ executablePath: chrome, headless: true, protocolTimeout: 1_800_000,
    args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  try {
    await fn(async () => {
      const page = await browser.newPage();
      page.on('pageerror', (e) => console.log('page error:', (e as Error).message));
      await page.setViewport({ width: WIDTH, height: HEIGHT });
      await page.goto(`http://localhost:${port}/`);
      return page;
    });
  } finally {
    await browser.close();
    server.close();
  }
}

export const boot = (page: Page, storage: Record<string, number[]>, extra: object = {}, noncommercial = true) =>
  page.evaluate((b) => (globalThis as any).ocMenuBoot(b), {
    groups: GROUPS, width: WIDTH, height: HEIGHT, noncommercial, files: noncommercial ? [...NONCOMMERCIAL_PATHS] : [], storage, ...extra,
  }) as Promise<{ loaded: string[]; error: string }>;
export const run = (page: Page, frames: number, until?: string) =>
  page.evaluate((n, u) => (globalThis as any).ocMenuRun(n, u), frames, until) as Promise<State>;
export const find = (page: Page, what: object) =>
  page.evaluate((w) => (globalThis as any).ocMenuFind(w), what) as Promise<{ cls: string; at: [number, number] } | null>;
export const click = (page: Page, at: [number, number], double = false) =>
  page.evaluate((x, y, d) => (globalThis as any).ocMenuClick(x, y, d), at[0], at[1], double);
export const key = (page: Page, code: string, k: string) => page.evaluate((c, kk) => (globalThis as any).ocMenuKey(c, kk), code, k);
export const type = (page: Page, text: string) => page.evaluate((t) => (globalThis as any).ocMenuType(t), text);
export const evalIn = (page: Page, src: string) => page.evaluate((s) => (globalThis as any).ocMenuEval(s), src);
export const storageOf = (page: Page) => page.evaluate(() => (globalThis as any).ocMenuStorage()) as Promise<Record<string, number[]>>;
export const ok = (s: State, what: string) => assert.equal(s.error, '', `${what}: the engine stopped:\n${s.error}\n${s.log.slice(-12).join('\n')}`);

/** clicks a button found by its callback (the original's own method name) and runs a few frames */
export async function press(page: Page, callback: string, frames = 20): Promise<State> {
  const b = await find(page, { callback });
  assert.ok(b, `the button ${callback} is on the screen`);
  await click(page, b!.at);
  return run(page, frames);
}

