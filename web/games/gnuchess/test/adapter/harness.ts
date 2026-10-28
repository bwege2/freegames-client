// A process around the ported adapter (src/adapter) for its tests: in-memory files with the package's
// book, a clock that stands still, and a scripted engine in place of the real one. What the adapter
// writes to the frontend, to stdout and to stderr is recorded, and so is every line the engine gets.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { adapter_engine_data, adapter_exited, adapter_frontend_data, main_adapter } from '../../src/adapter/main.ts';
import { MemFiles, PKGDATADIR } from '../../src/host.ts';
import { bstr } from '../../src/libc.ts';

export const BOOK = readFileSync(join(import.meta.dirname, '..', '..', 'assets', 'smallbook.bin'));

/** what GNU Chess 6.3.0's engine answers to "uci" (the oracle's output) */
export const UCI_REPLY = [
   'id name GNU Chess 6.3.0',
   'id author GNU Chess team',
   'option name Hash type spin default 16 min 4 max 1024',
   'option name Ponder type check default false',
   'option name OwnBook type check default false',
   'option name BookFile type string default /usr/local/share/gnuchess/smallbook.bin',
   'option name NullMove Pruning type combo default Fail High var Always var Fail High var Never',
   'option name NullMove Reduction type spin default 3 min 1 max 3',
   'option name Verification Search type combo default Endgame var Always var Endgame var Never',
   'option name Verification Reduction type spin default 5 min 1 max 6',
   'option name History Pruning type check default true',
   'option name History Threshold type spin default 60 min 0 max 100',
   'option name Futility Pruning type check default false',
   'option name Futility Margin type spin default 100 min 0 max 500',
   'option name Delta Pruning type check default false',
   'option name Delta Margin type spin default 50 min 0 max 500',
   'option name Quiescence Check Plies type spin default 1 min 0 max 2',
   'option name Material type spin default 100 min 0 max 400',
   'option name Piece Activity type spin default 100 min 0 max 400',
   'option name King Safety type spin default 100 min 0 max 400',
   'option name Pawn Structure type spin default 100 min 0 max 400',
   'option name Passed Pawns type spin default 100 min 0 max 400',
   'uciok',
];

export interface Options {
   /** lines the engine answers to a "go" (after the last "position"); none: it searches until "stop" */
   go?: (position: string, go: string) => string[];
   /** time(NULL) for srand() */
   time?: number;
   /** files of the working directory and $HOME */
   files?: Map<string, Uint8Array>;
   env?: Record<string, string>;
   /** the uci answer (default UCI_REPLY) */
   uci?: string[];
}

export class Session {
   frontend = ''; // what the adapter wrote to the frontend's pipe
   stdout = '';
   stderr = '';
   engine: string[] = []; // every line the engine got
   exit: number | null = null;
   initialized = false;
   files: MemFiles;
   private queue: string[] = []; // engine → adapter, not delivered yet
   private searching = false;
   private position = '';
   private hash = '16';
   private opts: Options;

   constructor(opts: Options = {}) {
      this.opts = opts;
      const map = opts.files ?? new Map<string, Uint8Array>();
      map.set(`${PKGDATADIR}/smallbook.bin`, new Uint8Array(BOOK));
      this.files = new MemFiles(map);
   }

   start(): this {
      const env = this.opts.env ?? { HOME: '/home/user' };
      const t = this.opts.time ?? 1000000000;
      main_adapter({
         toFrontend: (data) => {
            this.frontend += data;
         },
         toEngine: (data) => {
            for (const line of data.split('\n').slice(0, -1)) this.engine_line(line);
         },
         stderr: (s) => {
            this.stderr += s;
         },
         stdout: (s) => {
            this.stdout += s;
         },
         initialized: () => {
            this.initialized = true;
         },
         exit: (code) => {
            this.exit = code;
         },
         getenv: (name) => env[name],
         files: this.files,
         clock: { real: () => 0, cpu: () => 0, time: () => t },
      });
      this.pump();
      return this;
   }

   /** the scripted engine */
   private engine_line(line: string): void {
      this.engine.push(line);
      const reply = (...lines: string[]) => this.queue.push(...lines);
      if (line === 'uci') {
         // Fruit's option_list() prints the current values as the defaults
         reply(...(this.opts.uci ?? UCI_REPLY).map((l) => l.replace(/^option name Hash type spin default \d+/, `option name Hash type spin default ${this.hash}`)));
      } else if (line.startsWith('setoption name Hash value ')) this.hash = line.slice('setoption name Hash value '.length);
      if (line === 'isready') reply('readyok');
      else if (line.startsWith('position ')) this.position = line;
      else if (line.startsWith('go')) {
         this.searching = true;
         const lines = this.opts.go?.(this.position, line) ?? [];
         if (lines.some((l) => l.startsWith('bestmove'))) this.searching = false;
         reply(...lines);
      } else if (line === 'stop' || line === 'ponderhit') {
         if (line === 'stop' && this.searching) {
            this.searching = false;
            reply('info time 0 nodes 0 nps 0 cpuload 0', 'bestmove a2a3');
         }
      }
   }

   /** the engine answers "uci" now (for an engine scripted with uci: []) */
   engine_reply_uci(): this {
      this.queue.push(...UCI_REPLY);
      return this.pump();
   }

   /** delivers what the engine sent until nothing is left */
   pump(): this {
      while (this.queue.length > 0) {
         const lines = this.queue.splice(0);
         adapter_engine_data(lines.map((l) => l + '\n').join(''));
      }
      return this;
   }

   /** the frontend writes a line (SendToEngine adds the '\n'), then the engine answers */
   send(line: string): this {
      adapter_frontend_data(line + '\n');
      return this.pump();
   }

   /** what the adapter wrote to the frontend since the last take() */
   take(): string {
      const s = this.frontend;
      this.frontend = '';
      return s;
   }

   /** the engine lines since the last takeEngine() */
   takeEngine(): string[] {
      return this.engine.splice(0);
   }

   get exited(): boolean {
      return adapter_exited();
   }

   file(name: string): string | null {
      const f = this.files.read(name);
      return f === null ? null : bstr(f);
   }
}
