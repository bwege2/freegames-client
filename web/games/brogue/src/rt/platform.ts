// What the game gets from where it runs: the browser (host.ts) or the tests (test/harness.ts). It is
// Brogue's platform (struct brogueConsole, src/platform/platform.h) plus what the C library takes from
// the system: the clock, the files that must outlive the program, standard output and error.

/** a rogueEvent as the platform fills it in */
export interface BrogueEvent {
  eventType: number;
  param1: number;
  param2: number;
  controlKey: number;
  shiftKey: number;
}

export interface Platform {
  /** wait for the next event (brogueConsole.nextKeyOrMouseEvent) */
  nextKeyOrMouseEvent(ev: BrogueEvent, textInput: boolean, colorsDance: boolean): Promise<void>;
  /** let time pass; true if an event is waiting (brogueConsole.pauseForMilliseconds) */
  pauseForMilliseconds(ms: number, interruptForMouseMove: boolean): Promise<boolean>;
  /** draw one cell (brogueConsole.plotChar): a displayGlyph and colours of 0..100 */
  plotChar(glyph: number, x: number, y: number, fr: number, fg: number, fb: number, br: number, bg: number, bb: number): void;
  /** 0: Shift, 1: Control */
  modifierHeld(modifier: number): boolean;
  /** the game's notifications (game over, victory: brogueConsole.notifyEvent) */
  notifyEvent?(eventId: number, data1: number, data2: number, str1: string, str2: string): void;
  /** switches text/tiles/hybrid (brogueConsole.setGraphicsMode); absent: text only */
  setGraphicsMode?(mode: number): number;
  /** seconds since 1970 */
  time(): number;
  /** localtime() in the local time zone (else UTC, as the oracle runs) */
  readonly localTime?: boolean;
  /** may the program create a file of this name (fopen for writing, rename)? absent: yes */
  canCreate?(path: string): boolean;
  /** brogueConsole.takeScreenshot */
  takeScreenshot?(): boolean;
  /** a file of the game changed (null: removed) */
  fileChanged(path: string, data: Uint8Array | null): void;
  /** what the program writes to standard error */
  stderr(bytes: Uint8Array): void;
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
