// lclib.c: number formatting and small helpers.
import { months } from './g.ts';
import { NUMOF_DAYS_IN_YEAR, NUMOF_DAYS_IN_MONTH } from './consts.ts';
import { sprintf, snprintf, idiv, abs, f32 } from './c.ts';

export function current_month(current_time: number): string {
  return months[idiv(current_time % NUMOF_DAYS_IN_YEAR, NUMOF_DAYS_IN_MONTH)];
}

export function current_year(current_time: number): number {
  return idiv(current_time, NUMOF_DAYS_IN_YEAR);
}

export function format_number5(num: number): string {
  const num_sign = num >= 0 ? 1 : -1;
  if (num_sign === 1) {
    if (num < 99999) return sprintf('%5d', num);
    if (num < 9999999) return sprintf('%4dK', idiv(num, 1000));
    return sprintf('%4dM', idiv(num, 1000000));
  }
  const num_absval = (num_sign * num) | 0;
  if (num_absval < 9999) return sprintf('%5d', num);
  if (num_absval < 999999) return sprintf('%4dK', num_sign * idiv(num_absval, 1000));
  return sprintf('%4dM', num_sign * idiv(num_absval, 1000000));
}

export function num_to_ansi(size: number, num: number): string {
  let triplets = 0;
  let numf = f32(num);
  while (numf > 1000 || numf < -1000) {
    numf = f32(numf / 1000);
    triplets++;
  }
  let t: number;
  switch (triplets) {
    case 0: t = 32; break;
    case 1: t = 107; break;
    case 2: t = 109; break;
    case 3: t = 103; break;
    case 4: t = 116; break;
    case 5: t = 112; break;
    default: t = 63; break;
  }
  if (size === 4) {
    if (numf < 10) return snprintf(size + 1, '%1.1f%c', numf, t);
    return snprintf(size + 1, '%3.0f%c', numf, t);
  }
  if (t === 32) return snprintf(size, '%3.1f', numf);
  return snprintf(size, '%3.1f%c', numf, t);
}

export function num_to_ansi_unit(size: number, num: number, unit: number): string {
  let triplets = 0;
  let numf = f32(num);
  while (numf > 1000) {
    numf = f32(numf / 1000);
    triplets++;
  }
  let t: number;
  switch (triplets) {
    case 0: t = 32; break;
    case 1: t = 107; break;
    case 2: t = 109; break;
    case 3: t = 103; break;
    case 4: t = 116; break;
    case 5: t = 112; break;
    default: t = 63; break;
  }
  if (size === 4) {
    if (numf < 10) return snprintf(size, '%4.1f%c%c', numf, t, unit);
    return snprintf(size, '%4.0f%c%c', numf, t, unit);
  }
  return snprintf(size, '%5.1f%c%c', numf, t, unit);
}

/** commify into a buffer of `size`: [the string, the characters counted as written] */
export function commify(size: number, argnum: number): [string, number] {
  // the original adds up snprintf's return values (what would have been written)
  let str = '';
  let count = 0;
  let triad = 1;
  let num = argnum;
  let kludge = 1;
  const put = (s: string): void => {
    const room = size - count;
    if (room > 0) str = str.slice(0, count) + s.slice(0, room - 1);
    count += s.length;
  };
  if (num < 0) put('-');
  num = abs(argnum);
  for (; num >= 1000; num = idiv(num, 1000), triad++, kludge *= 1000);
  num = abs(argnum);
  for (let i = 0; triad > 0; i++, triad--) {
    if (i === 0) {
      if (triad === 1) put(sprintf('%d', num));
      else put(sprintf('%d,', num ? idiv(num, kludge) : num));
    } else if (triad === 1) put(sprintf('%03d', num ? idiv(num, kludge) : num));
    else put(sprintf('%03d,', num ? idiv(num, kludge) : num));
    if (num) num %= kludge;
    kludge = idiv(kludge, 1000);
  }
  return [str, count];
}

export function format_pos_number4(num: number): string { return num_to_ansi(4, num); }

export function format_power(size: number, power: number): string { return num_to_ansi_unit(size, power, 119); }

export const min_int = (a: number, b: number): number => (a < b ? a : b);
export const max_int = (a: number, b: number): number => (a > b ? a : b);
