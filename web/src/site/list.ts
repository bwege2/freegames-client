// The start page: every listed game as a card, with one row to search, filter and sort them. The
// choices live in the URL (#/?q=…), so Back, reload and shared links keep them. The cards show each
// game's players now, which the list also filters and sorts by (live.ts).
import { games, type Game } from './catalog.ts';
import { el, legalFooter } from './dom.ts';
import { thumb } from './thumb.ts';
import {
  apply, counts, decadeLabel, formatState, isFiltered, parseState, MODE_LABELS, NO_FILTERS, PLAYING_STEPS, SORT_LABELS, SORTS,
  type ListState, type SortKey,
} from './filter.ts';
import { liveText, onLive, playersOf, type Live } from './live.ts';

const listed = games.filter((g) => g.manifest.listed !== false);

/** the list's URL with the choices last made there (the game page's way back) */
let lastQuery = '';
export const listHref = () => `#/${lastQuery ? `?${lastQuery}` : ''}`;
/** the filters panel: open on wide screens, a button away on phones; kept while the player browses */
let filtersOpen: boolean | null = null;

interface Card {
  el: HTMLElement;
  /** the players now ("2 playing · 1 online"), empty while nobody plays */
  live: HTMLElement;
}

function card(g: Game): Card {
  const m = g.manifest;
  const live = el('span', { className: 'card-live' });
  return {
    el: el('a', { className: 'card', href: `#/${m.id}` },
      thumb(g),
      el('span', { className: 'card-text' },
        el('strong', { textContent: m.title }),
        el('span', { className: 'card-tagline', textContent: m.tagline }),
        el('span', { className: 'card-meta', textContent: `${m.original.year} · ${m.genres.join(', ')}` }),
        live,
        !g.load && el('span', { className: 'badge', textContent: 'Coming soon' }))),
    live,
  };
}

/** The list; it listens for the players now until `signal` aborts (the route moved on). */
export function listView(query = '', signal: AbortSignal = new AbortController().signal): HTMLElement {
  let s: ListState = parseState(query);
  let live: Live | null = null;
  // one card per game, kept: a card keeps its focus while the players now change
  const cardOf = new Map(listed.map((g) => [g.manifest.id, card(g)]));

  const search = el('input', { type: 'search', className: 'search', value: s.q, placeholder: 'Search games', autocomplete: 'off', spellcheck: false });
  search.setAttribute('aria-label', 'Search games');
  const sort = el('select', { className: 'sort-select' }, ...SORTS.map((k) => el('option', { value: k, textContent: SORT_LABELS[k], selected: k === s.sort })));
  const sortLabel = el('label', { className: 'sort' }, el('span', { textContent: 'Sort' }), sort);
  const clear = el('button', { type: 'button', className: 'clear', textContent: 'Clear' });
  const chips = el('div', { className: 'chips', id: 'list-filters' });
  const filters = el('button', { type: 'button', className: 'filters-toggle' });
  filters.setAttribute('aria-controls', chips.id);
  filtersOpen ??= matchMedia('(min-width: 44rem)').matches;
  const showFilters = () => {
    chips.hidden = !filtersOpen;
    filters.setAttribute('aria-expanded', String(filtersOpen));
  };
  filters.addEventListener('click', () => {
    filtersOpen = !filtersOpen;
    showFilters();
  });
  showFilters();
  const status = el('p', { className: 'result-count' });
  status.setAttribute('role', 'status');
  const cards = el('div', { className: 'cards' });

  const set = (next: Partial<ListState>) => {
    s = { ...s, ...next };
    render();
  };
  const toggle = <T>(xs: T[], x: T) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);

  function chip(key: string, label: string, n: number, on: boolean, flip: () => void, always = false): HTMLElement | null {
    if (!on && n === 0 && !always) return null;
    const b = el('button', { type: 'button', className: 'chip', dataset: { key } },
      el('span', { textContent: label }), el('span', { className: 'chip-count', textContent: String(n) }));
    b.setAttribute('aria-pressed', String(on));
    b.addEventListener('click', flip);
    return b;
  }

  function group(name: string, kids: (HTMLElement | null)[]): HTMLElement | null {
    const shown = kids.filter((k): k is HTMLElement => !!k);
    if (!shown.length) return null;
    const g = el('div', { className: 'chip-group' }, el('span', { className: 'chip-group-name', textContent: name }), ...shown);
    g.setAttribute('role', 'group');
    g.setAttribute('aria-label', name);
    return g;
  }

  function render(): void {
    lastQuery = formatState(s);
    const url = listHref();
    if (location.hash !== url && !(url === '#/' && (location.hash === '' || location.hash === '#'))) history.replaceState(history.state, '', url);

    const c = counts(listed, s, live);
    // rebuilt with the counts; the focused chip keeps the focus
    const focused = (document.activeElement as HTMLElement | null)?.dataset?.key;
    chips.replaceChildren(...[
      group('Show', [chip('playable', 'Playable now', c.playable, s.playable, () => set({ playable: !s.playable }))]),
      // at least n players now; one choice at a time ("1+" stays, so the filter is there when nobody plays)
      group('Playing now', PLAYING_STEPS.map((n) => chip(`playing:${n}`, `${n}+`, c.playing.get(n) ?? 0, s.playing === n,
        () => set({ playing: s.playing === n ? 0 : n }), n === 1))),
      group('Players', [...c.modes].map(([mo, n]) => chip(`mode:${mo}`, MODE_LABELS[mo], n, s.modes.includes(mo), () => set({ modes: toggle(s.modes, mo) })))),
      group('Year', [...c.decades].map(([d, n]) => chip(`year:${d}`, decadeLabel(d), n, s.decades.includes(d), () => set({ decades: toggle(s.decades, d) })))),
      group('Genre', [...c.genres].map(([g, n]) => chip(`genre:${g}`, g, n, s.genres.includes(g), () => set({ genres: toggle(s.genres, g) })))),
    ].filter((g): g is HTMLElement => !!g));
    if (focused) (chips.querySelector(`[data-key="${CSS.escape(focused)}"]`) as HTMLElement | null)?.focus();

    const active = s.genres.length + s.decades.length + s.modes.length + (s.playable ? 1 : 0) + (s.playing ? 1 : 0);
    filters.textContent = active ? `Filters · ${active}` : 'Filters';
    const shown = apply(listed, s, live);
    for (const g of listed) {
      const text = liveText(playersOf(live, g.manifest.id));
      const c = cardOf.get(g.manifest.id)!;
      if (c.live.textContent !== text) c.live.textContent = text;
    }
    const filtered = isFiltered(s);
    clear.hidden = !filtered && s.sort === 'title';
    // set only when it changes: it is a live region, and the players now re-render the list every few seconds
    const count = filtered ? `${shown.length} of ${listed.length} games` : `${listed.length} games`;
    if (status.textContent !== count) status.textContent = count;
    if (shown.length) {
      const els = shown.map((g) => cardOf.get(g.manifest.id)!.el);
      // the same cards in the same order: left alone (a focused card stays focused)
      if (els.length !== cards.children.length || els.some((e, i) => cards.children[i] !== e)) cards.replaceChildren(...els);
    } else {
      const reset = el('button', { type: 'button', className: 'play reset', textContent: 'Show all games' });
      reset.addEventListener('click', () => { search.value = ''; set({ ...NO_FILTERS, sort: s.sort }); search.focus(); });
      cards.replaceChildren(el('div', { className: 'empty' }, el('p', { textContent: 'No games match.' }), reset));
    }
  }

  search.addEventListener('input', () => set({ q: search.value }));
  search.addEventListener('keydown', (e) => {
    // Esc in an empty field leaves it; with text the browser clears it (and fires input)
    if (e.key === 'Escape' && !search.value) search.blur();
  });
  sort.addEventListener('change', () => set({ sort: sort.value as SortKey }));
  clear.addEventListener('click', () => {
    search.value = '';
    sort.value = 'title';
    set(NO_FILTERS);
    search.focus();
  });

  render();
  onLive((l) => {
    live = l;
    render();
  }, signal);
  return el('main', { className: 'list' },
    el('header', { className: 'site-head' },
      el('h1', { textContent: 'freegames' }),
      el('p', { textContent: 'A free games collection, browser-ported to run in 2 clicks.' })),
    el('div', { className: 'toolbar' }, el('div', { className: 'toolbar-row' }, search, filters, sortLabel, clear), chips, status),
    cards,
    legalFooter());
}
