// Biniax on the website: what main() and desktop/*.c did with SDL. The 640x480 screen on the SDK's pixel
// screen; the menu runs every frame (the original polled it every millisecond), a game step every
// 60 ms; arrows, Space/Enter ("A") and Escape ("B") as in the original; autosave.bnx and hiscore.bnx
// in the player's account storage on the server.
import { PixelScreen, type StartGame } from '../../../src/sdk/index.ts';
import { parseImage, type Image } from './assets.ts';
import { Biniax, DELTA_TIME, type Files } from './game.ts';
import { Gfx, SCREEN_X, SCREEN_Y, type ImageName } from './gfx.ts';
import { FrameBuffer, Mixer } from './screen.ts';
import type { Key } from './inp.ts';

const binUrls = import.meta.glob<string>('../assets/*.bin', { eager: true, query: '?url', import: 'default' });
const wavUrls = import.meta.glob<string>('../assets/*.wav', { eager: true, query: '?url', import: 'default' });
const IMAGES: ImageName[] = ['background', 'splash', 'gameover', 'option0', 'option1', 'option2', 'element0', 'element1',
  'element2', 'element3', 'shield', 'cursor0', 'cursor1', 'font'];
const KEYS: Record<string, Key> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', ' ': 'a', Enter: 'a', Escape: 'b' };
const FILES = ['autosave.bnx', 'hiscore.bnx'];

export const start: StartGame = async (host, ctx) => {
  const { signal, audio, storage } = ctx;
  const images = Object.fromEntries(await Promise.all(IMAGES.map(async (n) => {
    const r = await fetch(binUrls[`../assets/${n}.bin`], { signal });
    return [n, parseImage(new Uint8Array(await r.arrayBuffer()))] as const;
  }))) as Record<ImageName, Image>;
  const sounds = await Promise.all([null, 1, 2, 3, 4].map(async (n) => {
    if (n === null) return null;
    try {
      const r = await fetch(wavUrls[`../assets/sfx${n}.wav`], { signal });
      return await audio.decodeAudioData(await r.arrayBuffer());
    } catch {
      return null; // as Mix_LoadWAV failing: that sound stays silent
    }
  }));

  // the files the original kept next to the program, from the player's storage; writes go back to it
  const cache = new Map<string, Uint8Array>();
  await Promise.all(FILES.map(async (f) => {
    try {
      const d = await storage.get(f);
      if (d) cache.set(f, d);
    } catch {
      // offline: the game starts without its files, as on a first run
    }
  }));
  let writing = Promise.resolve();
  const files: Files = {
    read: (name) => cache.get(name) ?? null,
    write: (name, data) => {
      cache.set(name, data);
      writing = writing.then(() => storage.put(name, data).then(() => undefined, (e) => console.warn(`biniax: ${name} not saved`, e)));
    },
  };

  const screen = new PixelScreen(host, { width: SCREEN_X, height: SCREEN_Y }, signal);
  const fb = new FrameBuffer(images);
  const mixer = new Mixer(audio, sounds);
  const image = new ImageData(fb.pixels, SCREEN_X, SCREEN_Y);
  let dirty = true;
  const gfx = new Gfx({
    size: (n) => fb.size(n),
    blit: (n, src, x, y) => fb.blit(n, src, x, y),
    fill: (x, y, w, h) => fb.fill(x, y, w, h),
    flip: () => { dirty = true; },
    play: (c, s) => mixer.play(c, s),
  });
  // sysInit(): srand( SDL_GetTicks() ), the milliseconds since start
  const game = new Biniax(gfx, files, Math.floor(performance.now()) % 1000);

  window.addEventListener('keydown', (e) => {
    const k = KEYS[e.key];
    if (!k) return;
    e.preventDefault();
    if (e.repeat) return; // SDL 1.2 sends no repeats unless asked to
    game.input.press(k);
    // the original polled its menu every millisecond: each key gets its own pass, as there
    if (game.state === 'menu') {
      game.menuStep();
      if ((game.state as string) === 'quit') ctx.exit();
    }
  }, { signal });

  let acc = 0;
  ctx.frame((_t, dt) => {
    if (game.state === 'menu') {
      game.menuStep();
      acc = 0;
    } else if (game.state === 'game') {
      acc += Math.min(dt, 250);
      while (acc >= DELTA_TIME && game.state === 'game') {
        acc -= DELTA_TIME;
        game.gameStep();
      }
    }
    if (dirty) {
      screen.ctx.putImageData(image, 0, 0);
      dirty = false;
    }
    if (game.state === 'quit') ctx.exit();
  });

  return {
    async stop() {
      game.leave();
      // the last save reaches the server (or gives up after a moment)
      await Promise.race([writing, new Promise((r) => setTimeout(r, 3000))]);
    },
  };
};
