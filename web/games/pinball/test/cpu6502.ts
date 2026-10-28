// An NMOS 6502 core, for the tests only: it runs the assembled original (merlin.ts) so that the
// port's TypeScript translation can be compared with the 6502 code frame by frame. The shipped game
// has no CPU: it is the translation in src/. Decimal mode is not implemented (the listings never set
// it). Cycle counts include page-crossing and taken-branch penalties, so the tests can time loops.

export interface Bus {
  read(addr: number): number;
  write(addr: number, v: number): void;
}

const C = 0x01, Z = 0x02, I = 0x04, D = 0x08, B = 0x10, U = 0x20, V = 0x40, N = 0x80;

type AddrFn = (cpu: Cpu) => number;

export class Cpu {
  a = 0;
  x = 0;
  y = 0;
  s = 0xff;
  p = U | I;
  pc = 0;
  cycles = 0;
  /** set by an extra cycle of an indexed read that crossed a page */
  private crossed = false;
  readonly bus: Bus;

  constructor(bus: Bus) {
    this.bus = bus;
  }

  get flagC(): number { return this.p & C; }

  rd(a: number): number { return this.bus.read(a & 0xffff); }
  wr(a: number, v: number): void { this.bus.write(a & 0xffff, v & 0xff); }
  rd16(a: number): number { return this.rd(a) | (this.rd(a + 1) << 8); }
  /** the NMOS JMP ($xxFF) wraps within the page */
  rd16wrap(a: number): number { return this.rd(a) | (this.rd((a & 0xff00) | ((a + 1) & 0xff)) << 8); }
  push(v: number): void { this.wr(0x100 | this.s, v); this.s = (this.s - 1) & 0xff; }
  pull(): number { this.s = (this.s + 1) & 0xff; return this.rd(0x100 | this.s); }

  nz(v: number): number {
    v &= 0xff;
    this.p = (this.p & ~(N | Z)) | (v & N) | (v === 0 ? Z : 0);
    return v;
  }

  // ---- addressing (operand address; pc advanced) ----
  imm(): number { return this.pc++; }
  zp(): number { return this.rd(this.pc++); }
  zpx(): number { return (this.rd(this.pc++) + this.x) & 0xff; }
  zpy(): number { return (this.rd(this.pc++) + this.y) & 0xff; }
  abs(): number { const a = this.rd16(this.pc); this.pc += 2; return a; }
  absx(): number { const b = this.rd16(this.pc); this.pc += 2; const a = (b + this.x) & 0xffff; this.crossed = (a & 0xff00) !== (b & 0xff00); return a; }
  absy(): number { const b = this.rd16(this.pc); this.pc += 2; const a = (b + this.y) & 0xffff; this.crossed = (a & 0xff00) !== (b & 0xff00); return a; }
  indx(): number { const z = (this.rd(this.pc++) + this.x) & 0xff; return this.rd(z) | (this.rd((z + 1) & 0xff) << 8); }
  indy(): number {
    const z = this.rd(this.pc++);
    const b = this.rd(z) | (this.rd((z + 1) & 0xff) << 8);
    const a = (b + this.y) & 0xffff;
    this.crossed = (a & 0xff00) !== (b & 0xff00);
    return a;
  }

  adc(v: number): void {
    const c = this.p & C;
    const r = this.a + v + c;
    const ov = (~(this.a ^ v) & (this.a ^ r) & 0x80) !== 0;
    this.p = (this.p & ~(C | V)) | (r > 0xff ? C : 0) | (ov ? V : 0);
    this.a = this.nz(r);
  }
  sbc(v: number): void { this.adc(v ^ 0xff); }
  cmp(r: number, v: number): void {
    const t = r - v;
    this.p = (this.p & ~C) | (t >= 0 ? C : 0);
    this.nz(t);
  }
  branch(cond: boolean): void {
    const off = this.rd(this.pc++);
    if (cond) {
      const t = (this.pc + (off < 0x80 ? off : off - 0x100)) & 0xffff;
      this.cycles += (t & 0xff00) !== (this.pc & 0xff00) ? 2 : 1;
      this.pc = t;
    }
  }
  asl(v: number): number { this.p = (this.p & ~C) | ((v >> 7) & 1); return this.nz(v << 1); }
  lsr(v: number): number { this.p = (this.p & ~C) | (v & 1); return this.nz(v >> 1); }
  rol(v: number): number { const c = this.p & C; this.p = (this.p & ~C) | ((v >> 7) & 1); return this.nz((v << 1) | c); }
  ror(v: number): number { const c = this.p & C; this.p = (this.p & ~C) | (v & 1); return this.nz((v >> 1) | (c << 7)); }

  /** executes one instruction; returns its cycles */
  step(): number {
    const c0 = this.cycles;
    const op = this.rd(this.pc++);
    const e = TABLE[op];
    if (!e) throw new Error(`illegal opcode $${op.toString(16)} at $${((this.pc - 1) & 0xffff).toString(16)}`);
    this.crossed = false;
    e.run(this);
    this.cycles += e.cycles + (e.pagePenalty && this.crossed ? 1 : 0);
    return this.cycles - c0;
  }
}

interface Entry {
  run: (c: Cpu) => void;
  cycles: number;
  pagePenalty: boolean;
}

const TABLE: (Entry | undefined)[] = new Array(256);

function def(op: number, cycles: number, run: (c: Cpu) => void, pagePenalty = false): void {
  TABLE[op] = { run, cycles, pagePenalty };
}

const modes: Record<string, AddrFn> = {
  imm: (c) => c.imm(), zp: (c) => c.zp(), zpx: (c) => c.zpx(), zpy: (c) => c.zpy(),
  abs: (c) => c.abs(), absx: (c) => c.absx(), absy: (c) => c.absy(), indx: (c) => c.indx(), indy: (c) => c.indy(),
};

// read instructions: [op, mode, cycles, penalty]
function reads(fn: (c: Cpu, v: number) => void, ops: [number, string, number, boolean?][]): void {
  for (const [op, m, cy, pen] of ops) {
    const am = modes[m];
    def(op, cy, (c) => fn(c, c.rd(am(c))), pen ?? false);
  }
}
function writes(fn: (c: Cpu) => number, ops: [number, string, number][]): void {
  for (const [op, m, cy] of ops) {
    const am = modes[m];
    def(op, cy, (c) => c.wr(am(c), fn(c)));
  }
}
function rmw(fn: (c: Cpu, v: number) => number, ops: [number, string, number][]): void {
  for (const [op, m, cy] of ops) {
    const am = modes[m];
    def(op, cy, (c) => { const a = am(c); c.wr(a, fn(c, c.rd(a))); });
  }
}

const ALU: [string, number][] = [['imm', 2], ['zp', 3], ['zpx', 4], ['abs', 4], ['absx', 4], ['absy', 4], ['indx', 6], ['indy', 5]];
function alu(base: Record<string, number>, fn: (c: Cpu, v: number) => void): void {
  reads(fn, ALU.filter(([m]) => base[m] !== undefined).map(([m, cy]) => [base[m], m, cy, m === 'absx' || m === 'absy' || m === 'indy']));
}
const aluOps = (b: number): Record<string, number> => ({ imm: b + 0x08, zp: b + 0x04, zpx: b + 0x14, abs: b + 0x0c, absx: b + 0x1c, absy: b + 0x18, indx: b + 0x00, indy: b + 0x10 });

alu(aluOps(0x01), (c, v) => { c.a = c.nz(c.a | v); });            // ORA
alu(aluOps(0x21), (c, v) => { c.a = c.nz(c.a & v); });            // AND
alu(aluOps(0x41), (c, v) => { c.a = c.nz(c.a ^ v); });            // EOR
alu(aluOps(0x61), (c, v) => c.adc(v));                            // ADC
alu(aluOps(0xa1), (c, v) => { c.a = c.nz(v); });                  // LDA
alu(aluOps(0xc1), (c, v) => c.cmp(c.a, v));                       // CMP
alu(aluOps(0xe1), (c, v) => c.sbc(v));                            // SBC
writes((c) => c.a, [[0x85, 'zp', 3], [0x95, 'zpx', 4], [0x8d, 'abs', 4], [0x9d, 'absx', 5], [0x99, 'absy', 5], [0x81, 'indx', 6], [0x91, 'indy', 6]]);
writes((c) => c.x, [[0x86, 'zp', 3], [0x96, 'zpy', 4], [0x8e, 'abs', 4]]);
writes((c) => c.y, [[0x84, 'zp', 3], [0x94, 'zpx', 4], [0x8c, 'abs', 4]]);
reads((c, v) => { c.x = c.nz(v); }, [[0xa2, 'imm', 2], [0xa6, 'zp', 3], [0xb6, 'zpy', 4], [0xae, 'abs', 4], [0xbe, 'absy', 4, true]]);
reads((c, v) => { c.y = c.nz(v); }, [[0xa0, 'imm', 2], [0xa4, 'zp', 3], [0xb4, 'zpx', 4], [0xac, 'abs', 4], [0xbc, 'absx', 4, true]]);
reads((c, v) => c.cmp(c.x, v), [[0xe0, 'imm', 2], [0xe4, 'zp', 3], [0xec, 'abs', 4]]);
reads((c, v) => c.cmp(c.y, v), [[0xc0, 'imm', 2], [0xc4, 'zp', 3], [0xcc, 'abs', 4]]);
reads((c, v) => { c.p = (c.p & ~(N | V | Z)) | (v & (N | V)) | ((c.a & v) === 0 ? Z : 0); }, [[0x24, 'zp', 3], [0x2c, 'abs', 4]]);

const shifts: [number, (c: Cpu, v: number) => number][] = [[0x00, (c, v) => c.asl(v)], [0x20, (c, v) => c.rol(v)], [0x40, (c, v) => c.lsr(v)], [0x60, (c, v) => c.ror(v)]];
for (const [b, fn] of shifts) {
  def(b + 0x0a, 2, (c) => { c.a = fn(c, c.a); });
  rmw(fn, [[b + 0x06, 'zp', 5], [b + 0x16, 'zpx', 6], [b + 0x0e, 'abs', 6], [b + 0x1e, 'absx', 7]]);
}
rmw((c, v) => c.nz(v + 1), [[0xe6, 'zp', 5], [0xf6, 'zpx', 6], [0xee, 'abs', 6], [0xfe, 'absx', 7]]);
rmw((c, v) => c.nz(v - 1), [[0xc6, 'zp', 5], [0xd6, 'zpx', 6], [0xce, 'abs', 6], [0xde, 'absx', 7]]);

def(0xe8, 2, (c) => { c.x = c.nz(c.x + 1); });
def(0xc8, 2, (c) => { c.y = c.nz(c.y + 1); });
def(0xca, 2, (c) => { c.x = c.nz(c.x - 1); });
def(0x88, 2, (c) => { c.y = c.nz(c.y - 1); });
def(0xaa, 2, (c) => { c.x = c.nz(c.a); });
def(0xa8, 2, (c) => { c.y = c.nz(c.a); });
def(0x8a, 2, (c) => { c.a = c.nz(c.x); });
def(0x98, 2, (c) => { c.a = c.nz(c.y); });
def(0xba, 2, (c) => { c.x = c.nz(c.s); });
def(0x9a, 2, (c) => { c.s = c.x; });
def(0x48, 3, (c) => c.push(c.a));
def(0x08, 3, (c) => c.push(c.p | B | U));
def(0x68, 4, (c) => { c.a = c.nz(c.pull()); });
def(0x28, 4, (c) => { c.p = (c.pull() & ~B) | U; });
def(0x18, 2, (c) => { c.p &= ~C; });
def(0x38, 2, (c) => { c.p |= C; });
def(0x58, 2, (c) => { c.p &= ~I; });
def(0x78, 2, (c) => { c.p |= I; });
def(0xb8, 2, (c) => { c.p &= ~V; });
def(0xd8, 2, (c) => { c.p &= ~D; });
def(0xf8, 2, (c) => { c.p |= D; throw new Error('decimal mode is not implemented'); });
def(0xea, 2, () => {});
def(0x10, 2, (c) => c.branch((c.p & N) === 0));
def(0x30, 2, (c) => c.branch((c.p & N) !== 0));
def(0x50, 2, (c) => c.branch((c.p & V) === 0));
def(0x70, 2, (c) => c.branch((c.p & V) !== 0));
def(0x90, 2, (c) => c.branch((c.p & C) === 0));
def(0xb0, 2, (c) => c.branch((c.p & C) !== 0));
def(0xd0, 2, (c) => c.branch((c.p & Z) === 0));
def(0xf0, 2, (c) => c.branch((c.p & Z) !== 0));
def(0x4c, 3, (c) => { c.pc = c.rd16(c.pc); });
def(0x6c, 5, (c) => { c.pc = c.rd16wrap(c.rd16(c.pc)); });
def(0x20, 6, (c) => { const t = c.rd16(c.pc); const r = (c.pc + 1) & 0xffff; c.push(r >> 8); c.push(r & 0xff); c.pc = t; });
def(0x60, 6, (c) => { const lo = c.pull(); const hi = c.pull(); c.pc = (((hi << 8) | lo) + 1) & 0xffff; });
def(0x40, 6, (c) => { c.p = (c.pull() & ~B) | U; const lo = c.pull(); const hi = c.pull(); c.pc = (hi << 8) | lo; });
def(0x00, 7, (c) => { throw new Error(`BRK at $${((c.pc - 1) & 0xffff).toString(16)}`); });

export const FLAGS = { C, Z, I, D, B, U, V, N };
