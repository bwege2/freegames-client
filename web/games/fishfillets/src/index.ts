// Fish Fillets - Next Generation on the website: what game/Application.cpp and the agents of gengine/
// did with SDL. One game cycle every 100 ms (TimerAgent, a quarter of that with Shift held): draw, count
// the cycle, read the input, move the subtitles, update the game. The screen takes the size of the room
// (15 pixels a field) or of the menu picture, as VideoAgent::initVideoMode did. The files the original
// wrote to ~/.fillets-ng (options, saves, solved levels) are in the player's storage on the server.
import { PixelScreen, type StartGame } from '../../../src/sdk/index.ts';
import { Env, type DataFiles } from './engine/env.ts';
import { Level } from './engine/level.ts';
import { MENU_PICTURE_SIZES, WorldMap, type Game, type Gfx } from './engine/menus.ts';
import { rng } from './engine/random.ts';
import { Scripter, argStr } from './engine/script.ts';
import { StateManager, type GameState } from './engine/state.ts';
import { tostr } from './lua/interp.ts';
import { WebSound } from './ui/audio.ts';
import { Framebuffer, type Pic } from './ui/fb.ts';
import { FbPainter } from './ui/painter.ts';
import { decodePng } from './ui/png.ts';
import { TextRenderer } from './ui/text.ts';
import scriptsUrl from '../assets/scripts.json?url';

const DATA = import.meta.glob<string>('../assets/data/**/*', { eager: true, query: '?url', import: 'default' });
const URLS = new Map<string, string>();
for (const [k, v] of Object.entries(DATA)) URLS.set(k.slice('../assets/data/'.length), v);

/** the player's files: one storage file per directory of the original's user dir */
const PACKS: Record<string, string> = { solved: 'solved.pack', saves: 'saves.pack' };

/** e.code / e.key to the names the port uses (SDL keys) */
function keyName(e: KeyboardEvent): string | null {
  if (e.key === '+' || e.key === '-') return e.code.startsWith('Numpad') ? `KP${e.key}` : e.key;
  const c = e.code;
  if (c.startsWith('Key')) return c.slice(3).toLowerCase();
  if (c.startsWith('Digit')) return c.slice(5);
  const map: Record<string, string> = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Space: ' ', Enter: 'Enter', NumpadEnter: 'Enter',
    Escape: 'Escape', Tab: 'Tab', Backspace: 'Backspace', Minus: '-', Equal: '=', NumpadSubtract: 'KP-', NumpadAdd: 'KP+',
  };
  if (map[c]) return map[c];
  if (/^F\d+$/.test(c)) return c;
  return null;
}

export const start: StartGame = async (host, ctx) => {
  const { signal, audio, storage } = ctx;
  const scripts = (await (await fetch(scriptsUrl, { signal })).json()) as Record<string, string>;
  const data: DataFiles = { has: (p) => p in scripts || URLS.has(p), text: (p) => scripts[p] ?? null };

  // the fonts
  const families = { menu: 'ff-menu', subtitle: 'ff-subtitle', console: 'ff-console' } as const;
  await Promise.all(Object.entries(families).map(async ([k, fam]) => {
    try {
      const f = new FontFace(fam, `url(${URLS.get(`font/font_${k}.ttf`)})`);
      await f.load();
      document.fonts.add(f);
    } catch {
      // the browser's fallback font
    }
  }));
  const text = new TextRenderer(families);

  // pictures, decoded on first use
  const pics = new Map<string, Pic | null>();
  const loading = new Map<string, Promise<void>>();
  const loadPic = (path: string): Promise<void> => {
    let p = loading.get(path);
    if (!p) {
      const url = URLS.get(path);
      p = (url ? fetch(url, { signal }).then((r) => r.arrayBuffer()).then((b) => { pics.set(path, decodePng(new Uint8Array(b))); }) : Promise.reject(new Error(path)))
        .catch(() => { pics.set(path, null); });
      loading.set(path, p);
    }
    return p;
  };
  const pic = (path: string): Pic | null => {
    const p = pics.get(path);
    if (p === undefined) void loadPic(path);
    return p ?? null;
  };
  // the menu's pictures first: their sizes lay out the options menu
  const menuPics = [...URLS.keys()].filter((p) => p.startsWith('images/menu/') && p.endsWith('.png'));
  await Promise.all(menuPics.map(loadPic));
  for (const p of menuPics) { const q = pics.get(p); if (q) MENU_PICTURE_SIZES.set(p, { w: q.w, h: q.h }); }

  const sound = new WebSound(audio, (p) => URLS.get(p), async (p) => (URLS.has(p) ? (await fetch(URLS.get(p)!)).text() : null));
  const env = new Env(data, sound, { width: (t) => text.width('subtitle', 20, t) }, (m) => console.debug(`fillets: ${m}`));
  const opts = env.options;

  // the user dir from the server
  const enc = new TextEncoder(), dec = new TextDecoder();
  const toBytes = (s: string) => enc.encode(s);
  try {
    const o = await storage.get('options.lua');
    if (o) env.vfs.user.set('script/options.lua', Array.from(o, (b) => String.fromCharCode(b)).join(''));
    for (const [dir, file] of Object.entries(PACKS)) {
      const d = await storage.get(file);
      if (d) for (const [name, content] of Object.entries(JSON.parse(dec.decode(d)) as Record<string, string>)) env.vfs.user.set(`${dir}/${name}`, content);
    }
  } catch {
    // offline: a first run
  }
  let writing: Promise<unknown> = Promise.resolve();
  const dirty = new Set<string>();
  let flushTimer = 0;
  const flush = () => {
    flushTimer = 0;
    for (const f of [...dirty]) {
      dirty.delete(f);
      let bytes: Uint8Array;
      if (f === 'options.lua') bytes = toBytes(env.vfs.user.get('script/options.lua') ?? '');
      else {
        const dir = Object.keys(PACKS).find((k) => PACKS[k] === f)!;
        const obj: Record<string, string> = {};
        for (const [k, v] of env.vfs.user) if (k.startsWith(`${dir}/`)) obj[k.slice(dir.length + 1)] = v;
        bytes = toBytes(JSON.stringify(obj));
      }
      writing = writing.then(() => storage.put(f, bytes).catch((e) => console.warn(`fillets: ${f} not saved`, e)));
    }
  };
  env.vfs.onUserWrite = (path) => {
    const dir = path.split('/')[0];
    dirty.add(PACKS[dir] ?? 'options.lua');
    if (!flushTimer) flushTimer = window.setTimeout(flush, 500);
  };
  opts.onPersist = () => {
    env.vfs.user.set('script/options.lua', opts.serialize());
    env.vfs.onUserWrite('script/options.lua');
  };

  // OptionAgent and ScriptAgent: the language, the user's options, then script/init.lua
  const nav = (navigator.language || 'en').replace('-', '_').slice(0, 5);
  opts.setParam('lang', nav);
  opts.setDefault('volume_sound', 90);
  opts.setDefault('volume_music', 50);
  const scriptAgent = new Scripter(env);
  scriptAgent.reg('setParam', (a) => { opts.setParam(argStr(a, 0, 'setParam'), tostr(a[1]) ?? argStr(a, 1, 'setParam')); });
  scriptAgent.reg('getParam', (a) => { const v = opts.getParam(argStr(a, 0, 'getParam')); return v === '' ? undefined : v; });
  scriptAgent.reg('sendMsg', () => {});
  if (env.vfs.user.has('script/options.lua')) {
    try {
      scriptAgent.scriptInclude('script/options.lua');
      for (const line of env.vfs.user.get('script/options.lua')!.split('\n')) {
        const m = /^setParam\("([^"]+)"/.exec(line);
        if (m) opts.persistent.add(m[1]);
      }
    } catch { /* a broken options file is ignored */ }
  }
  scriptAgent.scriptInclude('script/init.lua');
  const applyVolumes = () => sound.setVolumes(opts.getAsInt('volume_sound'), opts.getAsInt('volume_music'));
  applyVolumes();
  opts.watchers.push((n) => { if (n === 'volume_sound' || n === 'volume_music') applyVolumes(); });
  // Random::init(): srand(time(NULL))
  rng.init(Math.floor(Date.now() / 1000));

  // the screen
  let screen: PixelScreen | null = null;
  let screenAbort: AbortController | null = null;
  let fb = new Framebuffer(640, 480);
  let image: ImageData | null = null;
  const setScreenSize = (w: number, h: number) => {
    if (screen && screen.width === w && screen.height === h) return;
    screenAbort?.abort();
    screenAbort = new AbortController();
    signal.addEventListener('abort', () => screenAbort?.abort(), { once: true });
    screen = new PixelScreen(host, { width: w, height: h }, screenAbort.signal);
    screen.canvas.style.touchAction = 'none';
    attachPointer(screen);
    fb = new Framebuffer(w, h);
    fb.clear();
    image = null;
  };

  // input
  const held = new Set<string>();
  let shift = false;
  let mouse = { x: -1, y: -1 };
  const manager = new StateManager();
  manager.input = { isPressed: (k) => held.has(k), mouse: () => mouse };
  const top = (): GameState | null => manager.top();
  const guard = (f: () => void) => Level.guard(f, (e) => { console.error('fillets:', e); failed = e.message; });
  let failed: string | null = null;
  window.addEventListener('keydown', (e) => {
    shift = e.shiftKey;
    const k = keyName(e);
    if (!k) return;
    if (k !== 'F5' && k !== 'F11' && k !== 'F12') e.preventDefault();
    if (k === 'F11' || k === 'F12') return;
    held.add(k);
    if (e.repeat && k !== 'up' && k !== 'down' && k !== 'left' && k !== 'right') return;
    guard(() => top()?.keyDown(k, e.shiftKey));
  }, { signal });
  window.addEventListener('keyup', (e) => {
    shift = e.shiftKey;
    const k = keyName(e);
    if (!k) return;
    held.delete(k);
    guard(() => top()?.keyUp(k));
  }, { signal });
  window.addEventListener('blur', () => { held.clear(); shift = false; }, { signal });
  function attachPointer(s: PixelScreen) {
    const sig = screenAbort!.signal;
    const at = (e: PointerEvent) => { const p = s.toPixel(e.clientX, e.clientY); if (p) mouse = p; };
    s.canvas.addEventListener('pointermove', at, { signal: sig });
    s.canvas.addEventListener('pointerdown', (e) => {
      at(e);
      s.canvas.setPointerCapture(e.pointerId);
      held.add(`mouse${e.button}`);
      guard(() => top()?.mouseDown(mouse.x, mouse.y, e.button));
    }, { signal: sig });
    const up = (e: PointerEvent) => { held.delete(`mouse${e.button}`); };
    s.canvas.addEventListener('pointerup', up, { signal: sig });
    s.canvas.addEventListener('pointercancel', up, { signal: sig });
    s.canvas.addEventListener('contextmenu', (e) => e.preventDefault(), { signal: sig });
  }

  // the status picture (StatusDisplay: "saved")
  let status: { pic: string; until: number } | null = null;

  const game: Game = {
    env,
    setScreenSize,
    exit: () => ctx.exit(),
    prepareLevel: (codename) => {
      for (const p of URLS.keys()) if (p.startsWith(`images/${codename}/`)) void loadPic(p);
    },
  };
  manager.onQuit = () => ctx.exit();
  const worldmap = new WorldMap(game);
  const levelHost = (level: Level) => {
    level.host.displayStatus ??= (p: string, s: number) => { status = { pic: env.vfs.dataPath(p), until: env.cycles + s * 10 }; void loadPic(env.vfs.dataPath(p)); };
  };
  setScreenSize(640, 480);
  env.options.setParam('screen_width', 640);
  env.options.setParam('screen_height', 480);
  guard(() => manager.pushState(null, worldmap));

  const painter = () => new FbPainter(fb, { pic }, text);
  const drawSubtitles = () => {
    if (!opts.getAsBool('subtitles', true)) return;
    for (const t of env.subtitles.titles) fb.blit(text.render('subtitle', 20, t.content, t.color), t.x, t.y);
  };
  const gfx: Gfx = {
    get fb() { return fb; },
    pic,
    text: (f, size, s, color) => text.render(f, size, s, color),
    textWidth: (f, size, s) => text.width(f, size, s),
    drawLevel: (level) => { if (level.script.isRoom()) level.room.draw(painter()); },
    drawSubtitles,
  };

  /** the pictures a level's models and background use are all loaded */
  const levelReady = (level: Level): boolean => {
    if (!level.script.isRoom()) return true;
    let ready = true;
    const need = (p: string) => { if (pics.get(p) === undefined) { ready = false; void loadPic(p); } };
    need(level.room.bg);
    for (const m of level.room.models) for (const pack of m.anim.packs) for (const l of pack.map.values()) for (const img of l) if ('path' in img) need(img.path);
    return ready;
  };

  const drawFrame = () => {
    for (const s of manager.running()) {
      if (s instanceof Level) {
        levelHost(s);
        if (s.script.isRoom()) {
          s.room.draw(painter());
          drawSubtitles();
          if (status && status.until > env.cycles) { const p = pic(status.pic); if (p) fb.blit(p, 0, 0); }
        }
      } else s.draw(gfx);
    }
  };

  let acc = 0;
  ctx.frame((_t, dt) => {
    if (failed) return;
    acc += Math.min(dt, 250);
    const interval = shift ? 25 : 100;
    let stepped = false;
    while (acc >= interval) {
      acc -= interval;
      const t = top();
      if (t instanceof Level && !levelReady(t)) { acc = 0; break; }
      guard(() => {
        drawFrame();
        env.cycles++;
        env.subtitles.update();
        manager.updateGame();
      });
      stepped = true;
      if (failed) break;
    }
    if (stepped && screen) {
      if (!image || image.width !== fb.w || image.height !== fb.h) image = new ImageData(fb.w, fb.h);
      image.data.set(fb.px);
      screen.ctx.putImageData(image, 0, 0);
    }
    if (failed && screen) {
      screen.ctx.fillStyle = '#000';
      screen.ctx.fillRect(0, 0, screen.width, 40);
      screen.ctx.fillStyle = '#f66';
      screen.ctx.font = '12px sans-serif';
      screen.ctx.fillText(`Script error: ${failed.slice(0, 90)}`, 8, 24);
    }
  });

  return {
    async stop() {
      if (flushTimer) { clearTimeout(flushTimer); flush(); }
      sound.stopMusic();
      await Promise.race([writing, new Promise((r) => setTimeout(r, 3000))]);
    },
  };
};
