// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// The game list's search, filters and sort, and how they sit in the URL (#/?q=…&genre=…&sort=…).
// Plain functions over the catalog's games and the players now (live.ts), so node tests check them
// without a browser.
import { GENRES, PLAY_MODES, type GameManifest, type Genre, type PlayMode } from '../sdk/game.ts';
import { playersOf, type Live } from './live.ts';

/** what the list needs of a catalog entry */
export interface Listed {
  manifest: GameManifest;
  /** set when the game is ported (playable now) */
  load?: unknown;
}

export const SORTS = ['title', 'year', 'added', 'size', 'playing', 'popular'] as const;
export type SortKey = typeof SORTS[number];
export const SORT_LABELS: Record<SortKey, string> = {
  title: 'Title', year: 'Year', added: 'Newest added', size: 'Download size', playing: 'Most played now', popular: 'Most popular',
};
/** the "Playing now" filter's choices: at least this many players right now */
export const PLAYING_STEPS = [1, 2, 5] as const;

export const MODE_LABELS: Record<PlayMode, string> = { single: '1 player', multi: '2+ on one computer', online: 'Online' };

export interface ListState {
  /** the search text, as typed */
  q: string;
  genres: Genre[];
  /** decades by their first year: 1970, 1980, … */
  decades: number[];
  modes: PlayMode[];
  /** only games that can be played now */
  playable: boolean;
  /** only games with at least this many players now (one of PLAYING_STEPS), 0: any */
  playing: number;
  sort: SortKey;
}

export const NO_FILTERS: ListState = { q: '', genres: [], decades: [], modes: [], playable: false, playing: 0, sort: 'title' };

export const decadeOf = (year: number) => Math.floor(year / 10) * 10;
export const decadeLabel = (decade: number) => `${decade}s`;

/** "Survival horror" -> "survival-horror" (a genre in the URL) */
export const genreSlug = (g: Genre) => g.toLowerCase().replace(/\s+/g, '-');

/** lower case without accents: "Söderblom" -> "soderblom" */
export function fold(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/** The state in a list URL's query ("q=cave&genre=puzzle,adventure&year=1980s&players=online&playable=1&playing=2&sort=year"). */
export function parseState(query: string): ListState {
  const p = new URLSearchParams(query);
  const list = (k: string) => (p.get(k) ?? '').split(',').map((v) => v.trim()).filter(Boolean);
  const genres = list('genre').map((v) => GENRES.find((g) => genreSlug(g) === v)).filter((g): g is Genre => !!g);
  const decades = list('year').map((v) => /^(\d{4})s$/.exec(v)).filter((m) => m && Number(m[1]) % 10 === 0).map((m) => Number(m![1]));
  const modes = list('players').filter((v): v is PlayMode => (PLAY_MODES as readonly string[]).includes(v));
  const sort = (SORTS as readonly string[]).includes(p.get('sort') ?? '') ? (p.get('sort') as SortKey) : 'title';
  const playing = Number(p.get('playing'));
  return {
    q: p.get('q') ?? '', genres: unique(genres), decades: unique(decades).sort((a, b) => a - b), modes: unique(modes),
    playable: p.get('playable') === '1', playing: (PLAYING_STEPS as readonly number[]).includes(playing) ? playing : 0, sort,
  };
}

/** The query for a state; defaults are left out, so the plain list is "". */
export function formatState(s: ListState): string {
  const p = new URLSearchParams();
  if (s.q.trim()) p.set('q', s.q);
  if (s.genres.length) p.set('genre', s.genres.map(genreSlug).join(','));
  if (s.decades.length) p.set('year', [...s.decades].sort((a, b) => a - b).map(decadeLabel).join(','));
  if (s.modes.length) p.set('players', s.modes.join(','));
  if (s.playable) p.set('playable', '1');
  if (s.playing) p.set('playing', String(s.playing));
  if (s.sort !== 'title') p.set('sort', s.sort);
  return p.toString().replace(/%2C/g, ',');
}

export function isFiltered(s: ListState): boolean {
  return formatState({ ...s, sort: 'title' }) !== '';
}

function unique<T>(xs: T[]): T[] {
  return [...new Set(xs)];
}

const haystacks = new WeakMap<GameManifest, string>();

/** Every word of the search appears in the title, tagline, author, platform, summary or genres. */
export function matches(m: GameManifest, q: string): boolean {
  const words = fold(q).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  let hay = haystacks.get(m);
  if (hay === undefined) {
    hay = fold([m.title, m.tagline, m.original.author, m.original.platform, ...m.summary, ...(m.genres ?? [])].join('\n'));
    haystacks.set(m, hay);
  }
  return words.every((w) => hay!.includes(w));
}

type Facet = 'genres' | 'decades' | 'modes' | 'playable' | 'playing';

/** The search and every filter but `except` (a facet's counts ignore its own choice). */
function passes(g: Listed, s: ListState, live: Live | null, except?: Facet): boolean {
  const m = g.manifest;
  if (!matches(m, s.q)) return false;
  if (except !== 'genres' && s.genres.length && !s.genres.some((x) => m.genres?.includes(x))) return false;
  if (except !== 'decades' && s.decades.length && !s.decades.includes(decadeOf(m.original.year))) return false;
  if (except !== 'modes' && s.modes.length && !s.modes.some((x) => m.modes?.includes(x))) return false;
  if (except !== 'playable' && s.playable && !g.load) return false;
  if (except !== 'playing' && s.playing && playersOf(live, m.id).playing < s.playing) return false;
  return true;
}

const byTitle = (a: Listed, b: Listed) => a.manifest.title.localeCompare(b.manifest.title);
function compare(key: SortKey, live: Live | null): (a: Listed, b: Listed) => number {
  switch (key) {
    case 'title': return byTitle;
    case 'year': return (a, b) => a.manifest.original.year - b.manifest.original.year || byTitle(a, b);
    // newest first; games that are not live yet last
    case 'added': return (a, b) => (b.manifest.added ?? '').localeCompare(a.manifest.added ?? '') || byTitle(a, b);
    case 'size': return (a, b) => a.manifest.original.packageBytes - b.manifest.original.packageBytes || byTitle(a, b);
    // most players now first, then most of them online
    case 'playing': return (a, b) => {
      const x = playersOf(live, a.manifest.id), y = playersOf(live, b.manifest.id);
      return y.playing - x.playing || y.online - x.online || byTitle(a, b);
    };
    // most plays in the last 30 days first, then most players now
    case 'popular': return (a, b) => {
      const x = playersOf(live, a.manifest.id), y = playersOf(live, b.manifest.id);
      return y.plays30 - x.plays30 || y.playing - x.playing || byTitle(a, b);
    };
  }
}

/**
 * The games to show, in order. Within a filter the choices are alternatives (Puzzle or Arcade); filters
 * add up. `live`: the players now (null: not known, everybody counts as 0).
 */
export function apply<T extends Listed>(games: T[], s: ListState, live: Live | null = null): T[] {
  return games.filter((g) => passes(g, s, live)).sort(compare(s.sort, live));
}

export interface FacetCounts {
  genres: Map<Genre, number>;
  decades: Map<number, number>;
  modes: Map<PlayMode, number>;
  playable: number;
  /** each PLAYING_STEPS value: the games with at least that many players now */
  playing: Map<number, number>;
}

/**
 * How many games each filter value would show, given the search and the other filters. Only values
 * some game has appear (genres in vocabulary order, decades ascending).
 */
export function counts(games: Listed[], s: ListState, live: Live | null = null): FacetCounts {
  const genres = new Map<Genre, number>(), decades = new Map<number, number>(), modes = new Map<PlayMode, number>();
  for (const g of GENRES) if (games.some((x) => x.manifest.genres?.includes(g))) genres.set(g, 0);
  for (const d of unique(games.map((x) => decadeOf(x.manifest.original.year))).sort((a, b) => a - b)) decades.set(d, 0);
  for (const mo of PLAY_MODES) if (games.some((x) => x.manifest.modes?.includes(mo))) modes.set(mo, 0);
  const playing = new Map<number, number>(PLAYING_STEPS.map((n) => [n, 0]));
  let playable = 0;
  for (const g of games) {
    const m = g.manifest;
    if (passes(g, s, live, 'genres')) for (const x of m.genres ?? []) genres.set(x, (genres.get(x) ?? 0) + 1);
    if (passes(g, s, live, 'decades')) decades.set(decadeOf(m.original.year), (decades.get(decadeOf(m.original.year)) ?? 0) + 1);
    if (passes(g, s, live, 'modes')) for (const x of m.modes ?? []) modes.set(x, (modes.get(x) ?? 0) + 1);
    if (g.load && passes(g, s, live, 'playable')) playable++;
    if (passes(g, s, live, 'playing')) for (const n of PLAYING_STEPS) if (playersOf(live, m.id).playing >= n) playing.set(n, playing.get(n)! + 1);
  }
  return { genres, decades, modes, playable, playing };
}
