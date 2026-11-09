// Shattered Pixel Dungeon on the page (re/shatteredpixeldungeon/NOTES.md, "The browser backend"): the translated
// game (src/gen) on the Java runtime (src/jre) and libGDX's browser backend (src/gdx/web), started as the
// original's desktop launcher starts it (oracle/src/freegames/spd/WebLauncher.java), in a canvas that fills the
// player's area. The game's files (settings, games in progress, rankings, badges) are the player's files in the
// site's storage; the game saves them itself when it pauses (the page is hidden, or the player leaves).
import type { StartGame } from '../../../src/sdk/index.ts';
import { AssetStore, PersistentStore, BrowserBackend, propertiesFromXML, registerFont } from './gdx/web/index.ts';
// the runtime and the translated program: static imports, so that Play downloads them before the start (the
// program's classes initialize on first use, after the backend is installed)
import * as rt from './jre/index.ts';
import './gen/index.ts';

// every file of the original's assets folder, by its path there (fetched before the start or when needed)
const assetUrls = import.meta.glob('../assets/**/*', { query: '?url&no-inline', import: 'default', eager: true }) as Record<string, string>;

/** A language's texts: messages/<group>/<group>_<code>.properties (English has no suffix). */
const langFile = (p: string, code: string) => p.startsWith('messages/') && p.endsWith('_' + code + '.properties');
const isLangFile = (p: string) => p.startsWith('messages/') && /_[a-z-]+\.properties$/.test(p);

/** What the game reads before it shows the title: everything but the music and the other languages' texts. */
const preload = (code: string) => (p: string) => !p.startsWith('music/') && (!isLangFile(p) || langFile(p, code));

/** The JVM's default locale for the browser's language (Locale.getDefault(): SPDSettings.language's default). */
function browserLocale(): [string, string, string] {
  const tag = navigator.language || 'en-US';
  const parts = tag.split('-');
  const lang = parts[0].toLowerCase();
  let country = '', script = '';
  for (const p of parts.slice(1)) {
    if (p.length === 4) script = p;
    else if (/^[A-Za-z]{2}$|^\d{3}$/.test(p)) country = p.toUpperCase();
  }
  return [lang, country, script ? '#' + script : ''];
}

/** The code of the language the game will start in (SPDSettings.language(), Languages.matchLocale). */
function startLanguage(files: PersistentStore): string {
  const s = files.read('settings.xml');
  if (s) {
    const code = propertiesFromXML(new TextDecoder().decode(s)).get('language');
    if (code) return code;
  }
  const [lang, , script] = browserLocale();
  if (lang === 'zh' && script.includes('Hant')) return 'zh-hant';
  return lang;
}

function message(host: HTMLElement, text: string) {
  const p = document.createElement('p');
  p.textContent = text;
  p.style.cssText = 'color:#eee;font:16px sans-serif;padding:24px;max-width:40em;margin:0';
  host.append(p);
  return p;
}

/** The page's one WebGL canvas: the game's GL objects (textures, buffers, programs) are kept in the translated
 *  program's static fields, which outlive a stop (the modules stay loaded), so a second Play reuses the canvas
 *  and its context, as the original keeps one GL context for the life of its process. */
/** The running game's signal (the language files of a later start are fetched under it). */
let currentSignal: AbortSignal;

let shared: { canvas: HTMLCanvasElement; gl: WebGLRenderingContext; files: PersistentStore | null; booted: any } | null = null;

function makeCanvas(): { canvas: HTMLCanvasElement; gl: WebGLRenderingContext } | null {
  const canvas = document.createElement('canvas');
  canvas.tabIndex = 0;
  canvas.style.cssText = 'display:block;width:100%;height:100%;outline:none;touch-action:none';
  // the LWJGL3 window's default framebuffer: no alpha, no depth or stencil needed, no multisampling
  const attrs = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false };
  const gl = (canvas.getContext('webgl2', attrs) ?? canvas.getContext('webgl', attrs)) as WebGLRenderingContext | null;
  return gl ? { canvas, gl } : null;
}

export const start: StartGame = async (host, ctx) => {
  host.style.background = '#000';
  host.style.position = 'relative';
  host.style.overflow = 'hidden';
  if (!shared) {
    const c = makeCanvas();
    if (!c) {
      message(host, 'Shattered Pixel Dungeon needs WebGL, and this browser does not offer it (or it is turned off). ' +
        'Turn on hardware acceleration in the browser\'s settings, or try another browser.');
      return { stop: () => {} };
    }
    shared = { ...c, files: null, booted: null };
  }
  const { canvas, gl } = shared;
  const status = message(host, 'Loading…');
  const signal = ctx.signal;
  currentSignal = signal;

  // the player's files, from the site's storage (once per page: later starts keep the files in memory)
  if (!shared.files) {
    const files = new PersistentStore(ctx.storage);
    try {
      await files.loadAll();
    } catch (e) {
      console.warn('Shattered Pixel Dungeon: the saved files could not be loaded: ' + e);
    }
    shared.files = files;
  }
  const files = shared.files;
  files.storage = ctx.storage;

  const assetPaths: Record<string, string> = {};
  for (const [k, url] of Object.entries(assetUrls)) assetPaths[k.replace(/^\.\.\/assets\//, '')] = url;
  const assets: AssetStore = (shared as any).assets ??= new AssetStore(assetPaths);
  const code = startLanguage(files);
  let pixelFont = 'sans-serif';
  try {
    await assets.load(preload(code), signal, (d, t) => { status.textContent = `Loading… ${d} / ${t}`; });
    pixelFont = await registerFont(assets.read('fonts/pixel_font.ttf')!);
  } catch (e) {
    if (signal.aborted) return { stop: () => {} };
    status.textContent = 'Shattered Pixel Dungeon could not load its files: ' + e;
    return { stop: () => {} };
  }
  if (signal.aborted) return { stop: () => {} };
  status.remove();

  host.append(canvas);
  let stopped = false;
  const backend = new BrowserBackend({
    host, canvas, gl, assets, files, audio: ctx.audio, signal, fontFamily: pixelFont,
    exit: () => { if (!stopped) ctx.exit(); },
  });

  // the runtime and the translated program (loaded once per page)
  backend.install();
  if (!shared.booted) {
    const [lang, country, variant] = browserLocale();
    rt.Locale.setDefault(new rt.Locale(lang, country, variant));
    shared.booted = rt.$J;
    patchLanguages(rt.$J, assets, () => currentSignal);
  }
  const J = shared.booted;
  if (signal.aborted) { canvas.remove(); return { stop: () => {} }; }

  let crashed = false;
  const crash = (e: unknown) => {
    crashed = true;
    console.error('Shattered Pixel Dungeon has crashed: ' + ((e as any)?.stack ?? e));
    canvas.remove();
    message(host, 'Shattered Pixel Dungeon has run into an error it cannot recover from and has stopped, sorry about that. ' +
      'Your game was saved when it last paused. (' + String((e as any)?.message ?? e) + ')');
  };
  try {
    const listener = J.load('freegames.spd.WebLauncher').create();
    backend.start(listener);
  } catch (e) {
    crash(e);
  }
  canvas.focus({ preventScroll: true });

  ctx.frame((time) => {
    if (crashed || stopped) return;
    try {
      backend.frame(time);
    } catch (e) {
      crash(e);
    }
  });

  // hidden (another tab, minimized): the game pauses, which saves it (GameScene.onPause), and the files are written
  const hide = () => {
    if (crashed || stopped) return;
    try { backend.pause(); } catch (e) { console.error(e); }
    void files.flush();
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') hide();
    else if (!crashed && !stopped) { try { backend.resume(); } catch (e) { crash(e); } }
  }, { signal });
  window.addEventListener('pagehide', hide, { signal });
  // full screen left with the browser's own means (holding Esc): the setting follows, as the settings window shows it
  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement || crashed || stopped) return;
    backend.app.postRunnable(() => {
      const S = J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
      if (S.fullscreen$()) S.fullscreen$boolean(false);
    });
  }, { signal });

  // for the screenshots and the end-to-end test: the scene and what is on it
  (window as any).shatteredpixeldungeon = debugHooks(J, backend);

  return {
    stop: async () => {
      if (stopped) return;
      stopped = true;
      try { if (!crashed) backend.dispose(); } catch (e) { console.error('Shattered Pixel Dungeon:', e); }
      canvas.remove();
      delete (window as any).shatteredpixeldungeon;
      await files.flush();
    },
  };
};

/**
 * Messages.setup(language) reads the language's .properties files synchronously; the other languages are not
 * fetched before the start (17 MB). When the player chooses one that is not there yet, the game goes on in what
 * it has (libGDX's I18NBundle falls back to English) while the files arrive, and then sets the language up
 * again and redraws the scene (ShatteredPixelDungeon.seamlessResetScene), as choosing it in the settings does.
 */
function patchLanguages(J: any, assets: AssetStore, current: () => AbortSignal) {
  const Messages = J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  // the class's static initializer puts its own methods back when it runs: run it first (it only lists the files)
  rt.ensureInit(Messages);
  const setup = Messages.setup;
  const loading = new Set<string>();
  Messages.setup = function (lang: any) {
    const code: string = lang.code();
    const missing = [...assets.urls.keys()].some((p) => langFile(p, code) && !assets.has(p));
    setup.call(Messages, lang);
    if (!missing || loading.has(code)) return;
    loading.add(code);
    const signal = current();
    assets.load((p) => langFile(p, code), signal).then(() => {
      if (signal.aborted) { loading.delete(code); return; }
      loading.delete(code);
      const SPDSettings = J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
      if (SPDSettings.language$() !== lang) return;
      setup.call(Messages, lang);
      J.load('com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon').seamlessResetScene$();
    }, (e: unknown) => { loading.delete(code); if (!signal.aborted) console.warn('Shattered Pixel Dungeon: texts of ' + code + ': ' + e); });
  };
}

/** What screenshots.mjs and e2e.mjs read: the scene's class, the hero, the open windows and the buttons on the
 *  screen (their class, text and place in CSS pixels of the canvas). */
function debugHooks(J: any, backend: BrowserBackend) {
  const Game = () => J.load('com.watabou.noosa.Game');
  const walk = (f: (g: any) => void) => {
    const visit = (g: any) => {
      if (!g || g.exists === false || g.visible_ === false) return;
      f(g);
      const m = g.members;
      if (m) for (let i = 0; i < m.size(); i++) visit(m.get(i));
    };
    visit(Game().scene());
  };
  const rect = (g: any) => {
    const c = g.camera();
    if (!c) return null;
    const a = c.cameraToScreen(g.x, g.y), b = c.cameraToScreen(g.x + g.width_, g.y + g.height_);
    const k = backend.graphics.cssWidth / backend.graphics.width;
    return { x: a.x * k, y: a.y * k, w: (b.x - a.x) * k, h: (b.y - a.y) * k };
  };
  return {
    /** the runtime ($J.load('binary.Name') gives a class of the translated program) */
    J,
    scene: () => {
      const s = Game().scene();
      return s ? s.getClass().getSimpleName() : null;
    },
    /** A cell's centre on the screen (CSS pixels of the canvas). */
    cell: (cell: number) => {
      const p = J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap').tileCenterToWorld(cell);
      const s = J.load('com.watabou.noosa.Camera').main.cameraToScreen(p.x, p.y);
      const k = backend.graphics.cssWidth / backend.graphics.width;
      return { x: s.x * k, y: s.y * k };
    },
    /** The cells of the floor's item heaps. */
    heaps: () => {
      const level = J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon').level;
      if (!level) return [];
      const out: number[] = [];
      const hs = level.heaps.valueList();
      for (let i = 0; i < hs.size(); i++) out.push(hs.get(i).pos);
      return out;
    },
    windows: () => {
      const W = J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
      const out: string[] = [];
      walk((g) => { if (g instanceof W) out.push(g.getClass().getName().replace(/.*\./, '')); });
      return out;
    },
    buttons: () => {
      const B = J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Button');
      const out: any[] = [];
      walk((g) => {
        if (!(g instanceof B) || g.active === false) return;
        let text = null;
        try { if (typeof g.text$ === 'function') text = g.text$(); } catch { /* no text */ }
        const r = rect(g);
        if (r) out.push({ cls: g.getClass().getName().replace(/.*\./, ''), text, ...r });
      });
      return out;
    },
    size: () => [backend.graphics.width, backend.graphics.height, backend.graphics.cssWidth, backend.graphics.cssHeight],
    hero: () => {
      const D = J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
      const h = D.hero;
      return h ? { depth: D.depth, pos: h.pos, hp: h.HP, ready: h.ready_, width: D.level?.width() ?? 0 } : null;
    },
  };
}
