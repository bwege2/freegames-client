// Endless Sky's Date class (source/Date.cpp): a day, month and year, with the
// same day-since-epoch arithmetic the stellar orbits use.

const MDAYS = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December'];

export class GameDate {
  day: number;
  month: number;
  year: number;

  constructor(day = 1, month = 1, year = 3013) {
    this.day = day;
    this.month = month;
    this.year = year;
  }

  static fromSave(day: number, month: number, year: number): GameDate {
    return new GameDate(day, month, year);
  }

  clone(): GameDate {
    return new GameDate(this.day, this.month, this.year);
  }

  /** Date::DaysSinceEpoch. */
  daysSinceEpoch(): number {
    let days = this.day;
    let month = this.month;
    let year = this.year;
    days += MDAYS[month - 1];
    if (month > 2 && !(year % 4) && ((year % 100) || !(year % 400))) ++days;
    --year;
    days += 146097 * Math.floor(year / 400);
    year %= 400;
    days += 36524 * Math.floor(year / 100);
    year %= 100;
    days += 1461 * Math.floor(year / 4);
    year %= 4;
    days += 365 * year;
    return days;
  }

  /** Date::operator++. */
  next(): void {
    const leap = (!(this.year % 4) ? 1 : 0) - (!(this.year % 100) ? 1 : 0) + (!(this.year % 400) ? 1 : 0);
    const days = [31, 28 + leap, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    ++this.day;
    if (this.day > days[this.month - 1]) {
      this.day = 1;
      ++this.month;
      if (this.month > 12) {
        this.month = 1;
        ++this.year;
      }
    }
  }

  toString(): string {
    const weekdays = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    return `${weekdays[this.weekday()]}, ${this.day} ${MONTHS[this.month - 1]} ${this.year}`;
  }

  short(): string {
    return `${this.day} ${MONTHS[this.month - 1]} ${this.year}`;
  }

  long(): string {
    const suffix = this.day % 10 === 1 && this.day % 100 !== 11 ? 'st'
      : this.day % 10 === 2 && this.day % 100 !== 12 ? 'nd'
        : this.day % 10 === 3 && this.day % 100 !== 13 ? 'rd' : 'th';
    return `the ${this.day}${suffix} of ${MONTHS_LONG[this.month - 1]}`;
  }

  /** Zeller's congruence, as Date::WeekdayNumberOffset. */
  weekday(): number {
    let day = this.day;
    let month = this.month;
    let year = this.year;
    if (month < 3) {
      --year;
      month += 12;
    }
    return Math.abs(day + Math.floor((13 * (month + 1)) / 5) + year + Math.floor(year / 4)
      + 6 * Math.floor(year / 100) + Math.floor(year / 400)) % 7;
  }

  daysSinceYearStart(): number {
    const leap = (!(this.year % 4) ? 1 : 0) - (!(this.year % 100) ? 1 : 0) + (!(this.year % 400) ? 1 : 0);
    return MDAYS[this.month - 1] + this.day + (this.month > 2 ? leap : 0) - 1;
  }
}
