// What the GNU Chess process gets from its operating system: files (the working directory and the
// installed data directory), the clock, the environment. The browser gives it the player's account
// storage and the bundled data (index.ts); the tests give it in-memory files and a clock of their own.

/** configure's default pkgdatadir (prefix /usr/local): where smallbook.bin is installed */
export const PKGDATADIR = '/usr/local/share/gnuchess';

export interface Files {
  /** fopen(name, "r") and read it all; null when it cannot be opened */
  read(name: string): Uint8Array | null;
  /** fopen(name, "w") + fwrite + fclose; false when it cannot be opened */
  write(name: string, data: Uint8Array): boolean;
  /** fopen(name, "a") + fwrite + fclose; false when it cannot be opened */
  append(name: string, data: Uint8Array): boolean;
  /** access(name, F_OK) == 0 */
  exists(name: string): boolean;
}

export interface Clock {
  /** wall-clock seconds (gettimeofday), for elapsed times */
  real(): number;
  /** CPU seconds of the process (getrusage), for the engine's cpu load */
  cpu(): number;
  /** time(NULL) */
  time(): number;
}

/**
 * What the engine thread (src/engine, Fruit) sees of the process: its two pipes to the adapter, the
 * flag that makes the program quit, files (OwnBook) and the clock. The engine is driven line by line:
 * main_engine(host) initializes it (main.cpp up to loop()), then loop_step(line) handles each line the
 * adapter sends (protocol.cpp's loop_step without its get()). During a search, event() asks
 * host.inputAvailable() and takes lines with host.getLine(), as Fruit polls its pipe.
 */
export interface EngineHost {
  /** send(): one line to the adapter (the pipe adds the '\n' that fprintf "%s\n" writes) */
  send(line: string): void;
  /** input_available() (posix.cpp): a line from the adapter is waiting */
  inputAvailable(): boolean;
  /** get(): the next waiting line (CR/LF removed, as my_file_read_line() does); null at EOF */
  getLine(): string | null;
  /** set_engine_to_quit(): the frontend's main loop ends (IsEngineToQuit) */
  quit(): void;
  files: Files;
  clock: Clock;
  /** stderr of the process (my_fatal) */
  stderr(s: string): void;
}

/**
 * What the adapter thread (src/adapter, PolyGlot) sees of the process: its pipes to the frontend and to
 * the engine, stderr, files, the clock and the environment. It is driven by data arriving on its two
 * input pipes (adapter_step()'s select()); what blocked in the original (uci_open() waiting for
 * "uciok", the SyncStop waits) continues when the awaited line arrives.
 */
export interface AdapterHost {
  /** write() on pipefd_a2f: bytes to the frontend (lines end with '\n') */
  toFrontend(data: string): void;
  /** write() on pipefd_a2e: bytes to the engine */
  toEngine(data: string): void;
  /** stderr of the process */
  stderr(s: string): void;
  /** pthread_cond_signal(&adapter_init_cond): main_adapter() is done initializing (InitAdapter() waits for it) */
  initialized(): void;
  /** exit(code) from inside the adapter (my_fatal's second error, engine_get() at EOF) */
  exit(code: number): void;
  /** getenv() */
  getenv(name: string): string | undefined;
  files: Files;
  clock: Clock;
}

/** In-memory files, as the tests and the browser use them (the browser writes them through to storage). */
export class MemFiles implements Files {
  readonly map: Map<string, Uint8Array>;
  /** called after a file was written (the browser saves it) */
  onWrite?: (name: string, data: Uint8Array) => void;
  /** a predicate for names that can be created (the browser: what its storage accepts) */
  canCreate: (name: string) => boolean = () => true;

  constructor(map?: Map<string, Uint8Array>) {
    this.map = map ?? new Map();
  }
  read(name: string): Uint8Array | null {
    return this.map.get(name) ?? null;
  }
  write(name: string, data: Uint8Array): boolean {
    if (!this.map.has(name) && !this.canCreate(name)) return false;
    const copy = data.slice();
    this.map.set(name, copy);
    this.onWrite?.(name, copy);
    return true;
  }
  append(name: string, data: Uint8Array): boolean {
    const old = this.map.get(name);
    if (!old) return this.write(name, data);
    const both = new Uint8Array(old.length + data.length);
    both.set(old);
    both.set(data, old.length);
    this.map.set(name, both);
    this.onWrite?.(name, both);
    return true;
  }
  exists(name: string): boolean {
    return this.map.has(name);
  }
}

/** the real clock */
export const realClock: Clock = {
  real: () => performance.now() / 1000,
  cpu: () => performance.now() / 1000,
  time: () => Math.floor(Date.now() / 1000),
};
