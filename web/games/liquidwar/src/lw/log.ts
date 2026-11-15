// lw/log.ts: src/logcli.c: the original writes its log to stdout; the port keeps it for the console.

export const LOG: string[] = [];
let line = '';

export function log_print_str(s: string): void {
  line += s;
}

export function log_println_str(s: string): void {
  LOG.push(line + s);
  line = '';
}

export function log_println(): void {
  LOG.push(line);
  line = '';
}
