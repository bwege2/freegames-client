// The engine thread in a Web Worker, so that the page stays responsive while it searches. The worker
// runs the engine (src/engine) on the lines the adapter sends (worker-link.ts on the page) and posts
// back what it writes.
//
// A search runs to its end here: a worker cannot read messages while it computes. Fruit reads its pipe
// during a search (event()), for "stop", "ponderhit", "isready" and "quit"; the page handles those
// while the search runs (worker-link.ts). Pondering ("go … ponder") would search until the opponent
// moves; here the ponder search is limited by the time Fruit computes for that move (as it is after
// "ponderhit"), and its "bestmove" is held back until "ponderhit" or "stop" comes, as Fruit's Delay
// holds it. While it is held, the lines Fruit ignores in that state are ignored (README).
import { InProcessEngine } from './engine-link.ts';
import { MemFiles, PKGDATADIR, realClock } from './host.ts';

/** what the page sends */
export type ToWorker =
  | { type: 'start'; book: Uint8Array; replay: string[] }
  | { type: 'write'; data: string };
/** what the worker sends */
export type FromWorker =
  | { type: 'out'; data: string }
  | { type: 'stderr'; data: string }
  | { type: 'quit' }
  | { type: 'ready' }
  /** a search starts (a "go" line) */
  | { type: 'begin'; ponder: boolean; infinite: boolean }
  /** the search ended (its lines, unless held, are out) */
  | { type: 'end' };

const post = (m: FromWorker): void => (self as unknown as Worker).postMessage(m);

let engine: InProcessEngine | null = null;
let muted = false;
/** during a ponder search: the lines of send_best_move() are kept here */
let pondering = false;
let tail: string[] = [];
/** a finished ponder search's last lines, waiting for "ponderhit" or "stop" (Fruit's Delay) */
let held: string[] | null = null;

/** the engine wrote a line (with its '\n') */
function out(data: string): void {
  if (muted) return;
  if (pondering) {
    // the periodic stat lines look like send_best_move()'s: keep them until it is clear which they are
    if (/^info (time .* cpuload|hashfull) /.test(data)) {
      tail.push(data);
      return;
    }
    if (data.startsWith('bestmove')) {
      tail.push(data);
      return;
    }
    for (const t of tail.splice(0)) post({ type: 'out', data: t });
  }
  post({ type: 'out', data });
}

function run(): void {
  if (!engine) return;
  for (;;) {
    const line = engine.peek();
    if (line === undefined) break;
    if (held !== null) {
      // Fruit in Delay: "ponderhit" and "stop" send the best move; go/position/setoption/ucinewgame are ignored
      if (line === 'ponderhit' || line === 'stop') {
        engine.skip();
        for (const t of held) post({ type: 'out', data: t });
        held = null;
        continue;
      }
      if (/^(go |position |setoption |ucinewgame$)/.test(line)) {
        engine.skip();
        continue;
      }
      engine.step();
      continue;
    }
    if (line.startsWith('go ')) {
      const words = line.split(' ');
      const ponder = words.includes('ponder');
      const infinite = words.includes('infinite');
      post({ type: 'begin', ponder, infinite });
      if (ponder) {
        // the ponder search as the timed search it becomes on "ponderhit"
        engine.replaceNext(words.filter((w) => w !== 'ponder').join(' '));
        pondering = true;
        tail = [];
      }
      engine.step();
      if (pondering) {
        pondering = false;
        held = tail;
        tail = [];
      }
      post({ type: 'end' });
      continue;
    }
    engine.step();
  }
}

self.onmessage = (e: MessageEvent<ToWorker>) => {
  const m = e.data;
  if (m.type === 'start') {
    const files = new MemFiles();
    files.map.set(PKGDATADIR + '/smallbook.bin', m.book);
    engine = new InProcessEngine(files, realClock, (s) => post({ type: 'stderr', data: s }));
    engine.start(out, () => post({ type: 'quit' }));
    if (m.replay.length) {
      // a new engine that takes over from one the page stopped: the same options, quietly
      muted = true;
      engine.write(m.replay.map((l) => l + '\n').join(''));
      while (engine.step());
      muted = false;
    }
    post({ type: 'ready' });
  } else if (m.type === 'write') {
    engine?.write(m.data);
    run();
  }
};
