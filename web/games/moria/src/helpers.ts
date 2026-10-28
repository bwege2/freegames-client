// helpers.cpp: Generic helper functions used throughout the code
import { cstr, type Ref, sprintf } from './libc.ts';
import { platform } from './platform.ts';

// Returns position of first set bit and clears that bit -RAK-
export function getAndClearFirstBit(flag: Ref<number>): number {
  let mask = 0x1;

  for (let i = 0; i < 32; i++) {
    if ((flag.v & mask) !== 0) {
      flag.v = (flag.v & ~mask) >>> 0;
      return i;
    }
    mask = (mask << 1) >>> 0;
  }

  // no one bits found
  return -1;
}

// Insert a long number into a string (was `insert_lnum()` function)
export function insertNumberIntoString(to_string: Ref<string>, from_string: string, number: number, show_sign: boolean): void {
  // the first occurrence of from_string
  const at = to_string.v.indexOf(from_string);

  if (at >= 0) {
    const str1 = to_string.v.slice(0, at);
    const str2 = to_string.v.slice(at + from_string.length);

    if (number >= 0 && show_sign) {
      to_string.v = sprintf('%s+%d%s', str1, number, str2);
    } else {
      to_string.v = sprintf('%s%d%s', str1, number, str2);
    }
  }
}

// Inserts a string into a string
export function insertStringIntoString(to_string: Ref<string>, from_string: string, str_to_insert: string | null): void {
  const at = to_string.v.indexOf(from_string);

  if (at >= 0) {
    to_string.v = to_string.v.slice(0, at) + (str_to_insert ?? '') + to_string.v.slice(at + from_string.length);
  }
}

export function isVowel(ch: string): boolean {
  switch (ch) {
    case 'a':
    case 'e':
    case 'i':
    case 'o':
    case 'u':
    case 'A':
    case 'E':
    case 'I':
    case 'O':
    case 'U':
      return true;
    default:
      return false;
  }
}

// strtol(str, &endptr, 10) as stringToNumber() uses it: leading white space, a sign, digits; the
// whole string must be used up ("" is 0); a value outside long's range fails.
export function stringToNumber(str: string, number: Ref<number>): boolean {
  const s = cstr(str);
  const m = /^[ \t\n\v\f\r]*([+-]?)(\d+)/.exec(s);
  if (m === null) {
    // no digits: strtol returns 0 and endptr = str
    if (s.length !== 0) {
      return false;
    }
    number.v = 0;
    return true;
  }
  if (m[0].length !== s.length) {
    // garbage at end of string
    return false;
  }
  const value = BigInt(m[1] + m[2]);
  if (value > 9223372036854775807n || value < -9223372036854775808n) {
    return false;
  }
  number.v = Number(BigInt.asIntN(32, value));
  return true;
}

export function getCurrentUnixTime(): number {
  return platform().time() >>> 0;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// strftime(day, 11, "%a %b %e", localtime(&now))
export function humanDateString(day: Ref<string>): void {
  const tm = platform().localtime(platform().time());
  day.v = sprintf('%s %s %2d', DAYS[tm.tm_wday], MONTHS[tm.tm_mon], tm.tm_mday);
}
