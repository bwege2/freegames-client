// What COW gets from where it runs: the browser (../host.ts) or the replay test (test/replay.ts).
import type { XServer } from '../xlib/xlib.ts';

/** the connection to the Netrek server: one TCP-like byte stream */
export interface Conn {
  /** bytes that arrived and were not read yet (at most max); empty: none yet; null: the server closed */
  read(max: number): Uint8Array | null;
  /** is there something to read (bytes or the end)? */
  readable(): boolean;
  write(bytes: Uint8Array): void;
  close(): void;
}

/** the client's UDP socket's link to the server: datagrams, each one whole or lost */
export interface Datagrams {
  /** the socket is made: datagrams that arrive from now on are kept for it */
  open(): void;
  /** the socket is closed: what was not read is gone, and nothing is kept */
  close(): void;
  send(d: Uint8Array): void;
  /** the next datagram that arrived, or null */
  recv(): Uint8Array | null;
  readable(): boolean;
}

export interface Platform {
  /** the clock: microseconds since 1970 (the oracle's virtual clock in the test) */
  nowUs(): number;
  /** COW waits (select, sleep): until one of the descriptors in fds is readable (the runtime's
   * readable()) or the clock reaches deadline (microseconds; -1: none). Resolves when COW may look again. */
  idle(fds: number[], deadline: number): Promise<void>;
  /** the X server COW's display is */
  x: XServer;
  /** COW connects to its server */
  connect(): Conn | null;
  /** COW makes its UDP socket (at most one at a time) */
  datagrams(): Datagrams;
  /** the process id (the oracle's virtual pid) */
  pid: number;
  /** the login name (getpwuid) */
  login: string;
  /** the home directory, also the working directory */
  home: string;
  /** a file COW wrote changed (its rc file) */
  fileChanged(path: string, data: Uint8Array | null): void;
  /** what COW prints */
  stdout(bytes: Uint8Array): void;
  stderr(bytes: Uint8Array): void;
}

let current: Platform | null = null;

export function setPlatform(p: Platform | null): void {
  current = p;
}

export function platform(): Platform {
  if (!current) throw new Error('no platform');
  return current;
}

/** exit(): ends the program by unwinding it */
export class Exit extends Error {
  status: number;
  constructor(status: number) {
    super(`exit(${status})`);
    this.status = status;
  }
}

/** longjmp(): unwinds to the setjmp() of its jmp_buf (re/netrek/tools/c2ts/emit.py, items()) */
export class LongJmp extends Error {
  env: any;
  val: number;
  constructor(env: any, val: number) {
    super('longjmp');
    this.env = env;
    this.val = val;
  }
}
