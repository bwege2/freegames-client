// Format.cpp (format::CleanString, RenderTemperature, StringToTemperature) and the number formatting of the
// original's StringBuilder (common/String.cpp: a C++ stream, default %g with precision 6; after
// Format::Precision(n) fixed with n decimals).
import { TEMPSCALE_CELSIUS, TEMPSCALE_FAHRENHEIT, TEMPSCALE_KELVIN } from '../sim/config.ts';

const f = Math.fround;

/** a float/double written to a stream with the default flags (%g, precision 6) */
export function fmtG(v: number, precision = 6): string {
  if (!Number.isFinite(v)) return Number.isNaN(v) ? 'nan' : (v < 0 ? '-inf' : 'inf');
  if (v === 0) return Object.is(v, -0) ? '-0' : '0';
  const exp = Math.floor(Math.log10(Math.abs(v)));
  let s: string;
  if (exp < -4 || exp >= precision) {
    s = v.toExponential(precision - 1);
    let [m, e] = s.split('e');
    if (m.includes('.')) m = m.replace(/0+$/, '').replace(/\.$/, '');
    const sign = e[0] === '-' ? '-' : '+';
    let digits = e.replace(/^[+-]/, '');
    if (digits.length < 2) digits = '0' + digits;
    return m + 'e' + sign + digits;
  }
  s = v.toPrecision(precision);
  if (s.includes('e')) return fmtG(Number(s), precision);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s;
}

/** a float written after Format::Precision(n) (fixed) */
export function fmtFixed(v: number, precision: number): string {
  if (!Number.isFinite(v)) return Number.isNaN(v) ? 'nan' : (v < 0 ? '-inf' : 'inf');
  return v.toFixed(precision);
}

/** format::CleanString(dirtyString, ascii, color, newlines, numeric) */
export function CleanString(dirtyString: string, ascii: boolean, color: boolean, newlines: boolean, numeric = false): string {
  const s = [...dirtyString];
  for (let i = 0; i < s.length; i++) {
    switch (s[i]) {
      case '\b':
        if (color) { s.splice(i, 2); i--; } else i++;
        break;
      case '\x0E':
        if (color) { s.splice(i, 1); i--; }
        break;
      case '\x0F':
        if (color) { s.splice(i, 4); i--; } else i += 3;
        break;
      case '\r':
      case '\n':
        if (newlines) s[i] = ' ';
        break;
      default:
        if (numeric && (s[i] < '0' || s[i] > '9')) {
          s.splice(i, 1);
          i--;
        } else if (ascii && (s[i] < ' ' || s[i] > '~')) {
          s.splice(i, 1);
          i--;
        }
        break;
    }
  }
  return s.join('');
}

/** format::RenderTemperature; fixed: the builder had Format::Precision(n) */
export function RenderTemperature(temp: number, scale: number, fixed: number | null = null): string {
  const out = (v: number) => (fixed === null ? fmtG(v) : fmtFixed(v, fixed));
  switch (scale) {
    case TEMPSCALE_CELSIUS:
      return out(f(temp - f(273.15))) + 'C';
    case TEMPSCALE_FAHRENHEIT:
      return out(f(f(f(temp - f(273.15)) * f(1.8)) + 32)) + 'F';
    default:
      return out(temp) + 'K';
  }
}

/** String::ToNumber<float>: throws on garbage (a prefix that is a number is accepted only in full) */
export function ToNumberFloat(str: string): number {
  const t = str.trim();
  if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(t)) throw new RangeError('not a number');
  return f(Number(t));
}

/** String::ToNumber<int> */
export function ToNumberInt(str: string, noThrow = false): number {
  const t = str.trim();
  if (!/^[+-]?\d+$/.test(t)) {
    if (noThrow) return 0;
    throw new RangeError('not a number');
  }
  return Number(t) | 0;
}

/** format::StringToTemperature */
export function StringToTemperature(str: string, defaultScale: number): number {
  let scale = defaultScale;
  if (str.length) {
    if (str.endsWith('K')) { scale = TEMPSCALE_KELVIN; str = str.slice(0, -1); }
    else if (str.endsWith('C')) { scale = TEMPSCALE_CELSIUS; str = str.slice(0, -1); }
    else if (str.endsWith('F')) { scale = TEMPSCALE_FAHRENHEIT; str = str.slice(0, -1); }
  }
  if (!str.length) throw new RangeError('empty string');
  let out = ToNumberFloat(str);
  switch (scale) {
    case TEMPSCALE_CELSIUS:
      out = f(out + 273.15);
      break;
    case TEMPSCALE_FAHRENHEIT:
      out = f(f(f(out - 32) / f(1.8)) + f(273.15));
      break;
    default:
      break;
  }
  return out;
}
