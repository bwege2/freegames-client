// HyperRogue 13.1o in the browser (stage 2, package U3): the canvas is the SDL window, the original's desktop start
// (hyper_main: hyper_init with initAll, the start menu, progress_warning) and its main loop, one mainloopiter per
// animation frame (control.cpp; SDL_GetTicks from performance.now). The score file with the saved game and the
// configuration file live in the player's account storage (src/cfile.ts). Quitting returns to the website.
// (C) Zeno Rogue, GPL-2.0-or-later (HyperRogue); TypeScript port.
import type { StartGame, GameContext } from '../../../src/sdk/index.ts';
import { G } from './globals.ts';
import { NotPorted, hr_exception } from './hyper.ts';
import { cfs, c_exit, STORED_FILES, STORAGE_FILE_LIMIT, bytes_to_cstr, cstr_to_bytes, trim_scorefile } from './cfile.ts';
import { hyper_main_init, hyper_main_finish } from './hyper-main.ts';
import { mainloopiter } from './control.ts';
import { popScreen } from './graph.ts';
import { sdl_set_canvas } from './sdlgfx.ts';
import { ttf_load_fonts, ttf_load_face, fontmetrics_load } from './sdlttf.ts';
import { language_load } from './language.ts';
import { sdl_attach, sdl_use_real_ticks } from './sdl.ts';
import { sound_attach, sound_shutdown } from './sound.ts';
import type { MixAudioContext, MixLoader, MixMediaElement } from './sdlmixer.ts';
import { OnlineUI } from './online-ui.ts';

const fontUrls = import.meta.glob<string>('../assets/fonts/*.{ttf,otf}', { eager: true, query: '?url', import: 'default' });
// the music and the sounds (game.json lazyAssets: Play does not wait for them; they load when a land or a sound
// first needs them) and the music list
const audioUrls = import.meta.glob<string>(['../assets/music/*.ogg', '../assets/sounds/*.ogg'], { eager: true, query: '?url', import: 'default' });
const audioTexts = import.meta.glob<string>('../assets/hyperrogue-music.txt', { eager: true, query: '?raw', import: 'default' });

/** the original's paths ("music/hr3-caves.ogg", "hyperrogue-music.txt") of the files under assets/ */
function asset_paths<T>(m: Record<string, T>): Map<string, T> {
  const r = new Map<string, T>();
  for (const [path, v] of Object.entries(m)) r.set(path.slice(path.indexOf('/assets/') + 8), v);
  return r;
}

/** the files of the mixer: an <audio> element for music (if the browser can play Ogg Vorbis), bytes for sounds */
function audio_loader(signal: AbortSignal): MixLoader {
  const probe = document.createElement('audio');
  const ogg = typeof probe.canPlayType === 'function' && probe.canPlayType('audio/ogg; codecs="vorbis"') !== '';
  return {
    media: (_url: string): MixMediaElement | null => (ogg ? document.createElement('audio') : null),
    fetch: async (url: string): Promise<ArrayBuffer> => {
      const r = await fetch(url, { signal });
      if (!r.ok) throw new Error(`${url}: ${r.status}`);
      return r.arrayBuffer();
    },
  };
}

/** the files of cfs.files that changed and are not stored yet, written one after another */
class FileStore {
  private readonly ctx: GameContext;
  private readonly dirty = new Set<string>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private chain: Promise<void> = Promise.resolve();

  constructor(ctx: GameContext) { this.ctx = ctx; }

  /** reads the stored files into cfs.files (before hyper_init) */
  async load(): Promise<void> {
    for (const name of STORED_FILES) {
      try {
        const b = await this.ctx.storage.get(name);
        if (b) cfs.files.set(name, bytes_to_cstr(b));
      } catch (e) {
        console.warn(`hyperrogue: could not read ${name}`, e);
      }
    }
  }

  /** cfs.onwrite: a changed file is stored after a short pause (a game writes its entry line by line) */
  changed(name: string): void {
    if (!STORED_FILES.includes(name)) return;
    this.dirty.add(name);
    if (this.timer === null) this.timer = setTimeout(() => { this.timer = null; void this.flush(); }, 500);
  }

  /** writes every changed file, in order; resolves when they are stored */
  flush(): Promise<void> {
    if (this.timer !== null) { clearTimeout(this.timer); this.timer = null; }
    const names = [...this.dirty];
    this.dirty.clear();
    for (const name of names) {
      let data = cfs.files.get(name) ?? '';
      if (name === G.scorefile || name === 'hyperrogue.log') data = trim_scorefile(data);
      if (data.length > STORAGE_FILE_LIMIT) { console.warn(`hyperrogue: ${name} is too large to store`); continue; }
      const bytes = cstr_to_bytes(data);
      this.chain = this.chain.then(() => this.ctx.storage.put(name, bytes).then(() => { }, (e: unknown) => {
        console.warn(`hyperrogue: could not store ${name}`, e);
      }));
    }
    return this.chain;
  }
}

export const start: StartGame = async (host, ctx) => {
  const canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.touchAction = 'none';
  canvas.style.cursor = 'default';
  host.replaceChildren(canvas);
  host.style.overflow = 'hidden';
  if (host.tabIndex < 0) host.tabIndex = 0;

  // the fonts (SDL_ttf's TTF_OpenFont reads them; the browser draws with them)
  const urls = new Map<string, string>();
  for (const [path, url] of Object.entries(fontUrls)) urls.set(path.slice(path.lastIndexOf('/') + 1), url);
  await ttf_load_fonts(urls);

  // the score file and the configuration file
  const store = new FileStore(ctx);
  await store.load();
  cfs.onwrite = (name) => { store.changed(name); };

  // the translation of the configured language (and for Chinese its font) before the start, so that the texts
  // of the start are translated as in the original; other languages load when first used (language.ts)
  const ini = cfs.files.get('hyperrogue.ini') ?? '';
  const language = parseInt(/^language=(-?\d+)/m.exec(ini)?.[1] ?? '-1', 10);
  const font_id = parseInt(/^font_id=(\d+)/m.exec(ini)?.[1] ?? '0', 10);
  try {
    await language_load(language);
    if (language === 8 || font_id === 3) await Promise.all([fontmetrics_load('NotoSans-Regular.ttf'), ttf_load_face('NotoSans-Regular.ttf')]);
  } catch (e) { console.warn('hyperrogue: could not load the translation', e); }

  // the music and the sounds (sound.cpp initAudio, called by initgraph, opens the mixer on ctx.audio)
  sound_attach(ctx.audio as unknown as MixAudioContext, audio_loader(ctx.signal), asset_paths(audioTexts), asset_paths(audioUrls));

  // the window
  const g2d = canvas.getContext('2d', { alpha: false });
  if (!g2d) throw new Error('no 2D canvas');
  sdl_set_canvas(g2d);
  sdl_attach(host, canvas, ctx.signal);
  sdl_use_real_ticks(() => performance.now());
  host.focus({ preventScroll: true });

  // the online game (port only, ONLINE.md): its menu items, the lobby, the lockstep
  const online = new OnlineUI(host, ctx);

  let running = hyper_main_init(['hyperrogue']);
  let finished = false;
  const reported = new Set<string>();
  const report = (e: unknown): void => {
    const m = e instanceof Error ? e.message : String(e);
    if (reported.has(m)) return;
    reported.add(m);
    console.error('hyperrogue:', e);
  };

  /** after mainloop(): finishAll (the score file, the saved game), once */
  const finish = (): void => {
    if (finished) return;
    finished = true;
    running = false;
    try { hyper_main_finish(); } catch (e) { report(e); }
  };

  ctx.frame(() => {
    if (!running) return;
    try {
      online.frame(mainloopiter);
    } catch (e) {
      if (e instanceof hr_exception || e instanceof c_exit) { G.quitmainloop = true; }
      else {
        report(e);
        // a screen of a package not ported yet: leave it, as its Esc would
        if (e instanceof NotPorted && G.screens.length > 1) popScreen();
      }
    }
    if (G.quitmainloop) {
      finish();
      void store.flush().then(() => { ctx.exit(); });
    }
  });

  if (!running) { finished = true; void store.flush().then(() => { ctx.exit(); }); }

  return {
    async stop() {
      // leaving the page is the original's quit: the game is recorded (or saved, with an Orb of Safety)
      online.stop();
      finish();
      sound_shutdown();
      sdl_set_canvas(null);
      await Promise.race([store.flush(), new Promise((r) => setTimeout(r, 3000))]);
      cfs.onwrite = () => { };
    },
  };
};
