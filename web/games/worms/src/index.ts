// Worms? on the website: the program (worms.ts) on its C64 (machine.ts), the VIC's picture in the SDK's
// pixel screen at the C64's NTSC pixel shape, the SID in an audio worklet, the PC keyboard as the C64's
// (keys.ts), the worm files in the player's storage on the server (files.ts). Online play, which the
// original did not have, is behind a button outside the picture (online.ts). Back stops everything.
import { PixelScreen, type StartGame } from '../../../src/sdk/index.ts';
import chargenUrl from '../assets/chargen.bin?url';
import workletUrl from './sid.worklet.ts?worker&url';
import { Machine, Stopped, FRAME_CYCLES, CPU_HZ } from './machine.ts';
import { Worms } from './worms.ts';
import { renderFrame, FRAME_W, FRAME_H, PIXEL_ASPECT } from './vic.ts';
import { SidPlayer, type SidWrite } from './sid.ts';
import { petscii, REPEATS } from './keys.ts';
import { wormDisk } from './files.ts';
import { Online } from './online.ts';

const FRAME_MS = (1000 * FRAME_CYCLES) / CPU_HZ;

/** the SID in the audio thread (or, where worklets are not allowed, a ScriptProcessor) */
async function startSound(audio: AudioContext, signal: AbortSignal): Promise<(w: SidWrite[]) => void> {
  try {
    await audio.audioWorklet.addModule(workletUrl);
    const node = new AudioWorkletNode(audio, 'worms-sid', { numberOfInputs: 0, outputChannelCount: [2] });
    node.connect(audio.destination);
    signal.addEventListener('abort', () => node.disconnect(), { once: true });
    return (w) => node.port.postMessage(w);
  } catch {
    const player = new SidPlayer(audio.sampleRate);
    const node = audio.createScriptProcessor(1024, 0, 2);
    node.onaudioprocess = (e) => {
      const l = e.outputBuffer.getChannelData(0);
      player.render(l);
      e.outputBuffer.getChannelData(1).set(l);
    };
    node.connect(audio.destination);
    signal.addEventListener('abort', () => node.disconnect(), { once: true });
    return (w) => player.push(w);
  }
}

const css = `
.wm-ui { position: absolute; top: 6px; right: 8px; z-index: 3; display: flex; gap: .4rem; align-items: center; flex-wrap: wrap;
  justify-content: flex-end; font: 13px/1.3 system-ui, sans-serif; color: #fff; max-width: calc(100% - 16px); }
.wm-ui button { font: inherit; padding: .2rem .55rem; border-radius: 5px; border: 1px solid #fff6; background: #0009; color: #fff; cursor: pointer; }
.wm-ui span { background: #0009; padding: .2rem .5rem; border-radius: 4px; }
.wm-ui span:empty { display: none; }
.wm-lobby { position: absolute; inset: 0; z-index: 4; overflow: auto; background: #000a; }
`;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}): HTMLElementTagNameMap[K] {
  return Object.assign(document.createElement(tag), props);
}

export const start: StartGame = async (host, ctx) => {
  const { signal } = ctx;
  const chargen = new Uint8Array(await (await fetch(chargenUrl, { signal })).arrayBuffer());
  const screen = new PixelScreen(host, { width: FRAME_W, height: FRAME_H, pixelAspect: PIXEL_ASPECT, background: '#000' }, signal);
  const seed = crypto.getRandomValues(new Uint32Array(1))[0];
  const m = new Machine(chargen, seed);
  const g = new Worms(m);
  g.disk = wormDisk(ctx.storage);

  // sound: the program's SID writes, with their 6502 time, go to the audio thread
  let pending: SidWrite[] = [];
  let send: ((w: SidWrite[]) => void) | null = null;
  m.onSid = (reg, value, cycles) => {
    if (online.catchingUp()) return;
    if (!pending.length) queueMicrotask(() => {
      if (send) send(pending);
      pending = [];
    });
    pending.push({ reg, value, cycles });
  };
  void startSound(ctx.audio, signal).then((s) => { send = s; }).catch(() => {});

  // the keyboard
  const held = new Map<string, number>();
  const typing = (e: Event) => e.target instanceof Element && !!e.target.closest('input, textarea, select, .wm-lobby');
  window.addEventListener('keydown', (e) => {
    if (typing(e)) return; // the lobby's fields
    const code = petscii(e);
    if (code === null) return;
    e.preventDefault();
    if (e.repeat) return;
    held.set(e.code, code);
    m.keyDown(code, REPEATS.has(code));
  }, { signal, capture: true });
  window.addEventListener('keyup', (e) => {
    const code = held.get(e.code);
    if (code === undefined) return;
    held.delete(e.code);
    m.keyUp(code);
  }, { signal, capture: true });
  window.addEventListener('blur', () => { for (const c of held.values()) m.keyUp(c); held.clear(); }, { signal });

  // buttons outside the picture: online play, and the C64 keys a touch screen lacks
  if (!document.getElementById('wm-css')) document.head.append(el('style', { id: 'wm-css', textContent: css }));
  const ui = el('div', { className: 'wm-ui' });
  const status = el('span');
  const onlineBtn = el('button', { textContent: 'Online game', title: 'Play with up to four people online (each worm a player)' });
  ui.append(status, onlineBtn);
  for (const [label, code] of [['F1', 0x85], ['F3', 0x86], ['F5', 0x87], ['F7', 0x88], ['RUN/STOP', 0x03], ['SPACE', 0x20], ['RETURN', 0x0d]] as const) {
    const b = el('button', { textContent: label, tabIndex: -1 });
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); m.keyDown(code); }, { signal });
    ui.append(b);
  }
  host.append(ui);
  signal.addEventListener('abort', () => ui.remove(), { once: true });
  const online = new Online(ctx, g, host, (s) => { status.textContent = s; });
  online.button = onlineBtn;
  onlineBtn.addEventListener('click', () => void online.open(), { signal });

  // the picture
  const image = screen.ctx.createImageData(FRAME_W, FRAME_H);
  const draw = () => {
    renderFrame(m, image.data);
    screen.ctx.putImageData(image, 0, 0);
  };

  // the program, and the C64's frames at its 59.83 Hz
  let failed: unknown = null;
  void g.run().catch((e) => {
    if (!(e instanceof Stopped)) {
      failed = e;
      console.error('worms', e);
    }
    m.release();
  });
  let acc = 0;
  let busy = false;
  const debug = {
    frames: () => m.frames,
    failed: () => (failed ? String(failed) : null),
    /** the screen as screen codes (for the end-to-end test) */
    screen: () => [...m.ram.subarray(0x400, 0x400 + 1000)],
    worms: () => g.w.map((w) => [...w]),
    online: () => online.state(),
    /** a new connection, as after a dropped one (the end-to-end test) */
    reconnect: (name: string) => ctx.net.rename(name),
  };
  (window as unknown as { __worms?: typeof debug }).__worms = debug;
  ctx.frame((_t, dt) => {
    acc = Math.min(acc + dt, 250);
    if (!busy) {
      busy = true;
      void (async () => {
        try {
          // catching up with an online round (decisions relayed while this page was away): as fast as
          // it goes, silently
          const fast = online.catchingUp();
          for (let n = 0; !signal.aborted && (fast ? n < 600 && online.catchingUp() : acc >= FRAME_MS); n++) {
            if (!fast) acc -= FRAME_MS;
            await m.frame();
          }
        } finally {
          busy = false;
        }
      })();
    }
    draw();
  });

  return {
    stop() {
      m.stop();
      online.close();
    },
  };
};
