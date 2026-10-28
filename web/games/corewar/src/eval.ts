// eval.c: the expression evaluator of the assembler and of cdb (Stefan Strack, version 3), in `long`
// (64 bits on the reference's Linux/x86-64): recursion for precedence, unary - + !, registers a..z with
// assignment, C's comparison and logic operators, overflow detection. Positions in the expression
// string stand for C's char pointers.
import { OVERFLOW, OK_EXPR, BAD_EXPR, DIV_ZERO } from './global.ts';
import { LONG_MAX, LONG_MIN, isdigit, isspace, toupper, at, scanLong } from './libc.ts';

/* two-char operators (char codes; the others are the operator characters themselves) */
const EQUAL = 0, NEQU = 1, GTE = 2, LTE = 3, AND = 4, OR = 5, IDENT = 6;
const BIGNUM = 20; /* largest number taken */

const c = (ch: string): number => ch.charCodeAt(0);
const TERMINAL = (ch: string): boolean => ch === ')' || ch === '\0';
function PRECEDENCE(op: number): number {
  return op === c('*') || op === c('/') || op === c('%') ? 5
    : op === c('+') || op === c('-') ? 4
      : op === c('>') || op === c('<') || op === EQUAL || op === NEQU || op === GTE || op === LTE ? 3
        : op === AND ? 2 : op === OR ? 1 : 0;
}

/* global error flag */
export let evalerr = OK_EXPR;
/* registers */
const regAr: bigint[] = new Array(26).fill(0n);
/* kludge to implement several precedence levels - saveOper works like "push back" in token parsers */
let saveOper = 0;

export function reset_eval(): void {
  evalerr = OK_EXPR;
  regAr.fill(0n);
  saveOper = 0;
}

const wrap = (v: bigint): bigint => BigInt.asIntN(64, v);

function calc(x: bigint, y: bigint, op: number): bigint {
  let z: bigint;
  switch (op) {
    case c('+'):
      if (evalerr === OK_EXPR && (x > 0n ? y > 0n && x > LONG_MAX - y : y < 0n && x < LONG_MIN - y)) evalerr = OVERFLOW;
      z = wrap(x + y);
      break;
    case c('-'):
      if (evalerr === OK_EXPR && (x > 0n ? y < 0n && x > LONG_MAX + y : y > 0n && x < LONG_MIN + y)) evalerr = OVERFLOW;
      z = wrap(x - y);
      break;
    case c('/'):
      if (y === 0n) {
        evalerr = DIV_ZERO;
        z = 0n;
      } else z = wrap(x / y);
      break;
    case c('*'):
      if (evalerr === OK_EXPR && x !== 0n && y !== 0n && x !== -1n && y !== -1n && x !== 1n && y !== 1n &&
        ((x > 0n) === (y > 0n) ? LONG_MAX / y / x === 0n : LONG_MIN / y / x === 0n)) evalerr = OVERFLOW;
      z = wrap(x * y);
      break;
    case c('%'):
      if (y === 0n) {
        evalerr = DIV_ZERO;
        z = 0n;
      } else z = x % y;
      break;
    case AND: z = x && y ? 1n : 0n; break;
    case OR: z = x || y ? 1n : 0n; break;
    case EQUAL: z = x === y ? 1n : 0n; break;
    case NEQU: z = x !== y ? 1n : 0n; break;
    case c('<'): z = x < y ? 1n : 0n; break;
    case c('>'): z = x > y ? 1n : 0n; break;
    case LTE: z = x <= y ? 1n : 0n; break;
    case GTE: z = x >= y ? 1n : 0n; break;
    case IDENT: z = y; break; /* the right-identity operator, used for initial call to eval() */
    default:
      z = 0n;
      evalerr = BAD_EXPR;
  }
  return z;
}

/**
 * getop(): the operator at p. A lone & | = ! leaves the operator variable as it was: in C that is the
 * uninitialized `oper2` of eval(); here it stays `prev` (0, i.e. "==", if eval() had none yet).
 */
function getop(e: string, p: number, prev: number): [number, number] {
  let oper = prev;
  const ch = at(e, p++);
  switch (ch) {
    case '&': if (at(e, p++) === '&') oper = AND; break;
    case '|': if (at(e, p++) === '|') oper = OR; break;
    case '=': if (at(e, p++) === '=') oper = EQUAL; break;
    case '!': if (at(e, p++) === '=') oper = NEQU; break;
    case '<':
      if (at(e, p) === '=') { ++p; oper = LTE; } else oper = c('<');
      break;
    case '>':
      if (at(e, p) === '=') { ++p; oper = GTE; } else oper = c('>');
      break;
    default: oper = c(ch); break;
  }
  return [p, oper];
}

const skip = (e: string, p: number): number => {
  while (isspace(at(e, p))) ++p;
  return p;
};

function getreg(e: string, p: number, regId: number, val: { v: bigint }): number {
  p = skip(e, p);
  if (at(e, p) === '=' && at(e, p + 1) !== '=') { /* assignment, not equality */
    p = evalp(-1, 0n, IDENT, e, p + 1, val);
    regAr[regId] = val.v;
  } else val.v = regAr[regId];
  return p;
}

function getval(e: string, p: number, val: { v: bigint }): number {
  p = skip(e, p);
  const ch = at(e, p);
  if (ch === '(') { /* parenthetical expression */
    p = evalp(-1, 0n, IDENT, e, p + 1, val);
    if (at(e, p) !== ')') evalerr = BAD_EXPR;
    return p + 1;
  }
  if (ch === '-') { /* unary minus */
    const acc = { v: 0n };
    p = getval(e, p + 1, acc);
    val.v = wrap(acc.v * -1n);
    return p;
  } else if (ch === '!') { /* logical NOT */
    const acc = { v: 0n };
    p = getval(e, p + 1, acc);
    val.v = acc.v ? 0n : 1n;
    return p;
  } else if (ch === '+') return getval(e, p + 1, val); /* unary plus */
  const regId = c(toupper(ch));
  if (regId >= c('A') && regId <= c('Z')) return getreg(e, p + 1, regId - c('A'), val);
  let buffer = '';
  while (isdigit(at(e, p)) && buffer.length < BIGNUM) buffer += e[p++];
  if (buffer.length === 0) evalerr = BAD_EXPR; /* no digits */
  const v = scanLong(buffer);
  if (v !== null) val.v = v; /* sscanf leaves *val as it was when there are no digits */
  return p;
}

function evalp(prevPrec: number, val1: bigint, oper1: number, e: string, p: number, result: { v: bigint }): number {
  const val2 = { v: 0n };
  let oper2 = 0;
  saveOper = 0;
  p = getval(e, p, val2);
  p = skip(e, p);
  if (TERMINAL(at(e, p))) { /* trivial: expr is number or () */
    result.v = calc(val1, val2.v, oper1);
    return p;
  }
  [p, oper2] = getop(e, p, oper2);
  let prec1: number, prec2: number;
  if ((prec1 = PRECEDENCE(oper1)) >= (prec2 = PRECEDENCE(oper2))) {
    if (prec2 > prevPrec) {
      /* continue to gobble up expressions */
      p = evalp(prevPrec, calc(val1, val2.v, oper1), oper2, e, p, result);
    } else {
      /* return from subevaluation of terms with higher precedence */
      result.v = calc(val1, val2.v, oper1);
      saveOper = oper2; /* akin to "push back" in parsers */
    }
  } else {
    const result2 = { v: 0n };
    p = evalp(prec1, val2.v, oper2, e, p, result2); /* start subevaluation starting from val2 op2 */
    result.v = calc(val1, result2.v, oper1);
    if (saveOper && PRECEDENCE(saveOper) >= prevPrec) {
      p = evalp(prevPrec, result.v, saveOper, e, p, result);
    }
  }
  return p;
}

export function reset_regs(): void {
  regAr.fill(0n);
}

export function set_reg(regChr: string, val: bigint): void {
  regAr[c(regChr) - c('A')] = val;
}

/** eval_expr(expr, &result): returns OK_EXPR, OVERFLOW, BAD_EXPR or DIV_ZERO */
export function eval_expr(expr: string, result: { v: bigint }): number {
  evalerr = OK_EXPR;
  if (at(expr, evalp(-1, 0n, IDENT, expr, 0, result)) !== '\0') evalerr = BAD_EXPR; /* still chars left */
  return evalerr;
}
