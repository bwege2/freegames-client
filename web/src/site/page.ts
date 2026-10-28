// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// A game's page: what it is, screenshots, the facts about the original, controls, one Play button, and
// how many play it right now.
import { size, type Game } from './catalog.ts';
import { el, legalFooter } from './dom.ts';
import { listHref } from './list.ts';
import { liveText, onLive, playersOf, popularText } from './live.ts';
import { thumb } from './thumb.ts';

/** The page; it listens for the players now until `signal` aborts (the route moved on). */
export function pageView(g: Game, onPlay: () => void, signal: AbortSignal = new AbortController().signal): HTMLElement {
  const m = g.manifest;
  const play = el('button', { className: 'play', type: 'button', textContent: g.load ? '▶  Play' : 'Coming soon', disabled: !g.load });
  if (g.load) play.addEventListener('click', onPlay);
  // the players now, once the server has told (nothing without a server)
  const live = el('p', { className: 'live-line', hidden: true });
  const popular = el('p', { className: 'popular-line', hidden: true });
  if (g.load) {
    onLive((l) => {
      live.hidden = !l;
      if (!l) return;
      const text = liveText(playersOf(l, m.id));
      live.textContent = text || 'Nobody is playing right now';
      live.classList.toggle('live-none', !text);
      popular.textContent = popularText(playersOf(l, m.id));
      popular.hidden = !popular.textContent;
    }, signal);
  }
  const shots = g.shots.length
    ? el('div', { className: 'shots' }, ...g.shots.map((s) => {
      const b = el('button', { className: 'shot', type: 'button', title: s.caption }, el('img', { src: s.url, alt: s.caption, loading: 'lazy' }));
      b.addEventListener('click', () => zoom(s.url, s.caption));
      return b;
    }))
    : el('div', { className: 'shots' }, el('span', { className: 'shot shot-none' }, thumb(g), el('span', { textContent: 'Screenshots arrive with the port.' })));
  const o = m.original;
  const facts: [string, Node | string][] = [
    ['Original', `${o.author}, ${o.year}`],
    ['Platform', o.platform],
    ['This port follows', o.version],
    ['License', o.license],
    ['Original package', size(o.packageBytes)],
    ['Genre', m.genres.join(', ')],
    ['Players', m.players],
    ['Source', el('a', { href: o.url, textContent: o.url.replace(/^https?:\/\//, ''), target: '_blank', rel: 'noopener' })],
  ];
  return el('main', { className: 'page' },
    el('a', { className: 'back-link', href: listHref(), textContent: '← All games' }),
    el('header', { className: 'page-head' },
      el('div', {}, el('h1', { textContent: m.title }), el('p', { className: 'tagline', textContent: m.tagline }), live, popular),
      play),
    shots,
    el('section', { className: 'about' },
      el('div', { className: 'summary' }, ...m.summary.map((p) => el('p', { textContent: p }))),
      el('dl', { className: 'facts' }, ...facts.flatMap(([k, v]) => [el('dt', { textContent: k }), el('dd', {}, v)]))),
    m.controls.length > 0 && el('section', { className: 'controls' },
      el('h2', { textContent: 'Controls' }),
      el('table', {}, el('tbody', {}, ...m.controls.map((c) => el('tr', {}, el('th', { textContent: c.input }), el('td', { textContent: c.action })))))),
    legalFooter());
}

function zoom(url: string, caption: string): void {
  const d = el('dialog', { className: 'zoom' }, el('img', { src: url, alt: caption }), el('p', { textContent: caption }));
  d.addEventListener('click', () => d.close());
  d.addEventListener('close', () => d.remove());
  document.body.append(d);
  d.showModal();
}
