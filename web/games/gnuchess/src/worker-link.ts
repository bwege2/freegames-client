// The engine thread as the page reaches it: a Web Worker (worker.ts). The adapter's lines go to the
// worker; while the worker searches it cannot read them, so this side does what Fruit's event() does
// with the lines that arrive during a search (protocol.cpp):
//  * "isready" is answered at once, "quit" ends the program at once;
//  * "stop" ends the search: the worker is stopped and a new one started with the same options
//    (its hash table starts empty), and the best move so far is sent as Fruit sends it (the last
//    "pv" the search printed); Fruit stops only after the first iteration, so this waits for it too;
//  * "position", "go", "setoption" and "ucinewgame" are ignored, as Fruit ignores them while it
//    searches (before a "stop"); lines after a "stop" go to the new engine;
//  * everything else ("ponderhit", "hashon", "uci", ...) waits for the end of the search.
// A search ends with its "bestmove" (Fruit is idle from then on), or, for a ponder search the worker
// holds (worker.ts), with the worker's "end".
import type { EngineLink } from './main.ts';
import type { FromWorker, ToWorker } from './worker.ts';

export class WorkerEngine implements EngineLink {
  private readonly book: Uint8Array;
  private worker: Worker | null = null;
  private out: (data: string) => void = () => {};
  private quit: () => void = () => {};
  private partial = '';
  /** what has to be replayed into a new worker so that it is the same engine */
  private setup: string[] = [];
  /** searches ("go" lines) sent to the worker, and how many of them are over */
  private sent = 0;
  private over = 0;
  /** the worker's search being reported now (begin .. end) is over already (its bestmove came) */
  private currentOver = false;
  private searchStart = 0;
  /** the last "info … pv …" of the running search: its best move and ponder move, its nodes */
  private lastPv: string[] = [];
  private lastNodes = '0';
  private firstIteration = false;
  /** a "stop" came while the first iteration was not done */
  private stopWanted = false;
  /** lines after a "stop", for the new worker */
  private afterStop: string[] | null = null;
  private stopped = false;

  constructor(book: Uint8Array) {
    this.book = book;
  }

  private get searching(): boolean {
    return this.sent > this.over;
  }

  start(out: (data: string) => void, quit: () => void): void {
    this.out = out;
    this.quit = quit;
    this.spawn([]);
  }

  private spawn(replay: string[]): void {
    const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    this.worker = w;
    this.sent = this.over = 0;
    this.currentOver = false;
    w.onmessage = (e: MessageEvent<FromWorker>) => {
      if (w !== this.worker || this.stopped) return;
      this.message(e.data);
    };
    const m: ToWorker = { type: 'start', book: this.book, replay };
    w.postMessage(m);
  }

  private message(m: FromWorker): void {
    switch (m.type) {
      case 'out':
        if (this.searching) this.watch(m.data);
        if (m.data.startsWith('bestmove') && !this.currentOver) {
          this.currentOver = true;
          this.over++;
        }
        this.out(m.data);
        break;
      case 'stderr':
        console.warn('engine:', m.data);
        break;
      case 'quit':
        this.quit();
        break;
      case 'begin':
        this.currentOver = false;
        break;
      case 'end':
        if (!this.currentOver) this.over++;
        this.currentOver = true;
        if (!this.searching) this.searchEnded();
        break;
      case 'ready':
        break;
    }
  }

  /** no search runs any more: a "stop" that waited for the first iteration is moot, its lines go on */
  private searchEnded(): void {
    this.stopWanted = false;
    if (this.afterStop) {
      const queued = this.afterStop;
      this.afterStop = null;
      for (const l of queued) this.line(l);
    }
  }

  /** what the running search printed: its PV lines and the end of its first iteration */
  private watch(line: string): void {
    const pv = /^info depth (\d+) .* nodes (\d+) pv (.*)$/.exec(line.trimEnd());
    if (pv) {
      this.lastPv = pv[3].split(' ');
      this.lastNodes = pv[2];
    }
    if (/^info depth \d+ seldepth \d+ time \d+ nodes \d+ nps/.test(line)) this.firstIteration = true;
    if (this.stopWanted && this.firstIteration && this.lastPv.length) this.stopNow();
  }

  write(data: string): void {
    if (this.stopped) return;
    const all = this.partial + data;
    const lines = all.split('\n');
    this.partial = lines.pop() ?? '';
    for (const l of lines) this.line(l.replace(/\r/g, ''));
  }

  private line(l: string): void {
    if (this.afterStop) {
      this.afterStop.push(l);
      return;
    }
    if (this.searching) {
      if (l === 'isready') {
        this.out('readyok\n');
        return;
      }
      if (l === 'quit') {
        this.quit();
        return;
      }
      if (l === 'stop') {
        this.afterStop = [];
        if (this.firstIteration && this.lastPv.length) this.stopNow();
        else this.stopWanted = true;
        return;
      }
      if (/^(go |position |setoption |ucinewgame$)/.test(l)) return;
      this.post(l); // read after the search
      return;
    }
    if (/^setoption |^hashon$|^hashoff$/.test(l)) this.setup.push(l);
    if (l.startsWith('go ')) {
      this.sent++;
      this.searchStart = performance.now();
      this.lastPv = [];
      this.lastNodes = '0';
      this.firstIteration = false;
    }
    this.post(l);
  }

  private post(l: string): void {
    const m: ToWorker = { type: 'write', data: l + '\n' };
    this.worker?.postMessage(m);
  }

  /** the search is stopped: Fruit's send_best_move() for the best move so far, a new worker, the waiting lines */
  private stopNow(): void {
    this.worker?.terminate();
    this.worker = null;
    this.stopWanted = false;
    const ms = Math.round(performance.now() - this.searchStart);
    const pv = this.lastPv;
    this.out(`info time ${ms} nodes ${this.lastNodes} nps 0 cpuload 1000\n`);
    this.out(pv.length >= 2 ? `bestmove ${pv[0]} ponder ${pv[1]}\n` : `bestmove ${pv[0] ?? '0000'}\n`);
    const queued = this.afterStop ?? [];
    this.afterStop = null;
    this.spawn(['uci', ...this.setup, 'isready']);
    for (const l of queued) this.line(l);
  }

  stop(): void {
    this.stopped = true;
    this.worker?.terminate();
    this.worker = null;
  }
}
