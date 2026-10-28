// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// A game's picture for the list: its first screenshot, or its initials until the port has screenshots.
import type { Game } from './catalog.ts';
import { el } from './dom.ts';

function hue(id: string): number {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

export function thumb(g: Game): HTMLElement {
  if (g.shots.length) return el('span', { className: 'thumb' }, el('img', { src: g.shots[0].url, alt: '', loading: 'lazy' }));
  const words = g.manifest.title.replace(/[^\p{L}\p{N} ]/gu, '').split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const t = el('span', { className: 'thumb thumb-none', textContent: initials });
  t.style.setProperty('--h', String(hue(g.manifest.id)));
  return t;
}
