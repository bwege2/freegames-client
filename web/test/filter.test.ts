// The game list's search, filters, sort and URL state (web/src/site/filter.ts), on the real game.json files.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { GameManifest } from '../src/sdk/game.ts';
import { apply, counts, fold, formatState, isFiltered, matches, parseState, NO_FILTERS, type Listed, type ListState } from '../src/site/filter.ts';
import { liveText, parseLive, popularText, type Live } from '../src/site/live.ts';

const GAMES = join(import.meta.dirname, '..', 'games');
const all: Listed[] = readdirSync(GAMES, { withFileTypes: true }).filter((d) => d.isDirectory())
  .map((d) => ({
    manifest: JSON.parse(readFileSync(join(GAMES, d.name, 'game.json'), 'utf8')) as GameManifest,
    load: existsSync(join(GAMES, d.name, 'src', 'index.ts')) ? true : undefined,
  }))
  .filter((g) => g.manifest.listed !== false);
const ids = (gs: Listed[]) => gs.map((g) => g.manifest.id);
const state = (s: Partial<ListState>): ListState => ({ ...NO_FILTERS, ...s });

/** a made-up game for the cases the real list does not have */
function fake(id: string, o: Partial<GameManifest> & { year?: number; bytes?: number } = {}): Listed {
  const { year = 1990, bytes = 1000, ...m } = o;
  return {
    manifest: {
      id, title: id, tagline: '', summary: [''], players: '1', genres: ['Puzzle'], modes: ['single'], controls: [], screenshots: [],
      original: { author: 'A', year, platform: 'P', version: 'v', license: 'L', packageBytes: bytes, url: 'u' }, ...m,
    },
  };
}

test('fold: case and accents do not matter', () => {
  assert.equal(fold('Söderblom ÉCOLE Ångström'), 'soderblom ecole angstrom');
});

test('search: every word must appear in title, tagline, author, platform, summary or genres', () => {
  const g = fake('x', { title: 'Hunt the Wumpus', tagline: 'Twenty rooms', summary: ['Bats carry you away.'], genres: ['Survival horror'], original: { author: 'Gregory Yob', year: 1973, platform: 'BASIC', version: '', license: '', packageBytes: 1, url: '' } });
  for (const q of ['wumpus', 'WUMPUS', 'yob', 'basic', 'twenty', 'bats away', 'horror', '  hunt   wumpus ', '']) assert.ok(matches(g.manifest, q), q);
  for (const q of ['chess', 'wumpus chess']) assert.ok(!matches(g.manifest, q), q);
  assert.ok(matches(fake('y', { original: { author: 'Kristian Söderblom', year: 1, platform: '', version: '', license: '', packageBytes: 1, url: '' } }).manifest, 'soderblom'));
});

test('search on the real list: a title finds its game, nonsense finds nothing', () => {
  assert.deepEqual(ids(apply(all, state({ q: 'wumpus' }))), ['wumpus']);
  assert.deepEqual(ids(apply(all, state({ q: 'Colossal cave' }))), ['adventure']);
  assert.deepEqual(apply(all, state({ q: 'zzqx' })), []);
});

test('filters: alternatives within one filter, all filters together', () => {
  const gs = [
    fake('a', { genres: ['Puzzle'], year: 1973, modes: ['single'] }),
    fake('b', { genres: ['Arcade'], year: 1985, modes: ['single', 'online'] }),
    fake('c', { genres: ['Puzzle', 'Arcade'], year: 1989, modes: ['multi'] }),
    { ...fake('d', { genres: ['Programming'], year: 2005, modes: ['online'] }), load: true },
  ];
  assert.deepEqual(ids(apply(gs, state({ genres: ['Puzzle'] }))), ['a', 'c']);
  assert.deepEqual(ids(apply(gs, state({ genres: ['Puzzle', 'Programming'] }))), ['a', 'c', 'd']);
  assert.deepEqual(ids(apply(gs, state({ decades: [1980] }))), ['b', 'c']);
  assert.deepEqual(ids(apply(gs, state({ genres: ['Arcade'], decades: [1980], modes: ['online'] }))), ['b']);
  assert.deepEqual(ids(apply(gs, state({ playable: true }))), ['d']);
  assert.deepEqual(ids(apply(gs, state({ modes: ['online', 'multi'] }))), ['b', 'c', 'd']);
});

test('counts: each filter counts what it would show with the others applied, only values that exist', () => {
  const gs = [
    fake('a', { genres: ['Puzzle'], year: 1973 }),
    fake('b', { genres: ['Arcade'], year: 1985 }),
    fake('c', { genres: ['Puzzle', 'Arcade'], year: 1989 }),
  ];
  const c = counts(gs, state({ decades: [1980] }));
  assert.deepEqual([...c.genres], [['Arcade', 2], ['Puzzle', 1]], 'genres within the 1980s, vocabulary order');
  assert.deepEqual([...c.decades], [[1970, 1], [1980, 2]], 'decades ignore their own choice');
  assert.equal(c.playable, 0);
  assert.ok(!c.genres.has('Roguelike'), 'a genre no game has is not offered');
});

test('counts on the real list add up', () => {
  const c = counts(all, NO_FILTERS);
  assert.equal([...c.decades.values()].reduce((a, b) => a + b, 0), all.length, 'every game is in one decade');
  assert.equal(c.playable, all.filter((g) => g.load).length);
  for (const [g, n] of c.genres) assert.equal(n, apply(all, state({ genres: [g] })).length, g);
});

test('sort: title, year, newest added (not live yet last), download size', () => {
  const gs = [
    fake('Moria', { year: 1983, bytes: 400, added: undefined }),
    fake('Biniax', { year: 2005, bytes: 54, added: '2026-10-25' }),
    fake('Adventure', { year: 1977, bytes: 513, added: '2026-11-02' }),
    fake('Wumpus', { year: 1973, bytes: 6, added: '2026-10-25' }),
  ];
  assert.deepEqual(ids(apply(gs, state({}))), ['Adventure', 'Biniax', 'Moria', 'Wumpus']);
  assert.deepEqual(ids(apply(gs, state({ sort: 'year' }))), ['Wumpus', 'Adventure', 'Moria', 'Biniax']);
  assert.deepEqual(ids(apply(gs, state({ sort: 'added' }))), ['Adventure', 'Biniax', 'Wumpus', 'Moria']);
  assert.deepEqual(ids(apply(gs, state({ sort: 'size' }))), ['Wumpus', 'Biniax', 'Moria', 'Adventure']);
});

test('URL: the state goes into the query and comes back the same', () => {
  const s = state({ q: 'cave ö&?', genres: ['Survival horror', 'Puzzle'], decades: [1980, 1970], modes: ['online'], playable: true, playing: 2, sort: 'year' });
  const q = formatState(s);
  assert.equal(q, 'q=cave+%C3%B6%26%3F&genre=survival-horror,puzzle&year=1970s,1980s&players=online&playable=1&playing=2&sort=year');
  assert.deepEqual(parseState(q), { ...s, decades: [1970, 1980] });
  assert.equal(formatState(NO_FILTERS), '', 'the plain list has no query');
  assert.deepEqual(parseState(''), NO_FILTERS);
});

test('URL: unknown or malformed values are ignored', () => {
  assert.deepEqual(parseState('genre=puzzle,nope&year=1985s,19x0s,1980s&players=team,multi&sort=random&playable=yes&x=1'),
    state({ genres: ['Puzzle'], decades: [1980], modes: ['multi'] }));
  for (const p of ['3', '0', '-1', 'x', '1.5']) assert.equal(parseState(`playing=${p}`).playing, 0, `playing=${p}`);
  assert.equal(parseState('playing=5&sort=playing').playing, 5);
  assert.equal(parseState('sort=playing').sort, 'playing');
});

test('isFiltered: the sort alone does not count as a filter', () => {
  assert.equal(isFiltered(state({ sort: 'size' })), false);
  assert.equal(isFiltered(state({ q: ' ' })), false);
  assert.equal(isFiltered(state({ q: 'a' })), true);
  assert.equal(isFiltered(state({ playable: true })), true);
  assert.equal(isFiltered(state({ playing: 1 })), true);
});

// ---- the players now (live.ts, from /stats)

const live = (o: Record<string, [number, number, number?]>): Live =>
  new Map(Object.entries(o).map(([id, [playing, online, plays30 = 0]]) => [id, { playing, online, plays30 }]));

test('players now: /stats gives each game its players, anything else gives nothing', () => {
  const l = parseLive({ seconds: 3, ws: {}, games: { wumpus: { playing: 2, online: 0, plays30: 41 }, xpilot: { playing: 3, online: 3 }, odd: { playing: -1, online: 'x', plays30: 1.5 } }, rooms: [] });
  assert.deepEqual(l && [...l], [['wumpus', { playing: 2, online: 0, plays30: 41 }], ['xpilot', { playing: 3, online: 3, plays30: 0 }], ['odd', { playing: 0, online: 0, plays30: 0 }]]);
  for (const b of [null, 'x', {}, { games: 3 }, { seconds: 1, rooms: [] }]) assert.equal(parseLive(b), null, JSON.stringify(b));
  assert.equal(liveText({ playing: 0, online: 0, plays30: 9 }), '');
  assert.equal(liveText({ playing: 1, online: 0, plays30: 0 }), '1 playing');
  assert.equal(liveText({ playing: 3, online: 2, plays30: 0 }), '3 playing · 2 online');
  assert.equal(popularText({ playing: 0, online: 0, plays30: 0 }), '');
  assert.equal(popularText({ playing: 0, online: 0, plays30: 1 }), '1 play in the last 30 days');
  assert.equal(popularText({ playing: 0, online: 0, plays30: 41 }), '41 plays in the last 30 days');
});

test('players now: filter by at least n players, sort by most players, count each step', () => {
  const gs = [fake('a'), fake('b'), fake('c'), fake('d')];
  const l = live({ a: [1, 0], b: [5, 0], c: [2, 2], z: [9, 9] });
  assert.deepEqual(ids(apply(gs, state({ playing: 1 }), l)), ['a', 'b', 'c']);
  assert.deepEqual(ids(apply(gs, state({ playing: 2 }), l)), ['b', 'c']);
  assert.deepEqual(ids(apply(gs, state({ playing: 5 }), l)), ['b']);
  assert.deepEqual(ids(apply(gs, state({ playing: 1 }), null)), [], 'nothing known: nobody plays');
  // most players first; equal players: more of them online first; then by title
  const l2 = live({ a: [2, 0], b: [5, 0], c: [2, 2] });
  assert.deepEqual(ids(apply(gs, state({ sort: 'playing' }), l2)), ['b', 'c', 'a', 'd']);
  assert.deepEqual(ids(apply(gs, state({ sort: 'playing' }), null)), ['a', 'b', 'c', 'd'], 'nothing known: by title');
  // the steps count with the other filters, not with their own choice
  const c = counts(gs, state({ playing: 5 }), l);
  assert.deepEqual([...c.playing], [[1, 3], [2, 2], [5, 1]]);
  assert.deepEqual([...counts(gs, state({ q: 'c' }), l).playing], [[1, 1], [2, 1], [5, 0]]);
  assert.deepEqual([...counts(gs, state({}), null).playing], [[1, 0], [2, 0], [5, 0]]);
  assert.equal(counts(gs, state({ playing: 5 }), l).modes.get('single'), 1, 'other filters count with it');
});

test('popularity: most plays in the last 30 days first, then most players now, then the title', () => {
  const gs = [fake('a'), fake('b'), fake('c'), fake('d')];
  assert.deepEqual(ids(apply(gs, state({ sort: 'popular' }), live({ a: [0, 0, 5], b: [0, 0, 40], c: [2, 0, 5], d: [0, 0, 0] }))), ['b', 'c', 'a', 'd']);
  assert.deepEqual(ids(apply(gs, state({ sort: 'popular' }), null)), ['a', 'b', 'c', 'd'], 'nothing known: by title');
  assert.equal(parseState('sort=popular').sort, 'popular');
  assert.equal(formatState(state({ sort: 'popular' })), 'sort=popular');
});
