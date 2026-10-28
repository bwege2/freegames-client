// Ballerburg on the website: the program (program.ts, baller1.ts' main) in the SDK's 640x480 pixel
// screen, with the mouse and keys of the original (browser.ts), the sound chip in an audio worklet, and
// online play, which the original did not have, behind a button outside the picture: the shared lobby,
// then one game per round of the room (online.ts). Quitting (q, or Exit program) returns to the game page.
import { PixelScreen, type StartGame } from '../../../src/sdk/index.ts';
import datUrl from '../assets/baller.dat?url';
import musUrl from '../assets/baller.mus?url';
import fontUrl from '../assets/font8x16.bin?url';
import workletUrl from './psg.worklet.ts?worker&url';
import { assets } from './assets.ts';
import { BrowserPlatform, Interrupt } from './browser.ts';
import { SDL_SetPlatform, windowSurface } from './sdl.ts';
import { PsgPlayer, setPsgSink, type PsgWrite } from './psg.ts';
import { runProgram } from './program.ts';
import { g, neues, play, type Name } from './baller1.ts';
import { scr_update, surf } from './screen.ts';
import { Quit } from './ballergui.ts';
import { OnlineRound, describeResults, packRules, rulesNow } from './online.ts';
import { moves } from './moves.ts';
import { randCount } from './random.ts';

/** the sound chip in the audio thread (or, where worklets are not allowed, a ScriptProcessor) */
async function startSound(audio: AudioContext, signal: AbortSignal): Promise<(w: PsgWrite) => void> {
  try {
    await audio.audioWorklet.addModule(workletUrl);
    const node = new AudioWorkletNode(audio, 'ballerburg-psg', { numberOfInputs: 0, outputChannelCount: [2] });
    node.connect(audio.destination);
    signal.addEventListener('abort', () => node.disconnect(), { once: true });
    let batch: PsgWrite[] = [];
    return (w) => {
      // the writes of one go of the game's code arrive together
      if (!batch.length) queueMicrotask(() => {
        node.port.postMessage(batch);
        batch = [];
      });
      batch.push(w);
    };
  } catch {
    const player = new PsgPlayer(audio.sampleRate);
    const node = audio.createScriptProcessor(1024, 0, 2);
    node.onaudioprocess = (e) => {
      const l = e.outputBuffer.getChannelData(0);
      player.render(l);
      e.outputBuffer.getChannelData(1).set(l);
    };
    node.connect(audio.destination);
    signal.addEventListener('abort', () => node.disconnect(), { once: true });
    return (w) => player.apply(w);
  }
}

const css = `
.bb-ui { position: absolute; top: 6px; right: 8px; z-index: 3; display: flex; gap: .6rem; align-items: center;
  font: 13px/1.3 system-ui, sans-serif; color: #fff; }
.bb-ui button { font: inherit; padding: .25rem .7rem; border-radius: 5px; border: 1px solid #fff8; background: #0008; color: #fff; cursor: pointer; }
.bb-ui span { background: #0009; padding: .2rem .5rem; border-radius: 4px; }
.bb-ui span:empty { display: none; }
.bb-lobby { position: absolute; inset: 0; z-index: 4; overflow: auto; background: #000a; }
`;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}): HTMLElementTagNameMap[K] {
  return Object.assign(document.createElement(tag), props);
}

export const start: StartGame = async (host, ctx) => {
  const { signal } = ctx;
  const load = async (u: string) => new Uint8Array(await (await fetch(u, { signal })).arrayBuffer());
  [assets.dat, assets.mus, assets.font] = await Promise.all([load(datUrl), load(musUrl), load(fontUrl)]);

  const screen = new PixelScreen(host, { width: 640, height: 480 }, signal);
  const platform = new BrowserPlatform(host, screen, signal);
  SDL_SetPlatform(platform);
  // for the end-to-end test (games/ballerburg/e2e.mjs): the game's state, and that the frame loop runs
  const debug = { frames: 0, state: () => ({
    online: moves !== null, zug: g.zug, n: g.n, end: g.end, wnd: g.wnd, rand: randCount(), by: [...g.by], ge: [...g.ge], pu: [...g.pu],
    ku: [...g.ku], vo: [...g.vo], st: [...g.st], wx: [...g.wx], prices: [...g.prices], ka: g.ka.map((s) => s.map((k) => [k.x, k.y, k.w, k.p])),
    ft: g.ft.map((s) => s.map((t) => [t.x, t.y])), names: [g.l_nam?.s, g.r_nam?.s],
  }),
  /** a new connection (as after a dropped one): the room is joined again, the round replayed */
  reconnect: (name: string) => ctx.net.rename(name),
  replays: () => (current?.replays ?? 0) + (platform.fast ? 0.5 : 0),
  /** a row of pixels of the window surface and of the drawing surface (0xRRGGBB) */
  pixels: (x: number, y: number, w: number) => [windowSurface(), surf].map((s) => Array.from((s!.pixels as Uint32Array).subarray(y * 640 + x, y * 640 + x + w))) };
  let current: OnlineRound | null = null;
  (window as unknown as { __ballerburg: typeof debug }).__ballerburg = debug;
  ctx.frame(() => {
    debug.frames++;
    platform.flush();
  });
  setPsgSink(await startSound(ctx.audio, signal));

  const style = el('style', { textContent: css });
  const online = el('button', { textContent: 'Play online', title: 'Two players, one castle each, over the internet' });
  const status = el('span');
  const ui = el('div', { className: 'bb-ui' });
  ui.append(status, online);
  const lobby = el('div', { className: 'bb-lobby', hidden: true });
  host.append(style, ui, lobby);

  let running: Promise<void> = Promise.resolve();
  let mode: 'local' | 'online' = 'local';

  /** the game on this computer: the program from its start, or (after online play) a new game */
  const local = (fresh: boolean) => {
    running = (async () => {
      try {
        if (fresh) {
          await runProgram();
        } else {
          neues();
          scr_update(0, 0, 0, 0);
          await play();
        }
        if (!signal.aborted) ctx.exit(); // the player quit
      } catch (e) {
        if (e instanceof Quit) {
          if (!signal.aborted) ctx.exit();
        } else if (!(e instanceof Interrupt)) {
          throw e;
        }
      }
    })();
  };

  /** the shared lobby over the game (whose mouse and keys pause meanwhile); null: cancelled */
  const openLobby = async () => {
    lobby.hidden = false;
    platform.input = false;
    try {
      return await ctx.lobby(lobby, {
        title: 'Ballerburg online',
        seats: { min: 2, max: 2 },
        seatNames: ['Left castle (moves first)', 'Right castle'],
        options: () => packRules(rulesNow()),
      });
    } catch {
      return null;
    } finally {
      lobby.hidden = true;
      lobby.replaceChildren();
      platform.input = true;
      host.focus({ preventScroll: true });
    }
  };

  online.onclick = async () => {
    if (mode !== 'local') return;
    mode = 'online';
    online.hidden = true;
    let round = await openLobby();
    if (!round) {
      // cancelled: the game on this computer goes on
      mode = 'local';
      online.hidden = false;
      return;
    }
    // a round starts: the local game ends; what it had set comes back afterwards
    platform.interrupt(new Interrupt('online'));
    await running.catch(() => {});
    platform.resume();
    const saved = { mod: g.mod, max_rund: g.max_rund, au_kap: g.au_kap, an_erl: g.an_erl, bur: [g.bur[0], g.bur[1]], l_nam: g.l_nam as Name, r_nam: g.r_nam as Name };
    while (round) {
      const r = (current = new OnlineRound(ctx, round, platform));
      r.onStatus = (t) => { status.textContent = t; };
      let end;
      try {
        end = await r.play();
      } catch (e) {
        if (signal.aborted || e instanceof Interrupt) return;
        throw e;
      } finally {
        r.close();
      }
      if (end.kind === 'quit') {
        ctx.exit();
        return;
      }
      if (end.kind === 'left') {
        ctx.rooms.leave();
        break;
      }
      status.textContent = describeResults(end.results, round);
      round = await openLobby(); // the room stays: the next round, or cancel
    }
    if (signal.aborted) return;
    status.textContent = '';
    Object.assign(g, { mod: saved.mod, max_rund: saved.max_rund, au_kap: saved.au_kap, an_erl: saved.an_erl, l_nam: saved.l_nam, r_nam: saved.r_nam });
    g.bur[0] = saved.bur[0];
    g.bur[1] = saved.bur[1];
    mode = 'local';
    online.hidden = false;
    local(false);
  };

  local(true);

  return {
    stop() {
      // the signal ends the program's waits, the listeners, the frame loop and the sound
      setPsgSink(null);
    },
  };
};
