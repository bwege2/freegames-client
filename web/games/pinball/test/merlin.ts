// A Merlin-subset 6502 assembler, for the tests only: it assembles Bill Budge's listings
// (re/pinball/orig/src/source_disc*/*.S) so that the original code can run in the test's 6502 core
// (cpu6502.ts) and the port's RAM image (src/image.ts) can be checked against the assembled bytes.
//
// What the listings use, and so what this handles: labels in column 1, `*` comment lines, `;`
// comments, ORG, OBJ (ignored: the load address on Bill Budge's disk), LST, EQU, HEX (with or
// without commas), DA, DS; expressions of labels, `*`, `$hex`, decimals, `+`, `-`, evaluated left
// to right; `#`, `#<`, `#>` immediates. `DA <expr` and `DA >expr` emit one byte: the lengths that
// EDIT.S, RUN2.S, SWAP.S and DISK.S give for the other files' routines (`SETMODE EQU HI+$10F`,
// `DRAWB EQU SETMODE+$25`, ...) only add up that way, and the tables that are read with an index
// (PTBL1, SRADDR, FTBLO, CTBL1LO, BOXLO, ...) need it. A known operand below $100 uses zero page
// when the instruction has a zero page form; a forward reference is absolute (as Merlin does).

export type Mode = 'imp' | 'acc' | 'imm' | 'zp' | 'zpx' | 'zpy' | 'abs' | 'absx' | 'absy' | 'ind' | 'indx' | 'indy' | 'rel';

/** opcode → { mode: byte } */
const OPS: Record<string, Partial<Record<Mode, number>>> = {
  ADC: { imm: 0x69, zp: 0x65, zpx: 0x75, abs: 0x6d, absx: 0x7d, absy: 0x79, indx: 0x61, indy: 0x71 },
  AND: { imm: 0x29, zp: 0x25, zpx: 0x35, abs: 0x2d, absx: 0x3d, absy: 0x39, indx: 0x21, indy: 0x31 },
  ASL: { acc: 0x0a, zp: 0x06, zpx: 0x16, abs: 0x0e, absx: 0x1e },
  BCC: { rel: 0x90 }, BCS: { rel: 0xb0 }, BEQ: { rel: 0xf0 }, BMI: { rel: 0x30 },
  BNE: { rel: 0xd0 }, BPL: { rel: 0x10 }, BVC: { rel: 0x50 }, BVS: { rel: 0x70 },
  BIT: { zp: 0x24, abs: 0x2c },
  BRK: { imp: 0x00 },
  CLC: { imp: 0x18 }, CLD: { imp: 0xd8 }, CLI: { imp: 0x58 }, CLV: { imp: 0xb8 },
  CMP: { imm: 0xc9, zp: 0xc5, zpx: 0xd5, abs: 0xcd, absx: 0xdd, absy: 0xd9, indx: 0xc1, indy: 0xd1 },
  CPX: { imm: 0xe0, zp: 0xe4, abs: 0xec },
  CPY: { imm: 0xc0, zp: 0xc4, abs: 0xcc },
  DEC: { zp: 0xc6, zpx: 0xd6, abs: 0xce, absx: 0xde },
  DEX: { imp: 0xca }, DEY: { imp: 0x88 },
  EOR: { imm: 0x49, zp: 0x45, zpx: 0x55, abs: 0x4d, absx: 0x5d, absy: 0x59, indx: 0x41, indy: 0x51 },
  INC: { zp: 0xe6, zpx: 0xf6, abs: 0xee, absx: 0xfe },
  INX: { imp: 0xe8 }, INY: { imp: 0xc8 },
  JMP: { abs: 0x4c, ind: 0x6c },
  JSR: { abs: 0x20 },
  LDA: { imm: 0xa9, zp: 0xa5, zpx: 0xb5, abs: 0xad, absx: 0xbd, absy: 0xb9, indx: 0xa1, indy: 0xb1 },
  LDX: { imm: 0xa2, zp: 0xa6, zpy: 0xb6, abs: 0xae, absy: 0xbe },
  LDY: { imm: 0xa0, zp: 0xa4, zpx: 0xb4, abs: 0xac, absx: 0xbc },
  LSR: { acc: 0x4a, zp: 0x46, zpx: 0x56, abs: 0x4e, absx: 0x5e },
  NOP: { imp: 0xea },
  ORA: { imm: 0x09, zp: 0x05, zpx: 0x15, abs: 0x0d, absx: 0x1d, absy: 0x19, indx: 0x01, indy: 0x11 },
  PHA: { imp: 0x48 }, PHP: { imp: 0x08 }, PLA: { imp: 0x68 }, PLP: { imp: 0x28 },
  ROL: { acc: 0x2a, zp: 0x26, zpx: 0x36, abs: 0x2e, absx: 0x3e },
  ROR: { acc: 0x6a, zp: 0x66, zpx: 0x76, abs: 0x6e, absx: 0x7e },
  RTI: { imp: 0x40 }, RTS: { imp: 0x60 },
  SBC: { imm: 0xe9, zp: 0xe5, zpx: 0xf5, abs: 0xed, absx: 0xfd, absy: 0xf9, indx: 0xe1, indy: 0xf1 },
  SEC: { imp: 0x38 }, SED: { imp: 0xf8 }, SEI: { imp: 0x78 },
  STA: { zp: 0x85, zpx: 0x95, abs: 0x8d, absx: 0x9d, absy: 0x99, indx: 0x81, indy: 0x91 },
  STX: { zp: 0x86, zpy: 0x96, abs: 0x8e },
  STY: { zp: 0x84, zpx: 0x94, abs: 0x8c },
  TAX: { imp: 0xaa }, TAY: { imp: 0xa8 }, TSX: { imp: 0xba }, TXA: { imp: 0x8a }, TXS: { imp: 0x9a }, TYA: { imp: 0x98 },
};

const SIZE: Record<Mode, number> = { imp: 1, acc: 1, imm: 2, zp: 2, zpx: 2, zpy: 2, abs: 3, absx: 3, absy: 3, ind: 3, indx: 2, indy: 2, rel: 2 };

export interface Line {
  /** 1-based line number in the source */
  n: number;
  text: string;
  label?: string;
  op?: string;
  operand?: string;
  /** address of the line's first byte (for EQU: none) */
  addr: number;
  size: number;
}

export interface Assembly {
  name: string;
  /** the first ORG */
  org: number;
  /** one past the last byte written */
  end: number;
  /** 64 KiB; only `written` bytes are the file's */
  mem: Uint8Array;
  written: Uint8Array;
  symbols: Map<string, number>;
  /** labels of lines that emit code or data (not EQU constants), with their addresses */
  labels: Map<string, number>;
  lines: Line[];
}

class AsmError extends Error {}

/** Assembles one listing. `pre` defines symbols before the file's own (not needed by these files). */
export function assemble(source: string, name: string): Assembly {
  const raw = source.replace(/\r/g, '').split('\n');
  const lines: Line[] = raw.map((text, i) => parseLine(text, i + 1));
  const symbols = new Map<string, number>();
  const labels = new Map<string, number>();
  // mode decided in pass 1 for each instruction line (pass 2 must keep the sizes)
  const modes = new Map<number, Mode>();
  let org = -1;

  for (const pass of [1, 2]) {
    let pc = 0;
    const mem = new Uint8Array(0x10000);
    const written = new Uint8Array(0x10000);
    let end = 0;
    const emit = (b: number) => {
      mem[pc & 0xffff] = b & 0xff;
      written[pc & 0xffff] = 1;
      pc++;
      if (pc > end) end = pc;
    };
    for (const ln of lines) {
      const at = `${name}:${ln.n}: ${ln.text.trim()}`;
      try {
        if (!ln.op) {
          if (ln.label) define(ln.label, pc, true);
          ln.addr = pc;
          ln.size = 0;
          continue;
        }
        const op = ln.op;
        const opd = ln.operand ?? '';
        if (op === 'EQU') {
          const v = evaluate(opd, pc, symbols, pass === 2);
          if (!ln.label) throw new AsmError('EQU without label');
          if (v !== undefined) define(ln.label, v, false);
          ln.addr = v ?? 0;
          ln.size = 0;
          continue;
        }
        if (ln.label) define(ln.label, pc, true);
        ln.addr = pc;
        const start = pc;
        if (op === 'ORG') {
          const v = evaluate(opd, pc, symbols, true);
          if (v === undefined) throw new AsmError('ORG needs known symbols');
          pc = v;
          if (org < 0) org = v;
          ln.addr = pc;
        } else if (op === 'OBJ' || op === 'LST') {
          // OBJ: where Bill Budge's assembler put the object code in its own memory; not the load address
        } else if (op === 'HEX') {
          const hex = opd.replace(/,/g, '');
          if (!/^([0-9A-Fa-f]{2})+$/.test(hex)) throw new AsmError('bad HEX');
          for (let i = 0; i < hex.length; i += 2) emit(parseInt(hex.slice(i, i + 2), 16));
        } else if (op === 'DA') {
          for (const part of splitArgs(opd)) {
            const p = part.trim();
            if (p.startsWith('<') || p.startsWith('>')) {
              const v = evaluate(p.slice(1), pc, symbols, pass === 2) ?? 0;
              emit(p[0] === '<' ? v & 0xff : (v >> 8) & 0xff);
            } else {
              const v = evaluate(p, pc, symbols, pass === 2) ?? 0;
              emit(v & 0xff);
              emit((v >> 8) & 0xff);
            }
          }
        } else if (op === 'DS') {
          const v = evaluate(opd, pc, symbols, true);
          if (v === undefined) throw new AsmError('DS needs a known size');
          for (let i = 0; i < v; i++) emit(0);
        } else if (OPS[op]) {
          const forms = OPS[op];
          let mode: Mode;
          let value = 0;
          const o = opd.trim();
          if (o === '') {
            mode = forms.imp !== undefined ? 'imp' : 'acc';
          } else if (forms.rel !== undefined) {
            mode = 'rel';
            value = evaluate(o, pc, symbols, pass === 2) ?? pc;
          } else if (o.startsWith('#')) {
            mode = 'imm';
            let e = o.slice(1);
            let sel = '';
            if (e.startsWith('<') || e.startsWith('>')) {
              sel = e[0];
              e = e.slice(1);
            }
            const v = evaluate(e, pc, symbols, pass === 2) ?? 0;
            value = sel === '>' ? (v >> 8) & 0xff : v & 0xff;
          } else if (/^\(.*\),Y$/i.test(o)) {
            mode = 'indy';
            value = evaluate(o.slice(1, o.lastIndexOf(')')), pc, symbols, pass === 2) ?? 0;
          } else if (/^\(.*,X\)$/i.test(o)) {
            mode = 'indx';
            value = evaluate(o.slice(1, o.toUpperCase().lastIndexOf(',X')), pc, symbols, pass === 2) ?? 0;
          } else if (/^\(.*\)$/.test(o)) {
            mode = 'ind';
            value = evaluate(o.slice(1, -1), pc, symbols, pass === 2) ?? 0;
          } else {
            let idx = '';
            let e = o;
            const m = /^(.*),([XY])$/i.exec(o);
            if (m) {
              e = m[1];
              idx = m[2].toUpperCase();
            }
            const v = evaluate(e, pc, symbols, pass === 2);
            if (pass === 1) {
              const zp = v !== undefined && v < 0x100;
              const want: Mode = idx === 'X' ? (zp ? 'zpx' : 'absx') : idx === 'Y' ? (zp ? 'zpy' : 'absy') : zp ? 'zp' : 'abs';
              let chosen = want;
              if (forms[chosen] === undefined) {
                const wide: Mode = idx === 'X' ? 'absx' : idx === 'Y' ? 'absy' : 'abs';
                chosen = wide;
              }
              modes.set(ln.n, chosen);
            }
            mode = modes.get(ln.n)!;
            value = v ?? 0;
          }
          const code = forms[mode];
          if (code === undefined) throw new AsmError(`${op} has no ${mode} form`);
          emit(code);
          if (mode === 'rel') {
            const off = value - (pc + 1);
            if (pass === 2 && (off < -128 || off > 127)) throw new AsmError('branch out of range');
            emit(off & 0xff);
          } else if (SIZE[mode] === 2) {
            if (pass === 2 && mode !== 'imm' && value > 0xff) throw new AsmError('zero page operand above $FF');
            emit(value);
          } else if (SIZE[mode] === 3) {
            emit(value & 0xff);
            emit((value >> 8) & 0xff);
          }
        } else {
          throw new AsmError(`unknown opcode ${op}`);
        }
        ln.size = pc - start;
      } catch (e) {
        if (e instanceof AsmError) throw new Error(`${at}: ${e.message}`);
        throw e;
      }
    }
    if (pass === 2) {
      return { name, org, end, mem, written, symbols, labels, lines };
    }
  }
  throw new Error('unreachable');

  function define(label: string, v: number, isLabel: boolean): void {
    const old = symbols.get(label);
    if (old !== undefined && old !== v) {
      // pass 2 may only confirm what pass 1 found
      throw new AsmError(`${label} redefined: $${old.toString(16)} -> $${v.toString(16)}`);
    }
    symbols.set(label, v);
    if (isLabel) labels.set(label, v);
  }
}

function parseLine(text: string, n: number): Line {
  const ln: Line = { n, text, addr: 0, size: 0 };
  if (text.trim() === '' || text.startsWith('*') || text.startsWith(';')) return ln;
  // a `;` comment, but not inside an operand (no strings in these listings)
  const semi = text.indexOf(';');
  const body = semi >= 0 ? text.slice(0, semi) : text;
  const parts = body.split(/\s+/);
  // parts[0] is the label ('' when the line starts with a blank)
  if (parts[0] !== '') ln.label = parts[0];
  if (parts.length > 1 && parts[1] !== '') ln.op = parts[1].toUpperCase();
  if (parts.length > 2) ln.operand = parts.slice(2).join('');
  return ln;
}

function splitArgs(s: string): string[] {
  return s.split(',').filter((x) => x.trim() !== '');
}

/** Merlin expressions as these listings use them: terms joined by + and -, left to right. */
export function evaluate(expr: string, pc: number, symbols: Map<string, number>, mustKnow: boolean): number | undefined {
  const s = expr.trim();
  if (s === '') throw new AsmError('empty expression');
  let i = 0;
  let total = 0;
  let sign = 1;
  let unknown = false;
  let first = true;
  while (i < s.length) {
    if (!first) {
      const c = s[i];
      if (c === '+') sign = 1;
      else if (c === '-') sign = -1;
      else throw new AsmError(`bad operator in ${s}`);
      i++;
    } else if (s[i] === '-') {
      sign = -1;
      i++;
    }
    first = false;
    let v: number | undefined;
    if (s[i] === '*') {
      v = pc;
      i++;
    } else if (s[i] === '$') {
      const m = /^[0-9A-Fa-f]+/.exec(s.slice(i + 1));
      if (!m) throw new AsmError(`bad hex in ${s}`);
      v = parseInt(m[0], 16);
      i += 1 + m[0].length;
    } else if (/[0-9]/.test(s[i])) {
      const m = /^[0-9]+/.exec(s.slice(i))!;
      v = parseInt(m[0], 10);
      i += m[0].length;
    } else {
      const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(s.slice(i));
      if (!m) throw new AsmError(`bad term in ${s}`);
      v = symbols.get(m[0]);
      if (v === undefined) {
        if (mustKnow) throw new AsmError(`undefined symbol ${m[0]}`);
        unknown = true;
      }
      i += m[0].length;
    }
    total += sign * (v ?? 0);
  }
  return unknown ? undefined : total & 0xffff;
}

/** The listings, by the names this port uses for them. */
export const FILES = {
  CDRAW: 'source_disc1/CDRAW.S',
  PPAK: 'source_disc1/PPAK.S',
  RUN2: 'source_disc1/RUN2.S',
  EDIT: 'source_disc1/EDIT.S',
  RUN: 'source_disc2/RUN.S',
  WIRE: 'source_disc2/WIRE.S',
  DISK: 'source_disc2/DISK.S',
  SWAP: 'source_disc2/SWAP.S',
  BOOT2: 'source_disc2/BOOT2.S',
} as const;
