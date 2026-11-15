// Pingus on the website: what pingus_main.cpp sets up (data, fonts, sound, savegames, the main menu) and
// ScreenManager::display's loop (input, update, draw, at most 40 frames a second as globals::desired_fps)
// in the browser. The 800x600 window on the SDK's pixel screen; the savegames in the player's storage.
import { PixelScreen, type StartGame } from '../../../src/sdk/index.ts';
import { Mixer } from './audio.ts';
import { CanvasFramebuffer } from './canvasfb.ts';
import { setSoundOut } from './common.ts';
import { initFonts } from './fonts.ts';
import { type ButtonName, type InputEvent, SCREEN_H, SCREEN_W, ScreenManager } from './gui.ts';
import { LevelMenu, PingusMenu, menuHooks } from './menus.ts';
import { BytesSource, setDataSource } from './res.ts';
import { SavegameManager, StatManager } from './saves.ts';
import textFilesUrl from '../assets/text-files.json?url';
import { startWorldmap } from './worldmap.ts';

const fileUrls = import.meta.glob<string>(['../assets/data/**/*.png', '../assets/data/**/*.jpg', '../assets/data/sounds/*.wav'], { eager: true, query: '?url', import: 'default' });
const musicUrls = import.meta.glob<string>(['../assets/data/music/*'], { eager: true, query: '?url', import: 'default' });

const SAVEGAMES = 'savegames.scm';
const VARIABLES = 'variables.scm';

/** the keys of data/controller/default.scm */
const KEY_BUTTONS: Record<string, ButtonName> = {
  p: 'pause', f: 'fast-forward', ' ': 'fast-forward', s: 'single-step', a: 'armageddon', Escape: 'escape', Tab: 'action-down',
  1: 'action-1', 2: 'action-2', 3: 'action-3', 4: 'action-4', 5: 'action-5', 6: 'action-6', 7: 'action-7', 8: 'action-8',
  9: 'action-9', 0: 'action-10',
};

export const start: StartGame = async (host, ctx) => {
  const { signal, storage } = ctx;
  const dec = new TextEncoder();
  // every file but the music first; the music when a screen plays it
  const files = new Map<string, Uint8Array>();
  const texts = await (await fetch(textFilesUrl, { signal })).json() as Record<string, string>;
  for (const [p, t] of Object.entries(texts)) files.set(p, dec.encode(t));
  await Promise.all(Object.entries(fileUrls).map(async ([k, url]) => {
    const r = await fetch(url, { signal });
    files.set(k.replace('../assets/data/', ''), new Uint8Array(await r.arrayBuffer()));
  }));
  const source = new BytesSource(files);
  setDataSource(source);
  initFonts();

  // savegames/savegames.scm and savegames/variables.scm in the account's storage
  const td = new TextDecoder();
  const load = async (name: string) => { try { const d = await storage.get(name); return d ? td.decode(d) : null; } catch { return null; } };
  let writing = Promise.resolve();
  const save = (name: string) => (text: string) => {
    writing = writing.then(() => storage.put(name, dec.encode(text)).then(() => undefined, (e) => console.warn(`pingus: ${name} not saved`, e)));
  };
  new SavegameManager(await load(SAVEGAMES), save(SAVEGAMES));
  new StatManager(await load(VARIABLES), save(VARIABLES));

  const mixer = new Mixer(ctx.audio, source, (name) => {
    const url = musicUrls[`../assets/data/music/${name}`];
    return url ? fetch(url, { signal }).then((r) => r.arrayBuffer()).then((b) => new Uint8Array(b)) : Promise.resolve(null);
  });
  setSoundOut(mixer);

  const screen = new PixelScreen(host, { width: SCREEN_W, height: SCREEN_H }, signal);
  const fb = new CanvasFramebuffer(screen.ctx, SCREEN_W, SCREEN_H);
  const sm = new ScreenManager(fb);
  sm.onEmpty = () => ctx.exit();
  menuHooks.startWorldmap = startWorldmap;
  sm.push(new PingusMenu());
  void LevelMenu;

  // input: the pointer in window pixels, the mouse buttons, the keys of the controller file, the arrow scroller
  const events: InputEvent[] = [];
  const held = new Set<string>();
  const pointer = (e: PointerEvent | MouseEvent) => {
    const r = screen.canvas.getBoundingClientRect();
    return { x: Math.floor((e.clientX - r.left) / r.width * SCREEN_W), y: Math.floor((e.clientY - r.top) / r.height * SCREEN_H) };
  };
  const c = screen.canvas;
  c.addEventListener('pointermove', (e) => events.push({ type: 'pointer', ...pointer(e) }), { signal });
  c.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    c.setPointerCapture(e.pointerId);
    events.push({ type: 'pointer', ...pointer(e) });
    if (e.button === 0) events.push({ type: 'button', name: 'primary', pressed: true });
    else if (e.button === 1 || e.button === 2) events.push({ type: 'button', name: 'secondary', pressed: true });
  }, { signal });
  c.addEventListener('pointerup', (e) => {
    events.push({ type: 'pointer', ...pointer(e) });
    if (e.button === 0) events.push({ type: 'button', name: 'primary', pressed: false });
    else if (e.button === 1 || e.button === 2) events.push({ type: 'button', name: 'secondary', pressed: false });
  }, { signal });
  c.addEventListener('contextmenu', (e) => e.preventDefault(), { signal });
  c.addEventListener('wheel', (e) => {
    e.preventDefault();
    const name: ButtonName = e.deltaY < 0 ? 'action-up' : 'action-down';
    events.push({ type: 'button', name, pressed: true }, { type: 'button', name, pressed: false });
  }, { signal, passive: false });
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k.startsWith('Arrow')) { held.add(k); e.preventDefault(); return; }
    const b = KEY_BUTTONS[k];
    if (b) {
      e.preventDefault();
      if (!e.repeat) events.push({ type: 'button', name: b, pressed: true });
    }
    if (e.key.length === 1) events.push({ type: 'key', key: e.key });
  }, { signal });
  window.addEventListener('keyup', (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    held.delete(k);
    const b = KEY_BUTTONS[k];
    if (b) events.push({ type: 'button', name: b, pressed: false });
  }, { signal });
  window.addEventListener('blur', () => held.clear(), { signal });

  let last = performance.now(), acc = 0;
  ctx.frame((now) => {
    acc += now - last;
    last = now;
    if (acc < 1000 / 40 - 1) return; // ScreenManager waits for 1/desired_fps
    const delta = acc / 1000;
    acc = 0;
    // core:button-scroller: 800 pixels a second while an arrow key is held
    const sp = 800 * delta;
    let dx = 0, dy = 0;
    if (held.has('ArrowLeft')) dx += sp;
    if (held.has('ArrowRight')) dx -= sp;
    if (held.has('ArrowUp')) dy += sp;
    if (held.has('ArrowDown')) dy -= sp;
    events.push({ type: 'scroll', dx, dy });
    const evs = events.splice(0);
    sm.frame(delta, evs, now);
  }, signal);

  return { stop: () => { setSoundOut(null); mixer.stop(); void writing; } };
};
