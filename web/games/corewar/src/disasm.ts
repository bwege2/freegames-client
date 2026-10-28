// disasm.c: core cells as text (the assembled listing, cdb's list).
import { g, INDIR_A, INDIR_A_TO_SYM, type Cell } from './global.ts';
import { opname, modname } from './asm.ts';
import { addr_sym } from './token.ts';
import { host } from './host.ts';
import { sprintf } from './libc.ts';

const denormalize = (x: number): number => (x > Math.trunc(g.coreSize / 2) ? x - g.coreSize : x);

const HIDE = 0, SHOW = 1;

/** C's view of a char array index past its end: what follows in memory is unknown, shown as '?' */
const sym = (i: number): string => (i >= 0 && i < addr_sym.length ? addr_sym[i] : '?');

export function cellview(c: Cell, emptyDisp: number): string {
  const op = (c.opcode & 0xf8) >> 3;
  const modifier = c.opcode & 0x07;
  const I = g.INITIALINST;
  if (emptyDisp === SHOW || c.opcode !== I.opcode || c.A_mode !== I.A_mode || c.A_value !== I.A_value ||
    c.B_mode !== I.B_mode || c.B_value !== I.B_value || c.debuginfo !== I.debuginfo)
    return sprintf('%3s%c%-2s %c%6d, %c%6d %4s',
      opname[op] ?? '???',
      g.SWITCH_8 ? ' ' : '.', g.SWITCH_8 ? '  ' : modname[modifier],
      INDIR_A(c.A_mode) ? sym(INDIR_A_TO_SYM(c.A_mode)) : sym(c.A_mode), denormalize(c.A_value),
      INDIR_A(c.B_mode) ? sym(INDIR_A_TO_SYM(c.B_mode)) : sym(c.B_mode), denormalize(c.B_value),
      c.debuginfo ? 'T' : '');
  return '';
}

export function locview(loc: number): string {
  return sprintf('%05d   %s\n', loc, cellview(g.memory.get(loc), HIDE));
}

export function disasm(cells: Cell[], n: number, offset: number): void {
  let s = '';
  if (!g.SWITCH_A) {
    if (SHOW && !g.SWITCH_8 && offset >= 0 && offset < n) s += sprintf('%-6s %3s%3s  %6s\n', '', 'ORG', '', 'START');
  } else s += sprintf('%-6s %3s%3s  %6d\n', '', 'ORG', '', offset);
  for (let i = 0; i < n; ++i) s += sprintf('%-6s %s\n', i === offset && !g.SWITCH_A ? 'START' : '', cellview(cells[i], SHOW));
  if (SHOW && g.SWITCH_8 && offset >= 0 && offset < n) s += sprintf('%-6s %3s%3s  %6s\n', '', 'END', '', 'START');
  host.stdout(s);
}
