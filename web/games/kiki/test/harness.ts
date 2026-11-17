// A headless kiki: the controller, the Python half and a memory "home directory", driven frame by frame
// with a virtual clock (SDL_GetTicks) and key events named as the original's KKey names them.
import { KikiController } from '../src/engine/controller.ts';
import { SilentSound } from '../src/engine/sound.ts';
import { KikiConfig, KikiGame, KikiHighscore, KikiPyWorld, type KikiStorage } from '../src/pyworld.ts';
import { KikiPlayer, ACTION_KEYS } from '../src/engine/objects.ts';
import { resetColors } from '../src/engine/colors.ts';

export class MemoryStorage implements KikiStorage {
  files = new Map<string, string>();
  load(name: string): string | null { return this.files.get(name) ?? null; }
  save(name: string, text: string): void { this.files.set(name, text); }
}

export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Headless {
  C: KikiController;
  game: KikiGame;
  storage = new MemoryStorage();
  sound = new SilentSound();
  time = 1000;

  constructor(opts: { menu?: boolean; random?: () => number } = {}) {
    resetColors();
    KikiPlayer.keys = new Map(ACTION_KEYS);
    this.C = new KikiController(this.sound);
    this.C.frame_time = this.C.last_time = this.time;
    this.game = new KikiGame(this.C, {
      storage: this.storage, getFullscreen: () => false, setFullscreen: () => {}, random: opts.random ?? seeded(1),
    });
    if (opts.menu) this.game.start();
    else {
      this.C.init();
      this.game.config = new KikiConfig(this.game);
      this.game.highscore = new KikiHighscore(this.storage);
      this.game.levelWorld.v.max_level_index = 0;
    }
  }

  level(name: string): KikiPyWorld {
    const w = new KikiPyWorld(this.game);
    w.create(name);
    return w;
  }

  /** one frame at time + dt */
  frame(dt = 10): void {
    this.time += dt;
    this.C.step(this.time);
  }

  run(ms: number, dt = 10): void {
    for (let t = 0; t < ms; t += dt) this.frame(dt);
  }

  key(name: string, down = true, character = 0): void {
    this.C.handleKeyboardEvent({ name, character }, down);
  }
  press(name: string, holdMs = 0, dt = 10): void {
    this.key(name, true);
    this.run(holdMs, dt);
    this.key(name, false);
  }
}
