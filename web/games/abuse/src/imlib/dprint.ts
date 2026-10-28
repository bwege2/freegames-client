// imlib/dprint.cpp: the debug printer (the game prints into its console window, game.cpp
// game_printer). Callers format with template strings instead of vsprintf.
let dprint_fun: ((s: string) => void) | null = null;

export function set_dprinter(f: ((s: string) => void) | null): void {
  dprint_fun = f;
}

export function dprintf(s: string): void {
  if (dprint_fun) dprint_fun(s);
}

/** lbreak() and the other fatal errors of the original end the program; the port throws this */
export class AbuseError extends Error {}

export function fatal(msg: string): never {
  throw new AbuseError(msg);
}

/** exit(): the program ends (the port returns to the game page) */
export class ExitProgram extends Error {
  code: number;
  constructor(code: number) {
    super(`exit(${code})`);
    this.code = code;
  }
}

/** printf() to the program's standard output (not the console window); the tests may read it */
let stdout_fun: ((s: string) => void) | null = null;
export function set_stdout(f: ((s: string) => void) | null): void { stdout_fun = f; }
export function stdout_printf(s: string): void {
  if (stdout_fun) stdout_fun(s);
}
