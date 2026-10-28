// @ts-nocheck
// NetHack 3.6.7 hacklib.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { panic } from './end.ts';
import { debugcore } from './files.ts';
import { impossible, pline } from './pline.ts';
import { struct_strbuf, struct_tm } from './structs.ts';
import { $arr, $cs, $peq, $rd, $u64, $wr, G, P, S, atoi, free, init_isaac64, localtime, mktime, sprintf, strcat, strchr, strcpy, strlen, strncmp, strrchr, strstr, sys_random_seed, time } from './rt/index.ts';
import { BUFSZ, FALSE, TABSIZ, TRUE, VISCTRL_NBUF } from './consts.ts';

let s_suffix$buf: any;
let ing_suffix$vowel: any;
let ing_suffix$buf: any;
let visctrl$visctrl_bufs: any;
let visctrl$nbuf: number;
let sitoa$buf: any;
let pmatchz$fuzzychars: any;
let yyyymmddhhmmss$datestr: any;

export function digit(c: number): number {
  return (48 <= c && c <= 57 ? 1 : 0) << 24 >> 24;
}

export function letter(c: number): number {
  return ((64 <= c && c <= 90 ? 1 : 0) << 24 >> 24 || 97 <= c && c <= 122 ? 1 : 0) << 24 >> 24;
}

export function highc(c: number): number {
  return (97 <= c && c <= 122 ? c & ~32 : c) << 24 >> 24;
}

export function lowc(c: number): number {
  return (65 <= c && c <= 90 ? c | 32 : c) << 24 >> 24;
}

export function lcase(s: Ptr | null): Ptr | null {
  let p = null;
  for (p = s; p.a[p.o]; p = p.add(1)) {
    if (65 <= p.a[p.o] && p.a[p.o] <= 90) {
      p.a[p.o] = (p.a[p.o] | 32) << 24 >> 24;
    }
  }
  return s;
}

export function ucase(s: Ptr | null): Ptr | null {
  let p = null;
  for (p = s; p.a[p.o]; p = p.add(1)) {
    if (97 <= p.a[p.o] && p.a[p.o] <= 122) {
      p.a[p.o] = (p.a[p.o] & ~32) << 24 >> 24;
    }
  }
  return s;
}

export function upstart(s: Ptr | null): Ptr | null {
  if (s) {
    s.a[s.o] = highc(s.a[s.o]);
  }
  return s;
}

export function mungspaces(bp: Ptr | null): Ptr | null {
  let $t1: any;
  let c = 0;
  let p = null;
  let p2 = null;
  let was_space = TRUE;
  for (p = p2 = bp; (c = p.a[p.o]) !== 0; p = p.add(1)) {
    if (c === 10) {
      break;
    }
    if (c === 9) {
      c = 32;
    }
    if (c !== 32 || !was_space) {
      $wr(($t1 = p2, p2 = $t1.add(1), $t1), 0, c);
    }
    was_space = (c === 32 ? 1 : 0) << 24 >> 24;
  }
  if (was_space && p2.o > bp.o) {
    p2 = p2.add(-1);
  }
  p2.a[p2.o] = 0;
  return bp;
}

export function trimspaces(txt: Ptr | null): Ptr | null {
  let end = null;
  while (txt.a[txt.o] === 32 || txt.a[txt.o] === 9) {
    txt = txt.add(1);
  }
  end = eos(txt);
  while ((end = end.add(-1)).o >= txt.o && (end.a[end.o] === 32 || end.a[end.o] === 9)) {
    end.a[end.o] = 0;
  }
  return txt;
}

export function strip_newline(str: Ptr | null): Ptr | null {
  let p = strrchr(str, 10);
  if (p) {
    if (p.o > str.o && $rd(p.add(-1)) === 13) {
      p = p.add(-1);
    }
    p.a[p.o] = 0;
  }
  return str;
}

export function eos(s: Ptr | null): Ptr | null {
  while (s.a[s.o]) {
    s = s.add(1);
  }
  return s;
}

export function str_end_is(str: Ptr | null, chkstr: Ptr | null): number {
  let clen = strlen(chkstr) | 0;
  if ((strlen(str) | 0) >= clen) {
    return (!strncmp(eos(str).add(-clen), chkstr, $u64(clen)) ? 1 : 0) << 24 >> 24;
  }
  return FALSE;
}

export function strkitten(s: Ptr | null, c: number): Ptr | null {
  let $t1: any;
  let p = eos(s);
  $wr(($t1 = p, p = $t1.add(1), $t1), 0, c);
  p.a[p.o] = 0;
  return s;
}

export function copynchars(dst: Ptr | null, src: Ptr | null, n: number): void {
  let $t1: any, $t2: any;
  while (n > 0 && src.a[src.o] !== 0 && src.a[src.o] !== 10) {
    $wr(($t1 = dst, dst = $t1.add(1), $t1), 0, $rd(($t2 = src, src = $t2.add(1), $t2)));
    --n;
  }
  dst.a[dst.o] = 0;
}

export function chrcasecpy(oc: number, nc: number): number {
  if (97 <= oc && oc <= 122) {
    if (65 <= nc && nc <= 90) {
      nc += 97 - 65;
    }
  } else if (65 <= oc && oc <= 90) {
    if (97 <= nc && nc <= 122) {
      nc += 65 - 97;
    }
  }
  return nc << 24 >> 24;
}

export function strcasecpy(dst: Ptr | null, src: Ptr | null): Ptr | null {
  let $t1: any, $t2: any;
  let result = dst;
  let ic = 0;
  let oc = 0;
  let dst_exhausted = 0;
  while ((ic = $rd(($t1 = src, src = $t1.add(1), $t1))) !== 0) {
    if (!dst_exhausted && !dst.a[dst.o]) {
      dst_exhausted = 1;
    }
    oc = $rd(dst.add(-dst_exhausted));
    $wr(($t2 = dst, dst = $t2.add(1), $t2), 0, chrcasecpy(oc, ic));
  }
  dst.a[dst.o] = 0;
  return result;
}

export function s_suffix(s: Ptr | null): Ptr | null {
  strcpy(P(s_suffix$buf), s);
  if (!strncmpi(P(s_suffix$buf), S("it"), -1)) {
    strcat(P(s_suffix$buf), S("s"));
  } else if (!strncmpi(P(s_suffix$buf), S("you"), -1)) {
    strcat(P(s_suffix$buf), S("r"));
  } else if ($rd(eos(P(s_suffix$buf)).add(-1)) === 115) {
    strcat(P(s_suffix$buf), S("'"));
  } else {
    strcat(P(s_suffix$buf), S("'s"));
  }
  return P(s_suffix$buf);
}

export function ing_suffix(s: Ptr | null): Ptr | null {
  let onoff = new Int8Array(10);
  let p = null;
  strcpy(P(ing_suffix$buf), s);
  p = eos(P(ing_suffix$buf));
  onoff[0] = p.a[p.o] = $wr(p.add(1), 0, 0);
  if (p.o >= P(ing_suffix$buf, 3).o && !strncmpi(p.add(-3), S(" on"), -1) || p.o >= P(ing_suffix$buf, 4).o && !strncmpi(p.add(-4), S(" off"), -1) || p.o >= P(ing_suffix$buf, 5).o && !strncmpi(p.add(-5), S(" with"), -1)) {
    p = strrchr(P(ing_suffix$buf), 32);
    strcpy(P(onoff), p);
    p.a[p.o] = 0;
  }
  if (p.o >= P(ing_suffix$buf, 3).o && !strchr(P(ing_suffix$vowel), $rd(p.add(-1))) && strchr(P(ing_suffix$vowel), $rd(p.add(-2))) && !strchr(P(ing_suffix$vowel), $rd(p.add(-3)))) {
    p.a[p.o] = $rd(p.add(-1));
    $wr(p.add(1), 0, 0);
  } else if (p.o >= P(ing_suffix$buf, 2).o && !strncmpi(p.add(-2), S("ie"), -1)) {
    $wr(p.add(-2), 0, 121);
    $wr(p.add(-1), 0, 0);
  } else if (p.o >= P(ing_suffix$buf, 1).o && $rd(p.add(-1)) === 101) {
    $wr(p.add(-1), 0, 0);
  }
  strcat(P(ing_suffix$buf), S("ing"));
  if (onoff[0]) {
    strcat(P(ing_suffix$buf), P(onoff));
  }
  return P(ing_suffix$buf);
}

export function xcrypt(str: Ptr | null, buf: Ptr | null): Ptr | null {
  let $t1: any;
  let p = null;
  let q = null;
  let bitmask = 0;
  for (bitmask = 1, p = str, q = buf; p.a[p.o]; q = q.add(1)) {
    q.a[q.o] = $rd(($t1 = p, p = $t1.add(1), $t1));
    if (q.a[q.o] & (32 | 64)) {
      q.a[q.o] = (q.a[q.o] ^ bitmask) << 24 >> 24;
    }
    if ((bitmask = bitmask << 1) >= 32) {
      bitmask = 1;
    }
  }
  q.a[q.o] = 0;
  return buf;
}

export function onlyspace(s: Ptr | null): number {
  for (; s.a[s.o]; s = s.add(1)) {
    if (s.a[s.o] !== 32 && s.a[s.o] !== 9) {
      return FALSE;
    }
  }
  return TRUE;
}

export function tabexpand(sbuf: Ptr | null): Ptr | null {
  let $t1: any, $t2: any;
  let buf = new Int8Array(256);
  let bp = null;
  let s = sbuf;
  let idx = 0;
  if (!s.a[s.o]) {
    return sbuf;
  }
  for (bp = P(buf), idx = 0; s.a[s.o]; s = s.add(1)) {
    if (s.a[s.o] === 9) {
      do {
        $wr(($t1 = bp, bp = $t1.add(1), $t1), 0, 32);
      } while (++idx % 8);
    } else {
      $wr(($t2 = bp, bp = $t2.add(1), $t2), 0, s.a[s.o]);
      ++idx;
    }
  }
  bp.a[bp.o] = 0;
  return strcpy(sbuf, P(buf));
}

export function visctrl(c: number): Ptr | null {
  let i = 0;
  let ccc = P(visctrl$visctrl_bufs[visctrl$nbuf]);
  visctrl$nbuf = (visctrl$nbuf + 1) % VISCTRL_NBUF;
  if (c & 0xff & 128) {
    ccc.a[ccc.o + i++] = 77;
    ccc.a[ccc.o + i++] = 45;
  }
  c = (c & 127) << 24 >> 24;
  if (c < 32) {
    ccc.a[ccc.o + i++] = 94;
    ccc.a[ccc.o + i++] = (c | 64) << 24 >> 24;
  } else if (c === 127) {
    ccc.a[ccc.o + i++] = 94;
    ccc.a[ccc.o + i++] = (c & ~64) << 24 >> 24;
  } else {
    ccc.a[ccc.o + i++] = c;
  }
  ccc.a[ccc.o + i] = 0;
  return ccc;
}

export async function stripchars(bp: Ptr | null, stuff_to_strip: Ptr | null, orig: Ptr | null): Promise<Ptr | null> {
  let $t1: any;
  let i = 0;
  let s = bp;
  if (s) {
    while (orig.a[orig.o] && i < BUFSZ - 1) {
      if (!strchr(stuff_to_strip, orig.a[orig.o])) {
        $wr(($t1 = s, s = $t1.add(1), $t1), 0, orig.a[orig.o]);
        ++i;
      }
      orig = orig.add(1);
    }
    s.a[s.o] = 0;
  } else {
    await impossible(S("no output buf in stripchars"));
  }
  return bp;
}

export function strsubst(bp: Ptr | null, orig: Ptr | null, replacement: Ptr | null): Ptr | null {
  let found = null;
  let buf = new Int8Array(256);
  if (bp) {
    found = strstr(bp, orig);
    if (found) {
      strcpy(P(buf), found.add(strlen(orig)));
      strcpy(found, replacement);
      strcat(bp, P(buf));
    }
  }
  return bp;
}

export function strNsubst(inoutbuf: Ptr | null, orig: Ptr | null, replacement: Ptr | null, n: number): number {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any;
  let bp = null;
  let op = null;
  let workbuf = new Int8Array(256);
  let rp = null;
  let len = strlen(orig) >>> 0;
  let ocount = 0;
  let rcount = 0;
  for (bp = inoutbuf, op = P(workbuf); bp.a[bp.o] && op.o < P(workbuf, BUFSZ - 1).o; ) {
    if ((!len || !strncmp(bp, orig, len)) && (++ocount === n || n === 0)) {
      for (rp = replacement; rp.a[rp.o] && op.o < P(workbuf, BUFSZ - 1).o; ) {
        $wr(($t1 = op, op = $t1.add(1), $t1), 0, $rd(($t2 = rp, rp = $t2.add(1), $t2)));
      }
      ++rcount;
      if (len) {
        bp = bp.add(len);
        continue;
      }
    }
    $wr(($t3 = op, op = $t3.add(1), $t3), 0, $rd(($t4 = bp, bp = $t4.add(1), $t4)));
  }
  if (!len && n === ocount + 1) {
    for (rp = replacement; rp.a[rp.o] && op.o < P(workbuf, BUFSZ - 1).o; ) {
      $wr(($t5 = op, op = $t5.add(1), $t5), 0, $rd(($t6 = rp, rp = $t6.add(1), $t6)));
    }
    ++rcount;
  }
  if (rcount) {
    op.a[op.o] = 0;
    strcpy(inoutbuf, P(workbuf));
  }
  return rcount;
}

export function ordin(n: number): Ptr | null {
  let dd = n % 10;
  return dd === 0 || dd > 3 || (n % 100 / 10 | 0) === 1 ? S("th") : dd === 1 ? S("st") : dd === 2 ? S("nd") : S("rd");
}

export function sitoa(n: number): Ptr | null {
  sprintf(P(sitoa$buf), n < 0 ? S("%d") : S("+%d"), n);
  return P(sitoa$buf);
}

export function sgn(n: number): number {
  return n < 0 ? -1 : n !== 0 ? 1 : 0;
}

export async function rounddiv(x: number, y: number): Promise<number> {
  let r = 0;
  let m = 0;
  let divsgn = 1;
  if (y === 0) {
    await panic(S("division by zero in rounddiv"));
  } else if (y < 0) {
    divsgn = -divsgn;
    y = -y;
  }
  if (x < 0) {
    divsgn = -divsgn;
    x = -x;
  }
  r = Math.trunc(x / y) | 0;
  m = x % y | 0;
  if (2 * m >= y) {
    ++r;
  }
  return Math.imul(divsgn, r);
}

export function distmin(x0: number, y0: number, x1: number, y1: number): number {
  let dx = x0 - x1;
  let dy = y0 - y1;
  if (dx < 0) {
    dx = -dx;
  }
  if (dy < 0) {
    dy = -dy;
  }
  return dx < dy ? dy : dx;
}

export function dist2(x0: number, y0: number, x1: number, y1: number): number {
  let dx = x0 - x1;
  let dy = y0 - y1;
  return Math.imul(dx, dx) + Math.imul(dy, dy);
}

export function isqrt(val: number): number {
  let rt = 0;
  let odd = 1;
  while (val >= odd) {
    val = val - odd;
    odd = odd + 2;
    rt = rt + 1;
  }
  return rt;
}

export function online2(x0: number, y0: number, x1: number, y1: number): number {
  let dx = x0 - x1;
  let dy = y0 - y1;
  return (!dy || !dx || dy === dx || dy === -dx ? 1 : 0) << 24 >> 24;
}

function pmatch_internal(patrn: Ptr | null, strng: Ptr | null, ci: number, sk: Ptr | null): number {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let $g = 0;
  let s = 0;
  let p = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
    case 1: // pmatch_top
      if (!sk) {
        s = $rd(($t1 = strng, strng = $t1.add(1), $t1));
        p = $rd(($t2 = patrn, patrn = $t2.add(1), $t2));
      } else {
        do {
          s = $rd(($t3 = strng, strng = $t3.add(1), $t3));
        } while (strchr(sk, s));
        do {
          p = $rd(($t4 = patrn, patrn = $t4.add(1), $t4));
        } while (strchr(sk, p));
      }
      if (!p) {
        return (s === 0 ? 1 : 0) << 24 >> 24;
      } else if (p === 42) {
        return (!patrn.a[patrn.o] || pmatch_internal(patrn, strng.add(-1), ci, sk) ? TRUE : s ? pmatch_internal(patrn.add(-1), strng, ci, sk) : FALSE) << 24 >> 24;
      } else if ((ci ? lowc(p) !== lowc(s) ? 1 : 0 : p !== s ? 1 : 0) && (p !== 63 || !s)) {
        return FALSE;
      } else {
        { $g = 1; continue $L; }
      }
    }
    break;
  }
}

export function pmatch(patrn: Ptr | null, strng: Ptr | null): number {
  return pmatch_internal(patrn, strng, FALSE, null);
}

export function pmatchi(patrn: Ptr | null, strng: Ptr | null): number {
  return pmatch_internal(patrn, strng, TRUE, null);
}

export function pmatchz(patrn: Ptr | null, strng: Ptr | null): number {
  return pmatch_internal(patrn, strng, TRUE, P(pmatchz$fuzzychars));
}

export function strncmpi(s1: Ptr | null, s2: Ptr | null, n: number): number {
  let $t1: any, $t2: any;
  let t1 = 0;
  let t2 = 0;
  while (n--) {
    if (!s2.a[s2.o]) {
      return s1.a[s1.o] !== 0 ? 1 : 0;
    } else if (!s1.a[s1.o]) {
      return -1;
    }
    t1 = lowc($rd(($t1 = s1, s1 = $t1.add(1), $t1)));
    t2 = lowc($rd(($t2 = s2, s2 = $t2.add(1), $t2)));
    if (t1 !== t2) {
      return t1 > t2 ? 1 : -1;
    }
  }
  return 0;
}

export function strstri(str: Ptr | null, sub: Ptr | null): Ptr | null {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any, $t8: any, $t9: any, $t10: any, $t11: any, $t12: any, $t13: any, $t14: any;
  let s1 = null;
  let s2 = null;
  let i = 0;
  let k = 0;
  let tstr = new Int8Array(32);
  let tsub = new Int8Array(32);
  if (!sub.a[sub.o]) {
    return str;
  }
  for (i = 0; i < TABSIZ; ++i) {
    tstr[i] = tsub[i] = 0;
  }
  for (k = 0, s1 = str; s1.a[s1.o]; ++k) {
    ($t5 = tstr, $t6 = $rd(($t4 = s1, s1 = $t4.add(1), $t4)) & TABSIZ - 1, $t5[$t6] = $t5[$t6] + 1 << 24 >> 24);
  }
  for (s2 = sub; s2.a[s2.o]; --k) {
    ($t11 = tsub, $t12 = $rd(($t10 = s2, s2 = $t10.add(1), $t10)) & TABSIZ - 1, $t11[$t12] = $t11[$t12] + 1 << 24 >> 24);
  }
  if (k < 0) {
    return null;
  }
  for (i = 0; i < TABSIZ; ++i) {
    if (tsub[i] > tstr[i]) {
      return null;
    }
  }
  for (i = 0; i <= k; ++i) {
    s1 = str.add(i);
    s2 = sub;
    while (lowc($rd(($t13 = s1, s1 = $t13.add(1), $t13))) === lowc($rd(($t14 = s2, s2 = $t14.add(1), $t14)))) {
      if (!s2.a[s2.o]) {
        return str.add(i);
      }
    }
  }
  return null;
}

export function fuzzymatch(s1: Ptr | null, s2: Ptr | null, ignore_chars: Ptr | null, caseblind: number): number {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let c1 = 0;
  let c2 = 0;
  do {
    while ((c1 = $rd(($t2 = s1, s1 = $t2.add(1), $t2))) !== 0 && !!strchr(ignore_chars, c1)) {
      continue;
    }
    while ((c2 = $rd(($t4 = s2, s2 = $t4.add(1), $t4))) !== 0 && !!strchr(ignore_chars, c2)) {
      continue;
    }
    if (!c1 || !c2) {
      break;
    }
    if (caseblind) {
      c1 = lowc(c1);
      c2 = lowc(c2);
    }
  } while (c1 === c2);
  return (!c1 && !c2 ? 1 : 0) << 24 >> 24;
}

function set_random(seed: number, fn: Function | null): void {
  init_isaac64(seed, fn);
}

export function init_random(fn: Function | null): void {
  set_random(sys_random_seed(), fn);
}

export function reseed_random(fn: Function | null): void {
  if (G.has_strong_rngseed) {
    init_random(fn);
  }
}

export function getnow(): number {
  const datetime = new Float64Array(1);
  datetime[0] = 0;
  time(P(datetime, 0));
  return datetime[0];
}

function getlt(): struct_tm | null {
  const date = new Float64Array(1);
  date[0] = getnow();
  return localtime(P(date, 0));
}

export function getyear(): number {
  return 1900 + getlt().tm_year;
}

export function yyyymmdd(date$: number): number {
  const date = new Float64Array(1);
  date[0] = date$;
  let datenum = 0;
  let lt = null;
  if (date[0] === 0) {
    lt = getlt();
  } else {
    lt = localtime(P(date, 0));
  }
  if (lt.tm_year < 70) {
    datenum = lt.tm_year + 2000;
  } else {
    datenum = lt.tm_year + 1900;
  }
  datenum = datenum * 100 + (lt.tm_mon + 1);
  datenum = datenum * 100 + lt.tm_mday;
  return datenum;
}

export function hhmmss(date$: number): number {
  const date = new Float64Array(1);
  date[0] = date$;
  let timenum = 0;
  let lt = null;
  if (date[0] === 0) {
    lt = getlt();
  } else {
    lt = localtime(P(date, 0));
  }
  timenum = lt.tm_hour * 10000 + lt.tm_min * 100 + lt.tm_sec;
  return timenum;
}

export async function yyyymmddhhmmss(date$: number): Promise<Ptr | null> {
  const date = new Float64Array(1);
  date[0] = date$;
  let datenum = 0;
  let lt = null;
  if (date[0] === 0) {
    lt = getlt();
  } else {
    lt = localtime(P(date, 0));
  }
  if (lt.tm_year < 70) {
    datenum = lt.tm_year + 2000;
  } else {
    datenum = lt.tm_year + 1900;
  }
  sprintf(P(yyyymmddhhmmss$datestr), S("%04ld%02d%02d%02d%02d%02d"), datenum, lt.tm_mon + 1, lt.tm_mday, lt.tm_hour, lt.tm_min, lt.tm_sec);
  do {
    if (await debugcore(S("hacklib.c"), 1)) {
      await pline(S("yyyymmddhhmmss() produced date string %s"), P(yyyymmddhhmmss$datestr));
    }
  } while (0);
  return P(yyyymmddhhmmss$datestr);
}

export async function time_from_yyyymmddhhmmss(buf: Ptr | null): Promise<number> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any, $t8: any, $t9: any, $t10: any, $t11: any, $t12: any;
  let k = 0;
  let timeresult = 0;
  let t = new struct_tm();
  let lt = null;
  let g = null;
  let p = null;
  let y = new Int8Array(5);
  let mo = new Int8Array(3);
  let md = new Int8Array(3);
  let h = new Int8Array(3);
  let mi = new Int8Array(3);
  let s = new Int8Array(3);
  if (buf && strlen(buf) === 14) {
    g = buf;
    p = P(y);
    for (k = 0; k < 4; ++k) {
      $wr(($t1 = p, p = $t1.add(1), $t1), 0, $rd(($t2 = g, g = $t2.add(1), $t2)));
    }
    p.a[p.o] = 0;
    p = P(mo);
    for (k = 0; k < 2; ++k) {
      $wr(($t3 = p, p = $t3.add(1), $t3), 0, $rd(($t4 = g, g = $t4.add(1), $t4)));
    }
    p.a[p.o] = 0;
    p = P(md);
    for (k = 0; k < 2; ++k) {
      $wr(($t5 = p, p = $t5.add(1), $t5), 0, $rd(($t6 = g, g = $t6.add(1), $t6)));
    }
    p.a[p.o] = 0;
    p = P(h);
    for (k = 0; k < 2; ++k) {
      $wr(($t7 = p, p = $t7.add(1), $t7), 0, $rd(($t8 = g, g = $t8.add(1), $t8)));
    }
    p.a[p.o] = 0;
    p = P(mi);
    for (k = 0; k < 2; ++k) {
      $wr(($t9 = p, p = $t9.add(1), $t9), 0, $rd(($t10 = g, g = $t10.add(1), $t10)));
    }
    p.a[p.o] = 0;
    p = P(s);
    for (k = 0; k < 2; ++k) {
      $wr(($t11 = p, p = $t11.add(1), $t11), 0, $rd(($t12 = g, g = $t12.add(1), $t12)));
    }
    p.a[p.o] = 0;
    lt = getlt();
    if (lt) {
      t.$cp(lt);
      t.tm_year = atoi(P(y)) - 1900;
      t.tm_mon = atoi(P(mo)) - 1;
      t.tm_mday = atoi(P(md));
      t.tm_hour = atoi(P(h));
      t.tm_min = atoi(P(mi));
      t.tm_sec = atoi(P(s));
      timeresult = mktime(t);
    }
    if ((timeresult | 0) === -1) {
      do {
        if (await debugcore(S("hacklib.c"), 1)) {
          await pline(S("time_from_yyyymmddhhmmss(%s) would have returned -1"), buf ? buf : S(""));
        }
      } while (0);
    } else {
      return timeresult;
    }
  }
  return 0;
}

export function phase_of_the_moon(): number {
  let lt = getlt();
  let epact = 0;
  let diy = 0;
  let goldn = 0;
  diy = lt.tm_yday;
  goldn = lt.tm_year % 19 + 1;
  epact = (11 * goldn + 18) % 30;
  if (epact === 25 && goldn > 11 || epact === 24) {
    ++epact;
  }
  return (((diy + epact) * 6 + 11) % 177 / 22 | 0) & 7;
}

export function friday_13th(): number {
  let lt = getlt();
  return (lt.tm_wday === 5 && lt.tm_mday === 13 ? 1 : 0) << 24 >> 24;
}

export function night(): number {
  let hour = getlt().tm_hour;
  return hour < 6 || hour > 21 ? 1 : 0;
}

export function midnight(): number {
  return getlt().tm_hour === 0 ? 1 : 0;
}

export function strbuf_init(strbuf: struct_strbuf | null): void {
  strbuf.str = null;
  strbuf.len = 0;
}

export async function strbuf_append(strbuf: struct_strbuf | null, str: Ptr | null): Promise<void> {
  let len = (strlen(str) | 0) + 1;
  await strbuf_reserve(strbuf, len + (strbuf.str ? strlen(strbuf.str) | 0 : 0));
  strcat(strbuf.str, str);
}

export async function strbuf_reserve(strbuf: struct_strbuf | null, len: number): Promise<void> {
  if (!strbuf.str) {
    strbuf.str = P(strbuf.buf);
    strbuf.str.a[strbuf.str.o] = 0;
    strbuf.len = 256;
  }
  if (len > strbuf.len) {
    let oldbuf = strbuf.str;
    strbuf.len = len + 256;
    strbuf.str = P(new Int8Array((strbuf.len >>> 0)));
    strcpy(strbuf.str, oldbuf);
    if (!$peq(oldbuf, P(strbuf.buf))) {
      free(oldbuf);
    }
  }
}

export function strbuf_empty(strbuf: struct_strbuf | null): void {
  if (!!strbuf.str && !$peq(strbuf.str, P(strbuf.buf))) {
    free(strbuf.str);
  }
  strbuf_init(strbuf);
}

export async function strbuf_nl_to_crlf(strbuf: struct_strbuf | null): Promise<void> {
  let $t1: any;
  if (strbuf.str) {
    let len = strlen(strbuf.str) | 0;
    let count = 0;
    let cp = strbuf.str;
    while (cp.a[cp.o]) {
      if ($rd(($t1 = cp, cp = $t1.add(1), $t1)) === 10) {
        ++count;
      }
    }
    if (count) {
      await strbuf_reserve(strbuf, len + count + 1);
      for (cp = strbuf.str.add(len).add(count); count; cp = cp.add(-1)) {
        if ((cp.a[cp.o] = cp.a[cp.o + -count]) === 10) {
          $wr((cp = cp.add(-1)), 0, 13);
          --count;
        }
      }
    }
  }
}

export function $init(): void {
  s_suffix$buf = new Int8Array(256);
  ing_suffix$vowel = $cs("aeiouwy", 8);
  ing_suffix$buf = new Int8Array(256);
  visctrl$visctrl_bufs = $arr(5, () => new Int8Array(5));
  visctrl$nbuf = 0;
  sitoa$buf = new Int8Array(13);
  pmatchz$fuzzychars = $cs(" \t-_", 5);
  yyyymmddhhmmss$datestr = new Int8Array(15);
}
