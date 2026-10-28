// EA FORTH rebuilt for the tests: a fig-FORTH outer interpreter and compiler (TypeScript) that builds the
// dictionary in the 6502's memory (fig-FORTH's layout: name field, link field, code field, parameter
// field), with the kernel of kernel.fth.ts and the game's screens compiled into it, read from the
// original disk in the order of the disk's own load screen. Everything compiled runs on the 6502 core
// (cpu6502.ts in c64.ts): the kernel's primitives, the game's high-level words as threaded code, the
// game's CODE words as the machine code its assembler text gives. Only defining words, compiling words
// and a few printing helpers are TypeScript ("host" words, reached through trap addresses when 6502
// code calls them).
import { C64 } from './c64.ts';
import { KERNEL } from './kernel.fth.ts';
import * as K from '../src/kernal.ts';

export const ZP = { N: 0x20, XSAVE: 0x28, W: 0x2a, IP: 0x2c, S0: 0x90 } as const;
/** where the dictionary starts, the system variables, the host words' trap addresses */
export const ORIGIN = 0x2100;
const VARS = 0xc000;
const DP = VARS;
const BASE = VARS + 2;
const DISP = VARS + 4;
const THREADS = 0xc100;
const TRAPS = 0xc800;

export interface Word {
  name: string;
  nfa: number;
  cfa: number;
  pfa: number;
  immediate?: boolean;
  /** TypeScript behaviour (host word) */
  host?: () => void;
}

interface Source {
  blk: number;
  text: string;
  in: number;
}

/** D64 → EA FORTH's 1024-byte blocks (track 18 sectors 0 and 1 are left out, re/worms/NOTES.md). */
export function d64Blocks(d64: Uint8Array): Uint8Array {
  const out = new Uint8Array(d64.length - 2 * 256);
  out.set(d64.subarray(0, 357 * 256), 0);
  out.set(d64.subarray(359 * 256), 357 * 256);
  return out;
}

export class EaForth {
  readonly m: C64;
  private readonly words = new Map<string, Word>();
  private readonly byCfa = new Map<number, Word>();
  private readonly asm = new Map<string, () => void>();
  readonly labels = new Map<string, number>();
  private latest = 0;
  private state = 0;
  private code = false;
  private src: Source[] = [];
  private blocks: Uint8Array = new Uint8Array(0);
  private nextTrap = TRAPS;
  private halted = false;
  private depth = 0;
  private cstack: number[] = [];
  private mode: 'abs' | 'imm' | 'x' | 'y' | 'indy' | 'indx' | 'ind' | 'acc' = 'abs';
  private smudged: Word | null = null;
  private haltCfa = 0;
  /** the words entered through DOCOL, by code field address: hooks for the tests */
  readonly onEnter = new Map<number, () => void>();

  constructor(m: C64) {
    this.m = m;
    this.w16(DP, ORIGIN);
    this.w16(BASE, 16); // the kernel is in HEX
    m.ram[ZP.W - 1] = 0x6c;
    m.cpu.x = ZP.S0;
    this.hostWords();
    this.assembler();
    this.interpretText(KERNEL);
    const docol = this.labels.get('DOCOL')!;
    m.watchPc(docol, () => {
      const cfa = this.r16(ZP.W);
      const h = this.onEnter.get(cfa);
      if (h) h();
    });
  }

  // ---- memory and stacks ----
  r16(a: number): number {
    return this.m.ram[a] | (this.m.ram[(a + 1) & 0xffff] << 8);
  }

  w16(a: number, v: number): void {
    this.m.write(a, v & 0xff);
    this.m.write((a + 1) & 0xffff, (v >> 8) & 0xff);
  }

  get here(): number {
    return this.r16(DP);
  }

  set here(v: number) {
    this.w16(DP, v);
  }

  push(v: number): void {
    const cpu = this.m.cpu;
    cpu.x = (cpu.x - 2) & 0xff;
    this.m.ram[cpu.x] = v & 0xff;
    this.m.ram[(cpu.x + 1) & 0xff] = (v >> 8) & 0xff;
  }

  pop(): number {
    const cpu = this.m.cpu;
    if (cpu.x >= ZP.S0) throw new Error('stack empty');
    const v = this.m.ram[cpu.x] | (this.m.ram[(cpu.x + 1) & 0xff] << 8);
    cpu.x = (cpu.x + 2) & 0xff;
    return v;
  }

  /** signed */
  pops(): number {
    const v = this.pop();
    return v & 0x8000 ? v - 0x10000 : v;
  }

  stackDepth(): number {
    return (ZP.S0 - this.m.cpu.x) / 2;
  }

  comma(v: number): void {
    const h = this.here;
    this.w16(h, v);
    this.here = h + 2;
  }

  ccomma(v: number): void {
    const h = this.here;
    this.m.write(h, v & 0xff);
    this.here = h + 1;
  }

  // ---- dictionary ----
  find(name: string): Word | undefined {
    return this.words.get(name);
  }

  word(name: string): Word {
    const w = this.words.get(name);
    if (!w) throw new Error(`no word ${name}`);
    return w;
  }

  nameOf(cfa: number): string | undefined {
    return this.byCfa.get(cfa)?.name;
  }

  /** fig-FORTH's CREATE: name field (count | $80, last character | $80), link field, code field */
  private create(name: string, cfaValue?: number): Word {
    const nfa = this.here;
    const bytes = [...name].map((c) => c.charCodeAt(0) & 0xff).slice(0, 31);
    this.ccomma(0x80 | bytes.length);
    bytes.forEach((b, i) => this.ccomma(i === bytes.length - 1 ? b | 0x80 : b));
    this.comma(this.latest);
    this.latest = nfa;
    const cfa = this.here;
    const pfa = cfa + 2;
    this.comma(cfaValue ?? pfa);
    const w: Word = { name, nfa, cfa, pfa };
    this.words.set(name, w);
    this.byCfa.set(cfa, w);
    return w;
  }

  /** a TypeScript word; with `callable` it gets a header whose code is a trap (6502 code may run it) */
  private host(name: string, fn: () => void, o: { immediate?: boolean; callable?: boolean } = {}): void {
    if (o.callable) {
      const addr = this.nextTrap++;
      this.m.trap(addr, () => {
        fn();
        this.m.cpu.pc = this.labels.get('NEXT')!;
      });
      const w = this.create(name, addr);
      w.host = fn;
      w.immediate = o.immediate;
      return;
    }
    const w: Word = { name, nfa: 0, cfa: 0, pfa: 0, host: fn, immediate: o.immediate };
    this.words.set(name, w);
  }

  // ---- running 6502 code ----
  /** Executes one word on the 6502 (nested calls allowed). */
  run(cfa: number, limit = Infinity): void {
    const t = THREADS + this.depth * 4;
    this.w16(t, cfa);
    this.w16(t + 2, this.haltCfa);
    const ip = this.r16(ZP.IP);
    const pc = this.m.cpu.pc;
    this.w16(ZP.IP, t);
    this.m.cpu.pc = this.labels.get('NEXT')!;
    this.depth++;
    try {
      this.m.run(() => {
        if (!this.halted) return false;
        this.halted = false;
        return true;
      }, limit);
    } finally {
      this.depth--;
    }
    this.w16(ZP.IP, ip);
    this.m.cpu.pc = pc;
  }

  execute(w: Word): void {
    if (w.host) w.host();
    else this.run(w.cfa);
  }

  // ---- the input stream ----
  private get cur(): Source {
    return this.src[this.src.length - 1];
  }

  /** the next blank-delimited word of the input, or null at its end */
  private next(): string | null {
    const s = this.cur;
    if (!s) return null;
    while (s.in < s.text.length && s.text.charCodeAt(s.in) <= 0x20) s.in++;
    if (s.in >= s.text.length) return null;
    const start = s.in;
    while (s.in < s.text.length && s.text.charCodeAt(s.in) > 0x20) s.in++;
    return s.text.slice(start, s.in);
  }

  private needName(): string {
    const n = this.next();
    if (n === null) throw new Error('name expected');
    return n;
  }

  /** the rest of the input up to `delim` (after the one blank that ends the word before) */
  private upTo(delim: string): string {
    const s = this.cur;
    s.in++;
    const end = s.text.indexOf(delim, s.in);
    const e = end < 0 ? s.text.length : end;
    const r = s.text.slice(s.in, e);
    s.in = e + 1;
    return r;
  }

  private number(tok: string): number | null {
    const base = this.r16(BASE);
    let neg = false;
    let t = tok;
    if (t.startsWith('-') && t.length > 1) {
      neg = true;
      t = t.slice(1);
    }
    let v = 0;
    for (const ch of t) {
      const c = ch.charCodeAt(0);
      const d = c >= 0x30 && c <= 0x39 ? c - 0x30 : c >= 0x41 && c <= 0x5a ? c - 0x41 + 10 : 99;
      if (d >= base) return null;
      v = v * base + d;
    }
    return (neg ? -v : v) & 0xffff;
  }

  private interpretSource(): void {
    const level = this.src.length;
    while (this.src.length >= level) {
      const tok = this.next();
      if (tok === null) {
        this.src.pop();
        continue;
      }
      this.interpretWord(tok);
    }
  }

  private interpretWord(tok: string): void {
    try {
      this.interpretWord1(tok);
    } catch (e) {
      const where = this.src.length ? `block ${this.cur.blk} offset ${this.cur.in}` : '';
      if (e instanceof Error && !e.message.includes(' | at ')) e.message += ` | at ${tok} ${where}`;
      throw e;
    }
  }

  private interpretWord1(tok: string): void {
    if (this.code) {
      const a = this.asm.get(tok);
      if (a) {
        a();
        return;
      }
    }
    const w = this.words.get(tok);
    if (w) {
      if (this.state && !w.immediate) {
        if (!w.cfa) throw new Error(`${tok} cannot be compiled`);
        this.comma(w.cfa);
      } else this.execute(w);
      return;
    }
    const n = this.number(tok);
    if (n === null) throw new Error(`${tok} ? (block ${this.cur?.blk})`);
    if (this.state) this.literal(n);
    else this.push(n);
  }

  interpretText(text: string): void {
    this.src.push({ blk: -1, text, in: 0 });
    this.interpretSource();
  }

  /** LOAD: interprets block n */
  load(n: number): void {
    const b = this.blocks.subarray(n * 1024, n * 1024 + 1024);
    this.src.push({ blk: n, text: String.fromCharCode(...b), in: 0 });
    this.interpretSource();
  }

  /** Compiles the game: the disk's blocks, then its load screen (block 120). */
  loadGame(blocks: Uint8Array): void {
    this.blocks = blocks;
    this.load(120);
  }

  private literal(n: number): void {
    this.comma(this.word('LIT').cfa);
    this.comma(n);
  }

  private compile(name: string): void {
    this.comma(this.word(name).cfa);
  }

  // ---- host words: the compiler, defining words, and the load screen's EA FORTH words ----
  private hostWords(): void {
    // the halt word that ends run()
    const halt = this.nextTrap++;
    this.m.trap(halt, () => { this.halted = true; });
    this.haltCfa = this.create('(HALT)', halt).cfa;

    // bootstrap arithmetic for the kernel's assembler operands (the kernel's own words replace them)
    this.host('+', () => { const b = this.pop(); this.push(this.pop() + b); });
    this.host('-', () => { const b = this.pop(); this.push(this.pop() - b); });
    this.host('1+', () => this.push(this.pop() + 1));
    this.host('1-', () => this.push(this.pop() - 1));
    this.host('2+', () => this.push(this.pop() + 2));

    this.host('CONSTANT', () => {
      this.create(this.needName(), this.labels.get('DOCON'));
      this.comma(this.pop());
    }, { callable: true });
    this.host('VARIABLE', () => {
      this.create(this.needName(), this.labels.get('DOVAR'));
      this.comma(this.pop());
    }, { callable: true });
    this.host(':', () => {
      const name = this.needName();
      const prev = this.words.get(name);
      const w = this.create(name, this.labels.get('DOCOL'));
      // smudged until ; : the word's own name still finds an earlier definition
      if (prev) this.words.set(name, prev);
      else this.words.delete(name);
      this.smudged = w;
      this.state = 1;
    });
    this.host(';', () => {
      this.compile('(;S)');
      this.state = 0;
      if (this.smudged) this.words.set(this.smudged.name, this.smudged);
      this.smudged = null;
    }, { immediate: true });
    this.host('CODE', () => {
      const name = this.needName();
      const prev = this.words.get(name);
      const w = this.create(name);
      // smudged until END-CODE, as in fig: "BOT 1+" inside CODE 1+ means the earlier 1+
      if (prev) this.words.set(name, prev);
      else this.words.delete(name);
      this.smudged = w;
      this.code = true;
      this.mode = 'abs';
    });
    this.host('END-CODE', () => {
      this.code = false;
      if (this.smudged) this.words.set(this.smudged.name, this.smudged);
      this.smudged = null;
    });
    this.host('LABEL', () => {
      this.labels.set(this.needName(), this.here);
      this.code = true;
    });
    this.host("'", () => {
      const w = this.word(this.needName());
      if (this.state) this.literal(w.pfa);
      else this.push(w.pfa);
    }, { immediate: true });
    this.host('[', () => { this.state = 0; }, { immediate: true });
    this.host(']', () => { this.state = 1; });
    this.host('LITERAL', () => { if (this.state) this.literal(this.pop()); }, { immediate: true });
    this.host('(', () => { this.upTo(')'); }, { immediate: true });
    this.host('\\', () => {
      const s = this.cur;
      s.in = s.blk < 0 ? (s.text.indexOf('\n', s.in) + 1 || s.text.length) : Math.ceil(s.in / 64) * 64;
    }, { immediate: true });
    this.host('."', () => {
      const str = this.upTo('"');
      if (this.state) {
        this.compile('(.")');
        this.ccomma(str.length);
        for (const ch of str) this.ccomma(ch.charCodeAt(0));
      } else for (const ch of str) K.chrout(this.m, ch.charCodeAt(0));
    }, { immediate: true });
    this.host(';S', () => {
      if (this.state) this.compile('(;S)');
      else this.src.pop();
    }, { immediate: true });
    this.host('-->', () => {
      const s = this.src.pop()!;
      this.load(s.blk + 1);
    }, { immediate: true });
    this.host('THRU', () => {
      const b = this.pop();
      const a = this.pop();
      for (let n = a; n <= b; n++) this.load(n);
    });
    // control structures (fig-FORTH: relative branch offsets)
    const ctl = (name: string, fn: () => void) => this.host(name, fn, { immediate: true });
    ctl('IF', () => { this.compile('0BRANCH'); this.cstack.push(this.here); this.comma(0); });
    ctl('ELSE', () => {
      this.compile('BRANCH');
      const a = this.here;
      this.comma(0);
      const f = this.cstack.pop()!;
      this.w16(f, this.here - f);
      this.cstack.push(a);
    });
    const then = () => { const f = this.cstack.pop()!; this.w16(f, this.here - f); };
    ctl('THEN', then);
    ctl('ENDIF', then);
    ctl('BEGIN', () => this.cstack.push(this.here));
    ctl('UNTIL', () => { this.compile('0BRANCH'); this.comma(this.cstack.pop()! - this.here); });
    ctl('AGAIN', () => { this.compile('BRANCH'); this.comma(this.cstack.pop()! - this.here); });
    ctl('WHILE', () => { this.compile('0BRANCH'); this.cstack.push(this.here); this.comma(0); });
    ctl('REPEAT', () => {
      const w = this.cstack.pop()!;
      const b = this.cstack.pop()!;
      this.compile('BRANCH');
      this.comma(b - this.here);
      this.w16(w, this.here - w);
    });
    ctl('DO', () => { this.compile('(DO)'); this.cstack.push(this.here); });
    ctl('LOOP', () => { this.compile('(LOOP)'); this.comma(this.cstack.pop()! - this.here); });
    ctl('+LOOP', () => { this.compile('(+LOOP)'); this.comma(this.cstack.pop()! - this.here); });

    // printing numbers, and 79-standard ROLL
    const print = (s: string) => { for (const ch of s) K.chrout(this.m, ch.charCodeAt(0)); };
    this.host('.', () => print(this.pops().toString(this.r16(BASE)).toUpperCase() + ' '), { callable: true });
    this.host('U.', () => print(this.pop().toString(this.r16(BASE)).toUpperCase() + ' '), { callable: true });
    this.host('ROLL', () => {
      const n = this.pop();
      const items: number[] = [];
      for (let i = 0; i < n; i++) items.push(this.pop());
      const x = items.pop()!;
      for (let i = items.length - 1; i >= 0; i--) this.push(items[i]);
      this.push(x);
    }, { callable: true });

    // the load screen's EA FORTH words
    this.host('FORTH', () => {});
    this.host('FREEZE', () => {});
    this.host('DISPLAY', () => {
      this.m.write(K.COLOR, this.m.ram[DISP]);
      this.m.write(0xd020, this.m.ram[DISP + 1]);
      this.m.write(0xd021, this.m.ram[DISP + 2]);
    });
    this.host('?FIND', () => this.push(this.words.has(this.needName()) ? 1 : 0));
    this.host('IFSO', () => {
      if (this.pop() === 0) {
        const s = this.cur;
        s.in = Math.ceil(s.in / 64) * 64;
      }
    });
    this.host('FORGET', () => { throw new Error('FORGET'); });
    // BLOCK (only MAKESP uses it, a development tool the game never calls): one buffer at C400
    this.host('BLOCK', () => {
      const n = this.pop();
      for (let i = 0; i < 1024; i++) this.m.write(0xc400 + i, this.blocks[n * 1024 + i] ?? 0x20);
      this.push(0xc400);
    }, { callable: true });
  }

  // ---- the 6502 assembler (fig-FORTH's, as the game's CODE words use it) ----
  private assembler(): void {
    const a = (name: string, fn: () => void) => this.asm.set(name, fn);
    a('#', () => { this.mode = 'imm'; });
    a(',X', () => { this.mode = 'x'; });
    a(',Y', () => { this.mode = 'y'; });
    a(')Y', () => { this.mode = 'indy'; });
    a('X)', () => { this.mode = 'indx'; });
    a(')', () => { this.mode = 'ind'; });
    a('.A', () => { this.mode = 'acc'; });
    a('BOT', () => { this.mode = 'x'; this.push(0); });
    a('SEC', () => { this.mode = 'x'; this.push(2); });
    for (const [k, v] of Object.entries(ZP)) if (k !== 'S0') a(k, () => this.push(v));
    a('0=', () => this.push(0xd0));
    a('0<', () => this.push(0x10));
    a('CS', () => this.push(0x90));
    a('VS', () => this.push(0x50));
    a('NOT', () => this.push(this.pop() ^ 0x20));
    // labels of the kernel (NEXT, PUSH, ...): after LABEL defines them
    const labelWord = (tok: string) => this.labels.get(tok);
    const origGet = this.asm.get.bind(this.asm);
    this.asm.get = (tok: string) => {
      const f = origGet(tok);
      if (f) return f;
      const l = labelWord(tok);
      return l === undefined ? undefined : () => this.push(l);
    };

    const implied: Record<string, number> = {
      'BRK,': 0x00, 'CLC,': 0x18, 'CLD,': 0xd8, 'CLI,': 0x58, 'CLV,': 0xb8, 'DEX,': 0xca, 'DEY,': 0x88, 'INX,': 0xe8,
      'INY,': 0xc8, 'NOP,': 0xea, 'PHA,': 0x48, 'PHP,': 0x08, 'PLA,': 0x68, 'PLP,': 0x28, 'RTI,': 0x40, 'RTS,': 0x60,
      'SEC,': 0x38, 'SED,': 0xf8, 'SEI,': 0x78, 'TAX,': 0xaa, 'TAY,': 0xa8, 'TSX,': 0xba, 'TXA,': 0x8a, 'TXS,': 0x9a,
      'TYA,': 0x98,
    };
    for (const [k, op] of Object.entries(implied)) a(k, () => { this.ccomma(op); this.mode = 'abs'; });

    type Modes = Partial<Record<'imm' | 'zp' | 'zpx' | 'zpy' | 'abs' | 'absx' | 'absy' | 'indx' | 'indy' | 'ind' | 'acc', number>>;
    const g1 = (b: number, imm = true): Modes => ({
      ...(imm ? { imm: b + 0x08 } : {}), zp: b + 0x04, zpx: b + 0x14, abs: b + 0x0c, absx: b + 0x1c, absy: b + 0x18,
      indx: b, indy: b + 0x10,
    });
    const g2 = (b: number): Modes => ({ acc: b + 0x0a, zp: b + 0x06, zpx: b + 0x16, abs: b + 0x0e, absx: b + 0x1e });
    const ops: Record<string, Modes> = {
      'ORA,': g1(0x01), 'AND,': g1(0x21), 'EOR,': g1(0x41), 'ADC,': g1(0x61), 'STA,': g1(0x81, false),
      'LDA,': g1(0xa1), 'CMP,': g1(0xc1), 'SBC,': g1(0xe1),
      'ASL,': g2(0x00), 'ROL,': g2(0x20), 'LSR,': g2(0x40), 'ROR,': g2(0x60),
      'INC,': { zp: 0xe6, zpx: 0xf6, abs: 0xee, absx: 0xfe }, 'DEC,': { zp: 0xc6, zpx: 0xd6, abs: 0xce, absx: 0xde },
      'LDX,': { imm: 0xa2, zp: 0xa6, zpy: 0xb6, abs: 0xae, absy: 0xbe },
      'LDY,': { imm: 0xa0, zp: 0xa4, zpx: 0xb4, abs: 0xac, absx: 0xbc },
      'STX,': { zp: 0x86, zpy: 0x96, abs: 0x8e }, 'STY,': { zp: 0x84, zpx: 0x94, abs: 0x8c },
      'CPX,': { imm: 0xe0, zp: 0xe4, abs: 0xec }, 'CPY,': { imm: 0xc0, zp: 0xc4, abs: 0xcc },
      'BIT,': { zp: 0x24, abs: 0x2c }, 'JMP,': { abs: 0x4c, ind: 0x6c }, 'JSR,': { abs: 0x20 },
    };
    for (const [name, modes] of Object.entries(ops)) {
      a(name, () => {
        const mode = this.mode;
        this.mode = 'abs';
        if (mode === 'acc') {
          if (modes.acc === undefined) throw new Error(`${name} .A`);
          this.ccomma(modes.acc);
          return;
        }
        const v = this.pop();
        const zp = v < 0x100;
        let op: number | undefined;
        let size = 2;
        switch (mode) {
          case 'imm': op = modes.imm; size = 1; break;
          case 'x': op = zp && modes.zpx !== undefined ? modes.zpx : modes.absx; size = zp && modes.zpx !== undefined ? 1 : 2; break;
          case 'y': op = zp && modes.zpy !== undefined ? modes.zpy : modes.absy; size = zp && modes.zpy !== undefined ? 1 : 2; break;
          case 'indx': op = modes.indx; size = 1; break;
          case 'indy': op = modes.indy; size = 1; break;
          case 'ind': op = modes.ind; size = 2; break;
          default: op = zp && modes.zp !== undefined ? modes.zp : modes.abs; size = zp && modes.zp !== undefined ? 1 : 2;
        }
        if (op === undefined) throw new Error(`${name}: no ${mode} mode (operand ${v.toString(16)}) in block ${this.cur?.blk}`);
        this.ccomma(op);
        if (size === 1) this.ccomma(v);
        else this.comma(v);
      });
    }
    // structured branches: condition = the branch opcode that skips the body
    a('IF,', () => { this.ccomma(this.pop()); this.push(this.here); this.push(0); this.ccomma(0); this.mode = 'abs'; });
    a('ELSE,', () => {
      this.pop();
      const f = this.pop();
      this.ccomma(0x4c);
      const j = this.here;
      this.comma(0);
      this.resolve(f, 0);
      this.push(j);
      this.push(1);
    });
    a('THEN,', () => { const kind = this.pop(); this.resolve(this.pop(), kind); });
    a('BEGIN,', () => this.push(this.here));
    a('UNTIL,', () => {
      const op = this.pop();
      const b = this.pop();
      this.ccomma(op);
      const off = b - (this.here + 1);
      if (off < -128 || off > 127) throw new Error('UNTIL, out of range');
      this.ccomma(off & 0xff);
    });
    a('AGAIN,', () => { this.ccomma(0x4c); this.comma(this.pop()); });
  }

  private resolve(at: number, kind: number): void {
    if (kind === 1) {
      this.w16(at, this.here);
      return;
    }
    const off = this.here - (at + 1);
    if (off > 127) throw new Error('IF, out of range');
    this.m.write(at, off);
  }

  /** fig's ' : the parameter field address of a word */
  pfa(name: string): number {
    return this.word(name).pfa;
  }

  cfa(name: string): number {
    return this.word(name).cfa;
  }

  /** the value of a CONSTANT (or a constant changed through its parameter field, like W#) */
  constant(name: string): number {
    return this.r16(this.pfa(name));
  }

  get dictionary(): Map<string, Word> {
    return this.words;
  }
}
