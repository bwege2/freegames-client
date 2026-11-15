// The program's thread: the translated Lincity runs here, synchronously as the C program did (its dialogs
// and screens wait in their own event loops). The page shares memory with it: the events (keys, buttons,
// pointer), the pixmap and the palette; the worker posts the files it writes and when it ends.
import { setPlatform, type Platform, type XEv, MapNotify } from './lc/platform.ts';
import { PX } from './lc/pixmap.ts';
import { G } from './lc/g.ts';
import { vfsPut, mkdir, HOME } from './lc/stdio.ts';
import { unpackData, installData } from './data.ts';
import { run } from './lc/main.ts';
import { CTL, eventWaiting, takeEvent, type Shared } from './shared.ts';

export type ToWorker = { t: 'start'; pack: Uint8Array; files: [string, Uint8Array][]; shared: Shared; now: number };
export type FromWorker =
  | { t: 'file'; path: string; data: Uint8Array | null }
  | { t: 'cursor'; pirate: boolean }
  | { t: 'exit'; code: number; results: string }
  | { t: 'error'; message: string };

const post = (m: FromWorker): void => (self as unknown as Worker).postMessage(m);

function start(m: ToWorker): void {
  const { shared } = m;
  const ctl = new Int32Array(shared.ctl);
  const evq = new Int32Array(shared.events);
  const pal = new Uint8Array(shared.palette);
  let pendingMap = false;
  const t0 = performance.now();
  PX.alloc = (n: number) => {
    const v = new Uint8Array(shared.pixels, 0, n);
    v.fill(0);
    return v;
  };
  const p: Platform = {
    // gettimeofday(): microseconds since the program started (re/lincity/NOTES.md, "The clock")
    nowUs: () => Math.floor((performance.now() - t0) * 1000),
    time: () => Math.floor(m.now / 1000),
    sleepUs(us: number) {
      // select(): wait, but wake up for input; at least a millisecond (real_time counts milliseconds)
      const write = Atomics.load(ctl, CTL.WRITE);
      if (eventWaiting(ctl)) return;
      Atomics.wait(ctl, CTL.WRITE, write, Math.max(1, us / 1000));
    },
    pending: () => pendingMap || eventWaiting(ctl),
    nextEvent(): XEv {
      if (pendingMap) {
        pendingMap = false;
        return { type: MapNotify };
      }
      for (;;) {
        const write = Atomics.load(ctl, CTL.WRITE);
        const e = takeEvent(ctl, evq);
        if (e) return { type: e[0], keysym: e[1], ch: e[2], state: e[3], button: e[4], width: e[5], height: e[6] };
        Atomics.wait(ctl, CTL.WRITE, write, 1000);
      }
    },
    pointer: () => [Atomics.load(ctl, CTL.PX), Atomics.load(ctl, CTL.PY)],
    mapWindow() { pendingMap = true; },
    setPalette(palette: Uint8Array) { pal.set(palette); },
    setCursor(pirate: boolean) { post({ t: 'cursor', pirate }); },
    dirty() {
      Atomics.store(ctl, CTL.W, G.pixmap_width);
      Atomics.store(ctl, CTL.H, G.pixmap_height);
      Atomics.add(ctl, CTL.FRAME, 1);
    },
    fileChanged(path: string, data: Uint8Array | null) { post({ t: 'file', path, data: data ? data.slice() : null }); },
  };
  setPlatform(p);
  installData(unpackData(m.pack));
  mkdir(`${HOME}/.lincity`);
  for (const [path, data] of m.files) vfsPut(path, data);
  const code = run();
  post({ t: 'exit', code, results: '' });
}

self.onmessage = (e: MessageEvent<ToWorker>) => {
  if (e.data.t !== 'start') return;
  try {
    start(e.data);
  } catch (err) {
    post({ t: 'error', message: err instanceof Error ? `${err.message}\n${err.stack ?? ''}` : String(err) });
  }
};
