// util.cpp of HyperRogue 13.1o: small math helpers, bignum (Clearing, the expansion analyzer), the expression
// parser (numbers only in stage 1: the command line's parseld/parseint), string helpers.
// gcd/gmod/zgmod/szgmod/gdiv are in hyper.ts (the core types need them) and re-exported here.
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Names: `hrand(bignum)` is `hrand_bignum` (hrand(int) is rand.ts's); bignum's operators are methods:
// `a += b` -> a.add(b), `a + b` -> bignum.plus(a, b), `a - b` -> bignum.minus(a, b), `a < b` -> a.lt(b),
// `b++` -> bignum_inc(b), `b--` -> bignum_dec(b).
import { hr_exception, NotPorted } from './hyper.ts';
import { hrand, rand, randd } from './rand.ts';
import { its, kz, lalign } from './hprint.ts';
import { XLAT } from './language.ts';
import { G } from './globals.ts';

export { gcd, gmod, zgmod, szgmod, gdiv } from './hyper.ts';

/** SDL_GetTicks(): the desktop build takes SDL's; the oracle (harness.cpp) replaces it by a counter starting at
 *  0, so the port counts too. A later stage (the browser) may replace `ticks_source.get`. */
let fake_ticks = 0;
export const ticks_source = { get: (): number => fake_ticks++ };
export function SDL_GetTicks(): number { return ticks_source.get(); }

export function sqr(x: number): number { return x * x; }

export function round_nearest(x: number, multiple_of?: number): number {
  if (multiple_of !== undefined) return multiple_of * round_nearest(x / multiple_of);
  if (x > 0) return Math.trunc(x + .5); else return -Math.trunc(.5 - x);
}

export function frac(x: number): number {
  x -= Math.trunc(x);
  if (x < 0) x++;
  return x;
}

export function lerp(a0: number, a1: number, x: number): number {
  return a0 + (a1 - a0) * x;
}

export function clamp(a: number, v0: number, v1: number): number {
  if (a < v0) return v0;
  if (a > v1) return v1;
  return a;
}

export function ilerp(a0: number, a1: number, x: number): number {
  return (x - a0) / (a1 - a0);
}

// hooks_tests: G.hooks_tests

function isalnum(c: number): boolean {
  return (c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
}

export function simplify(s: string): string {
  let res = '';
  for (const c of s) if (isalnum(c.charCodeAt(0))) res += c;
  return res;
}

export function appears(haystack: string, needle: string): boolean {
  return simplify(haystack).indexOf(simplify(needle)) !== -1;
}

// --- the expression parser ---

export class hr_parse_exception extends hr_exception {
  s: string;
  constructor(z: string) { super(z); this.s = z; }
}

/** struct exp_parser. Stage 1 ports the real-number part: numbers, the named constants, + - * / ^, unary minus,
 *  parentheses and the real functions; complex numbers, matrices, colors and the game/screen variables are
 *  graphics or menu features (a later stage) and throw NotPorted. */
export class exp_parser {
  s = '';
  at = 0;
  line_number = 1;
  last_line = 0;
  extra_params = new Map<string, number>();

  where(): string {
    // s.find('\n') is "not 0" (npos is true too): the line form unless the string starts with a newline
    if (this.s.indexOf('\n') !== 0) return '(line ' + its(this.line_number) + ', pos ' + its(this.at - this.last_line) + ')';
    else return '(pos ' + its(this.at) + ')';
  }

  ok(): boolean { return this.at === this.s.length; }
  next(step = 0): string { if (this.at >= this.s.length - step) return '\0'; else return this.s[this.at + step]; }

  eatchar(): string { return this.s[this.at++]; }

  eat(c: string): boolean {
    const orig_at = this.at;
    let k = 0;
    while (k < c.length && c[k] === this.next()) { this.at++; k++; }
    if (k === c.length) return true;
    else this.at = orig_at;
    return false;
  }

  skip_white(): void {
    while (this.next() === ' ' || this.next() === '\n' || this.next() === '\r' || this.next() === '\t') {
      if (this.next() === '\r') this.last_line++;
      if (this.next() === '\n') {
        this.line_number++; this.last_line = this.at;
      }
      this.at++;
    }
  }

  next_token(): string {
    this.skip_white();
    let token = '';
    while (true) {
      const c = this.next();
      if ((c >= '0' && c <= '9') || (c === '.' && this.next(1) !== '.') || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_') {
        token += c; this.at++;
      }
      else break;
    }
    return token;
  }

  snext(step = 0): string { this.skip_white(); return this.next(step); }

  parse_with_reps(): [number, number][] {
    const vals: [number, number][] = [];
    vals.push([this.rparse(0), 1]);
    while (true) {
      this.skip_white();
      if (this.eat(':^')) {
        const rep = this.rparse(0);
        vals[vals.length - 1][1] *= rep;
      }
      if (this.eat(',')) vals.push([this.rparse(0), 1]);
      else break;
    }
    return vals;
  }

  parse(prio = 0): number {
    let res: number;
    this.skip_white();
    if (this.eat('sin(')) res = Math.sin(this.parsepar());
    else if (this.eat('cos(')) res = Math.cos(this.parsepar());
    else if (this.eat('sinh(')) res = Math.sinh(this.parsepar());
    else if (this.eat('cosh(')) res = Math.cosh(this.parsepar());
    else if (this.eat('asin(')) res = Math.asin(this.parsepar());
    else if (this.eat('acos(')) res = Math.acos(this.parsepar());
    else if (this.eat('asinh(')) res = Math.asinh(this.parsepar());
    else if (this.eat('acosh(')) res = Math.acosh(this.parsepar());
    else if (this.eat('exp(')) res = Math.exp(this.parsepar());
    else if (this.eat('sqrt(')) res = Math.sqrt(this.parsepar());
    else if (this.eat('log(')) res = Math.log(this.parsepar());
    else if (this.eat('tan(')) res = Math.tan(this.parsepar());
    else if (this.eat('tanh(')) res = Math.tanh(this.parsepar());
    else if (this.eat('atan(')) res = Math.atan(this.parsepar());
    else if (this.eat('atanh(')) res = Math.atanh(this.parsepar());
    else if (this.eat('abs(')) res = Math.abs(this.parsepar());
    else if (this.eat('re(')) res = this.parsepar();
    else if (this.eat('im(')) { this.parsepar(); res = 0; }
    else if (this.eat('conj(')) res = this.parsepar();
    else if (this.eat('floor(')) res = Math.floor(this.parsepar());
    else if (this.eat('frac(')) { res = this.parsepar(); res = res - Math.floor(res); }
    else if (this.eat('to01(')) { res = this.parsepar(); return Math.atan(res) / Math.PI + 0.5; }
    else if (this.eat('min(')) {
      let a = this.rparse(0);
      while ((this.skip_white(), this.eat(','))) a = Math.min(a, this.rparse(0));
      this.force_eat(')');
      res = a;
    }
    else if (this.eat('max(')) {
      let a = this.rparse(0);
      while ((this.skip_white(), this.eat(','))) a = Math.max(a, this.rparse(0));
      this.force_eat(')');
      res = a;
    }
    else if (this.eat('atan2(')) {
      const y = this.rparse(0);
      this.force_eat(',');
      const x = this.rparse(0);
      this.force_eat(')');
      res = Math.atan2(y, x);
    }
    else if (this.eat('angle_from_matrix(') || this.eat('dist_from_matrix(') || this.eat('edge(') ||
      this.eat('edge_angles(') || this.eat('regradius(') || this.eat('arcmedge(') || this.eat('arcmcurv(') ||
      this.eat('ideal_angle(') || this.eat('ideal_edge(') || this.eat('regangle(') || this.eat('txp(') ||
      this.eat('lands_at('))
      throw new NotPorted('exp_parser: geometry functions');
    else if (this.eat('test(')) {
      res = this.parsepar();
      // println(hlog, "res = ", ...)
    }
    else if (this.eat('ifp(')) {
      const cond = this.parse(0);
      this.force_eat(',');
      const yes = this.parse(0);
      this.force_eat(',');
      const no = this.parsepar();
      res = cond > 0 ? yes : no;
    }
    else if (this.eat('ifz(')) {
      const cond = this.parse(0);
      this.force_eat(',');
      const yes = this.parse(0);
      this.force_eat(',');
      const no = this.parsepar();
      res = Math.abs(cond) < 1e-8 ? yes : no;
    }
    else if (this.eat('let(')) {
      const name = this.next_token();
      this.force_eat('=');
      const val = this.parse(0);
      this.force_eat(',');
      const had = this.extra_params.has(name), old = this.extra_params.get(name);
      this.extra_params.set(name, val);
      try { res = this.parsepar(); }
      finally { this.extra_params.set(name, had ? old! : 0); }
    }
    else if (this.eat('solve(')) {
      const name = this.next_token();
      this.force_eat('=');
      let minval = this.parse(0);
      this.force_eat(',');
      let maxval = this.parse(0);
      this.force_eat(',');
      const bak_at = this.at;
      res = 0;
      for (let i = 0; i < 100; i++) {
        res = (minval + maxval) / 2;
        const had = this.extra_params.has(name), old = this.extra_params.get(name);
        this.extra_params.set(name, res);
        try {
          this.at = bak_at;
          const result = this.parsepar();
          if (result > 0) maxval = res;
          else minval = res;
        }
        finally { this.extra_params.set(name, had ? old! : 0); }
      }
    }
    else if (this.next() === '(') { this.at++; res = this.parsepar(); }
    else {
      let number = this.next_token();
      const p = this.extra_params.get(number);
      if (p !== undefined) res = p;
      else if (number === 'e') res = Math.exp(1);
      else if (number === 'i') throw new NotPorted('exp_parser: complex numbers');
      else if (number === 'inf') res = Infinity;
      else if (number === 'p' || number === 'pi') res = Math.PI;
      else if (number === 'tau') res = 2 * Math.PI;
      else if (number === 'phi') res = (1 + Math.sqrt(5)) / 2;
      else if (number === '' && this.next() === '-') { this.at++; res = -this.parse(20); }
      else if (number === '') throw new hr_parse_exception('number missing, ' + this.where());
      else if (number === 's') res = G.ticks / 1000.;
      else if (number === 'ms') res = G.ticks;
      else if (number[0] === '0' && number[1] === 'x') res = Number(BigInt.asIntN(64, BigInt('0x' + (/^[0-9a-fA-F]*/.exec(number.slice(2))![0] || '0'))));
      else if (number === 'deg') res = Math.PI / 180;
      else if (number === 'turncount') res = G.turncount;
      else if (number === 'illegal_moves') res = G.illegal_moves;
      else if (number === 'random') res = randd();
      else if (number === 'MAX_EDGE') res = 120;
      else if (number === 'MAX_VALENCE') res = 120;
      else if (['ultra_mirror_dist', 'psl_steps', 'single_step', 'step', 'edgelen', 'mousex', 'mousey', 'framecount',
        'gametime', 'last_a', 'last_b', 'last_c', 'last_d', 'lshift', 'rshift', 'lctrl', 'rctrl', 'capslock', 'numlock',
        'scrolllock', 'holdmouse', 'mousexs', 'mouseys', 'mousez', 'shot', 'fake_edgelength'].includes(number))
        throw new NotPorted('exp_parser: ' + number);
      else if (number[0] >= 'a' && number[0] <= 'z') throw new hr_parse_exception('unknown value: ' + number);
      else if (number[0] >= 'A' && number[0] <= 'Z') throw new hr_parse_exception('unknown value: ' + number);
      else if (number[0] === '_') throw new hr_parse_exception('unknown value: ' + number);
      else {
        const lastc = number[number.length - 1];
        if (lastc === 'e' || lastc === 'E') {
          if (this.eat('-')) number = number + '-' + this.next_token();
          else if (this.eat('+')) number = number + '+' + this.next_token();
        }
        // std::stringstream ss; ss << number; ss >> res: the whole token must be one number
        if (!/^(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(number)) throw new hr_parse_exception('unknown value: ' + number);
        res = Number(number);
      }
    }
    while (true) {
      this.skip_white();
      if (this.next() === '.' && this.next(1) === '.' && prio === 0) throw new NotPorted('exp_parser: animations');
      if (this.next() === '+' && prio <= 10) { this.at++; res = res + this.parse(20); }
      else if (this.next() === '-' && prio <= 10) { this.at++; res = res - this.parse(20); }
      else if (this.next() === '*' && prio <= 20) { this.at++; res = res * this.parse(30); }
      else if (this.next() === '/' && prio <= 20) { this.at++; res = res / this.parse(30); }
      else if (this.next() === '^') { this.at++; res = Math.pow(res, this.parse(40)); }
      else break;
    }
    return res;
  }

  rparse(prio = 0): number { return this.validate_real(this.parse(prio)); }
  iparse(prio = 0): number { return Math.trunc(Math.floor(this.rparse(prio) + .5)) | 0; }

  parsepar(): number {
    const res = this.parse();
    this.force_eat(')');
    return res;
  }

  /** the values are real here (stage 1 has no complex part): kz(imag(x)) is always 0 */
  validate_real(x: number): number {
    if (kz(0)) throw new hr_parse_exception('expected real number but ' + lalign(-1, x) + ' found at ' + this.where());
    return x;
  }

  force_eat(c: string): void {
    this.skip_white();
    if (!this.eat(c)) throw new hr_parse_exception('expected: ' + c + ' at ' + this.where());
  }

  // --- added by U4 (config.cpp's parameters): parsematrix, parsecolor ---

  /** transmatrix parsematrix(int prio) */
  parsematrix(prio = 0): transmatrix {
    this.skip_white();
    let res: transmatrix;
    const s = this.s, at = this.at;
    let done = false;
    if (at + 3 < s.length && s[at + 3] === '(') {
      const unit = angle_unit(s[at]);
      const c0 = coord_id(s[at + 1]);
      const c1 = coord_id(s[at + 2]);
      if (c0 >= 0 && c1 >= 0 && c0 !== c1 && unit) {
        this.at += 4;
        const angle = this.validate_real(this.parsepar());
        if (unit === -1) res = lorentz(c0, c1, angle);
        else res = cspin(c0, c1, unit * angle);
        done = true;
      }
    }
    if (!done) {
      if (this.eat('inv(')) {
        res = this.parsematrix();
        this.force_eat(')');
        res = inverse(res);
      }
      else if (this.next() === '(') {
        this.at++;
        res = this.parsematrix();
        this.force_eat(')');
      }
      else {
        const token = this.next_token();
        if (token === 'id') res = tcopy(Id);
        else if (token === 'view') res = tcopy(G.current_display.view_matrix); // View
        else if (token === 'mori') res = tcopy(pconf().mori().get());
        else throw new hr_parse_exception('unknown matrix: ' + token);
      }
    }
    // mulwhile:
    while (true) {
      this.skip_white();
      if (this.next() === '*' && prio <= 20) { this.at++; res = tmul(res!, this.parsematrix(30)); }
      else break;
    }
    return res!;
  }

  /** color_t parsecolor(int prio) (the color names, hex values, rgb(), hsv(), lerp(), wallif(), indexed() and
   *  the values of the parameters) */
  parsecolor(prio = 0): number {
    void prio;
    this.skip_white();
    if (this.eat('indexed(')) {
      const pos = this.at;
      const parts = [0, 0, 0, 0];
      const have_index = this.extra_params.has('p');
      const val = this.extra_params.get('p') ?? 0;
      for (let i = 0; i < 4; i++) {
        this.at = pos;
        this.extra_params.set('p', i + 1);
        parts[i] = this.rparse();
      }
      if (!have_index) this.extra_params.delete('p');
      this.extra_params.set('p', val);
      this.force_eat(')');
      return part_to_col(parts);
    }
    if (this.eat('wallif(')) {
      const val0 = this.rparse();
      this.force_eat(',');
      let res = this.parsecolor();
      this.force_eat(')');
      res = (res & 0xFFFFFF00) >>> 0;
      if (val0 > 0) res = (res | 0x1) >>> 0;
      return res;
    }
    if (this.eat('rgb(')) {
      const parts = [0, 0, 0, 0];
      parts[3] = this.rparse(); this.force_eat(',');
      parts[2] = this.rparse(); this.force_eat(',');
      parts[1] = this.rparse();
      if (this.eat(',')) parts[0] = this.rparse(); else parts[0] = 1;
      this.force_eat(')');
      return part_to_col(parts);
    }
    if (this.eat('hsv(')) {
      // (the original computes the colour and does not return it: the parsing goes on below)
      const hue = this.rparse();
      const sat = this.eat(',') ? this.rparse() : 1;
      const value = this.eat(',') ? this.rparse() : 1;
      const alpha = this.eat(',') ? this.rparse() : 1;
      let col = ((rainbow_color(sat, hue) << 8) | 0xFF) >>> 0;
      if (value < 1) col = gradient(0, col, 0, value, 1);
      if (alpha < 1) col = set_part(col, 0, Math.min(Math.max(alpha * 255, 0), 255));
      void col;
    }
    if (this.eat('lerp(')) {
      const a = this.parsecolor();
      this.force_eat(',');
      const b = this.parsecolor();
      this.force_eat(',');
      const x = this.rparse();
      this.force_eat(')');
      return gradient(a, b, 0, x, 1);
    }
    const token = this.next_token();
    const par = util_late.find_param(token);
    if (par) return Math.trunc(par.get_cld()) >>> 0;

    const p = find_color_by_name(token);
    if (p) return ((p[1] << 8) | 0xFF) >>> 0;

    // sscanf(token.c_str(), "%x", &res): the token is letters, digits and '_' (a hex prefix of it is read)
    const hex = (): number => {
      const m = /^(0[xX])?([0-9a-fA-F]+)/.exec(token);
      if (!m) throw new hr_parse_exception('color parse error');
      return Number(BigInt.asUintN(32, BigInt('0x' + m[2])));
    };
    if (token.length === 6) {
      const res = hex();
      return (res * 256 + 0xFF) >>> 0;
    }
    else if (token.length === 8) {
      return hex();
    }
    throw new hr_parse_exception('color parse error');
  }
}

/** what util.ts needs from config.ts (set by config.ts when it loads; util.cpp reads `params` directly) */
export const util_late = {
  find_param: (_name: string): { get_cld(): number } | null => null,
};

/** int coord_id(char ch) */
function coord_id(ch: string): number {
  if (ch === 'x') return 0;
  if (ch === 'y') return 1;
  if (ch === 'z') return 2;
  if (ch === 'w') return 3;
  if (ch === 't') return MDIM() - 1;
  return -1;
}

/** ld angle_unit(char ch) */
function angle_unit(ch: string): number {
  if (ch === 'r') return 1;
  if (ch === 'd') return degree;
  if (ch === 't') return TAU;
  if (ch === 'q') return TAU / 4;
  if (ch === 'l') return -1;
  return 0;
}

/** color_t part_to_col(array<ld, 4> parts) (res starts uninitialized in C++; every byte is set) */
function part_to_col(parts: number[]): number {
  let res = 0;
  for (let i = 0; i < 4; i++) {
    const v = parts[i];
    res = set_part(res, i, Math.min(Math.max(Math.trunc(v * 255 + .5), 0), 255));
  }
  return res >>> 0;
}

/** EX transmatrix parsematrix(const string& s) */
export function parsematrix(s: string): transmatrix {
  const ep = new exp_parser();
  ep.s = s;
  return ep.parsematrix();
}

/** EX color_t parsecolor(const string& s, bool has_alpha) */
export function parsecolor(s: string, has_alpha: boolean): number {
  const ep = new exp_parser();
  ep.s = s;
  let col = ep.parsecolor();
  if (!has_alpha) col = col >>> 8;
  return col;
}

/** EX colortable parsecolortable(const string& s) */
export function parsecolortable(s: string): number[] {
  const tab: number[] = [];
  const ep = new exp_parser();
  ep.s = s;
  tab.push(ep.parsecolor() >>> 8);
  while (ep.eat(','))
    tab.push(ep.parsecolor() >>> 8);
  return tab;
}
import { pconf } from './globals.ts';
import { type transmatrix, cspin, lorentz, inverse, tmul, tcopy, Id, degree, TAU } from './hyperpoint.ts';
import { MDIM } from './classes.ts';
import { rainbow_color, gradient, set_part, find_color_by_name } from './colors.ts';
import { fts } from './hprint.ts';
import { fmtF } from './cpp.ts';

export function parseld(s: string): number {
  const ep = new exp_parser();
  ep.s = s;
  return ep.rparse();
}

export function parseint(s: string): number {
  const ep = new exp_parser();
  ep.s = s;
  return ep.iparse();
}

// parsematrix, parsecolor, parsecolortable: above (U4). parsematrix23, available_functions/constants/variables:
// graphics and menus (a later stage).

// --- bignum ---

/** struct bignum: base 10^9 digits, least significant first */
export class bignum {
  static readonly BASE = 1000000000;
  static readonly BASE2 = 1000000000 * 1000000000;
  digits: number[] = [];

  /** bignum(), bignum(int i), bignum(ld d) (C++ picks the overload by the argument's type: say which) */
  constructor(i?: number, from_ld = false) {
    if (i === undefined) return;
    if (!from_ld) { this.digits.push(i | 0); return; }
    let d = i;
    if (d === 0) return;
    let n = 1;
    while (d > bignum.BASE) { d /= bignum.BASE; n++; }
    this.digits.length = n;
    n--;
    while (n >= 0) { this.digits[n] = Math.trunc(d) | 0; d -= this.digits[n]; d *= bignum.BASE; n--; }
  }
  static from_ld(d: number): bignum { return new bignum(d, true); }

  clone(): bignum { const b = new bignum(); b.digits = [...this.digits]; return b; }
  set(o: bignum): this { this.digits = [...o.digits]; return this; }

  be(i: number): void { this.digits.length = 1; this.digits[0] = i; }

  /** operator += */
  add(b: bignum): this {
    const K = b.digits.length;
    while (K > this.digits.length) this.digits.push(0);
    let carry = 0;
    for (let i = 0; i < K || carry; i++) {
      if (i >= this.digits.length) this.digits.push(0);
      this.digits[i] += carry;
      if (i < K) this.digits[i] += b.digits[i];
      if (this.digits[i] >= bignum.BASE) {
        this.digits[i] -= bignum.BASE;
        carry = 1;
      }
      else carry = 0;
    }
    return this;
  }

  addmul(b: bignum, factor: number): void {
    const K = b.digits.length;
    while (K > this.digits.length) this.digits.push(0);
    let carry = 0;
    for (let i = 0; i < K || (carry > 0 || carry < -1) || (carry === -1 && i < this.digits.length); i++) {
      if (i >= this.digits.length) this.digits.push(0);
      let l = this.digits[i];
      l += carry;
      if (i < K) l += Math.imul(b.digits[i], factor);
      carry = 0;
      if (l >= bignum.BASE) carry = Math.trunc(l / bignum.BASE);
      if (l < 0) carry = -Math.trunc((bignum.BASE - 1 - l) / bignum.BASE);
      l -= carry * bignum.BASE;
      this.digits[i] = l | 0;
    }
    if (carry < 0) this.digits[this.digits.length - 1] -= bignum.BASE;
    while (this.digits.length && this.digits[this.digits.length - 1] === 0) this.digits.pop();
  }

  get_str(max_length: number): string {
    if (this.digits.length === 0) return '0';
    let ret = its(this.digits[this.digits.length - 1]);
    for (let i = this.digits.length - 2; i >= 0; i--) {
      if (ret.length > max_length && i) {
        ret += XLAT(' (%1 more digits)', its(9 * (i + 1)));
        return ret;
      }

      ret += ' ';
      let val = its(this.digits[i]);
      while (val.length < 9) val = '0' + val;
      ret += val;
    }
    return ret;
  }

  /** operator < */
  lt(b: bignum): boolean {
    if (this.digits.length !== b.digits.length)
      return this.digits.length < b.digits.length;
    for (let i = this.digits.length - 1; i >= 0; i--)
      if (this.digits[i] !== b.digits[i])
        return this.digits[i] < b.digits[i];
    return false;
  }
  /** operator > */
  gt(b: bignum): boolean { return b.lt(this); }

  leading(): number {
    switch (this.digits.length) {
      case 0:
        return 0;
      case 1:
        return this.digits[this.digits.length - 1];
      default:
        return this.digits[this.digits.length - 1] + this.digits[this.digits.length - 2] / bignum.BASE;
    }
  }

  approx(): number {
    return this.leading() * Math.pow(bignum.BASE, this.digits.length - 1);
  }

  log_approx(): number {
    return Math.log(this.leading()) + Math.log(bignum.BASE) * (this.digits.length - 1);
  }

  approx_div(b: bignum): number {
    return this.leading() / b.leading() * Math.pow(bignum.BASE, this.digits.length - b.digits.length);
  }

  approx_int(): number {
    if (this.digits.length > 1) return bignum.BASE;
    if (this.digits.length === 0) return 0;
    return this.digits[0];
  }

  nonzero(): boolean { return this.approx_ld() !== 0; }

  randomized_div(x: number): bignum {
    const res = this.clone();
    let carry = 0;
    const K = res.digits.length;
    for (let i = K - 1; i >= 0; i--) {
      carry *= bignum.BASE;
      carry += this.digits[i];
      // strange compiler buug:
      // if I do / and %, function 'divmod' is called, and it complains on launch that divmod is unimplemented
      res.digits[i] = Math.trunc(carry / x);
      carry -= res.digits[i] * x;
    }
    while (res.digits.length && res.digits[res.digits.length - 1] === 0) res.digits.pop();
    if (rand() % x < carry) res.add(new bignum(1));
    return res;
  }

  approx_ld(): number {
    let res = 0;
    for (let i = 0; i < this.digits.length; i++) res += this.digits[i] * Math.pow(bignum.BASE, i);
    return res;
  }

  /** long long approx_ll() (exact while below 2^53, which BASE2 = 10^18 exceeds: the comparisons the callers make
   *  against BASE2 and between these values are what matters; see expansion.ts verify) */
  approx_ll(): number {
    if (this.digits.length > 2) return bignum.BASE2;
    if (this.digits.length === 0) return 0;
    if (this.digits.length === 1) return this.digits[0];
    return this.digits[0] + this.digits[1] * bignum.BASE;
  }

  /** friend operator +(bignum a, const bignum& b) */
  static plus(a: bignum, b: bignum): bignum { const r = a.clone(); r.addmul(b, 1); return r; }
  /** friend operator -(bignum a, const bignum& b) */
  static minus(a: bignum, b: bignum): bignum { const r = a.clone(); r.addmul(b, -1); return r; }
}

/** bignum hrand(bignum b) */
export function hrand_bignum(b: bignum): bignum {
  const res = new bignum();
  const d = b.digits.length;
  while (true) {
    res.digits.length = d;
    for (let i = 0; i < d - 1; i++) res.digits[i] = hrand(bignum.BASE);
    res.digits[d - 1] = hrand(b.digits[d - 1] + 1);
    if (res.lt(b)) return res;
  }
}

/** void operator ++(bignum &b, int) */
export function bignum_inc(b: bignum): void {
  let i = 0;
  while (true) {
    if (b.digits.length === i) { b.digits.push(1); break; }
    else if (b.digits[i] === bignum.BASE - 1) {
      b.digits[i] = 0;
      i++;
    }
    else {
      b.digits[i]++;
      break;
    }
  }
}

/** void operator --(bignum &b, int) */
export function bignum_dec(b: bignum): void {
  let i = 0;
  while (true) {
    if (b.digits.length === i) { b.digits.push(bignum.BASE - 1); break; }
    else if (b.digits[i] === 0) {
      b.digits[i] = bignum.BASE - 1;
      i++;
    }
    else {
      b.digits[i]--;
      break;
    }
  }
}

export function short_form(b: bignum): string {
  if (b.lt(new bignum(0))) return '-' + short_form(bignum.minus(new bignum(0), b));
  else if (b.lt(new bignum(100000))) return its(b.approx_int());
  else {
    let val: number;
    let q: number;
    if (b.digits.length >= 2) {
      q = Math.max(b.digits.length - 2, 0);
      val = b.digits[q] + bignum.BASE * b.digits[q + 1];
    }
    else {
      q = 0;
      val = b.digits[0];
    }

    let digits = q * 9;
    while (val >= 1000) { val = Math.trunc(val / 10); digits++; }
    let str = its(val) + 'E' + its(digits + 2);
    str = str.slice(0, 1) + '.' + str.slice(1);
    return str;
  }
}

/** in s, replace occurences of a with b (returns the new s: C++ changes s in place) */
export function replace_str(s: string, a: string, b: string): string {
  while (s.indexOf(a) !== -1) {
    const k = s.indexOf(a);
    s = s.slice(0, k) + b + s.slice(k + a.length);
  }
  return s;
}

// compress_string (zlib deflate; only wfcgen's -wfc-c and the editors use it), file_exists, find_file, file_error,
// file_format_error, read_file_as_string: files and URLs, the save code's and the UI's (a later stage).

// open_url, open_wiki (added by U2: help.cpp's "wiki" key)
/** void open_url(string s): the browser opens the page (as the ISWEB build: window.open) */
export function open_url(s: string): void {
  const w = globalThis as { open?: (url: string) => unknown };
  if (w.open) w.open(s);
}

/** void open_wiki(const char *title) */
export function open_wiki(title: string): void {
  // Since "Crossroads" is ambiguous, we use the direct link to Crossroads I.
  if (title === 'Crossroads') {
    title = 'Crossroads (Land)';
  }
  const urlhex = '0123456789ABCDEF';
  let url = 'https://hyperrogue.miraheze.org/wiki/';
  for (const c of new TextEncoder().encode(title)) {
    if ((48 <= c && c <= 57) || (97 <= c && c <= 122) || (65 <= c && c <= 90) || c === 95 || c === 45)
      url += String.fromCharCode(c);
    else if (c === 32)
      url += '_';
    else
      url += '%' + urlhex[c >> 4] + urlhex[c & 15];
  }
  open_url(url);
}

// decompress_string (zlib's inflate, CAP_ZLIB): the strings are byte strings (one char per byte, 0..255). zlib is
// not in the browser, so this is a plain RFC 1950/1951 inflater (stored, fixed and dynamic Huffman blocks).
const INF_LBASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163,
  195, 227, 258];
const INF_LEXT = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
const INF_DBASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049,
  3073, 4097, 6145, 8193, 12289, 16385, 24577];
const INF_DEXT = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
const INF_CLORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

/** canonical Huffman code from code lengths: counts per length and the symbols sorted by code */
function inf_build(lengths: number[]): { count: number[]; symbol: number[] } {
  const count = new Array<number>(16).fill(0);
  for (const l of lengths) count[l]++;
  count[0] = 0;
  const offs = new Array<number>(16).fill(0);
  for (let i = 1; i < 16; i++) offs[i] = offs[i - 1] + count[i - 1];
  const symbol = new Array<number>(lengths.length).fill(0);
  for (let s = 0; s < lengths.length; s++) if (lengths[s]) symbol[offs[lengths[s]]++] = s;
  return { count, symbol };
}

export function decompress_string(s: string): string {
  let pos = 2; // the zlib header (CMF, FLG); the Adler-32 at the end is not checked
  if (s.length < 2 || (s.charCodeAt(0) & 15) !== 8) throw new hr_exception('z-error');
  let bitbuf = 0, bitcnt = 0;
  const out: number[] = [];
  const bits = (n: number): number => {
    while (bitcnt < n) {
      if (pos >= s.length) throw new hr_exception('z-error-2');
      bitbuf |= (s.charCodeAt(pos++) & 255) << bitcnt; bitcnt += 8;
    }
    const v = bitbuf & ((1 << n) - 1);
    bitbuf >>>= n; bitcnt -= n;
    return v;
  };
  const decode = (h: { count: number[]; symbol: number[] }): number => {
    let code = 0, first = 0, index = 0;
    for (let len = 1; len < 16; len++) {
      code |= bits(1);
      const cnt = h.count[len];
      if (code - cnt < first) return h.symbol[index + (code - first)];
      index += cnt; first += cnt; first <<= 1; code <<= 1;
    }
    throw new hr_exception('z-error-2');
  };
  let last = 0;
  while (!last) {
    last = bits(1);
    const type = bits(2);
    if (type === 0) {
      bitbuf = 0; bitcnt = 0;
      const len = (s.charCodeAt(pos) & 255) | ((s.charCodeAt(pos + 1) & 255) << 8);
      pos += 4;
      for (let i = 0; i < len; i++) out.push(s.charCodeAt(pos++) & 255);
      continue;
    }
    let lencode: { count: number[]; symbol: number[] }, distcode: { count: number[]; symbol: number[] };
    if (type === 1) {
      const l: number[] = [];
      for (let i = 0; i < 288; i++) l.push(i < 144 ? 8 : i < 256 ? 9 : i < 280 ? 7 : 8);
      lencode = inf_build(l);
      distcode = inf_build(new Array<number>(30).fill(5));
    }
    else if (type === 2) {
      const nlen = bits(5) + 257, ndist = bits(5) + 1, ncode = bits(4) + 4;
      const cl = new Array<number>(19).fill(0);
      for (let i = 0; i < ncode; i++) cl[INF_CLORDER[i]] = bits(3);
      const clcode = inf_build(cl);
      const lengths: number[] = [];
      while (lengths.length < nlen + ndist) {
        const sym = decode(clcode);
        if (sym < 16) lengths.push(sym);
        else {
          let len = 0, rep: number;
          if (sym === 16) { len = lengths[lengths.length - 1]; rep = 3 + bits(2); }
          else if (sym === 17) rep = 3 + bits(3);
          else rep = 11 + bits(7);
          for (let i = 0; i < rep; i++) lengths.push(len);
        }
      }
      lencode = inf_build(lengths.slice(0, nlen));
      distcode = inf_build(lengths.slice(nlen));
    }
    else throw new hr_exception('z-error-2');
    for (;;) {
      let sym = decode(lencode);
      if (sym < 256) out.push(sym);
      else if (sym === 256) break;
      else {
        sym -= 257;
        const len = INF_LBASE[sym] + bits(INF_LEXT[sym]);
        const ds = decode(distcode);
        const dist = INF_DBASE[ds] + bits(INF_DEXT[ds]);
        for (let i = 0; i < len; i++) out.push(out[out.length - dist]);
      }
    }
  }
  // println(hlog, isize(s), " -> ", isize(out)) (the log)
  let res = '';
  for (let i = 0; i < out.length; i += 4096) res += String.fromCharCode(...out.slice(i, i + 4096));
  return res;
}

/** EX string eval_programmable_string(const string& fmt) (added by U4: the menu line format; the values are
 *  real numbers in the port, so the "+i" part never shows) */
export function eval_programmable_string(fmt: string): string {
  try {
    const ep = new exp_parser();
    ep.s = fmt;
    let out = '';
    while (ep.at < fmt.length) {
      if (ep.eat('$(')) {
        const res = ep.parse();
        if (ep.eat(',')) {
          const prec = ep.iparse();
          // str.precision(prec); str << std::fixed; if(prec) str << std::showpoint; str << real(res);
          out += fmtF(res, prec);
        }
        else {
          out += fts(res);
        }
        ep.force_eat(')');
      }
      else out += ep.eatchar();
    }
    return out;
  }
  catch (ex) {
    if (ex instanceof hr_parse_exception) return fmt;
    throw ex;
  }
}

export function starts_with(c: string, token: string): boolean {
  return c.startsWith(token);
}

/** floyd_warshall(vector<vector<char>>& v): chars, so every store wraps to a signed char */
export function floyd_warshall(v: number[][]): void {
  const N = v.length;
  for (let k = 0; k < N; k++)
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++)
        v[i][j] = (Math.min(v[i][j], v[i][k] + v[k][j]) << 24) >> 24;
}
