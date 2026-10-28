// What the game gets from where it runs: the browser (host.ts) or the tests (test/harness.ts).
export interface Platform {
  /** the next key (a byte), or -1 when there are no more (the end of input) */
  getKey(terminal: number[]): Promise<number>;
  /** time passes (the original's msleep: animations); the terminal output so far is shown */
  delay(ms: number, terminal: number[]): Promise<void>;
  /** seconds since 1970 */
  time(): number;
  /** the login name */
  login(): string;
  /** the seed of the n-th opening of /dev/urandom (from 0): 8 bytes, a number below 2^53 */
  seed(n: number): number;
  /** a file of the game changed (null: removed) */
  fileChanged(path: string, data: Uint8Array | null): void;
  /** what the program writes to standard error */
  stderr(bytes: Uint8Array): void;
  /** a draw from the generators (for the tests' count) */
  rngDraw?(): void;
}

let current: Platform | null = null;

export function setPlatform(p: Platform): void {
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
