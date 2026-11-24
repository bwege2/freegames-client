// OpenClonk in the browser: the game page (docs/GAME-INTEGRATION.md, start(host, ctx)). The page starts the original's
// application as the installed game starts without a scenario (src/app.ts): C4Application::Init opens the original's
// start menu (gui/C4Startup*: main menu, scenario selection, player selection, options, about), its SDL window and
// OpenGL context on the page's canvas, its sound on the page's AudioContext, its main loop one round per animation frame.
// What it draws, plays and does with the keys and the mouse is the original's code as the translator wrote it (src/gen).
// The player's files of the original's user folder (config, player files, savegames) are kept in the site's storage
// (src/storage.ts); the original's "Exit" returns to the game page.
import type { StartGame, GameContext } from '../../../src/sdk/index.ts';
import { START_GROUPS, SCENARIO_FOLDERS, MUSIC_GROUP } from './groups.ts';
import { fetchGroup, fetchNoncommercial, missingGroups } from './content.ts';
import type { ContentGroup, ContentFile } from './app.ts';
import { OriginalApp, USER_DATA } from './app.ts';
import { UserFiles } from './storage.ts';
import { OnlineGames } from './lobby.ts';
import { addFile, isDir, listDir, readFile, takeChanges } from './rt/fs.ts';
import { ENVIRONMENT } from './rt/libc.ts';

const css = `
.oc { position: absolute; inset: 0; background: #000; color: #e8e4d8; font: 15px/1.5 system-ui, sans-serif; overflow: hidden; }
.oc canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; outline: none; }
.oc-panel { position: absolute; inset: 0; overflow: auto; padding: 24px; box-sizing: border-box; background: rgba(0, 0, 0, .82); }
.oc-panel h1 { font-size: 22px; margin: 0 0 4px; font-weight: 600; }
.oc-note { color: #b9b3a3; max-width: 46rem; margin: 0 0 16px; }
.oc-panel button { font: inherit; padding: 4px 12px; border-radius: 4px; border: 1px solid #5a5446; background: #2a271f; color: inherit; cursor: pointer; }
.oc-panel button:hover { background: #3b362a; }
.oc-status { position: absolute; left: 12px; bottom: 10px; right: 12px; color: #d8d2c0; text-shadow: 0 1px 2px #000; pointer-events: none; }
.oc pre { white-space: pre-wrap; font-size: 12px; color: #b9b3a3; max-height: 40vh; overflow: auto; }
`;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, ...kids: (Node | string)[]): HTMLElementTagNameMap[K] {
  const e = Object.assign(document.createElement(tag), props);
  e.append(...kids);
  return e;
}

const MB = (n: number) => (n / 1048576).toFixed(1);

async function run(host: HTMLElement, ctx: GameContext): Promise<{ stop(): void }> {
  host.append(el('style', { textContent: css }));
  const root = el('div', { className: 'oc' });
  const canvas = el('canvas');
  const panel = el('div', { className: 'oc-panel' });
  const status = el('div', { className: 'oc-status' });
  // the site's lobby of a network game (src/lobby.ts), over the original's window
  const lobby = el('div', { className: 'oc-panel' });
  lobby.hidden = true;
  root.append(canvas, status, panel, lobby);
  host.append(root);
  const stopped = () => ctx.signal.aborted;

  // the game's window: a canvas at the page's pixels; its WebGL2 context is made when the original asks SDL for its
  // OpenGL context (rt/gl.ts, with the depth, stencil and multisampling the original asks for)
  const gl = !!document.createElement('canvas').getContext('webgl2');
  canvas.tabIndex = 0;
  let app: OriginalApp | null = null;
  const resize = () => {
    const w = Math.max(1, Math.round(root.clientWidth)), h = Math.max(1, Math.round(root.clientHeight));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    // the original's window gets the new size from SDL (C4Window::HandleSDLEvent: SDL_WINDOWEVENT_SIZE_CHANGED)
    app?.resized(w, h);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(root);
  resize();
  const cleanup = () => observer.disconnect();

  const say = (title: string, note: string, ...more: Node[]) => {
    panel.replaceChildren(el('h1', { textContent: title }), el('p', { className: 'oc-note', textContent: note }), ...more);
    panel.hidden = false;
  };

  if (!gl) {
    say('OpenClonk', 'This browser has no WebGL2, which the port draws with.');
    return { stop: cleanup };
  }
  const missing = missingGroups([...START_GROUPS, ...SCENARIO_FOLDERS, MUSIC_GROUP]);
  if (missing.length) {
    say('OpenClonk', `This build has no content: ${missing.join(', ')} missing (re/openclonk/tools/pack.sh --out web/games/openclonk/assets before the build).`);
    return { stop: cleanup };
  }

  // ---- the content: everything the original's start menu offers (the system groups, the six scenario folders, the
  // music; Play has the first ones in the browser's cache, game.json lazyAssets the others) and the non-commercial files
  const names = [...START_GROUPS, ...SCENARIO_FOLDERS, MUSIC_GROUP];
  const got = new Map<string, [number, number]>();
  const progress = () => {
    let a = 0, b = 0;
    for (const [x, y] of got.values()) { a += x; b += Math.max(x, y); }
    say('OpenClonk', `Loading the original's content… ${MB(a)}${b ? ` of ${MB(b)}` : ''} MB`);
  };
  say('OpenClonk', 'Loading the original\'s content…');
  let groups: ContentGroup[];
  let files: ContentFile[];
  try {
    [groups, files] = await Promise.all([
      Promise.all(names.map((g) => fetchGroup(g, ctx.signal, (x, y) => { got.set(g, [x, y]); progress(); }))),
      fetchNoncommercial(ctx.signal),
    ]);
  } catch (e) {
    if (!stopped()) say('OpenClonk', `The content did not load: ${(e as Error).message}`);
    return { stop: cleanup };
  }
  if (stopped()) return { stop: cleanup };

  // ---- the original's application, started as the installed game is without a scenario: the start menu
  const lines: string[] = [];
  let frameLoop: AbortController | null = null;
  const fail = (what: string, e: unknown) => {
    frameLoop?.abort();
    app = null;
    say('OpenClonk', `${what}: ${String((e as Error)?.message ?? e).split('\n')[0]}`, el('pre', { textContent: lines.slice(-40).join('\n') }));
  };
  // the system's language, which the original's Linux build takes from LANG (setlocale, IsGermanSystem: German or English)
  ENVIRONMENT.LANG = `${(navigator.language || 'en').replace('-', '_')}.UTF-8`;
  const a = new OriginalApp({
    canvas, audio: ctx.audio, groups, files,
    log: (l) => { lines.push(l); if (lines.length > 400) lines.splice(0, 100); },
  });
  // the player's files (src/storage.ts): loaded into the original's user folder before it starts
  const user = new UserFiles(ctx.storage, USER_DATA, { readFile, addFile, isDir, listDir, pack: (p) => a.packFolder(p) });
  let note = '';
  let online: OnlineGames | null = null;
  user.onRefused = (path, why) => {
    note = `Not kept in your storage: ${path || 'a file'} (${why}).`;
    status.textContent = note;
  };
  try {
    say('OpenClonk', 'Decoding the original\'s sounds and music…');
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    a.prepare();
    // network games through the site's rooms (the original's network dialogs are left out)
    online = new OnlineGames(a, ctx, lobby, (t) => { status.textContent = t || note; });
    try {
      await user.load();
    } catch (e) {
      note = `Your player files could not be loaded (${(e as Error).message}); what you change now is not kept.`;
    }
    await a.decodeSounds();
    if (stopped()) return { stop: cleanup };
    app = a;
    if (!a.start()) { fail('The original could not start', 'C4Application::Init failed'); return { stop: cleanup }; }
  } catch (e) {
    fail('The engine stopped while starting', e);
    return { stop: cleanup };
  }
  panel.hidden = true;
  status.textContent = note;
  canvas.focus();
  let leaving = false;
  const leave = async () => {
    if (leaving) return;
    leaving = true;
    frameLoop?.abort();
    app = null;
    // the files the original wrote when it quit (its config) go to the storage before the page goes back
    await Promise.race([user.sync(takeChanges()), new Promise((r) => setTimeout(r, 5000))]).catch(() => {});
    ctx.exit();
  };
  frameLoop = new AbortController();
  let said = '';
  ctx.frame(() => {
    if (!app) return;
    try {
      // the site's lobby before a network game starts: the original waits for it
      if (online && !online.before()) return;
      app.frame();
    } catch (e) {
      fail(`The engine stopped in frame ${app.frameCounter}`, e);
      return;
    }
    const outcome = online?.outcome ?? '';
    if (outcome !== said) { said = outcome; status.textContent = outcome || note; }
    const changed = takeChanges();
    if (changed.length) void user.sync(changed);
    // the original quit (the start menu's "Exit", Esc in the main menu): back to the game page
    if (app.quit) void leave();
  }, frameLoop.signal);

  // ---- keys and the mouse: the page's events as SDL's, which the original's HandleSDLEvent reads
  const onKey = (down: boolean) => (e: KeyboardEvent) => {
    if (!app) return;
    if (app.key(e, down)) e.preventDefault();
  };
  window.addEventListener('keydown', onKey(true), { signal: ctx.signal });
  window.addEventListener('keyup', onKey(false), { signal: ctx.signal });
  canvas.addEventListener('mousemove', (e) => app?.mouseMove(e), { signal: ctx.signal });
  canvas.addEventListener('mousedown', (e) => { canvas.focus(); app?.mouseButton(e, true); e.preventDefault(); }, { signal: ctx.signal });
  window.addEventListener('mouseup', (e) => app?.mouseButton(e, false), { signal: ctx.signal });
  canvas.addEventListener('wheel', (e) => { app?.wheel(e); e.preventDefault(); }, { signal: ctx.signal, passive: false });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault(), { signal: ctx.signal });

  return {
    stop() {
      frameLoop?.abort();
      // the page closes as the original's window does (SDL_QUIT): C4Application::Quit saves the config; what the original
      // wrote last goes out while the connection lasts
      try {
        if (app && !app.quit) app.engine.Application.Quit$v();
      } catch { /* an engine that stopped */ }
      online?.leave();
      app = null;
      void user.sync(takeChanges()).catch(() => {});
      cleanup();
    },
  };
}

export const start: StartGame = (host, ctx) => run(host, ctx);
