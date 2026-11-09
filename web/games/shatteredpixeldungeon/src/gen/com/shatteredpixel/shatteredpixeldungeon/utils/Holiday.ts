// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/utils/Holiday.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2026 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */
import { $J, Calendar, JEnum } from '../../../../../jre/index.ts';

export class Holiday extends JEnum {
  static cached: Holiday = null;
  static NONE: Holiday = null;
  static LUNAR_NEW_YEAR: Holiday = null;
  static APRIL_FOOLS: Holiday = null;
  static EASTER: Holiday = null;
  static PRIDE: Holiday = null;
  static SHATTEREDPD_BIRTHDAY: Holiday = null;
  static HALLOWEEN: Holiday = null;
  static PD_BIRTHDAY: Holiday = null;
  static WINTER_HOLIDAYS: Holiday = null;
  static NEW_YEARS: Holiday = null;
  static $VALUES: Holiday[] = null;
  _Holiday($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static clearCachedHoliday(): void {
    Holiday.cached = null;
  }
  static getCurrentHoliday(): Holiday {
    if (Holiday.cached == null) {
      Holiday.cached = Holiday.getHolidayForDate(Calendar.getInstance());
    }
    return Holiday.cached;
  }
  static getHolidayForDate(cal: GregorianCalendar): Holiday {
    if (Holiday.isLunarNewYear(cal.get(1), cal.get(6))) {
      return Holiday.LUNAR_NEW_YEAR;
    }
    if (cal.get(2) === 3 && cal.get(5) === 1) {
      return Holiday.APRIL_FOOLS;
    }
    if (Holiday.isEaster(cal.get(1), cal.get(6), cal.getActualMaximum(6) === 366)) {
      return Holiday.EASTER;
    }
    if (cal.get(2) === 5 && cal.get(5) >= 24) {
      return Holiday.PRIDE;
    }
    if (cal.get(2) === 7 && cal.get(5) <= 7) {
      return Holiday.SHATTEREDPD_BIRTHDAY;
    }
    if (cal.get(2) === 9 && cal.get(5) >= 24) {
      return Holiday.HALLOWEEN;
    }
    if (cal.get(2) === 11 && cal.get(5) <= 7) {
      return Holiday.PD_BIRTHDAY;
    }
    if (cal.get(2) === 11 && cal.get(5) >= 15 && cal.get(5) <= 26) {
      return Holiday.WINTER_HOLIDAYS;
    }
    if ((cal.get(2) === 11 && cal.get(5) >= 27) || (cal.get(2) === 0 && cal.get(5) <= 2)) {
      return Holiday.NEW_YEARS;
    }
    return Holiday.NONE;
  }
  static isLunarNewYear(year: number, dayOfYear: number): boolean {
    let lunarNewYearDayOfYear: number;
    switch (year) {
      default:
        lunarNewYearDayOfYear = (31 + 5) | 0;
        break;
      case 2020:
        lunarNewYearDayOfYear = 25;
        break;
      case 2021:
        lunarNewYearDayOfYear = (31 + 12) | 0;
        break;
      case 2022:
        lunarNewYearDayOfYear = (31 + 1) | 0;
        break;
      case 2023:
        lunarNewYearDayOfYear = 22;
        break;
      case 2024:
        lunarNewYearDayOfYear = (31 + 10) | 0;
        break;
      case 2025:
        lunarNewYearDayOfYear = 29;
        break;
      case 2026:
        lunarNewYearDayOfYear = (31 + 17) | 0;
        break;
      case 2027:
        lunarNewYearDayOfYear = (31 + 6) | 0;
        break;
      case 2028:
        lunarNewYearDayOfYear = 26;
        break;
      case 2029:
        lunarNewYearDayOfYear = (31 + 13) | 0;
        break;
      case 2030:
        lunarNewYearDayOfYear = (31 + 3) | 0;
        break;
      case 2031:
        lunarNewYearDayOfYear = 23;
        break;
      case 2032:
        lunarNewYearDayOfYear = (31 + 11) | 0;
        break;
      case 2033:
        lunarNewYearDayOfYear = 31;
        break;
      case 2034:
        lunarNewYearDayOfYear = (31 + 19) | 0;
        break;
      case 2035:
        lunarNewYearDayOfYear = (31 + 8) | 0;
        break;
      case 2036:
        lunarNewYearDayOfYear = 28;
        break;
      case 2037:
        lunarNewYearDayOfYear = (31 + 15) | 0;
        break;
      case 2038:
        lunarNewYearDayOfYear = (31 + 4) | 0;
        break;
      case 2039:
        lunarNewYearDayOfYear = 24;
        break;
      case 2040:
        lunarNewYearDayOfYear = (31 + 12) | 0;
        break;
      case 2041:
        lunarNewYearDayOfYear = (31 + 1) | 0;
        break;
      case 2042:
        lunarNewYearDayOfYear = 22;
        break;
      case 2043:
        lunarNewYearDayOfYear = (31 + 10) | 0;
        break;
      case 2044:
        lunarNewYearDayOfYear = 30;
        break;
      case 2045:
        lunarNewYearDayOfYear = (31 + 17) | 0;
        break;
      case 2046:
        lunarNewYearDayOfYear = (31 + 6) | 0;
        break;
      case 2047:
        lunarNewYearDayOfYear = 26;
        break;
      case 2048:
        lunarNewYearDayOfYear = (31 + 14) | 0;
        break;
      case 2049:
        lunarNewYearDayOfYear = (31 + 2) | 0;
        break;
      case 2050:
        lunarNewYearDayOfYear = 23;
        break;
      case 2051:
        lunarNewYearDayOfYear = (31 + 11) | 0;
        break;
      case 2052:
        lunarNewYearDayOfYear = (31 + 1) | 0;
        break;
      case 2053:
        lunarNewYearDayOfYear = (31 + 19) | 0;
        break;
      case 2054:
        lunarNewYearDayOfYear = (31 + 8) | 0;
        break;
      case 2055:
        lunarNewYearDayOfYear = 28;
        break;
      case 2056:
        lunarNewYearDayOfYear = (31 + 15) | 0;
        break;
      case 2057:
        lunarNewYearDayOfYear = (31 + 4) | 0;
        break;
      case 2058:
        lunarNewYearDayOfYear = 24;
        break;
      case 2059:
        lunarNewYearDayOfYear = (31 + 12) | 0;
        break;
      case 2060:
        lunarNewYearDayOfYear = (31 + 2) | 0;
        break;
      case 2061:
        lunarNewYearDayOfYear = 21;
        break;
      case 2062:
        lunarNewYearDayOfYear = (31 + 9) | 0;
        break;
      case 2063:
        lunarNewYearDayOfYear = 29;
        break;
      case 2064:
        lunarNewYearDayOfYear = (31 + 17) | 0;
        break;
      case 2065:
        lunarNewYearDayOfYear = (31 + 5) | 0;
        break;
      case 2066:
        lunarNewYearDayOfYear = 26;
        break;
      case 2067:
        lunarNewYearDayOfYear = (31 + 14) | 0;
        break;
      case 2068:
        lunarNewYearDayOfYear = (31 + 3) | 0;
        break;
      case 2069:
        lunarNewYearDayOfYear = 23;
        break;
      case 2070:
        lunarNewYearDayOfYear = (31 + 11) | 0;
        break;
      case 2071:
        lunarNewYearDayOfYear = 31;
        break;
      case 2072:
        lunarNewYearDayOfYear = (31 + 19) | 0;
        break;
      case 2073:
        lunarNewYearDayOfYear = (31 + 7) | 0;
        break;
      case 2074:
        lunarNewYearDayOfYear = 27;
        break;
      case 2075:
        lunarNewYearDayOfYear = (31 + 15) | 0;
        break;
      case 2076:
        lunarNewYearDayOfYear = (31 + 5) | 0;
        break;
      case 2077:
        lunarNewYearDayOfYear = 24;
        break;
      case 2078:
        lunarNewYearDayOfYear = (31 + 12) | 0;
        break;
      case 2079:
        lunarNewYearDayOfYear = (31 + 2) | 0;
        break;
      case 2080:
        lunarNewYearDayOfYear = 22;
        break;
      case 2081:
        lunarNewYearDayOfYear = (31 + 9) | 0;
        break;
      case 2082:
        lunarNewYearDayOfYear = 29;
        break;
      case 2083:
        lunarNewYearDayOfYear = (31 + 17) | 0;
        break;
      case 2084:
        lunarNewYearDayOfYear = (31 + 6) | 0;
        break;
      case 2085:
        lunarNewYearDayOfYear = 26;
        break;
      case 2086:
        lunarNewYearDayOfYear = (31 + 14) | 0;
        break;
      case 2087:
        lunarNewYearDayOfYear = (31 + 3) | 0;
        break;
      case 2088:
        lunarNewYearDayOfYear = 24;
        break;
      case 2089:
        lunarNewYearDayOfYear = (31 + 10) | 0;
        break;
      case 2090:
        lunarNewYearDayOfYear = 30;
        break;
      case 2091:
        lunarNewYearDayOfYear = (31 + 18) | 0;
        break;
      case 2092:
        lunarNewYearDayOfYear = (31 + 7) | 0;
        break;
      case 2093:
        lunarNewYearDayOfYear = 27;
        break;
      case 2094:
        lunarNewYearDayOfYear = (31 + 15) | 0;
        break;
      case 2095:
        lunarNewYearDayOfYear = (31 + 5) | 0;
        break;
      case 2096:
        lunarNewYearDayOfYear = 25;
        break;
      case 2097:
        lunarNewYearDayOfYear = (31 + 12) | 0;
        break;
      case 2098:
        lunarNewYearDayOfYear = (31 + 1) | 0;
        break;
      case 2099:
        lunarNewYearDayOfYear = 21;
        break;
      case 2100:
        lunarNewYearDayOfYear = (31 + 9) | 0;
        break;
    }
    return dayOfYear >= ((lunarNewYearDayOfYear - 4) | 0) && dayOfYear <= ((lunarNewYearDayOfYear + 2) | 0);
  }
  static isEaster(year: number, dayOfYear: number, isLeapYear: boolean): boolean {
    if (dayOfYear < 59 || dayOfYear > 121) {
      return false;
    }
    let a = year % 19;
    let b = $J.idiv(year, 100);
    let c = year % 100;
    let d = $J.idiv(b, 4);
    let e = b % 4;
    let f = $J.idiv(((b + 8) | 0), 25);
    let g = $J.idiv(((b - f + 1) | 0), 3);
    let h = ((Math.imul(a, 19) + b - d - g + 15) | 0) % 30;
    let i = $J.idiv(c, 4);
    let k = c % 4;
    let l = ((32 + Math.imul(2, e) + Math.imul(2, i) - h - k) | 0) % 7;
    let m = $J.idiv(((a + Math.imul(h, 11) + Math.imul(l, 22)) | 0), 451);
    let n = $J.idiv(((h + l - Math.imul(m, 7) + 114) | 0), 31);
    let o = ((h + l - Math.imul(m, 7) + 114) | 0) % 31;
    let easterDayOfYear = 0;
    if (n === 3) {
      easterDayOfYear = (easterDayOfYear + 59) | 0;
    } else {
      easterDayOfYear = (easterDayOfYear + 90) | 0;
    }
    if (isLeapYear) {
      easterDayOfYear = (easterDayOfYear + 1) | 0;
    }
    easterDayOfYear = (easterDayOfYear + (o + 1)) | 0;
    return dayOfYear >= ((easterDayOfYear - 4) | 0) && dayOfYear <= ((easterDayOfYear + 2) | 0);
  }
  static values(): Holiday[] { return Holiday.$VALUES.slice(); }
  static valueOf(name: string): Holiday { return $J.enumValueOf(Holiday, name); }
  static $clinit() {
    Holiday.NONE = new Holiday()._Holiday('NONE', 0);
    Holiday.LUNAR_NEW_YEAR = new Holiday()._Holiday('LUNAR_NEW_YEAR', 1);
    Holiday.APRIL_FOOLS = new Holiday()._Holiday('APRIL_FOOLS', 2);
    Holiday.EASTER = new Holiday()._Holiday('EASTER', 3);
    Holiday.PRIDE = new Holiday()._Holiday('PRIDE', 4);
    Holiday.SHATTEREDPD_BIRTHDAY = new Holiday()._Holiday('SHATTEREDPD_BIRTHDAY', 5);
    Holiday.HALLOWEEN = new Holiday()._Holiday('HALLOWEEN', 6);
    Holiday.PD_BIRTHDAY = new Holiday()._Holiday('PD_BIRTHDAY', 7);
    Holiday.WINTER_HOLIDAYS = new Holiday()._Holiday('WINTER_HOLIDAYS', 8);
    Holiday.NEW_YEARS = new Holiday()._Holiday('NEW_YEARS', 9);
    Holiday.$VALUES = [Holiday.NONE, Holiday.LUNAR_NEW_YEAR, Holiday.APRIL_FOOLS, Holiday.EASTER, Holiday.PRIDE, Holiday.SHATTEREDPD_BIRTHDAY, Holiday.HALLOWEEN, Holiday.PD_BIRTHDAY, Holiday.WINTER_HOLIDAYS, Holiday.NEW_YEARS];
  }
}

$J.define(Holiday, 'com.shatteredpixel.shatteredpixeldungeon.utils.Holiday', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Holiday' }, clinit: true, lazy: ['$VALUES', 'NONE', 'LUNAR_NEW_YEAR', 'APRIL_FOOLS', 'EASTER', 'PRIDE', 'SHATTEREDPD_BIRTHDAY', 'HALLOWEEN', 'PD_BIRTHDAY', 'WINTER_HOLIDAYS', 'NEW_YEARS', 'cached'] });
