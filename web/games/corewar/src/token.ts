// token.c and asm.h: the assembler's tokenizer. Indices into a line are uChar in the C code (they wrap
// at 256); assemble() refuses lines of 256 characters or more before they get here (see asm.ts).
import { isdigit, isalpha, isspace, at } from './libc.ts';

export const NONE = 0, ADDRTOKEN = 1, FSEPTOKEN = 2, COMMTOKEN = 3, MODFTOKEN = 4, EXPRTOKEN = 5, WSPCTOKEN = 6,
  CHARTOKEN = 7, NUMBTOKEN = 8, APNDTOKEN = 9, MISCTOKEN = 10;

export const sep_sym = ',', com_sym = ';', mod_sym = '.', cat_sym = '&', cln_sym = ':';

/* NEW_MODES */
export const addr_sym = '#$@<>*{}';
export const expr_sym = '()/+-%!=';

const is_addr = (ch: string): boolean => addr_sym.includes(ch);
const is_expr = (ch: string): boolean => expr_sym.includes(ch);
const is_alpha = (ch: string): boolean => isalpha(ch) || ch === '_';

/** ch_in_set(): index of c in the set (its length if absent) */
export function ch_in_set(c: string, s: string): number {
  const i = s.indexOf(c);
  return i < 0 ? s.length : i;
}

/** str_in_set(): index of str in the list (its length if absent); case is significant */
export function str_in_set(str: string, s: readonly string[]): number {
  let i = 0;
  while (s[i] !== '' && s[i] !== str) i++;
  return i;
}

/** skip_space(): the index of the next non-whitespace char */
export function skip_space(str: string, i: number): number {
  let idx = i & 255;
  while (isspace(at(str, idx))) idx = (idx + 1) & 255;
  return idx;
}

/**
 * A C char array (the assembler's static buf, buf2, token: MAXALLCHAR bytes). `s` reads it up to the
 * first NUL and writes it as strcpy does, leaving the bytes after the new NUL as they were: trav2()
 * appends to buf without terminating it, so what an earlier string left there can show.
 */
export class CBuf {
  b = new Uint8Array(8000 + 256);
  get s(): string {
    const b = this.b;
    let e = 0, r = '';
    while (b[e]) r += String.fromCharCode(b[e++]);
    return r;
  }
  set s(v: string) {
    const n = Math.min(v.length, this.b.length - 1);
    for (let i = 0; i < n; i++) this.b[i] = v.charCodeAt(i);
    this.b[n] = 0;
  }
  get length(): number {
    let e = 0;
    while (this.b[e]) e++;
    return e;
  }
  /** buf[i] = c */
  put(i: number, c: string): void {
    if (i < this.b.length) this.b[i] = c.charCodeAt(0) & 255;
  }
  /** strcat */
  cat(v: string): void {
    const n = this.length;
    for (let i = 0; i < v.length && n + i < this.b.length - 1; i++) this.b[n + i] = v.charCodeAt(i);
    this.b[Math.min(n + v.length, this.b.length - 1)] = 0;
  }
}

/**
 * get_token(): the next token of str from *curIndex into token; returns its type and advances the
 * index (cur.i).
 */
export function get_token(str: string, cur: { i: number }, token: CBuf): number {
  let src = skip_space(str, cur.i);
  let t = '';
  let tokenType: number;
  let ch: string;
  if (at(str, src) !== '\0') {
    if (isdigit((ch = str[src]))) { /* Grab the whole digit */
      while (isdigit(at(str, src))) { t += str[src]; src = (src + 1) & 255; }
      tokenType = NUMBTOKEN;
    } else if (is_alpha(ch)) { /* Grab the whole identifier */
      for (; (ch = at(str, src)) !== '\0' && (is_alpha(ch) || isdigit(ch));) { t += ch; src = (src + 1) & 255; }
      tokenType = CHARTOKEN;
    } else {
      /* The following would accept only one single char. */
      if (is_expr(ch)) tokenType = EXPRTOKEN; /* Is operator symbol ? */
      else if (is_addr(ch)) tokenType = ADDRTOKEN; /* Is addressing mode symbol ? */
      else if (ch === cat_sym) { /* Is concatenation symbol ? currently force so that there is no double '&' */
        if (at(str, src + 1) === '&') {
          t += str[src];
          src = (src + 1) & 255;
          tokenType = EXPRTOKEN;
        } else tokenType = APNDTOKEN;
      } else if (ch === com_sym) tokenType = COMMTOKEN; /* comment symbol ? */
      else if (ch === sep_sym) tokenType = FSEPTOKEN; /* field separator symbol ? */
      else if (ch === mod_sym) tokenType = MODFTOKEN; /* modifier symbol ? */
      else if (ch === '|' && at(str, src + 1) === '|') {
        t += str[src];
        src = (src + 1) & 255;
        tokenType = EXPRTOKEN;
      } else tokenType = MISCTOKEN;
      t += at(str, src);
      src = (src + 1) & 255;
    }
  } else tokenType = NONE;
  token.s = t;
  cur.i = src;
  return tokenType;
}
