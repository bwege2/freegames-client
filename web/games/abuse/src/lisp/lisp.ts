// lisp/lisp.cpp, lisp_opt.cpp, lisp_gc.cpp: Abuse's Lisp interpreter, translated statement by statement.
// Cells are JavaScript objects; nil is null. The original allocates cells in spaces it collects by
// copying (lisp_gc.cpp); collection changes no value a program can see, so the port leaves it to
// JavaScript's garbage collector. Numbers keep the original's quirk: setq/setf of a number into a
// symbol whose value is a number changes that number cell in place (LSymbol::SetNumber), so every
// other reference to the cell sees the new value too.
import { dprintf, fatal, ExitProgram } from '../imlib/dprint.ts';
import { bFILE, jFILE, open_file, get_save_filename_prefix } from '../imlib/specs.ts';
import { crc_manager } from '../crc.ts';
import { sin_table, atan_table, TBS } from './trig.ts';

export const L_BAD_CELL = 0, L_CONS_CELL = 1, L_NUMBER = 2, L_SYMBOL = 3, L_SYS_FUNCTION = 4, L_USER_FUNCTION = 5,
  L_STRING = 6, L_CHARACTER = 7, L_C_FUNCTION = 8, L_C_BOOL = 9, L_L_FUNCTION = 10, L_POINTER = 11,
  L_OBJECT_VAR = 12, L_1D_ARRAY = 13, L_FIXED_POINT = 14, L_COLLECTED_OBJECT = 15;

export const PERM_SPACE = 0, TMP_SPACE = 1, USER_SPACE = 2, GC_SPACE = 3;
export const FIXED_TRIG_SIZE = 360;

export type LObj = LObject | null;

export class LObject {
  type: number;
  constructor(type: number) { this.type = type; }
}
export class LList extends LObject {
  car: LObj = null;
  cdr: LObj = null;
  constructor() { super(L_CONS_CELL); }
}
export class LNumber extends LObject {
  num: number;
  constructor(num: number) { super(L_NUMBER); this.num = num; }
}
export class LString extends LObject {
  str: string;
  constructor(s: string) { super(L_STRING); this.str = s; }
}
export class LSymbol extends LObject {
  value: LObj;
  function: LObj;
  name: LString;
  constructor(name: string) {
    super(L_SYMBOL);
    this.name = new LString(name);
    this.value = null;
    this.function = null;
  }
}
export class LSysFunction extends LObject {
  min_args: number;
  max_args: number;
  fun_number: number;
  constructor(type: number, min: number, max: number, n: number) {
    super(type);
    this.min_args = min;
    this.max_args = max;
    this.fun_number = n;
  }
}
export class LUserFunction extends LObject {
  arg_list: LObj;
  block_list: LObj;
  constructor(a: LObj, b: LObj) { super(L_USER_FUNCTION); this.arg_list = a; this.block_list = b; }
}
export class LArray extends LObject {
  len: number;
  data: LObj[];
  constructor(len: number) { super(L_1D_ARRAY); this.len = len; this.data = new Array(len).fill(null); }
}
export class LChar extends LObject {
  ch: number;
  constructor(ch: number) { super(L_CHARACTER); this.ch = ch & 0xffff; }
}
export class LPointer extends LObject {
  addr: unknown;
  constructor(addr: unknown) { super(L_POINTER); this.addr = addr; }
}
export class LFixedPoint extends LObject {
  x: number;
  constructor(x: number) { super(L_FIXED_POINT); this.x = x | 0; }
}
export class LObjectVar extends LObject {
  index: number;
  constructor(i: number) { super(L_OBJECT_VAR); this.index = i; }
}

// ------------------------------------------------------------------ the game's side (clisp.cpp)
export interface LispHooks {
  c_caller(n: number, args: LObj): number;
  l_caller(n: number, args: LObj): LObj;
  l_obj_get(n: number): LObj;
  l_obj_set(n: number, v: LObj): void;
  l_obj_print(n: number): void;
  clisp_init(): void;
  /** the loading progress (stat_man) */
  status_push?(msg: string): void;
  status_update?(percent: number): void;
  status_pop?(): void;
}
let hooks: LispHooks | null = null;
export function set_lisp_hooks(h: LispHooks): void { hooks = h; }

export let current_space = TMP_SPACE;
export function set_current_space(s: number): void { current_space = s; }
export let current_print_file: bFILE | null = null;
export let trace_level = 0;
let print_level = 0, trace_print_level = 1000;
export let total_user_functions = 0;
let break_level = 0;

/** l_user_stack: values the interpreter saves while it binds symbols */
export const l_user_stack: LObj[] = [];

// ------------------------------------------------------------------ symbols (lisp_opt.cpp)
const symbols = new Map<string, LSymbol>();
export let l_undefined: LSymbol;
export let true_symbol: LSymbol, list_symbol: LSymbol, string_symbol: LSymbol, quote_symbol: LSymbol,
  backquote_symbol: LSymbol, comma_symbol: LSymbol, do_symbol: LSymbol, in_symbol: LSymbol, aref_symbol: LSymbol,
  if_symbol: LSymbol, progn_symbol: LSymbol, car_symbol: LSymbol, cdr_symbol: LSymbol;
let colon_initial_contents: LSymbol, colon_initial_element: LSymbol, eq_symbol: LSymbol, zero_symbol: LSymbol,
  eq0_symbol: LSymbol, load_warning: LSymbol, if_1progn: LSymbol, if_2progn: LSymbol, if_12progn: LSymbol,
  not_symbol: LSymbol;

export function symbol_count(): number { return symbols.size; }

export function find_symbol(name: string): LSymbol | null {
  return symbols.get(name) ?? null;
}

export function find_or_create(name: string): LSymbol {
  let p = symbols.get(name);
  if (p) return p;
  p = new LSymbol(name);
  // If constant, set the value to ourself
  p.value = name[0] === ':' ? p : l_undefined;
  p.function = l_undefined;
  symbols.set(name, p);
  return p;
}

function l_comp_init(): void {
  l_undefined = null as unknown as LSymbol;
  l_undefined = find_or_create(':UNDEFINED');
  l_undefined.function = null;
  l_undefined.value = null;
  true_symbol = find_or_create('T');
  list_symbol = find_or_create('list');
  string_symbol = find_or_create('string');
  quote_symbol = find_or_create('quote');
  backquote_symbol = find_or_create('backquote');
  comma_symbol = find_or_create('comma');
  in_symbol = find_or_create('in');
  do_symbol = find_or_create('do');
  aref_symbol = find_or_create('aref');
  colon_initial_contents = find_or_create(':initial-contents');
  colon_initial_element = find_or_create(':initial-element');
  if_1progn = find_or_create('if-1progn');
  if_2progn = find_or_create('if-2progn');
  if_12progn = find_or_create('if-12progn');
  if_symbol = find_or_create('if');
  progn_symbol = find_or_create('progn');
  not_symbol = find_or_create('not');
  eq_symbol = find_or_create('eq');
  zero_symbol = find_or_create('0');
  eq0_symbol = find_or_create('eq0');
  car_symbol = find_or_create('car');
  cdr_symbol = find_or_create('cdr');
  load_warning = find_or_create('load_warning');
}

// ------------------------------------------------------------------ helpers
export function item_type(x: LObj): number {
  return x ? x.type : L_CONS_CELL;
}
export function CAR(x: LObj): LObj { return (x as LList).car; }
export function CDR(x: LObj): LObj { return (x as LList).cdr; }
export function DEFINEDP(x: LObj): boolean { return x !== l_undefined; }
export function NILP(x: LObj): boolean { return x === null; }

export function lbreak(msg: string): never {
  break_level++;
  dprintf(msg + '\n');
  fatal(`lisp: ${msg.trim()}`);
}

function need_perm_space(why: string): void {
  if (current_space !== PERM_SPACE && current_space !== GC_SPACE) lbreak(`${why} : action requires permanant space\n`);
}

export function new_cons(): LList { return new LList(); }
export function new_number(n: number): LNumber { return new LNumber(n); }
export function new_string(s: string): LString { return new LString(s); }
export function new_char(c: number): LChar { return new LChar(c); }
export function new_fixed(x: number): LFixedPoint { return new LFixedPoint(x); }
/** LPointer::Create: NULL stays nil */
export function new_pointer(addr: unknown): LPointer | null { return addr === null || addr === undefined ? null : new LPointer(addr); }

export function lpointer_value(p: LObj): unknown {
  if (!p) return null;
  if (item_type(p) !== L_POINTER) {
    print(p);
    lbreak(' is not a pointer\n');
  }
  return (p as LPointer).addr;
}

/** int32_t lnumber_value(void *) */
export function lnumber_value(n: LObj): number {
  switch (item_type(n)) {
    case L_NUMBER: return (n as LNumber).num | 0;
    case L_FIXED_POINT: return (n as LFixedPoint).x >> 16;
    case L_STRING: { const s = (n as LString).str; return s.length ? s.charCodeAt(0) & 0xff : 0; }
    case L_CHARACTER: return lcharacter_value(n);
    default:
      print(n);
      lbreak(' is not a number\n');
  }
}

export function lstring_value(s: LObj): string {
  if (item_type(s) !== L_STRING) {
    print(s);
    lbreak(' is not a string\n');
  }
  return (s as LString).str;
}

export function lcharacter_value(c: LObj): number {
  if (item_type(c) !== L_CHARACTER) {
    print(c);
    lbreak('is not a character\n');
  }
  return (c as LChar).ch;
}

/** long lfixed_point_value(void *) */
export function lfixed_point_value(c: LObj): number {
  switch (item_type(c)) {
    case L_NUMBER: return (c as LNumber).num * 65536; // num << 16 on a long
    case L_FIXED_POINT: return (c as LFixedPoint).x;
    default:
      print(c);
      lbreak(' is not a number\n');
  }
}

export function lisp_atom(i: LObj): LObj {
  return item_type(i) === L_CONS_CELL ? null : true_symbol;
}
export function lcdr(c: LObj): LObj {
  if (!c) return null;
  return c.type === L_CONS_CELL ? (c as LList).cdr : null;
}
export function lcar(c: LObj): LObj {
  if (!c) return null;
  return c.type === L_CONS_CELL ? (c as LList).car : null;
}

export function lisp_eq(n1: LObj, n2: LObj): LObj {
  if (!n1 && !n2) return true_symbol;
  if ((n1 && !n2) || (n2 && !n1)) return null;
  const t1 = n1!.type, t2 = n2!.type;
  if (t1 !== t2) return null;
  if (t1 === L_NUMBER) return (n1 as LNumber).num === (n2 as LNumber).num ? true_symbol : null;
  if (t1 === L_CHARACTER) return (n1 as LChar).ch === (n2 as LChar).ch ? true_symbol : null;
  if (n1 === n2) return true_symbol;
  return null;
}

export function lisp_equal(n1: LObj, n2: LObj): LObj {
  if (!n1 && !n2) return true_symbol;
  if (!n1 || !n2) return null;
  const t1 = item_type(n1), t2 = item_type(n2);
  if (t1 !== t2) return null;
  switch (t1) {
    case L_STRING:
      return lstring_value(n1) === lstring_value(n2) ? true_symbol : null;
    case L_CONS_CELL:
      while (n1 && n2) {
        if (!lisp_equal(CAR(n1), CAR(n2))) return null;
        n1 = CDR(n1);
        n2 = CDR(n2);
        if (n1 && n1.type !== L_CONS_CELL) return lisp_equal(n1, n2);
      }
      if (n1 || n2) return null;
      return true_symbol;
    default:
      return lisp_eq(n1, n2);
  }
}

export function lisp_cos(x: number): number {
  x = (x + FIXED_TRIG_SIZE / 4) % FIXED_TRIG_SIZE;
  return x < 0 ? sin_table[FIXED_TRIG_SIZE + x] : sin_table[x];
}
export function lisp_sin(x: number): number {
  x = x % FIXED_TRIG_SIZE;
  return x < 0 ? sin_table[FIXED_TRIG_SIZE + x] : sin_table[x];
}

const idiv = (a: number, b: number): number => (a / b) | 0;

export function lisp_atan2(dy: number, dx: number): number {
  if (dy === 0) return dx > 0 ? 0 : 180;
  if (dx === 0) return dy > 0 ? 90 : 270;
  if (dx > 0) {
    if (dy > 0) {
      if (Math.abs(dx) > Math.abs(dy)) {
        const a = idiv(Math.imul(dx, 29), dy);
        return a >= TBS ? 0 : 45 - atan_table[a];
      } else {
        const a = idiv(Math.imul(dy, 29), dx);
        return a >= TBS ? 90 : 45 + atan_table[a];
      }
    } else {
      if (Math.abs(dx) > Math.abs(dy)) {
        const a = idiv(Math.imul(dx, 29), Math.abs(dy));
        return a >= TBS ? 0 : 315 + atan_table[a];
      } else {
        const a = idiv(Math.imul(Math.abs(dy), 29), dx);
        return a >= TBS ? 260 : 315 - atan_table[a];
      }
    }
  } else {
    if (dy > 0) {
      if (Math.abs(dx) > Math.abs(dy)) {
        const a = idiv(Math.imul(-dx, 29), dy);
        return a >= TBS ? 135 + 45 : 135 + atan_table[a];
      } else {
        const a = idiv(Math.imul(dy, 29), -dx);
        return a >= TBS ? 135 - 45 : 135 - atan_table[a];
      }
    } else {
      if (Math.abs(dx) > Math.abs(dy)) {
        const a = idiv(Math.imul(-dx, 29), Math.abs(dy));
        return a >= TBS ? 225 - 45 : 225 - atan_table[a];
      } else {
        const a = idiv(Math.imul(Math.abs(dy), 29), Math.abs(dx));
        return a >= TBS ? 225 + 45 : 225 + atan_table[a];
      }
    }
  }
}

export function nth(num: number, list: LObj): LObj {
  if (num < 0) lbreak(`NTH: ${num} is not a nonnegative fixnum and therefore not a valid index\n`);
  while (list && num) {
    list = CDR(list);
    num--;
  }
  return list ? CAR(list) : null;
}

export function assoc(item: LObj, list: LObj): LObj {
  if (item_type(list) !== L_CONS_CELL) return null;
  while (list) {
    if (lisp_eq(CAR(CAR(list)), item)) return lcar(list);
    list = CDR(list);
  }
  return null;
}

/** LList::GetLength */
export function list_length(l: LObj): number {
  if (l && item_type(l) !== L_CONS_CELL) {
    print(l);
    lbreak(' is not a sequence\n');
  }
  let ret = 0;
  for (let p = l; p; p = CDR(p)) ret++;
  return ret;
}

function pairlis(list1: LObj, list2: LObj, list3: LObj): LObj {
  if (item_type(list1) !== L_CONS_CELL || item_type(list1) !== item_type(list2)) return null;
  const l1 = list_length(list1), l2 = list_length(list2);
  if (l1 !== l2) {
    print(list1);
    print(list2);
    lbreak('... are not the same length (pairlis)\n');
  }
  if (l1 === 0) return null;
  let first: LList | null = null, last: LList | null = null, cur: LList | null = null;
  while (list1) {
    cur = new LList();
    if (!first) first = cur;
    if (last) last.cdr = cur;
    last = cur;
    const cell = new LList();
    cell.car = lcar(list1);
    cell.cdr = lcar(list2);
    cur.car = cell;
    list1 = (list1 as LList).cdr;
    list2 = (list2 as LList).cdr;
  }
  cur!.cdr = list3;
  return first;
}

export function push_onto_list(object: LObj, list: { v: LObj }): void {
  const c = new LList();
  c.car = object;
  c.cdr = list.v;
  list.v = c;
}

function add_sys_function(name: string, min: number, max: number, n: number): LSymbol {
  need_perm_space('add_sys_function');
  const s = find_or_create(name);
  if (s.function !== l_undefined) lbreak(`add_sys_fucntion -> symbol ${name} already has a function\n`);
  s.function = new LSysFunction(L_SYS_FUNCTION, min, max, n);
  return s;
}

export function add_c_object(symbol: LSymbol, index: number): LSymbol | null {
  need_perm_space('add_c_object');
  if (symbol.value !== l_undefined) lbreak(`add_c_object -> symbol ${symbol.name.str} already has a value\n`);
  symbol.value = new LObjectVar(index);
  return null;
}

function add_fun(type: number, name: string, min: number, max: number, n: number): LSymbol {
  total_user_functions++;
  need_perm_space('add_c_function');
  const s = find_or_create(name);
  if (s.function !== l_undefined) lbreak(`add_sys_fucntion -> symbol ${name} already has a function\n`);
  s.function = new LSysFunction(type, min, max, n);
  return s;
}
export function add_c_function(name: string, min: number, max: number, n: number): LSymbol {
  return add_fun(L_C_FUNCTION, name, min, max, n);
}
export function add_c_bool_fun(name: string, min: number, max: number, n: number): LSymbol {
  return add_fun(L_C_BOOL, name, min, max, n);
}
export function add_lisp_function(name: string, min: number, max: number, n: number): LSymbol {
  return add_fun(L_L_FUNCTION, name, min, max, n);
}

// ------------------------------------------------------------------ the reader
/** a position in source text: the original's `char const *&` */
export class Src {
  s: string;
  i: number;
  constructor(s: string, i = 0) { this.s = s; this.i = i; }
  c(k = 0): string { return this.s[this.i + k] ?? '\0'; }
}

function skip_c_comment(s: Src): void {
  s.i += 2;
  while (s.c() !== '\0' && (s.c() !== '*' || s.c(1) !== '/')) {
    if (s.c() === '/' && s.c(1) === '*') skip_c_comment(s);
    else s.i++;
  }
  if (s.c() !== '\0') s.i += 2;
}

function str_token_len(s: Src): number {
  let x = 1, i = s.i;
  const at = (k: number): string => s.s[k] ?? '\0';
  while (at(i) !== '\0' && (at(i) !== '"' || at(i + 1) === '"')) {
    if (at(i) === '\\' || at(i) === '"') i++;
    i++;
    x++;
  }
  return x;
}

const EOF26 = '\x1a';

/** read_ltoken: the next token, or null at the end */
export function read_ltoken(s: Src): string | null {
  for (;;) {
    while (s.c() === ' ' || s.c() === '\t' || s.c() === '\n' || s.c() === '\r' || s.c() === EOF26) s.i++;
    if (s.c() === ';') {
      while (s.c() !== '\0' && s.c() !== '\n' && s.c() !== '\r' && s.c() !== EOF26) s.i++;
      continue;
    } else if (s.c() === '/' && s.c(1) === '*') {
      skip_c_comment(s);
      continue;
    }
    break;
  }
  const c = s.c();
  if (c === '\0') return null;
  if (c === ')' || c === '(' || c === "'" || c === '`' || c === ',' || c === EOF26) {
    s.i++;
    return c;
  }
  if (c === '"') {
    s.i++;
    return '"';
  }
  if (c === '#') {
    let b = '#';
    s.i++;
    if (s.c() !== "'") {
      b += s.c();
      s.i++;
    }
    return b;
  }
  let b = '';
  while (s.c() !== '\0' && s.c() !== ')' && s.c() !== '(' && s.c() !== ' ' && s.c() !== '\n' && s.c() !== '\r' &&
         s.c() !== '\t' && s.c() !== ';' && s.c() !== EOF26) {
    b += s.c();
    s.i++;
  }
  return b;
}

export function end_of_program(s: Src): boolean {
  return read_ltoken(new Src(s.s, s.i)) === null;
}

function lerror(loc: Src | null, cause: string): never {
  if (loc) {
    let out = '';
    for (let lines = 0, i = loc.i; i < loc.s.length && lines < 10; i++) {
      if (loc.s[i] === '\n') lines++;
      out += loc.s[i];
    }
    dprintf(out + '\nPROGRAM LOCATION : \n');
  }
  dprintf(`ERROR MESSAGE : ${cause}\n`);
  lbreak('');
}

const isdigit = (c: string | undefined): boolean => c !== undefined && c >= '0' && c <= '9';

/** sscanf(n, "%ld", ...) */
function scan_long(n: string): number {
  const m = /^\s*([+-]?\d+)/.exec(n);
  return m ? Number(m[1]) : 0;
}

function quoted(sym: LSymbol, code: Src): LObj {
  const cs = new LList();
  cs.car = sym;
  const c2 = new LList();
  c2.car = compile(code);
  c2.cdr = null;
  cs.cdr = c2;
  return cs;
}

/** LObject::Compile */
export function compile(code: Src): LObj {
  const n = read_ltoken(code);
  if (n === null) lerror(null, 'unexpected end of program');
  if (n === 'nil') return null;
  if (n[0].toUpperCase() === 'T' && n.length === 1) return true_symbol;
  if (n[0] === "'") return quoted(quote_symbol, code);
  if (n[0] === '`') return quoted(backquote_symbol, code);
  if (n[0] === ',') return quoted(comma_symbol, code);
  if (n[0] === '(') {
    let first: LList | null = null, cur: LList | null = null, last: LList | null = null;
    let done = false;
    do {
      const peek = new Src(code.s, code.i);
      const t = read_ltoken(peek);
      if (t === null) lerror(null, 'unexpected end of program');
      if (t[0] === ')') {
        done = true;
        read_ltoken(code);
      } else if (t[0] === '.' && t.length === 1) {
        if (!first) lerror(code, "token '.' not allowed here\n");
        read_ltoken(code);
        const tmp = compile(code);
        last!.cdr = tmp;
        last = null;
      } else if (!last && first) {
        lerror(code, 'illegal end of dotted list\n');
      } else {
        cur = new LList();
        if (!first) first = cur;
        cur.car = compile(code);
        if (last) last.cdr = cur;
        last = cur;
      }
    } while (!done);
    return comp_optimize(first);
  }
  if (n[0] === ')') lerror(code, 'mismatched )');
  if (isdigit(n[0]) || (n[0] === '-' && isdigit(n[1]))) return new LNumber(scan_long(n));
  if (n[0] === '"') {
    str_token_len(code);
    let out = '';
    for (; code.c() !== '\0' && (code.c() !== '"' || code.c(1) === '"'); code.i++) {
      if (code.c() === '\\') {
        code.i++;
        const e = code.c();
        if (e === 'n') out += '\n';
        else if (e === 'r') out += '\r';
        else if (e === 't') out += '\t';
        else if (e === '\\') out += '\\';
        else out += '\0'; // the original leaves this character unset
      } else out += code.c();
      if (code.c() === '"') code.i++;
    }
    code.i++;
    return new LString(cstr(out));
  }
  if (n[0] === '#') {
    if (n[1] === '\\') {
      const name = read_ltoken(code) ?? '';
      if (name === 'newline') return new LChar(10);
      if (name === 'space') return new LChar(32);
      return new LChar(name.length ? name.charCodeAt(0) : 0);
    } else if (n.length === 1) {
      const cs = new LList();
      cs.car = find_or_create('function');
      const c2 = new LList();
      c2.car = compile(code);
      cs.cdr = c2;
      return cs;
    }
    lbreak(`Unknown #\\ notation : ${n}\n`);
  }
  return find_or_create(n);
}

/** lisp_opt.cpp comp_optimize: rewrites (if ...) forms */
function comp_optimize(list: LObj): LObj {
  let return_val = list;
  if (list) {
    if (CAR(list) === if_symbol) {
      const eval1 = lcar(lcdr(lcdr(list)));
      const eval2 = lcar(lcdr(lcdr(lcdr(list))));
      const ret = { v: null as LObj };
      if (lcar(list) === eq_symbol && lcar(lcdr(list)) === zero_symbol) {
        push_onto_list(lcar(lcdr(lcdr(list))), ret);
        push_onto_list(eq0_symbol, ret);
        return_val = comp_optimize(ret.v);
      } else if (lcar(list) === eq_symbol && lcar(lcdr(lcdr(list))) === zero_symbol) {
        push_onto_list(lcar(lcdr(list)), ret);
        push_onto_list(eq0_symbol, ret);
        return_val = comp_optimize(ret.v);
      } else if (lcar(lcar(lcdr(list))) === not_symbol) {
        push_onto_list(lcar(lcdr(lcdr(list))), ret);
        push_onto_list(lcar(lcdr(lcdr(lcdr(list)))), ret);
        push_onto_list(lcar(lcdr(lcar(lcdr(list)))), ret);
        push_onto_list(if_symbol, ret);
        return_val = comp_optimize(ret.v);
      } else if (lcar(eval1) === progn_symbol && (eval2 === null || item_type(eval2) !== L_CONS_CELL)) {
        push_onto_list(eval2, ret);
        push_onto_list(lcdr(eval1), ret);
        push_onto_list(lcar(lcdr(list)), ret);
        push_onto_list(if_1progn, ret);
        return_val = comp_optimize(ret.v);
      } else if (lcar(eval1) === progn_symbol && lcar(eval2) === progn_symbol) {
        push_onto_list(lcdr(eval2), ret);
        push_onto_list(lcdr(eval1), ret);
        push_onto_list(lcar(lcdr(list)), ret);
        push_onto_list(if_12progn, ret);
        return_val = comp_optimize(ret.v);
      } else if (lcar(eval2) === progn_symbol) {
        push_onto_list(lcdr(eval2), ret);
        push_onto_list(eval1, ret);
        push_onto_list(lcar(lcdr(list)), ret);
        push_onto_list(if_2progn, ret);
        return_val = comp_optimize(ret.v);
      }
    }
  }
  return return_val;
}

// ------------------------------------------------------------------ printing
function lprint_string(st: string): void {
  if (current_print_file) {
    for (let i = 0; i < st.length; i++) current_print_file.write_uint8(st.charCodeAt(i));
  } else dprintf(st);
}

/** %g as printf writes it */
export function fmt_g(v: number): string {
  if (v === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(v)));
  if (exp < -4 || exp >= 6) {
    const s = v.toExponential(5).replace(/\.?0+e/, 'e');
    return s.replace(/e([+-])(\d)$/, 'e$10$2');
  }
  return String(Number(v.toPrecision(6)));
}

/** LObject::Print */
export function print(o: LObj): void {
  print_level++;
  switch (item_type(o)) {
    case L_CONS_CELL:
      if (!o) lprint_string('nil');
      else {
        lprint_string('(');
        for (let cs: LObj = o; cs; cs = lcdr(cs)) {
          if (item_type(cs) === L_CONS_CELL) {
            print((cs as LList).car);
            if ((cs as LList).cdr) lprint_string(' ');
          } else {
            lprint_string('. ');
            print(cs);
            cs = null;
          }
        }
        lprint_string(')');
      }
      break;
    case L_NUMBER: lprint_string(String((o as LNumber).num)); break;
    case L_SYMBOL: lprint_string((o as LSymbol).name.str); break;
    case L_USER_FUNCTION:
    case L_SYS_FUNCTION: lprint_string('err... function?'); break;
    case L_C_FUNCTION: lprint_string('C function, returns number\n'); break;
    case L_C_BOOL: lprint_string('C boolean function\n'); break;
    case L_L_FUNCTION: lprint_string('External lisp function\n'); break;
    case L_STRING:
      if (current_print_file) lprint_string(lstring_value(o));
      else dprintf(`"${lstring_value(o)}"`);
      break;
    case L_POINTER: lprint_string('0x1'); break;
    case L_FIXED_POINT: {
      const v = lfixed_point_value(o);
      lprint_string(fmt_g(Math.floor(v / 65536) + (v & 0xffff) / 0x10000));
      break;
    }
    case L_CHARACTER:
      if (current_print_file) current_print_file.write_uint8((o as LChar).ch & 0xff);
      else {
        const ch = (o as LChar).ch;
        dprintf('#\\');
        if (ch === 10) dprintf('newline');
        else if (ch === 32) dprintf('space');
        else dprintf(String.fromCharCode(ch & 0xff));
      }
      break;
    case L_OBJECT_VAR: hooks!.l_obj_print((o as LObjectVar).index); break;
    case L_1D_ARRAY: {
      const a = o as LArray;
      dprintf('#(');
      for (let j = 0; j < a.len; j++) {
        print(a.data[j]);
        if (j !== a.len - 1) dprintf(' ');
      }
      dprintf(')');
      break;
    }
    default: dprintf("Shouldn't happen\n");
  }
  print_level--;
  if (!print_level && !current_print_file) dprintf('\n');
}

// ------------------------------------------------------------------ evaluation
function eval_function(sym: LObj, arg_list: LObj): LObj {
  if (item_type(sym) !== L_SYMBOL) {
    print(sym);
    lbreak('EVAL: is not a function name (not symbol either)');
  }
  const s = sym as LSymbol;
  const fun = s.function;
  const t = item_type(fun);
  let req_min = 0, req_max = 0;
  switch (t) {
    case L_SYS_FUNCTION:
    case L_C_FUNCTION:
    case L_C_BOOL:
    case L_L_FUNCTION:
      req_min = (fun as LSysFunction).min_args;
      req_max = (fun as LSysFunction).max_args;
      break;
    case L_USER_FUNCTION:
      return eval_user_function(s, arg_list);
    default:
      print(s);
      lbreak(' is not a function name');
  }
  if (req_min !== -1) {
    let args = 0;
    for (let a = arg_list; a; a = CDR(a)) args++;
    if (args < req_min) {
      print(arg_list);
      print(s.name);
      lbreak('\nToo few parameters to function\n');
    } else if (req_max !== -1 && args > req_max) {
      print(arg_list);
      print(s.name);
      lbreak('\nToo many parameters to function\n');
    }
  }
  let ret: LObj = null;
  switch (t) {
    case L_SYS_FUNCTION:
      ret = sys_function(fun as LSysFunction, arg_list);
      break;
    case L_L_FUNCTION:
      ret = hooks!.l_caller((fun as LSysFunction).fun_number, arg_list);
      break;
    case L_C_FUNCTION:
    case L_C_BOOL: {
      let first: LList | null = null, cur: LList | null = null;
      while (arg_list) {
        const tmp = new LList();
        if (first) cur!.cdr = tmp;
        else first = tmp;
        cur = tmp;
        cur.car = lisp_eval(CAR(arg_list));
        arg_list = lcdr(arg_list);
      }
      if (t === L_C_FUNCTION) ret = new LNumber(hooks!.c_caller((fun as LSysFunction).fun_number, first));
      else ret = hooks!.c_caller((fun as LSysFunction).fun_number, first) ? true_symbol : null;
      break;
    }
  }
  return ret;
}
export { eval_function };

function mapcar(arg_list: LObj): LObj {
  const sym = lisp_eval(CAR(arg_list));
  switch (item_type(sym)) {
    case L_SYS_FUNCTION:
    case L_USER_FUNCTION:
    case L_SYMBOL:
      break;
    default:
      print(sym);
      lbreak(' is not a function\n');
  }
  const num_args = list_length(CDR(arg_list));
  if (!num_args) return null;
  const arg_on: LObj[] = [];
  let list_on = CDR(arg_list);
  let stop = false;
  for (let i = 0; i < num_args; i++) {
    arg_on[i] = lisp_eval(CAR(list_on));
    list_on = CDR(list_on);
    if (!arg_on[i]) stop = true;
  }
  if (stop) return null;
  let return_list: LList | null = null, last_return: LList | null = null;
  do {
    let na_list: LList | null = null, first: LList | null = null;
    for (let i = 0; !stop && i < num_args; i++) {
      if (!na_list) first = na_list = new LList();
      else {
        na_list.cdr = new LList();
        na_list = na_list.cdr as LList;
      }
      if (arg_on[i]) {
        na_list.car = CAR(arg_on[i]);
        arg_on[i] = CDR(arg_on[i]);
      } else stop = true;
    }
    if (!stop) {
      const c = new LList();
      c.car = eval_function(sym, first);
      if (return_list) last_return!.cdr = c;
      else return_list = c;
      last_return = c;
    }
  } while (!stop);
  return return_list;
}

function concatenate(prog_list: LObj): LObj {
  let el_list = CDR(prog_list);
  const rtype = lisp_eval(CAR(prog_list));
  if (rtype !== string_symbol) {
    print(prog_list);
    lbreak("concat operation not supported, try 'string\n");
  }
  const elements = list_length(el_list);
  if (!elements) return new LString('');
  const str_eval: LObj[] = [];
  for (let i = 0; i < elements; i++, el_list = CDR(el_list)) {
    str_eval[i] = lisp_eval(CAR(el_list));
    switch (item_type(str_eval[i])) {
      case L_CONS_CELL:
        for (let cl = str_eval[i]; cl; cl = CDR(cl)) {
          if (item_type(CAR(cl)) !== L_CHARACTER) {
            print(str_eval[i]);
            lbreak(' is not a character\n');
          }
        }
        break;
      case L_STRING: break;
      default:
        print(prog_list);
        lbreak('type not supported\n');
    }
  }
  let s = '';
  for (let i = 0; i < elements; i++) {
    switch (item_type(str_eval[i])) {
      case L_CONS_CELL:
        for (let cl = str_eval[i]; cl; cl = CDR(cl)) {
          if (item_type(CAR(cl)) === L_CHARACTER) s += String.fromCharCode((CAR(cl) as LChar).ch & 0xff);
        }
        break;
      case L_STRING:
        s += cstr(lstring_value(str_eval[i]));
        break;
    }
  }
  return new LString(cstr(s));
}

/** a string as C sees it: up to its first NUL */
export function cstr(s: string): string {
  const z = s.indexOf('\0');
  return z < 0 ? s : s.slice(0, z);
}

function backquote_eval(args: LObj): LObj {
  if (item_type(args) !== L_CONS_CELL) return args;
  if (args === null) return null;
  if ((args as LList).car === comma_symbol) return lisp_eval(CAR(CDR(args)));
  let first: LList | null = null, last: LList | null = null;
  while (args) {
    if (item_type(args) === L_CONS_CELL) {
      if (CAR(args) === comma_symbol) {
        last!.cdr = lisp_eval(CAR(CDR(args)));
        args = null;
      } else {
        const cur = new LList();
        if (first) last!.cdr = cur;
        else first = cur;
        last = cur;
        cur.car = backquote_eval(CAR(args));
        args = CDR(args);
      }
    } else {
      last!.cdr = backquote_eval(args);
      args = null;
    }
  }
  return first;
}

/** LSymbol::SetNumber */
export function set_number(s: LSymbol, num: number): void {
  if (s.value !== l_undefined && item_type(s.value) === L_NUMBER) (s.value as LNumber).num = num;
  else s.value = new LNumber(num);
}

const SYS_FUNCS: [string, number, number][] = [
  ['print', 1, -1], ['car', 1, 1], ['cdr', 1, 1], ['length', 0, -1], ['list', 0, -1], ['cons', 2, 2],
  ['quote', 1, 1], ['eq', 2, 2], ['+', 0, -1], ['-', 1, -1], ['if', 2, 3], ['setf', 2, 2],
  ['symbol-list', 0, 0], ['assoc', 2, 2], ['null', 1, 1], ['acons', 2, 2], ['pairlis', 2, 2], ['let', 1, -1],
  ['defun', 2, -1], ['atom', 1, 1], ['not', 1, 1], ['and', -1, -1], ['or', -1, -1], ['progn', -1, -1],
  ['equal', 2, 2], ['concatenate', 1, -1], ['char-code', 1, 1], ['code-char', 1, 1], ['*', -1, -1],
  ['/', 1, -1], ['cond', -1, -1], ['select', 1, -1], ['function', 1, 1], ['mapcar', 2, -1],
  ['funcall', 1, -1], ['>', 2, 2], ['<', 2, 2], ['tmp-space', 0, 0], ['perm-space', 0, 0],
  ['symbol-name', 1, 1], ['trace', 0, -1], ['untrace', 0, -1], ['digstr', 2, 2], ['compile-file', 1, 1],
  ['abs', 1, 1], ['min', 2, 2], ['max', 2, 2], ['>=', 2, 2], ['<=', 2, 2], ['backquote', 1, 1],
  ['comma', 1, 1], ['nth', 2, 2], ['resize-tmp', 1, 1], ['resize-perm', 1, 1], ['cos', 1, 1], ['sin', 1, 1],
  ['atan2', 2, 2], ['enum', 1, -1], ['quit', 0, 0], ['eval', 1, 1], ['break', 0, 0], ['mod', 2, 2],
  ['write_profile', 1, 1], ['setq', 2, 2], ['for', 4, -1], ['open_file', 2, -1], ['load', 1, 1],
  ['bit-and', 1, -1], ['bit-or', 1, -1], ['bit-xor', 1, -1], ['make-array', 1, -1], ['aref', 2, 2],
  ['if-1progn', 2, 3], ['if-2progn', 2, 3], ['if-12progn', 2, 3], ['eq0', 1, 1], ['preport', 1, 1],
  ['search', 2, 2], ['elt', 2, 2], ['listp', 1, 1], ['numberp', 1, 1], ['do', 2, 3], ['gc', 0, 0],
  ['schar', 2, 2], ['symbolp', 1, 1], ['num2str', 1, 1], ['nconc', 2, -1], ['first', 1, 1], ['second', 1, 1],
  ['third', 1, 1], ['fourth', 1, 1], ['fifth', 1, 1], ['sixth', 1, 1], ['seventh', 1, 1], ['eighth', 1, 1],
  ['ninth', 1, 1], ['tenth', 1, 1], ['substr', 3, 3], ['local_load', 1, 1],
];

const F = {
  PRINT: 0, CAR: 1, CDR: 2, LENGTH: 3, LIST: 4, CONS: 5, QUOTE: 6, EQ: 7, PLUS: 8, MINUS: 9, IF: 10, SETF: 11,
  SYMBOL_LIST: 12, ASSOC: 13, NULL: 14, ACONS: 15, PAIRLIS: 16, LET: 17, DEFUN: 18, ATOM: 19, NOT: 20, AND: 21,
  OR: 22, PROGN: 23, EQUAL: 24, CONCATENATE: 25, CHAR_CODE: 26, CODE_CHAR: 27, TIMES: 28, SLASH: 29, COND: 30,
  SELECT: 31, FUNCTION: 32, MAPCAR: 33, FUNCALL: 34, GT: 35, LT: 36, TMP_SPACE: 37, PERM_SPACE: 38,
  SYMBOL_NAME: 39, TRACE: 40, UNTRACE: 41, DIGSTR: 42, COMPILE_FILE: 43, ABS: 44, MIN: 45, MAX: 46, GE: 47,
  LE: 48, BACKQUOTE: 49, COMMA: 50, NTH: 51, RESIZE_TMP: 52, RESIZE_PERM: 53, COS: 54, SIN: 55, ATAN2: 56,
  ENUM: 57, QUIT: 58, EVAL: 59, BREAK: 60, MOD: 61, WRITE_PROFILE: 62, SETQ: 63, FOR: 64, OPEN_FILE: 65,
  LOAD: 66, BIT_AND: 67, BIT_OR: 68, BIT_XOR: 69, MAKE_ARRAY: 70, AREF: 71, IF_1PROGN: 72, IF_2PROGN: 73,
  IF_12PROGN: 74, EQ0: 75, PREPORT: 76, SEARCH: 77, ELT: 78, LISTP: 79, NUMBERP: 80, DO: 81, GC: 82,
  SCHAR: 83, SYMBOLP: 84, NUM2STR: 85, NCONC: 86, FIRST: 87, SECOND: 88, THIRD: 89, FOURTH: 90, FIFTH: 91,
  SIXTH: 92, SEVENTH: 93, EIGHTH: 94, NINTH: 95, TENTH: 96, SUBSTR: 97, LOCAL_LOAD: 98,
};

function make_array(len: number, rest: LObj): LArray {
  const p = new LArray(len);
  if (rest) {
    let x = lisp_eval(CAR(rest));
    if (x === colon_initial_contents) {
      x = lisp_eval(CAR(CDR(rest)));
      for (let i = 0; i < len; i++, x = CDR(x)) {
        if (!x) {
          print(rest);
          lbreak('(make-array) incorrect list length\n');
        }
        p.data[i] = CAR(x);
      }
      if (x) {
        print(rest);
        lbreak('(make-array) incorrect list length\n');
      }
    } else if (x === colon_initial_element) {
      x = lisp_eval(CAR(CDR(rest)));
      for (let i = 0; i < len; i++) p.data[i] = x;
    } else {
      print(x);
      lbreak('Bad option argument to make-array\n');
    }
  }
  return p;
}

function array_get(a: LObj, x: number): LObj {
  if (item_type(a) !== L_1D_ARRAY) {
    print(a);
    lbreak('is not an array\n');
  }
  const arr = a as LArray;
  if (x >= arr.len || x < 0) lbreak(`array reference out of bounds (${x})\n`);
  return arr.data[x];
}

/** the text of a file, or null */
function read_text(fp: bFILE): string {
  const l = fp.file_size();
  const b = fp.read_bytes(l);
  let s = '';
  for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode(...b.subarray(i, i + 8192));
  return s;
}

function load_file(fun_number: number, fn: LObj): LObj {
  const st = lstring_value(fn);
  let fp: bFILE;
  if (fun_number === F.LOCAL_LOAD) {
    if (st === 'gamma.lsp') fp = new jFILE(`${get_save_filename_prefix()}gamma.lsp`, 'rb');
    else fp = new jFILE(st, 'rb');
  } else fp = open_file(st, 'rb');
  if (fp.open_failure()) {
    fp.close();
    if (DEFINEDP(load_warning.value) && load_warning.value) dprintf(`Warning : file ${st} does not exist\n`);
    return null;
  }
  const l = fp.file_size();
  const text = read_text(fp);
  fp.close();
  const cs = new Src(cstr(text));
  hooks?.status_push?.(`(load "${st}")`);
  crc_manager.get_filenumber(st);
  while (!end_of_program(cs)) {
    hooks?.status_update?.(Math.trunc((cs.i * 100) / l));
    const compiled_form = compile(cs);
    lisp_eval(compiled_form);
  }
  hooks?.status_update?.(100);
  hooks?.status_pop?.();
  return fn;
}

function sys_function(fn: LSysFunction, arg_list: LObj): LObj {
  let ret: LObj = null;
  switch (fn.fun_number) {
    case F.PRINT:
      while (arg_list) {
        ret = lisp_eval(CAR(arg_list));
        arg_list = CDR(arg_list);
        print(ret);
      }
      break;
    case F.CAR: ret = lcar(lisp_eval(CAR(arg_list))); break;
    case F.CDR: ret = lcdr(lisp_eval(CAR(arg_list))); break;
    case F.LENGTH: {
      const v = lisp_eval(CAR(arg_list));
      switch (item_type(v)) {
        case L_STRING: ret = new LNumber(cstr(lstring_value(v)).length); break;
        case L_CONS_CELL: ret = new LNumber(list_length(v)); break;
        default:
          print(v);
          lbreak('length : type not supported\n');
      }
      break;
    }
    case F.LIST: {
      let first: LList | null = null, last: LList | null = null;
      while (arg_list) {
        const cur = new LList();
        cur.car = lisp_eval(CAR(arg_list));
        if (last) last.cdr = cur;
        else first = cur;
        last = cur;
        arg_list = CDR(arg_list);
      }
      ret = first;
      break;
    }
    case F.CONS: {
      const c = new LList();
      c.car = lisp_eval(CAR(arg_list));
      c.cdr = lisp_eval(CAR(CDR(arg_list)));
      ret = c;
      break;
    }
    case F.QUOTE: ret = CAR(arg_list); break;
    case F.EQ: {
      const a = lisp_eval(CAR(arg_list));
      const b = lisp_eval(CAR(CDR(arg_list)));
      ret = lisp_eq(b, a);
      break;
    }
    case F.EQUAL: {
      const a = lisp_eval(CAR(arg_list));
      const b = lisp_eval(CAR(CDR(arg_list)));
      ret = lisp_equal(b, a);
      break;
    }
    case F.PLUS: {
      let sum = 0;
      while (arg_list) {
        sum = (sum + lnumber_value(lisp_eval(CAR(arg_list)))) | 0;
        arg_list = CDR(arg_list);
      }
      ret = new LNumber(sum);
      break;
    }
    case F.TIMES: {
      let first = lisp_eval(CAR(arg_list));
      if (arg_list && item_type(first) === L_FIXED_POINT) {
        let prod = 1 << 16;
        do {
          prod = ((prod >> 8) * Math.floor(lfixed_point_value(first) / 256)) | 0;
          arg_list = CDR(arg_list);
          if (arg_list) first = lisp_eval(CAR(arg_list));
        } while (arg_list);
        ret = new LFixedPoint(prod);
      } else {
        let prod = 1;
        do {
          prod = Math.imul(prod, lnumber_value(lisp_eval(CAR(arg_list))));
          arg_list = CDR(arg_list);
          if (arg_list) first = lisp_eval(CAR(arg_list));
        } while (arg_list);
        ret = new LNumber(prod);
      }
      break;
    }
    case F.SLASH: {
      let quot = 0, first = 1;
      while (arg_list) {
        const i = lisp_eval(CAR(arg_list));
        if (item_type(i) !== L_NUMBER) {
          print(i);
          lbreak('/ only defined for numbers, cannot divide ');
        } else if (first) {
          quot = (i as LNumber).num | 0;
          first = 0;
        } else {
          const d = (i as LNumber).num;
          if (d === 0) lbreak('/: division by zero');
          quot = Math.trunc(quot / d) | 0;
        }
        arg_list = CDR(arg_list);
      }
      ret = new LNumber(quot);
      break;
    }
    case F.MINUS: {
      let sub = lnumber_value(lisp_eval(CAR(arg_list)));
      arg_list = CDR(arg_list);
      while (arg_list) {
        sub = (sub - lnumber_value(lisp_eval(CAR(arg_list)))) | 0;
        arg_list = CDR(arg_list);
      }
      ret = new LNumber(sub);
      break;
    }
    case F.IF:
      if (lisp_eval(CAR(arg_list))) ret = lisp_eval(CAR(CDR(arg_list)));
      else {
        arg_list = CDR(CDR(arg_list));
        ret = arg_list ? lisp_eval(CAR(arg_list)) : null;
      }
      break;
    case F.SETQ:
    case F.SETF: {
      const set_to = lisp_eval(CAR(CDR(arg_list)));
      const i = CAR(arg_list);
      const x = item_type(set_to);
      switch (item_type(i)) {
        case L_SYMBOL: {
          const s = i as LSymbol;
          switch (item_type(s.value)) {
            case L_NUMBER:
              if (x === L_NUMBER && s.value !== l_undefined) set_number(s, lnumber_value(set_to));
              else s.value = set_to;
              break;
            case L_OBJECT_VAR:
              hooks!.l_obj_set((s.value as LObjectVar).index, set_to);
              break;
            default:
              s.value = set_to;
          }
          ret = s.value;
          break;
        }
        case L_CONS_CELL: {
          let car = (i as LList).car;
          if (car === car_symbol) {
            car = lisp_eval(CAR(CDR(i)));
            if (!car || item_type(car) !== L_CONS_CELL) {
              print(car);
              lbreak('setq car : evaled object is not a cons cell\n');
            }
            (car as LList).car = set_to;
          } else if (car === cdr_symbol) {
            car = lisp_eval(CAR(CDR(i)));
            if (!car || item_type(car) !== L_CONS_CELL) {
              print(car);
              lbreak('setq cdr : evaled object is not a cons cell\n');
            }
            (car as LList).cdr = set_to;
          } else if (car !== aref_symbol) {
            lbreak('expected (aref, car, cdr, or symbol) in setq\n');
          } else {
            const a = lisp_eval(CAR(CDR(i)));
            if (item_type(a) !== L_1D_ARRAY) {
              print(a);
              lbreak('is not an array (aref)\n');
            }
            const num = lnumber_value(lisp_eval(CAR(CDR(CDR(i)))));
            if (num >= (a as LArray).len || num < 0) lbreak(`aref : value of bounds (${num})\n`);
            (a as LArray).data[num] = set_to;
          }
          ret = set_to;
          break;
        }
        default:
          print(i);
          lbreak('setq/setf only defined for symbols and arrays now..\n');
      }
      break;
    }
    case F.SYMBOL_LIST: ret = null; break;
    case F.ASSOC: {
      const item = lisp_eval(CAR(arg_list));
      const list = lisp_eval(CAR(CDR(arg_list)));
      ret = assoc(item, list);
      break;
    }
    case F.NOT:
    case F.NULL:
      ret = lisp_eval(CAR(arg_list)) === null ? true_symbol : null;
      break;
    case F.ACONS: {
      const i1 = lisp_eval(CAR(arg_list));
      const i2 = lisp_eval(CAR(CDR(arg_list)));
      const cs = new LList();
      cs.car = i1;
      cs.cdr = i2;
      ret = cs;
      break;
    }
    case F.PAIRLIS: {
      const a1 = lisp_eval(CAR(arg_list));
      arg_list = CDR(arg_list);
      const a2 = lisp_eval(CAR(arg_list));
      arg_list = CDR(arg_list);
      const n3 = lisp_eval(CAR(arg_list));
      ret = pairlis(a1, a2, n3);
      break;
    }
    case F.LET: {
      let var_list = CAR(arg_list);
      let block_list = CDR(arg_list);
      const stack_start = l_user_stack.length;
      while (var_list) {
        const var_name = CAR(CAR(var_list));
        if (item_type(var_name) !== L_SYMBOL) {
          print(var_name);
          lbreak('should be a symbol (let)\n');
        }
        l_user_stack.push((var_name as LSymbol).value);
        const tmp = lisp_eval(CAR(CDR(CAR(var_list))));
        (var_name as LSymbol).value = tmp;
        var_list = CDR(var_list);
      }
      while (block_list) {
        ret = lisp_eval(CAR(block_list));
        block_list = CDR(block_list);
      }
      let cur_stack = stack_start;
      var_list = CAR(arg_list);
      while (var_list) {
        (CAR(CAR(var_list)) as LSymbol).value = l_user_stack[cur_stack++];
        var_list = CDR(var_list);
      }
      l_user_stack.length = stack_start;
      break;
    }
    case F.DEFUN: {
      const symbol = CAR(arg_list);
      if (item_type(symbol) !== L_SYMBOL) {
        print(symbol);
        lbreak(' is not a symbol! (DEFUN)\n');
      }
      const block_list = CDR(CDR(arg_list));
      (symbol as LSymbol).function = new LUserFunction(lcar(lcdr(arg_list)), block_list);
      ret = symbol;
      break;
    }
    case F.ATOM: ret = lisp_atom(lisp_eval(CAR(arg_list))); break;
    case F.AND: {
      let l = arg_list;
      ret = true_symbol;
      while (l) {
        if (!lisp_eval(CAR(l))) {
          ret = null;
          l = null;
        } else l = CDR(l);
      }
      break;
    }
    case F.OR: {
      let l = arg_list;
      ret = null;
      while (l) {
        if (lisp_eval(CAR(l))) {
          ret = true_symbol;
          l = null;
        } else l = CDR(l);
      }
      break;
    }
    case F.PROGN: ret = eval_block(arg_list); break;
    case F.CONCATENATE: ret = concatenate(arg_list); break;
    case F.CHAR_CODE: {
      const i = lisp_eval(CAR(arg_list));
      switch (item_type(i)) {
        case L_CHARACTER: ret = new LNumber((i as LChar).ch); break;
        case L_STRING: {
          const s = lstring_value(i);
          ret = new LNumber(s.length ? (s.charCodeAt(0) << 24) >> 24 : 0); // *char: signed
          break;
        }
        default:
          print(i);
          lbreak(' is not character type\n');
      }
      break;
    }
    case F.CODE_CHAR: {
      const i = lisp_eval(CAR(arg_list));
      if (item_type(i) !== L_NUMBER) {
        print(i);
        lbreak(' is not number type\n');
      }
      ret = new LChar((i as LNumber).num);
      break;
    }
    case F.COND: {
      let block_list = CAR(arg_list);
      ret = null;
      while (block_list) {
        if (lisp_eval(lcar(CAR(block_list)))) ret = lisp_eval(CAR(CDR(CAR(block_list))));
        block_list = CDR(block_list);
      }
      break;
    }
    case F.SELECT: {
      const selector = lisp_eval(CAR(arg_list));
      let sel = CDR(arg_list);
      ret = null;
      while (sel) {
        if (lisp_equal(selector, lisp_eval(CAR(CAR(sel))))) {
          sel = CDR(CAR(sel));
          while (sel) {
            ret = lisp_eval(CAR(sel));
            sel = CDR(sel);
          }
        } else sel = CDR(sel);
      }
      break;
    }
    case F.FUNCTION: {
      const s = lisp_eval(CAR(arg_list));
      if (item_type(s) !== L_SYMBOL) {
        print(s);
        lbreak('is not a symbol\n');
      }
      ret = (s as LSymbol).function;
      break;
    }
    case F.MAPCAR: ret = mapcar(arg_list); break;
    case F.FUNCALL: {
      const n1 = lisp_eval(CAR(arg_list));
      ret = eval_function(n1, CDR(arg_list));
      break;
    }
    case F.GT: case F.LT: case F.GE: case F.LE: {
      const n1 = lnumber_value(lisp_eval(CAR(arg_list)));
      const n2 = lnumber_value(lisp_eval(CAR(CDR(arg_list))));
      const f = fn.fun_number;
      const r = f === F.GT ? n1 > n2 : f === F.LT ? n1 < n2 : f === F.GE ? n1 >= n2 : n1 <= n2;
      ret = r ? true_symbol : null;
      break;
    }
    case F.TMP_SPACE: current_space = TMP_SPACE; ret = true_symbol; break;
    case F.PERM_SPACE: current_space = PERM_SPACE; ret = true_symbol; break;
    case F.SYMBOL_NAME: {
      const symb = lisp_eval(CAR(arg_list));
      if (item_type(symb) !== L_SYMBOL) {
        print(symb);
        lbreak(' is not a symbol (symbol-name)\n');
      }
      ret = (symb as LSymbol).name;
      break;
    }
    case F.TRACE:
      trace_level++;
      if (arg_list) trace_print_level = lnumber_value(lisp_eval(CAR(arg_list)));
      ret = true_symbol;
      break;
    case F.UNTRACE:
      if (trace_level > 0) {
        trace_level--;
        ret = true_symbol;
      } else ret = null;
      break;
    case F.DIGSTR: {
      let num = lnumber_value(lisp_eval(CAR(arg_list)));
      let dig = lnumber_value(lisp_eval(CAR(CDR(arg_list))));
      let s = '';
      while (num) {
        s = String.fromCharCode(48 + (num % 10)) + s;
        num = (num / 10) | 0;
        dig--;
      }
      while (dig-- > 0) s = '0' + s;
      ret = new LString(s);
      break;
    }
    case F.LOCAL_LOAD:
    case F.LOAD:
    case F.COMPILE_FILE:
      ret = load_file(fn.fun_number, lisp_eval(CAR(arg_list)));
      break;
    case F.ABS: ret = new LNumber(Math.abs(lnumber_value(lisp_eval(CAR(arg_list)))) | 0); break;
    case F.MIN: case F.MAX: {
      const x = lnumber_value(lisp_eval(CAR(arg_list)));
      const y = lnumber_value(lisp_eval(CAR(CDR(arg_list))));
      ret = new LNumber(fn.fun_number === F.MIN ? (x < y ? x : y) : (x > y ? x : y));
      break;
    }
    case F.BACKQUOTE: ret = backquote_eval(CAR(arg_list)); break;
    case F.COMMA:
      print(arg_list);
      lbreak('comma is illegal outside of backquote\n');
      break;
    case F.NTH: {
      const x = lnumber_value(lisp_eval(CAR(arg_list)));
      ret = nth(x, lisp_eval(CAR(CDR(arg_list))));
      break;
    }
    case F.RESIZE_TMP:
    case F.RESIZE_PERM:
      break;
    case F.COS: ret = new LFixedPoint(lisp_cos(lnumber_value(lisp_eval(CAR(arg_list))))); break;
    case F.SIN: ret = new LFixedPoint(lisp_sin(lnumber_value(lisp_eval(CAR(arg_list))))); break;
    case F.ATAN2: {
      const y = lnumber_value(lisp_eval(CAR(arg_list)));
      const x = lnumber_value(lisp_eval(CAR(CDR(arg_list))));
      ret = new LNumber(lisp_atan2(y, x));
      break;
    }
    case F.ENUM: {
      const sp = current_space;
      current_space = PERM_SPACE;
      let x = 0;
      while (arg_list) {
        const sym = lisp_eval(CAR(arg_list));
        switch (item_type(sym)) {
          case L_SYMBOL:
            (sym as LSymbol).value = new LNumber(x);
            break;
          case L_CONS_CELL: {
            const s = lisp_eval(CAR(sym));
            if (item_type(s) !== L_SYMBOL) {
              print(arg_list);
              lbreak('expecting (symbol value) for enum\n');
            }
            x = lnumber_value(lisp_eval(CAR(CDR(sym))));
            // the original writes ((LSymbol *)sym)->value with sym the list (symbol value): in C's layout a
            // symbol's value is where a cons cell keeps its cdr
            (sym as LList).cdr = new LNumber(x);
            break;
          }
          default:
            print(arg_list);
            lbreak('expecting symbol or (symbol value) in enum\n');
        }
        arg_list = CDR(arg_list);
        x++;
      }
      current_space = sp;
      break;
    }
    case F.QUIT: throw new ExitProgram(0);
    case F.EVAL: ret = lisp_eval(lisp_eval(CAR(arg_list))); break;
    case F.BREAK: lbreak('User break'); break;
    case F.MOD: {
      const x = lnumber_value(lisp_eval(CAR(arg_list)));
      let y = lnumber_value(lisp_eval(CAR(CDR(arg_list))));
      if (y === 0) {
        lbreak('mod: division by zero\n');
        y = 1;
      }
      ret = new LNumber(x % y);
      break;
    }
    case F.FOR: {
      const bind_var = CAR(arg_list);
      if (item_type(bind_var) !== L_SYMBOL) lbreak('expecting for iterator to be a symbol\n');
      arg_list = CDR(arg_list);
      if (CAR(arg_list) !== in_symbol) lbreak("expecting in after 'for iterator'\n");
      arg_list = CDR(arg_list);
      let ilist = lisp_eval(CAR(arg_list));
      arg_list = CDR(arg_list);
      if (CAR(arg_list) !== do_symbol) lbreak("expecting do after 'for iterator in list'\n");
      arg_list = CDR(arg_list);
      const bv = bind_var as LSymbol;
      l_user_stack.push(bv.value);
      while (ilist) {
        bv.value = CAR(ilist);
        for (let block = arg_list; block; block = CDR(block)) ret = lisp_eval(CAR(block));
        ilist = CDR(ilist);
      }
      bv.value = l_user_stack.pop()!;
      break;
    }
    case F.OPEN_FILE: {
      const str1 = lisp_eval(CAR(arg_list));
      const str2 = lisp_eval(CAR(CDR(arg_list)));
      const old_file = current_print_file;
      current_print_file = open_file(lstring_value(str1), lstring_value(str2));
      if (!current_print_file.open_failure()) {
        while (arg_list) {
          ret = lisp_eval(CAR(arg_list));
          arg_list = CDR(arg_list);
        }
      }
      current_print_file.close();
      current_print_file = old_file;
      break;
    }
    case F.BIT_AND: case F.BIT_OR: case F.BIT_XOR: {
      let first = lnumber_value(lisp_eval(CAR(arg_list)));
      arg_list = CDR(arg_list);
      while (arg_list) {
        const v = lnumber_value(lisp_eval(CAR(arg_list)));
        if (fn.fun_number === F.BIT_AND) first &= v;
        else if (fn.fun_number === F.BIT_OR) first |= v;
        else first ^= v;
        arg_list = CDR(arg_list);
      }
      ret = new LNumber(first);
      break;
    }
    case F.MAKE_ARRAY: {
      const l = lnumber_value(lisp_eval(CAR(arg_list)));
      if (l >= 2 << 16 || l <= 0) lbreak(`bad array size ${l}\n`);
      ret = make_array(l, CDR(arg_list));
      break;
    }
    case F.AREF: {
      const x = lnumber_value(lisp_eval(CAR(CDR(arg_list))));
      ret = array_get(lisp_eval(CAR(arg_list)), x);
      break;
    }
    case F.IF_1PROGN:
      if (lisp_eval(CAR(arg_list))) ret = eval_block(CAR(CDR(arg_list)));
      else ret = lisp_eval(CAR(CDR(CDR(arg_list))));
      break;
    case F.IF_2PROGN:
      if (lisp_eval(CAR(arg_list))) ret = lisp_eval(CAR(CDR(arg_list)));
      else ret = eval_block(CAR(CDR(CDR(arg_list))));
      break;
    case F.IF_12PROGN:
      if (lisp_eval(CAR(arg_list))) ret = eval_block(CAR(CDR(arg_list)));
      else ret = eval_block(CAR(CDR(CDR(arg_list))));
      break;
    case F.EQ0: {
      const v = lisp_eval(CAR(arg_list));
      ret = item_type(v) !== L_NUMBER || (v as LNumber).num !== 0 ? null : true_symbol;
      break;
    }
    case F.PREPORT: break;
    case F.SEARCH: {
      const arg1 = lisp_eval(CAR(arg_list));
      arg_list = CDR(arg_list);
      const haystack = cstr(lstring_value(lisp_eval(CAR(arg_list))));
      const needle = cstr(lstring_value(arg1));
      const find = haystack.indexOf(needle);
      ret = find >= 0 ? new LNumber(find) : null;
      break;
    }
    case F.ELT: {
      const arg1 = lisp_eval(CAR(arg_list));
      arg_list = CDR(arg_list);
      const x = lnumber_value(lisp_eval(CAR(arg_list)));
      const st = cstr(lstring_value(arg1));
      if (x < 0 || x >= st.length) {
        lbreak('elt: out of range of string\n');
      } else ret = new LChar((st.charCodeAt(x) << 24) >> 24);
      break;
    }
    case F.LISTP: ret = item_type(lisp_eval(CAR(arg_list))) === L_CONS_CELL ? true_symbol : null; break;
    case F.NUMBERP: {
      const t = item_type(lisp_eval(CAR(arg_list)));
      ret = t === L_NUMBER || t === L_FIXED_POINT ? true_symbol : null;
      break;
    }
    case F.DO: {
      const ustack_start = l_user_stack.length;
      for (let init_var = CAR(arg_list); init_var; init_var = CDR(init_var)) {
        const sym = CAR(CAR(init_var));
        if (item_type(sym) !== L_SYMBOL) lbreak('expecting symbol name for iteration var\n');
        l_user_stack.push((sym as LSymbol).value);
      }
      let do_evaled = l_user_stack.length;
      for (let init_var = CAR(arg_list); init_var; init_var = CDR(init_var))
        l_user_stack.push(lisp_eval(CAR(CDR(CAR(init_var)))));
      for (let init_var = CAR(arg_list); init_var; init_var = CDR(init_var)) {
        (CAR(CAR(init_var)) as LSymbol).value = l_user_stack[do_evaled];
        do_evaled++;
      }
      for (let i = 0; !i;) {
        i = lisp_eval(CAR(CAR(CDR(arg_list)))) !== null ? 1 : 0;
        if (!i) {
          eval_block(CDR(CDR(arg_list)));
          for (let init_var = CAR(arg_list); init_var; init_var = CDR(init_var))
            lisp_eval(CAR(CDR(CDR(CAR(init_var)))));
        }
      }
      ret = lisp_eval(CAR(CDR(CAR(CDR(arg_list)))));
      do_evaled = ustack_start;
      for (let init_var = CAR(arg_list); init_var; init_var = CDR(init_var)) {
        (CAR(CAR(init_var)) as LSymbol).value = l_user_stack[do_evaled];
        do_evaled++;
      }
      l_user_stack.length = ustack_start;
      break;
    }
    case F.GC: break;
    case F.SCHAR: {
      const s = cstr(lstring_value(lisp_eval(CAR(arg_list))));
      arg_list = CDR(arg_list);
      const x = lnumber_value(lisp_eval(CAR(arg_list)));
      if (x < 0 || x >= s.length) lbreak(`SCHAR: index ${x} out of bounds\n`);
      ret = new LChar((s.charCodeAt(x) << 24) >> 24);
      break;
    }
    case F.SYMBOLP: ret = item_type(lisp_eval(CAR(arg_list))) === L_SYMBOL ? true_symbol : null; break;
    case F.NUM2STR: ret = new LString(String(lnumber_value(lisp_eval(CAR(arg_list))))); break;
    case F.NCONC: {
      let l1 = lisp_eval(CAR(arg_list));
      arg_list = CDR(arg_list);
      let first = l1;
      if (!l1) {
        l1 = first = lisp_eval(CAR(arg_list));
        arg_list = CDR(arg_list);
      }
      if (item_type(l1) !== L_CONS_CELL) {
        print(l1);
        lbreak('first arg should be a list\n');
      }
      do {
        let next = l1;
        while (next) {
          l1 = next;
          next = lcdr(next);
        }
        (l1 as LList).cdr = lisp_eval(CAR(arg_list));
        arg_list = CDR(arg_list);
      } while (arg_list);
      ret = first;
      break;
    }
    case F.FIRST: case F.SECOND: case F.THIRD: case F.FOURTH: case F.FIFTH:
    case F.SIXTH: case F.SEVENTH: case F.EIGHTH: case F.NINTH: case F.TENTH: {
      let l = lisp_eval(CAR(arg_list));
      for (let k = F.FIRST; k < fn.fun_number; k++) l = CDR(l);
      ret = CAR(l);
      break;
    }
    case F.SUBSTR: {
      const x1 = lnumber_value(lisp_eval(CAR(arg_list)));
      const x2 = lnumber_value(lisp_eval(CAR(CDR(arg_list))));
      const st = lisp_eval(CAR(CAR(CDR(arg_list))));
      const sv = cstr(lstring_value(st));
      if (x1 < 0 || x1 > x2 || x2 >= sv.length) lbreak('substr: bad x1 or x2 value');
      ret = new LString(x2 - x1 ? sv.slice(x1, x2 + 1) : '');
      break;
    }
    default:
      dprintf(`Undefined system function number ${fn.fun_number}\n`);
  }
  return ret;
}

export function eval_block(list: LObj): LObj {
  let ret: LObj = null;
  while (list) {
    ret = lisp_eval(CAR(list));
    list = CDR(list);
  }
  return ret;
}

/** LSymbol::EvalUserFunction */
export function eval_user_function(sym: LSymbol, arg_list: LObj): LObj {
  let ret: LObj = null;
  const fun = sym.function as LUserFunction;
  if (item_type(fun) !== L_USER_FUNCTION) {
    print(sym);
    lbreak('is not a user defined function\n');
  }
  const fun_arg_list = fun.arg_list;
  let block_list = fun.block_list;
  const stack_start = l_user_stack.length;
  let f_arg: LObj;
  for (f_arg = fun_arg_list; f_arg; f_arg = CDR(f_arg)) l_user_stack.push((CAR(f_arg) as LSymbol).value);
  {
    const new_start = l_user_stack.length;
    let i = new_start;
    for (f_arg = fun_arg_list; f_arg; f_arg = CDR(f_arg)) {
      if (!arg_list) {
        print(sym);
        lbreak('too few parameter to function\n');
      }
      l_user_stack.push(lisp_eval(CAR(arg_list)));
      arg_list = CDR(arg_list);
    }
    for (f_arg = fun_arg_list; f_arg; f_arg = CDR(f_arg)) (CAR(f_arg) as LSymbol).value = l_user_stack[i++];
    l_user_stack.length = new_start;
  }
  if (f_arg) {
    print(sym);
    lbreak('too many parameter to function\n');
  }
  while (block_list) {
    ret = lisp_eval(CAR(block_list));
    block_list = CDR(block_list);
  }
  let cur_stack = stack_start;
  for (f_arg = fun_arg_list; f_arg; f_arg = CDR(f_arg)) (CAR(f_arg) as LSymbol).value = l_user_stack[cur_stack++];
  l_user_stack.length = stack_start;
  return ret;
}

/** LObject::Eval */
export function lisp_eval(o: LObj): LObj {
  const tstart = trace_level;
  if (trace_level) {
    if (trace_level <= trace_print_level) {
      dprintf(`${trace_level} (0, 0, 0) TRACE : `);
      print(o);
      dprintf('\n');
    }
    trace_level++;
  }
  let ret: LObj = null;
  if (o) {
    switch (o.type) {
      case L_BAD_CELL:
        lbreak('error: eval on a bad cell\n');
        break;
      case L_CHARACTER:
      case L_STRING:
      case L_NUMBER:
      case L_POINTER:
      case L_FIXED_POINT:
        ret = o;
        break;
      case L_SYMBOL:
        if (o === true_symbol) ret = o;
        else {
          ret = (o as LSymbol).value;
          if (item_type(ret) === L_OBJECT_VAR) ret = hooks!.l_obj_get((ret as LObjectVar).index);
        }
        break;
      case L_CONS_CELL:
        ret = eval_function((o as LList).car, (o as LList).cdr);
        break;
      default:
        dprintf("shouldn't happen\n");
    }
  }
  if (tstart) {
    trace_level--;
    if (trace_level <= trace_print_level) dprintf(`${trace_level} (0, 0, 0) TRACE ==> `);
    print(ret);
    dprintf('\n');
  }
  return ret;
}

export function lisp_init(): void {
  symbols.clear();
  total_user_functions = 0;
  l_user_stack.length = 0;
  trace_level = 0;
  current_print_file = null;
  current_space = PERM_SPACE;
  l_comp_init();
  for (let i = 0; i < SYS_FUNCS.length; i++) add_sys_function(SYS_FUNCS[i][0], SYS_FUNCS[i][1], SYS_FUNCS[i][2], i);
  hooks!.clisp_init();
  current_space = TMP_SPACE;
  dprintf(`Lisp: ${symbols.size} symbols defined, ${SYS_FUNCS.length} system functions, ${total_user_functions} pre-compiled functions\n`);
}

export function lisp_uninit(): void {
  symbols.clear();
}

/** clear_tmp: the original empties its temporary space here; nothing to do for the port */
export function clear_tmp(): void { /* garbage collected */ }

/** compile and evaluate a program text (as `(load ...)` does form by form) */
export function eval_string(text: string): LObj {
  const cs = new Src(text);
  let ret: LObj = null;
  while (!end_of_program(cs)) ret = lisp_eval(compile(cs));
  return ret;
}

/** symbol_value(sym) */
export function symbol_value(s: LObj): LObj { return (s as LSymbol).value; }
/** LSymbol::GetName etc. for callers that hold a symbol */
export function symbol_name(s: LObj): string { return (s as LSymbol).name.str; }

/** LObject::Compile(s) of one expression */
export function compile_string(text: string): LObj {
  return compile(new Src(text));
}
