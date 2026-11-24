// OpenTTD's calendar: Gregorian leap years, dates counted in days from
// January 1st of year 0 (src/timer/timer_game_common.{h,cpp}). One game day is
// 74 ticks of 27 ms (src/timer/timer_game_tick.h, src/gfx_type.h).

export const DAYS_IN_YEAR = 365;
export const DAYS_IN_LEAP_YEAR = 366;
export const MONTHS_IN_YEAR = 12;
export const DAY_TICKS = 74;
export const MILLISECONDS_PER_TICK = 27;
export const TICKS_PER_SECOND = Math.floor(1000 / MILLISECONDS_PER_TICK);
export const DEF_START_YEAR = 1950;
export const ORIGINAL_BASE_YEAR = 1920;

const ACCUM_JAN = 0;
const ACCUM_FEB = ACCUM_JAN + 31;
const ACCUM_MAR = ACCUM_FEB + 29;
const ACCUM_APR = ACCUM_MAR + 31;
const ACCUM_MAY = ACCUM_APR + 30;
const ACCUM_JUN = ACCUM_MAY + 31;
const ACCUM_JUL = ACCUM_JUN + 30;
const ACCUM_AUG = ACCUM_JUL + 31;
const ACCUM_SEP = ACCUM_AUG + 31;
const ACCUM_OCT = ACCUM_SEP + 30;
const ACCUM_NOV = ACCUM_OCT + 31;
const ACCUM_DEC = ACCUM_NOV + 30;

export const ACCUM_DAYS_FOR_MONTH = [ACCUM_JAN, ACCUM_FEB, ACCUM_MAR, ACCUM_APR, ACCUM_MAY, ACCUM_JUN,
  ACCUM_JUL, ACCUM_AUG, ACCUM_SEP, ACCUM_OCT, ACCUM_NOV, ACCUM_DEC];

export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInMonth(year: number, month: number): number {
  if (month === 1) return isLeapYear(year) ? 29 : 28;
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
}

/** DateAtStartOfYear */
export function dateAtStartOfYear(year: number): number {
  const leap = year === 0 ? 0 : (Math.trunc((year - 1) / 4) - Math.trunc((year - 1) / 100) + Math.trunc((year - 1) / 400) + 1);
  return 365 * year + leap;
}

/** CalendarConvertYMDToDate: month 0..11, day 1..31. */
export function convertYMDToDate(year: number, month: number, day: number): number {
  let days = ACCUM_DAYS_FOR_MONTH[month] + day - 1;
  if (!isLeapYear(year) && days >= ACCUM_MAR) days--;
  return dateAtStartOfYear(year) + days;
}

export interface YearMonthDay { year: number; month: number; day: number }

// _month_date_from_year_day: packed (month << 5) | day for every day of a
// leap year. Building it in code gives the same table as the source.
const MONTH_DATE_FROM_YEAR_DAY: number[] = (() => {
  const out: number[] = [];
  for (let m = 0; m < 12; m++) for (let d = 1; d <= daysInMonth(2000, m); d++) out.push((m << 5) | d);
  return out;
})();

/** CalendarConvertDateToYMD */
export function convertDateToYMD(date: number): YearMonthDay {
  let year = 400 * Math.trunc(date / (DAYS_IN_YEAR * 400 + 97));
  let rem = date % (DAYS_IN_YEAR * 400 + 97);
  if (rem >= DAYS_IN_YEAR * 100 + 25) {
    year += 100;
    rem -= DAYS_IN_YEAR * 100 + 25;
    year += 100 * Math.trunc(rem / (DAYS_IN_YEAR * 100 + 24));
    rem = rem % (DAYS_IN_YEAR * 100 + 24);
  }
  if (!isLeapYear(year) && rem >= DAYS_IN_YEAR * 4) {
    year += 4;
    rem -= DAYS_IN_YEAR * 4;
  }
  year += 4 * Math.trunc(rem / (DAYS_IN_YEAR * 4 + 1));
  rem = rem % (DAYS_IN_YEAR * 4 + 1);
  while (rem >= (isLeapYear(year) ? DAYS_IN_LEAP_YEAR : DAYS_IN_YEAR)) {
    rem -= isLeapYear(year) ? DAYS_IN_LEAP_YEAR : DAYS_IN_YEAR;
    year++;
  }
  if (!isLeapYear(year) && rem >= ACCUM_MAR - 1) rem++;
  const x = MONTH_DATE_FROM_YEAR_DAY[rem];
  return { year, month: x >> 5, day: x & 0x1f };
}

/** The original's saved date for a game that starts in a given year. */
export function startDate(year: number = DEF_START_YEAR): number {
  return convertYMDToDate(year, 0, 1);
}

/** The 74-tick fractional day counter used by the game loop. */
export class GameCalendar {
  year: number;
  month = 0;
  day = 1;
  date: number;
  dateFract = 0;
  tickCounter = 0;

  constructor(year: number = DEF_START_YEAR) {
    this.year = year;
    this.date = convertYMDToDate(year, 0, 1);
  }

  /** Advance one game tick; returns true when a day passed. */
  tick(): boolean {
    this.tickCounter++;
    if (++this.dateFract < DAY_TICKS) return false;
    this.dateFract = 0;
    this.date++;
    const ymd = convertDateToYMD(this.date);
    this.year = ymd.year;
    this.month = ymd.month;
    this.day = ymd.day;
    return true;
  }
}
