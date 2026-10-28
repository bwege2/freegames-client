// @ts-nocheck
// COW 3.3.3 string_util.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { $u64, memccpy, strlen } from '../rt/index.ts';



export function itoapad(val: number, result: Ptr | null, pad: number, prec: number): Ptr | null {
  let lead_digit = 0;
  let i = 0;
  let j = 0;
  let too_big = 1;
  let h = 1;
  if (prec !== 0) {
    result.a[result.o + prec] = 0;
  }
  for (i = 100000000, j = 0; i && h <= prec; i = i / 10 | 0, ++j) {
    if (9 - prec > j && too_big) {
      continue;
    } else if (h) {
      j = 0;
      too_big = 0;
      h = 0;
    }
    result.a[result.o + j] = (val % (i * 10) / i | 0) + 48 << 24 >> 24;
    if (result.a[result.o + j] !== 48 && !lead_digit) {
      lead_digit = 1;
    }
    if (!lead_digit && !pad) {
      if ((result.a[result.o + j] = (val % (i * 10) / i | 0) + 48 << 24 >> 24) === 48) {
        result.a[result.o + j] = 32;
      }
    }
  }
  if (val === 0) {
    result.a[result.o + (prec - 1)] = 48;
  }
  return result;
}

export function ftoa(fval: number, result: Ptr | null, pad: number, iprec: number, dprec: number): Ptr | null {
  let i = 0;
  let ival = 0;
  let val = fval;
  if (fval < 0) {
    for (i = 0; i <= iprec + dprec + 1; ++i) {
      result.a[result.o + i] = 63;
    }
    result.a[result.o + (iprec + dprec + 1)] = 0;
    return result;
  }
  if (iprec + dprec !== 0) {
    result.a[result.o + (iprec + dprec + 1)] = 0;
  }
  for (i = 0; i < dprec; ++i) {
    val = val * 10;
  }
  ival = Math.trunc(val) | 0;
  itoapad(ival, result, pad, iprec + dprec);
  for (i = iprec + dprec; i >= iprec; --i) {
    if (result.a[result.o + i] === 32) {
      result.a[result.o + (i + 1)] = 48;
    } else {
      result.a[result.o + (i + 1)] = result.a[result.o + i];
    }
  }
  result.a[result.o + iprec] = 46;
  if (fval < 1) {
    result.a[result.o + (iprec - 1)] = 48;
  }
  return result;
}

export function format(buf: Ptr | null, from: Ptr | null, width: number, right_justify: number): Ptr | null {
  let len = strlen(from) | 0;
  let i = 0;
  if (len > width) {
    len = width;
  }
  buf.a[buf.o + width] = 0;
  if (right_justify) {
    memccpy(buf.add(width - len), from, 0, $u64(len));
    for (i = 0; i < width - len; ++i) {
      buf.a[buf.o + i] = 32;
    }
  } else {
    memccpy(buf, from, 0, $u64(len));
    for (i = len; i < width; ++i) {
      buf.a[buf.o + i] = 32;
    }
  }
  return buf;
}

export function $init(): void {
}
