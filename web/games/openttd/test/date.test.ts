// The calendar against the proleptic Gregorian calendar: OpenTTD counts days
// from 1 January of year 0, which is a leap year; the values below are the
// same dates as Python's datetime (date - 1 January 1) + 366.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DAY_TICKS, GameCalendar, convertDateToYMD, convertYMDToDate, daysInMonth, isLeapYear,
} from '../src/sim/date.ts';

test('leap years', () => {
  for (const y of [0, 4, 1996, 2000, 2024]) assert.equal(isLeapYear(y), true, String(y));
  for (const y of [1, 1900, 1999, 2001, 2100]) assert.equal(isLeapYear(y), false, String(y));
  assert.equal(daysInMonth(2000, 1), 29);
  assert.equal(daysInMonth(1900, 1), 28);
});

test('dates', () => {
  const cases: [number, number, number, number][] = [
    [1, 0, 1, 366],
    [1920, 0, 1, 701265],
    [1950, 0, 1, 712223],
    [1999, 11, 31, 730484],
    [2000, 1, 29, 730544],
    [2000, 2, 1, 730545],
    [2026, 10, 23, 740308],
  ];
  for (const [y, m, d, date] of cases) {
    assert.equal(convertYMDToDate(y, m, d), date, `${y}-${m + 1}-${d}`);
    assert.deepEqual(convertDateToYMD(date), { year: y, month: m, day: d });
  }
});

test('one day is 74 ticks', () => {
  const c = new GameCalendar(1950);
  assert.equal(c.date, 712223);
  for (let i = 1; i < DAY_TICKS; i++) assert.equal(c.tick(), false);
  assert.equal(c.dateFract, DAY_TICKS - 1);
  assert.equal(c.tick(), true);
  assert.equal(c.date, 712224);
  assert.equal(c.dateFract, 0);
  assert.deepEqual([c.year, c.month, c.day], [1950, 0, 2]);
});
