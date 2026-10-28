// The process pMARS runs as: its standard streams, its files, its clock and its X display. The website
// gives it the browser's (index.ts); the tests give it recording ones.
import type { XDisplay } from './display.ts';

export interface Host {
  /** stdout and stderr (byte strings) */
  stdout(s: string): void;
  stderr(s: string): void;
  /** fopen(name, "r") and read it all; null if it cannot be opened */
  readFile(name: string): Promise<string | null>;
  /** fopen(name, "a") + fputs: append to a file (cdb's logfile); false if it cannot be opened */
  appendFile(name: string, data: string): Promise<boolean>;
  /** a line from stdin with its '\n' (fgets), null at EOF */
  readStdin(): Promise<string | null>;
  /** isatty(fileno(stdin)) */
  stdinIsTty: boolean;
  /** time(0) */
  time(): number;
  /** the X window (xwindisp.c) */
  display: XDisplay;
}

/** exit(code): unwinds the whole program */
export class Exit extends Error {
  code: number;
  constructor(code: number) {
    super(`exit ${code}`);
    this.code = code;
  }
}

export let host: Host;
export function set_host(h: Host): void {
  host = h;
}

export const errout = (s: string): void => host.stderr(s);
