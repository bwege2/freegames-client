// Brogue CE 1.15.1 in the browser: the translated program (re/brogue/tools/c2ts) with SDL's platform done
// for the page (host.ts, tiles.ts): its title screen, its games, its files in the player's account storage
// and its high scores in the server's tables (files.ts).
import type { StartGame } from '../../../src/sdk/index.ts';
import tilesPngUrl from '../assets/tiles.png?url';
import tilesBinUrl from '../assets/tiles.bin?url';
import { GameFiles } from './files.ts';
import { quitImmediately } from './game/MainMenu.ts';
import { BrowserPlatform } from './host.ts';
import { decodePng } from './png.ts';
import { runBrogue } from './program.ts';
import { TileSheet } from './tiles.ts';

async function fetchBytes(url: string, signal: AbortSignal): Promise<Uint8Array> {
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return new Uint8Array(await r.arrayBuffer());
}

export const start: StartGame = (host, ctx) => {
  const note = document.createElement('div');
  Object.assign(note.style, { position: 'absolute', inset: '0', display: 'grid', placeItems: 'center', color: '#bbb', background: '#000', font: '16px system-ui, sans-serif' });
  note.textContent = 'Loading Brogue…';
  host.style.position = 'relative';
  host.style.background = '#000';
  host.appendChild(note);
  const message = (text: string) => {
    note.textContent = text;
    note.style.display = 'grid';
    if (!note.isConnected) host.appendChild(note);
  };
  let platform: BrowserPlatform | null = null;
  let files: GameFiles | null = null;

  (async () => {
    const [png, bin] = await Promise.all([fetchBytes(tilesPngUrl, ctx.signal), fetchBytes(tilesBinUrl, ctx.signal)]);
    const sheet = new TileSheet(decodePng(png), bin);
    files = new GameFiles(ctx);
    files.onError = (m) => console.warn(m);
    const initial = await files.load();
    if (ctx.signal.aborted) return;
    note.remove();
    const f = files;
    platform = new BrowserPlatform(host, sheet, ctx.signal, {
      fileChanged: (path, data) => f.changed(path, data),
      canCreate: (path) => f.canCreate(path),
      // the window closed (SDL_QUIT in sdl2-platform.c pollBrogueEvent): the game is saved as it is
      quit: () => {
        quitImmediately();
        void f.flush();
      },
      screenshot: (blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'Screenshot.png';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      },
    });
    const p = platform;
    (window as any).__brogue = { text: () => p.screenText(), idle: () => p.idle };
    ctx.signal.addEventListener('abort', () => delete (window as any).__brogue);
    await runBrogue(platform, [], initial);
    await f.flush();
    if (!ctx.signal.aborted) ctx.exit();
  })().catch((e) => {
    if (ctx.signal.aborted) return;
    console.error(e);
    message(`Brogue stopped: ${e instanceof Error ? e.message : String(e)}`);
  });

  return {
    stop() {
      // the signal aborts: the platform saves the game if one is being played and ends the program
    },
  };
};
