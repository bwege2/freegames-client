// The GNU Go program (gnugo.ts) in a Web Worker, so that the page stays responsive while the computer
// thinks. The page sends the command line, the files of the working directory and the lines typed; the
// worker sends back what the program prints, the files it writes, and how far the search is.
import { GnuGo } from './gnugo.ts';
import { mc_load_patterns_from_db } from './engine/montecarlo.ts';

export type ToWorker =
  | { type: 'start'; argv: string[]; db: string; files: [string, Uint8Array][]; time: number }
  | { type: 'line'; line: string }
  | { type: 'file'; name: string; data: Uint8Array | null };

export type FromWorker =
  | { type: 'out'; s: string }
  | { type: 'err'; s: string }
  | { type: 'read' }
  | { type: 'write'; name: string; data: Uint8Array }
  | { type: 'progress'; done: number; total: number }
  /** played: the game had started (else the program only printed something: --help, an error) */
  | { type: 'exit'; status: number; played: boolean };

const post = (m: FromWorker): void => (self as unknown as Worker).postMessage(m);

/** what the server stores: [A-Za-z0-9._-]{1,64}, 64 files, 512 KiB each, 4 MiB in all */
export const storageName = (n: string): boolean => /^[A-Za-z0-9._-]{1,64}$/.test(n) && n !== '.' && n !== '..';
const MAX_FILES = 64;
const MAX_FILE = 512 * 1024;
const MAX_TOTAL = 4 * 1024 * 1024;

const files = new Map<string, Uint8Array>();
const lines: string[] = [];
let wake: (() => void) | null = null;
let out = '';
let lastProgress = 0;

/** output goes out in pieces, not character by character */
function flush(): void {
  if (out) post({ type: 'out', s: out });
  out = '';
}

function total(except: string): number {
  let t = 0;
  for (const [k, v] of files) if (k !== except) t += v.length;
  return t;
}

function canWrite(name: string, size = 0): boolean {
  if (!storageName(name)) return false;
  if (!files.has(name) && files.size >= MAX_FILES) return false;
  return size <= MAX_FILE && total(name) + size <= MAX_TOTAL;
}

self.onmessage = (e: MessageEvent<ToWorker>) => {
  const m = e.data;
  if (m.type === 'line') {
    lines.push(m.line);
    wake?.();
  } else if (m.type === 'file') {
    if (m.data) files.set(m.name, m.data);
    else files.delete(m.name);
  } else if (m.type === 'start') {
    mc_load_patterns_from_db(m.db);
    for (const [k, v] of m.files) files.set(k, v);
    const prog = new GnuGo({
      out: (s) => {
        out += s;
        if (out.length > 4096) flush();
      },
      err: (s) => {
        flush();
        post({ type: 'err', s });
      },
      readLine: async () => {
        flush();
        if (!lines.length) {
          post({ type: 'read' });
          await new Promise<void>((r) => (wake = r));
          wake = null;
        }
        return lines.shift()!;
      },
      readFile: (name) => (storageName(name) ? (files.get(name) ?? null) : null),
      canWrite: (name) => canWrite(name),
      writeFile: (name, data) => {
        if (!canWrite(name, data.length)) return false;
        files.set(name, data);
        post({ type: 'write', name, data });
        return true;
      },
      progress: (done, all) => {
        const now = Date.now();
        if (now - lastProgress < 200) return;
        lastProgress = now;
        flush();
        post({ type: 'progress', done, total: all });
      },
      time: () => m.time,
    });
    void prog.main(m.argv).then((status) => {
      flush();
      post({ type: 'exit', status, played: prog.played });
    });
  }
};
