// Enigma 1.30 in the browser: the 640x480 window on the SDK's pixel screen, the mouse through pointer lock,
// the original's data (assets/), the engine (engine/) running the levels' Lua code (lua/), and the player's
// solved levels in server storage.
import { PixelScreen, type StartGame } from '../../../src/sdk/index.ts';
import { initEngine } from './engine/index.ts';
import { toBytes } from './lua/lib.ts';
import { EnigmaApp, type PackInfo } from './app.ts';
import { SoundPlayer, MenuMusic, loadSoundTable } from './sound.ts';
import fontUrl from '../assets/fonts/DejaVuSansCondensed.ttf?url';
import packsJson from '../assets/levels/packs.json?raw';
import libJson from '../assets/levels/lib.json?raw';
import espritUrl from '../assets/music/esprit.ogg?url';
import ragUrl from '../assets/music/enigma_rag.ogg?url';
import s3mUrl from '../assets/music/pentagonal_dreams.s3m?url';

const dataFiles = import.meta.glob('../assets/data/*', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
const gfx32 = import.meta.glob('../assets/gfx32/*.{png,jpg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const gfx = import.meta.glob('../assets/gfx/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const packUrls = import.meta.glob('../assets/levels/*.json', { query: '?url', import: 'default' }) as Record<string, () => Promise<string>>;
const soundUrls = import.meta.glob('../assets/sound/*.wav', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

const base = (p: string) => p.replace(/^.*\//, '').replace(/\.[a-z0-9]+$/, '');
const data = (name: string) => dataFiles[`../assets/data/${name}`] ?? '';

export const start: StartGame = async (host, ctx) => {
  const screen = new PixelScreen(host, { width: 640, height: 480, background: '#000' }, ctx.signal);
  const g = screen.ctx;
  g.fillStyle = '#000'; g.fillRect(0, 0, 640, 480);
  g.fillStyle = '#ccc'; g.font = '16px sans-serif'; g.fillText('Loading Enigma ...', 250, 240);

  // images (gfx32 first, gfx as the fallback, as GameFS::findImageFile)
  const urls = new Map<string, string>();
  for (const [p, u] of Object.entries(gfx)) urls.set(base(p), u);
  for (const [p, u] of Object.entries(gfx32)) urls.set(base(p), u);
  const images = new Map<string, HTMLImageElement>();
  await Promise.all([...urls].map(([name, u]) => new Promise<void>((res) => {
    const im = new Image();
    im.onload = () => { images.set(name, im); res(); };
    im.onerror = () => res();
    im.src = u;
  })));
  const font = new FontFace('Enigma DejaVu', `url(${fontUrl})`);
  try { document.fonts.add(await font.load()); } catch { /* the fallback font is used */ }

  const sizes = JSON.parse(data('images.json')) as Record<string, [string, number, number]>;
  const errors = initEngine({
    lua: (n) => toBytes(data(n)),
    text: (n) => data(n),
    imageSize: (n) => { const s = sizes[n]; return s ? [s[1], s[2]] : null; },
  });
  if (errors.length) console.warn('Enigma models:', errors);

  const soundMap: Record<string, string> = {};
  for (const [p, u] of Object.entries(soundUrls)) soundMap[base(p)] = u;
  let sound: SoundPlayer | null = null;
  let music: MenuMusic | null = null;
  try {
    sound = new SoundPlayer(ctx.audio, loadSoundTable(data('sound-defaults.lua')), soundMap);
    sound.preload();
    music = new MenuMusic(ctx.audio, { esprit: espritUrl, rag: ragUrl, s3m: s3mUrl });
  } catch (e) { console.warn('Enigma sound:', e); }

  let locked = false;
  let soft = false;
  const canvas = screen.canvas;
  const app = new EnigmaApp({
    g, canvas,
    img: (n) => images.get(n) ?? null,
    packs: JSON.parse(packsJson) as PackInfo[],
    libs: JSON.parse(libJson) as Record<string, string>,
    loadPack: async (dir) => {
      const f = packUrls[`../assets/levels/${dir}.json`];
      const u = await f();
      return await (await fetch(u, { signal: ctx.signal })).json() as Record<string, string>;
    },
    sound, music,
    storage: { get: (n) => ctx.storage.get(n), put: async (n, d) => { await ctx.storage.put(n, d); } },
    scale: () => canvas.getBoundingClientRect().width / 640,
    exit: () => ctx.exit(),
    // without pointer lock (refused, or not supported) the mouse still steers while it is over the window
    lockPointer: () => {
      if (locked || soft) return;
      try {
        const r = canvas.requestPointerLock?.() as unknown as Promise<void> | undefined;
        if (r && typeof r.catch === 'function') r.catch(() => { soft = true; });
        else if (!canvas.requestPointerLock) soft = true;
      } catch { soft = true; }
    },
    unlockPointer: () => { soft = false; if (document.pointerLockElement === canvas) document.exitPointerLock(); },
    pointerLocked: () => locked || soft,
  });
  const opts = { signal: ctx.signal };
  document.addEventListener('pointerlockchange', () => {
    const was = locked;
    locked = document.pointerLockElement === canvas;
    if (was && !locked) app.onPointerLockLost();
  }, opts);
  canvas.addEventListener('mousemove', (e) => {
    if (locked || soft) app.onMouseMove(e.movementX, e.movementY);
    if (!locked) { const p = screen.toPixel(e.clientX, e.clientY); if (p) app.onPointer(p.x, p.y); }
  }, opts);
  canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const p = screen.toPixel(e.clientX, e.clientY);
    app.onClick(p?.x ?? -1, p?.y ?? -1, e.button);
  }, opts);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault(), opts);
  window.addEventListener('keydown', (e) => {
    if (app.onKey(e)) e.preventDefault();
    else if (['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'F3', 'F4', 'F5'].includes(e.code)) e.preventDefault();
  }, opts);

  await app.init();
  ctx.frame((_t, dt) => app.frame(Math.min(dt, 100) / 1000));
  return {
    stop: () => {
      music?.stop();
      if (document.pointerLockElement === canvas) document.exitPointerLock();
    },
  };
};
