// What the program gets from its surroundings, as one object the start of a game sets: the terminal's
// keys, the clock, the login name, the data files of the installation, the files it writes (save
// game, character records) and the score file. The browser (index.ts) and the tests (test/harness.ts)
// each provide one.
import type { Window } from './curses.ts';
import type { HighScore_t } from './structs.ts';

/** struct tm, as localtime() fills it */
export interface Tm {
  tm_sec: number;
  tm_min: number;
  tm_hour: number;
  tm_mday: number;
  /** 0 = January */
  tm_mon: number;
  /** years since 1900 */
  tm_year: number;
  /** 0 = Sunday */
  tm_wday: number;
}

/** The program's working directory: the files it writes and reads back (game.sav, character records). */
export interface FileSystem {
  /** The file's bytes, or null if it does not exist. */
  read(name: string): Uint8Array | null;
  /** Creates or replaces a file; false if it cannot be written (a name the storage cannot keep, no space). */
  write(name: string, data: Uint8Array): boolean;
  /** unlink(); false if it did not exist. */
  remove(name: string): boolean;
  exists(name: string): boolean;
}

/** The score file (scores.dat), shared by everyone: entries best first, as the file keeps them. */
export interface ScoreFile {
  /**
   * recordNewHighScore(): enters a score as the original enters it in scores.dat. Resolves with an
   * error message to print (the file could not be opened) or null.
   */
  record(entry: HighScore_t): Promise<string | null>;
  /** showScoresScreen(): the entries, or an error message to print. */
  read(): Promise<HighScore_t[] | string>;
}

export interface Platform {
  /**
   * getch(): shows `screen` (curses' getch refreshes stdscr), then waits for the next key and returns
   * it as the byte the terminal sends. Rejects when the game is stopped.
   */
  getch(screen: Window): Promise<number>;
  /** A key is waiting: takes it (checkForNonBlockingKeyPress) and returns true. */
  keyWaiting(): boolean;
  /** refresh(): `screen` may be shown now (the browser draws it now and then, and lets keys in). */
  refresh(screen: Window): Promise<void>;
  /** endwin(): the program leaves the screen as `screen` shows it. */
  endwin(screen: Window): void;
  /** The terminal's bell. */
  bell(): void;
  /** time(nullptr): seconds since 1970 */
  time(): number;
  /** localtime() */
  localtime(t: number): Tm;
  /** getlogin(): the player's login name */
  login(): string;
  /** A data file of the installation (data/help.txt, ...): its text, or null. */
  data(path: string): string | null;
  files: FileSystem;
  scores: ScoreFile;
}

let current: Platform | null = null;

export function setPlatform(p: Platform): void {
  current = p;
}

/** The platform of the running game. */
export function platform(): Platform {
  if (!current) throw new Error('moria: no platform');
  return current;
}

/** exit(): ends the program (caught by main) */
export class ProgramExit extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`exit(${status})`);
    this.status = status;
  }
}
