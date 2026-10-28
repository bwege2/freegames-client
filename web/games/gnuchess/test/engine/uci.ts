// The engine (src/engine) in-process, driven by UCI lines as the oracle is driven through
// `gnuchess --uci` (re/gnuchess/oracle/drive.py): each line runs to completion, input arrives during a
// search only if a test puts it into `pending`, and time() is the fixed time the oracle runs with
// (GNUCHESS_TIME).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MemFiles, PKGDATADIR, type Clock, type EngineHost } from '../../src/host.ts';
import { loop_step, main_engine } from '../../src/engine/main.ts';

export const ORACLE_TIME = 1000000000;

const book = readFileSync(join(import.meta.dirname, '..', '..', 'assets', 'smallbook.bin'));

export interface Engine {
  /** one line from the adapter (loop_step); returns what the engine printed for it */
  send(line: string): string[];
  /** lines that arrive while a search runs: the engine reads them when it polls (event()) */
  pending: string[];
  quit: boolean;
  stderr: string;
}

/** starts the engine (main_engine): its state is module state, so a new one replaces the previous */
export function start_engine(): Engine {
  let out: string[] = [];
  const files = new MemFiles(new Map([[PKGDATADIR + '/smallbook.bin', new Uint8Array(book)]]));
  const clock: Clock = {
    real: () => performance.now() / 1000,
    cpu: () => performance.now() / 1000,
    time: () => ORACLE_TIME,
  };
  const engine: Engine = {
    send(line: string): string[] {
      out = [];
      loop_step(line);
      return out;
    },
    pending: [],
    quit: false,
    stderr: '',
  };
  const host: EngineHost = {
    send: (line) => out.push(line),
    inputAvailable: () => engine.pending.length > 0,
    getLine: () => engine.pending.shift() ?? null,
    quit: () => {
      engine.quit = true;
    },
    files,
    clock,
    stderr: (s) => {
      engine.stderr += s;
    },
  };
  main_engine(host);
  return engine;
}

/** the lines of an output that do not depend on speed, with the time-dependent values masked */
export function stable_lines(lines: string[]): string[] {
  const kept: string[] = [];
  // the last "info time ... cpuload" (and its "info hashfull") before "bestmove" is send_best_move()'s;
  // the earlier ones are search_send_stat()'s, printed once a second
  let last_stat = -1;
  for (let i = 0; i < lines.length; i++) if (lines[i].startsWith('info time ')) last_stat = i;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('info currmove ')) continue;
    if (line.startsWith('info time ') && i !== last_stat) continue;
    if (line.startsWith('info hashfull ') && i !== last_stat + 1) continue;
    kept.push(line.replace(/\b(time|nps|cpuload) -?\d+/g, '$1 *'));
  }
  return kept;
}
