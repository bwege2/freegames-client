// Typing Warriors: GPL-3.0-or-later (LICENSE.md).
// The player's file "profile" in the account's storage (struct Profile of the game's schema): the
// chosen layouts and settings, the stars of the lessons, the ratings as the server last told them,
// the last rounds, the switching times. The ratings that count are the server's tables.
import { packGame, unpackGame, type GameContext } from '../../../src/sdk/index.ts';
import { Lang, Profile as ProfileMsg, type Mode } from './proto/typingwarriors.ts';
import { DEFAULT_LAYOUT, layoutById } from './layouts.ts';

export interface LessonDone { layout: string; lesson: number; stars: number; wpm: number; accuracy: number; runs: number }
export interface KnownRating { table: string; elo: number; games: number }
export interface Played { time: number; mode: Mode; layout: string; place: number; players: number; wpm: number; accuracy: number; eloBefore: number; eloAfter: number }
export interface SwitchStat { from: string; to: string; switches: number; totalMs: number; bestMs: number }

export interface Profile {
  layout: string;
  layout2: string;
  lang: 'en' | 'de';
  uiLang: '' | 'en' | 'de';
  helper: boolean;
  trustLayout: boolean;
  sound: boolean;
  lessons: LessonDone[];
  ratings: KnownRating[];
  history: Played[];
  switchStats: SwitchStat[];
}

export const HISTORY_MAX = 50;
const FILE = 'profile';

export function defaultProfile(): Profile {
  const german = (navigator.language || '').toLowerCase().startsWith('de');
  return {
    layout: german ? DEFAULT_LAYOUT : 'qwerty', layout2: german ? 'neo2' : 'dvorak', lang: german ? 'de' : 'en', uiLang: '',
    helper: true, trustLayout: false, sound: true, lessons: [], ratings: [], history: [], switchStats: [],
  };
}

export async function loadProfile(ctx: GameContext): Promise<Profile> {
  const p = defaultProfile();
  let file: Uint8Array | null = null;
  try { file = await ctx.storage.get(FILE); } catch { return p; } // offline: the defaults, nothing is kept
  if (!file) return p;
  try {
    const m = unpackGame(ProfileMsg, file);
    if (layoutById(m.layout)) p.layout = m.layout;
    if (layoutById(m.layout2)) p.layout2 = m.layout2;
    p.lang = m.lang === Lang.DE ? 'de' : 'en';
    p.uiLang = m.uiLang === 'de' || m.uiLang === 'en' ? m.uiLang : '';
    p.helper = m.helper;
    p.trustLayout = m.trustLayout;
    p.sound = m.sound;
    for (const x of m.lessons) p.lessons.push({ layout: x.layout, lesson: x.lesson, stars: x.stars, wpm: x.wpm, accuracy: x.accuracy, runs: x.runs });
    for (const x of m.ratings) p.ratings.push({ table: x.table, elo: x.elo, games: x.games });
    for (const x of m.history) {
      p.history.push({ time: x.time, mode: x.mode, layout: x.layout, place: x.place, players: x.players, wpm: x.wpm, accuracy: x.accuracy, eloBefore: x.eloBefore, eloAfter: x.eloAfter });
    }
    for (const x of m.switchStats) p.switchStats.push({ from: x.from, to: x.to, switches: x.switches, totalMs: x.totalMs, bestMs: x.bestMs });
  } catch { /* a broken file: the defaults */ }
  return p;
}

export function packProfile(p: Profile): Uint8Array {
  return packGame(ProfileMsg, (m) => {
    m.layout = p.layout;
    m.layout2 = p.layout2;
    m.lang = p.lang === 'de' ? Lang.DE : Lang.EN;
    m.uiLang = p.uiLang;
    m.helper = p.helper;
    m.trustLayout = p.trustLayout;
    m.sound = p.sound;
    const lessons = m._initLessons(p.lessons.length);
    p.lessons.forEach((x, i) => Object.assign(lessons.get(i), x));
    const ratings = m._initRatings(p.ratings.length);
    p.ratings.forEach((x, i) => Object.assign(ratings.get(i), x));
    const history = m._initHistory(Math.min(HISTORY_MAX, p.history.length));
    p.history.slice(0, HISTORY_MAX).forEach((x, i) => Object.assign(history.get(i), x));
    const stats = m._initSwitchStats(p.switchStats.length);
    p.switchStats.forEach((x, i) => Object.assign(stats.get(i), x));
  });
}

/** Saves in the background; a failed save (offline) is tried again with the next one. */
export function saveProfile(ctx: GameContext, p: Profile): void {
  void ctx.storage.put(FILE, packProfile(p)).catch(() => { /* offline */ });
}

export function lessonDone(p: Profile, layout: string, lesson: number): LessonDone | undefined {
  return p.lessons.find((x) => x.layout === layout && x.lesson === lesson);
}

export function recordLesson(p: Profile, layout: string, lesson: number, stars: number, wpm: number, accuracy: number): void {
  let d = lessonDone(p, layout, lesson);
  if (!d) p.lessons.push(d = { layout, lesson, stars: 0, wpm: 0, accuracy: 0, runs: 0 });
  d.runs = Math.min(65535, d.runs + 1);
  if (stars > d.stars || (stars === d.stars && wpm > d.wpm)) {
    d.stars = stars;
    d.wpm = Math.round(wpm);
    d.accuracy = Math.round(accuracy * 1000);
  }
}

export function ratingOf(p: Profile, table: string): KnownRating | undefined {
  return p.ratings.find((r) => r.table === table);
}

export function setRating(p: Profile, table: string, elo: number, games: number): void {
  const r = ratingOf(p, table);
  if (r) { r.elo = elo; r.games = games; } else p.ratings.push({ table, elo, games });
}

export function recordSwitch(p: Profile, from: string, to: string, ms: number): void {
  let s = p.switchStats.find((x) => x.from === from && x.to === to);
  if (!s) p.switchStats.push(s = { from, to, switches: 0, totalMs: 0, bestMs: 0 });
  s.switches++;
  s.totalMs = Math.min(0xffffffff, s.totalMs + Math.round(ms));
  s.bestMs = s.bestMs ? Math.min(s.bestMs, Math.round(ms)) : Math.round(ms);
}
