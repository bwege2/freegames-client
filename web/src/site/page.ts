// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// A game's page: what it is, screenshots, the facts about the original, controls, one Play button, and
// how many play it right now.
import { size, type Game } from './catalog.ts';
import { el, legalFooter } from './dom.ts';
import { downloadOf, megabytes } from './downloads.ts';
import { feedbackForm } from './feedback.ts';
import { siteHref } from './hosts.ts';
import { listHref } from './list.ts';
import { liveText, onLive, playersOf, popularText } from './live.ts';
import { thumb } from './thumb.ts';

/** The page; it listens for the players now until `signal` aborts (the route moved on). */
export function pageView(g: Game, onPlay: () => void, signal: AbortSignal = new AbortController().signal): HTMLElement {
  const m = g.manifest;
  // a game marked broken (game.json "broken") says so, and plays only on a second, deliberate click
  const broken = g.load ? m.broken : undefined;
  const play = el('button', { className: 'play', type: 'button', textContent: g.load ? (broken ? 'Broken right now' : '▶  Play') : 'Coming soon', disabled: !g.load || !!broken });
  if (g.load) play.addEventListener('click', onPlay);
  const brokenNote = broken
    ? el('p', { className: 'broken-note' }, `⚠ ${broken} `, el('button', { className: 'try-anyway', type: 'button', textContent: 'Try anyway', onclick: onPlay }))
    : null;
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
    ? el('div', { className: 'shots' }, ...g.shots.map((s, i) => {
      const b = el('button', { className: 'shot', type: 'button', title: s.caption }, el('img', { src: s.url, alt: s.caption, loading: 'lazy' }));
      b.addEventListener('click', () => zoom(g.shots, i));
      return b;
    }))
    : el('div', { className: 'shots' }, el('span', { className: 'shot shot-none' }, thumb(g), el('span', { textContent: 'Screenshots arrive with the port.' })));
  // what Play downloads the first time (dist/downloads.json; nothing on the development server)
  const download = el('span', { textContent: '…' });
  const playSize = el('span', { className: 'play-size' });
  if (g.load) {
    void downloadOf(m.id).then((d) => {
      download.textContent = d ? `${megabytes(d.bytes)} for the first start (afterwards starts immediately from your browser's cache)` : '–';
      if (d) playSize.textContent = `${megabytes(d.bytes)} to start`;
    });
  }
  const caveat = m.caveat ? el('p', { className: 'caveat-note', textContent: m.caveat }) : null;
  const o = m.original;
  const facts: [string, Node | string][] = [
    ['Original', `${o.author}, ${o.year}`],
    ['Platform', o.platform],
    [m.remake ? 'Based on' : 'This port follows', o.version],
    ['License', o.license],
    ['Original package', size(o.packageBytes)],
    ['Genre', m.genres.join(', ')],
    ['Players', m.players],
    ...(g.load ? [['Download', download] as [string, Node]] : []),
    ['Source', el('a', { href: o.url, textContent: o.url.replace(/^https?:\/\//, ''), target: '_blank', rel: 'noopener' })],
    ...(m.links?.length
      ? [['Links', el('ul', { className: 'links' }, ...m.links.map((l) => el('li', {}, el('a', { href: l.url, textContent: l.label, target: '_blank', rel: 'noopener' }))))] as [string, Node]]
      : []),
  ];
  return el('main', { className: 'page' },
    el('a', { className: 'back-link', href: siteHref(listHref()), textContent: '← All games' }),
    el('header', { className: 'page-head' },
      el('div', {}, el('h1', { textContent: m.title }), el('p', { className: 'tagline', textContent: m.tagline }), brokenNote, live, popular),
      el('div', { className: 'play-box' }, play, playSize)),
    shots,
    el('section', { className: 'about' },
      el('div', { className: 'summary' }, ...m.summary.map((p) => el('p', { textContent: p })), caveat),
      el('dl', { className: 'facts' }, ...facts.flatMap(([k, v]) => [el('dt', { textContent: k }), el('dd', {}, v)]))),
    m.controls.length > 0 && el('section', { className: 'controls' },
      el('h2', { textContent: 'Controls' }),
      el('table', {}, el('tbody', {}, ...m.controls.map((c) => el('tr', {}, el('th', { textContent: c.input }), el('td', { textContent: c.action })))))),
    g.load ? feedbackForm(m.id, m.title) : null,
    legalFooter());
}

/**
 * The screenshot in a dialog, with the others of the game one step away: the arrows or the left and right
 * half of the picture (mouse), the arrow keys (keyboard). A click on the dark backdrop closes it, Esc too.
 */
function zoom(shots: { url: string; caption: string }[], start: number): void {
  let at = start;
  const img = el('img', { alt: '' });
  const caption = el('p', {});
  const count = el('span', { className: 'zoom-count' });
  const show = (): void => {
    const s = shots[at];
    img.src = s.url;
    img.alt = s.caption;
    caption.textContent = s.caption;
    count.textContent = `${at + 1} / ${shots.length}`;
  };
  const step = (by: number): void => {
    at = (at + by + shots.length) % shots.length;
    show();
  };
  const arrow = (side: 'prev' | 'next', label: string, by: number): HTMLButtonElement => {
    const b = el('button', { className: `zoom-arrow zoom-${side}`, type: 'button', textContent: label, title: label === '‹' ? 'Previous' : 'Next' });
    b.addEventListener('click', () => step(by));
    return b;
  };
  const many = shots.length > 1;
  const frame = el('div', { className: 'zoom-frame' }, img, ...(many ? [arrow('prev', '‹', -1), arrow('next', '›', 1)] : []));
  const d = el('dialog', { className: 'zoom' }, frame, caption, count);
  if (many) {
    img.addEventListener('click', (e) => {
      const r = img.getBoundingClientRect();
      step(e.clientX < r.left + r.width / 2 ? -1 : 1);
    });
    d.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        step(e.key === 'ArrowLeft' ? -1 : 1);
      }
    });
  }
  d.addEventListener('click', (e) => { if (e.target === d || e.target === frame) d.close(); });
  d.addEventListener('close', () => d.remove());
  show();
  document.body.append(d);
  d.showModal();
}
