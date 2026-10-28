// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
/** document.createElement with properties and children. */
export function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> & { dataset?: Record<string, string> } = {}, ...kids: (Node | string | null | undefined | false)[]): HTMLElementTagNameMap[K] {
  const { dataset, ...rest } = props;
  const e = Object.assign(document.createElement(tag), rest);
  if (dataset) Object.assign(e.dataset, dataset);
  for (const k of kids) if (k) e.append(k);
  return e;
}

/** The legal links at the foot of the list and of every game page (static pages, public/ and scripts/legal.mjs). */
export function legalFooter(): HTMLElement {
  return el('footer', { className: 'site-foot' },
    el('a', { href: 'impressum.html', textContent: 'Impressum / Legal notice' }),
    el('a', { href: 'datenschutz.html', textContent: 'Datenschutz / Privacy' }),
    el('a', { href: 'nutzungsbedingungen.html', textContent: 'Nutzungsbedingungen / Terms of use' }),
    el('a', { href: 'licenses.html', textContent: 'Licenses & source' }));
}
