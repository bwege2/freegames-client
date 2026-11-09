// @ts-nocheck
// The rest of the Java library Shattered Pixel Dungeon uses: java.text (dates, numbers), java.util.regex,
// Calendar and TimeZone, java.lang.reflect.Array. Partly from FreeCol's runtime (web/games/freecol/src/jre/misc.ts).
//
// The time zone: TimeZone.getDefault() is the "user.timezone" property ($J.properties) when it is set (the
// tests set "UTC", as the oracle runs with TZ=UTC), else the platform's local time. The game reads the date
// (utils/Holiday.java: the pasty's look and name, Rat King's hat; not the generated levels, checked with
// clocks in October and December), so the tests fix the clock and the zone only to be reproducible.
import { $J, JObject, defineLib, exc, jsRegex, RuntimeException, IllegalArgumentException } from './lang.ts';

export const IllegalFormatException = exc('IllegalFormatException', IllegalArgumentException, 'java.util.IllegalFormatException');

/* ------------------------------------------------------------------ TimeZone, Calendar */

export class TimeZone extends JObject {
  id: string;
  constructor(id: string) {
    super();
    this.id = id;
  }
  static getTimeZone(id: string) { return new TimeZone(id === 'UTC' || id === 'GMT' ? 'UTC' : id); }
  static getDefault() {
    const p = $J.properties.get('user.timezone');
    return new TimeZone(p ? p : 'local');
  }
  getID() { return this.id === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : this.id; }
  /** The calendar fields of a time in this zone (UTC or the platform's local time). */
  fields(t: number) {
    const d = new Date(t);
    const u = this.id === 'UTC';
    return {
      year: u ? d.getUTCFullYear() : d.getFullYear(), month: u ? d.getUTCMonth() : d.getMonth(),
      day: u ? d.getUTCDate() : d.getDate(), hour: u ? d.getUTCHours() : d.getHours(),
      minute: u ? d.getUTCMinutes() : d.getMinutes(), second: u ? d.getUTCSeconds() : d.getSeconds(),
      ms: u ? d.getUTCMilliseconds() : d.getMilliseconds(), dow: u ? d.getUTCDay() : d.getDay(),
    };
  }
}
defineLib(TimeZone, 'java.util.TimeZone');

const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** java.util.Calendar (a GregorianCalendar): the fields the game reads. */
export class Calendar extends JObject {
  static ERA = 0; static YEAR = 1; static MONTH = 2; static WEEK_OF_YEAR = 3; static DATE = 5; static DAY_OF_MONTH = 5;
  static DAY_OF_YEAR = 6; static DAY_OF_WEEK = 7; static AM_PM = 9; static HOUR = 10; static HOUR_OF_DAY = 11;
  static MINUTE = 12; static SECOND = 13; static MILLISECOND = 14;
  static JANUARY = 0; static FEBRUARY = 1; static MARCH = 2; static APRIL = 3; static MAY = 4; static JUNE = 5;
  static JULY = 6; static AUGUST = 7; static SEPTEMBER = 8; static OCTOBER = 9; static NOVEMBER = 10; static DECEMBER = 11;
  t: number;
  zone: TimeZone;
  constructor() {
    super();
    this.t = Number($J.system_currentTimeMillis());
    this.zone = TimeZone.getDefault();
  }
  static getInstance() { return new GregorianCalendar(); }
  setTime(d: any) { this.t = Number(d.getTime()); }
  getTime() { return new ($J.load('java.util.Date'))(BigInt(this.t)); }
  getTimeInMillis() { return BigInt(this.t); }
  setTimeInMillis(t: bigint) { this.t = Number(t); }
  setTimeZone(z: TimeZone) { this.zone = z; }
  get(field: number): number {
    const f = this.zone.fields(this.t);
    switch (field) {
    case Calendar.YEAR: return f.year;
    case Calendar.MONTH: return f.month;
    case Calendar.DAY_OF_MONTH: return f.day;
    case Calendar.DAY_OF_YEAR: {
      let n = f.day;
      for (let m = 0; m < f.month; m++) n += MONTH_DAYS[m] + (m === 1 && isLeap(f.year) ? 1 : 0);
      return n;
    }
    case Calendar.DAY_OF_WEEK: return f.dow + 1;
    case Calendar.HOUR_OF_DAY: return f.hour;
    case Calendar.HOUR: return f.hour % 12;
    case Calendar.AM_PM: return f.hour < 12 ? 0 : 1;
    case Calendar.MINUTE: return f.minute;
    case Calendar.SECOND: return f.second;
    case Calendar.MILLISECOND: return f.ms;
    case Calendar.ERA: return 1;
    default: throw new IllegalArgumentException('calendar field ' + field);
    }
  }
  getActualMaximum(field: number): number {
    const y = this.get(Calendar.YEAR);
    switch (field) {
    case Calendar.DAY_OF_YEAR: return isLeap(y) ? 366 : 365;
    case Calendar.DAY_OF_MONTH: { const m = this.get(Calendar.MONTH); return MONTH_DAYS[m] + (m === 1 && isLeap(y) ? 1 : 0); }
    case Calendar.MONTH: return 11;
    default: throw new IllegalArgumentException('calendar field ' + field);
    }
  }
}
defineLib(Calendar, 'java.util.Calendar');
export class GregorianCalendar extends Calendar {
  static getInstance() { return new GregorianCalendar(); }
}
defineLib(GregorianCalendar, 'java.util.GregorianCalendar');

/* ------------------------------------------------------------------ java.text */

export class Format extends JObject {}
defineLib(Format, 'java.text.Format');

export class DateFormat extends Format {
  zone: TimeZone = TimeZone.getDefault();
  setTimeZone(z: TimeZone) { this.zone = z; }
  getTimeZone() { return this.zone; }
}
defineLib(DateFormat, 'java.text.DateFormat');

/** SimpleDateFormat: the patterns the game uses (yyyy MM dd HH mm ss SSS). */
export class SimpleDateFormat extends DateFormat {
  pattern: string;
  constructor(pattern: string = 'yyyy-MM-dd HH:mm', _l?: any) {
    super();
    this.pattern = pattern;
  }
  format(d: any) {
    const t = typeof d === 'bigint' ? Number(d) : typeof d === 'number' ? d : Number(d.getTime());
    const f = this.zone.fields(t);
    const p2 = (n: number) => String(n).padStart(2, '0');
    return this.pattern.replace(/yyyy|MM|dd|HH|mm|ss|SSS/g, (m) => ({
      yyyy: String(f.year), MM: p2(f.month + 1), dd: p2(f.day), HH: p2(f.hour),
      mm: p2(f.minute), ss: p2(f.second), SSS: String(f.ms).padStart(3, '0'),
    } as any)[m]);
  }
}
defineLib(SimpleDateFormat, 'java.text.SimpleDateFormat');

export class DecimalFormatSymbols extends JObject {
  locale: any;
  constructor(locale?: any) {
    super();
    this.locale = locale;
  }
  static getInstance(locale?: any) { return new DecimalFormatSymbols(locale); }
  /** The decimal and grouping separators of the locale (the platform's Intl data, as Java's CLDR data). */
  sep(): { dec: string; group: string } {
    const tag = this.locale ? String(this.locale.toLanguageTag()) || 'en' : 'en';
    let dec = '.', group = ',';
    try {
      for (const p of new Intl.NumberFormat(tag).formatToParts(1234567.5)) {
        if (p.type === 'decimal') dec = p.value;
        if (p.type === 'group') group = p.value;
      }
    } catch {}
    return { dec, group };
  }
}
defineLib(DecimalFormatSymbols, 'java.text.DecimalFormatSymbols');

export class NumberFormat extends Format {
  symbols: DecimalFormatSymbols;
  constructor(symbols?: DecimalFormatSymbols) {
    super();
    this.symbols = symbols ?? new DecimalFormatSymbols();
  }
  static getInstance(locale?: any) { return new NumberFormat(new DecimalFormatSymbols(locale)); }
  /** NumberFormat.getInstance(): grouping, up to three fraction digits, half-even. */
  format(x: any): string {
    const { dec, group } = this.symbols.sep();
    const v = typeof x === 'bigint' ? x : +x;
    let [ip, fp] = typeof v === 'bigint' ? [String(v < 0n ? -v : v), ''] : halfEven(Math.abs(v), 3).split('.');
    ip = ip.replace(/\B(?=(\d{3})+(?!\d))/g, group);
    fp = (fp || '').replace(/0+$/, '');
    const neg = typeof v === 'bigint' ? v < 0n : v < 0 || Object.is(v, -0);
    return (neg && (ip !== '0' || fp) ? '-' : '') + ip + (fp ? dec + fp : '');
  }
}
defineLib(NumberFormat, 'java.text.NumberFormat');

/** x with n fraction digits, rounded half-even on the exact binary value (as java.text does). */
function halfEven(x: number, n: number): string {
  let s = x.toFixed(n); // toFixed rounds half up on the exact value; only an exact tie can differ
  const scaled = x * 10 ** n;
  if (Number.isInteger(scaled * 2) && !Number.isInteger(scaled) && Math.abs(scaled) < 2 ** 52) {
    const fl = Math.floor(scaled);
    const r = fl % 2 === 0 ? fl : fl + 1;
    s = (r / 10 ** n).toFixed(n);
  }
  return s;
}

/** DecimalFormat: the patterns the game uses ("#", "#.##", "#.##x": optional fraction digits and a suffix). */
export class DecimalFormat extends NumberFormat {
  pattern: string;
  constructor(pattern: string, symbols?: DecimalFormatSymbols) {
    super(symbols);
    this.pattern = pattern;
  }
  format(x: any): string {
    const m = /^([#0,]*)(?:\.([#0]*))?(.*)$/.exec(this.pattern);
    const minFrac = (m[2] || '').replace(/#/g, '').length;
    const maxFrac = (m[2] || '').length;
    const { dec } = this.symbols.sep();
    const v = typeof x === 'bigint' ? Number(x) : +x;
    let [ip, fp] = halfEven(Math.abs(v), maxFrac).split('.');
    fp = fp || '';
    while (fp.length > minFrac && fp.endsWith('0')) fp = fp.substring(0, fp.length - 1);
    const neg = v < 0 && (ip !== '0' || /[1-9]/.test(fp));
    return (neg ? '-' : '') + ip + (fp ? dec + fp : '') + m[3];
  }
}
defineLib(DecimalFormat, 'java.text.DecimalFormat');

/* ------------------------------------------------------------------ java.util.regex */

export class Pattern extends JObject {
  re: string;
  flags: any;
  constructor(re: string, flags = 0) {
    super();
    this.re = re; this.flags = flags;
  }
  static CASE_INSENSITIVE = 2;
  static compile(re: string, flags = 0) { return new Pattern(re, flags); }
  static quote(s: string) { return '\\Q' + s + '\\E'; }
  static matches(re: string, s: string) { return jsRegex('^(?:' + re + ')$').test(s); }
  matcher(s: string) { return new Matcher(this, s); }
  pattern() { return this.re; }
  split(s: string) { return s.split(jsRegex(this.re, this.flags & 2 ? 'i' : '')); }
  toString() { return this.re; }
}
defineLib(Pattern, 'java.util.regex.Pattern');
export class Matcher extends JObject {
  m: RegExpExecArray | null = null;
  rx: RegExp;
  p: Pattern;
  s: string;
  constructor(p: Pattern, s: string) {
    super();
    this.p = p; this.s = s;
    this.rx = jsRegex(p.re, 'g' + (p.flags & 2 ? 'i' : ''));
  }
  reset(s?: string) { if (s !== undefined) this.s = s; this.rx.lastIndex = 0; this.m = null; return this; }
  matches() { this.m = jsRegex('^(?:' + this.p.re + ')$', this.p.flags & 2 ? 'i' : '').exec(this.s); return !!this.m; }
  find() { this.m = this.rx.exec(this.s); return !!this.m; }
  group(i: any = 0) { return this.m ? (this.m[i] === undefined ? null : this.m[i]) : null; }
  groupCount() { return this.m ? this.m.length - 1 : 0; }
  start() { return this.m ? this.m.index : -1; }
  end() { return this.m ? this.m.index + this.m[0].length : -1; }
  replaceAll(r: string) { return this.s.replace(this.rx, r); }
}
defineLib(Matcher, 'java.util.regex.Matcher');

/* ------------------------------------------------------------------ java.util.Base64 (the oracle's save files) */

export class Base64 extends JObject {
  static getEncoder() {
    return { encodeToString: (b: any) => { let s = ''; for (const x of b) s += String.fromCharCode(x & 0xff); return btoa(s); } };
  }
  static getDecoder() {
    return { decode: (s: string) => Array.from(atob(s), (c: string) => (c.charCodeAt(0) << 24) >> 24) };
  }
}
defineLib(Base64, 'java.util.Base64');

/* ------------------------------------------------------------------ java.lang.reflect */

export class JArray {
  static newInstance(c: any, n: number) {
    const a = new Array(n).fill(null);
    if (c && c.getName) Object.defineProperty(a, '$type', { value: 'L' + c.getName() + ';', enumerable: false });
    return a;
  }
  static getLength(a: any[]) { return a.length; }
  static get(a: any[], i: number) { return a[i]; }
}

export { RuntimeException };
