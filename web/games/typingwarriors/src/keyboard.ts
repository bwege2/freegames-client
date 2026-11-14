// Typing Warriors: GPL-3.0-or-later (LICENSE.md).
// The helper keyboard: the chosen layout drawn on an ISO or ANSI keyboard, the key to press next lit
// with the modifiers to hold, every key in the colour of its finger. It shows one level at a time
// (plain, Shift, level 3, level 4): the level of the next character, or the one picked by hand.
import { DEAD, ROWS, fingerOf, strokeFor, type Layout } from './layouts.ts';
import { el, t } from './ui.ts';

const WIDE: Record<string, number> = { Backspace: 2, Tab: 1.5, CapsLock: 1.75, Enter: 2.25, ShiftLeft: 2.25, ShiftRight: 2.75 };

export class HelperKeyboard {
  readonly root: HTMLElement;
  private layout: Layout;
  private keys = new Map<string, HTMLElement>();
  private level = 0;
  private pinned = false;
  private tabs: HTMLElement;
  private board: HTMLElement;
  private title: HTMLElement;
  private next: { code: string; hold: string[] } | null = null;

  constructor(layout: Layout) {
    this.layout = layout;
    this.title = el('span', 'tw-kb-name');
    this.tabs = el('div', 'tw-kb-tabs');
    this.board = el('div', 'tw-kb-board');
    this.root = el('div', 'tw-kb', el('div', 'tw-kb-head', this.title, this.tabs), this.board);
    this.build();
  }

  setLayout(layout: Layout): void {
    if (layout === this.layout) return;
    this.layout = layout;
    this.level = 0;
    this.pinned = false;
    this.build();
  }

  /** Lights the key for a character (and its modifiers); null or an untypeable one: nothing lit. */
  hint(char: string | null): void {
    const s = char === null ? null : strokeFor(this.layout, char);
    this.next = s ? { code: s.code, hold: s.hold } : null;
    if (s && !this.pinned && s.level !== this.level) {
      this.level = s.level;
      this.labels();
    }
    this.light();
  }

  /** A short flash on a key: "ok" or "bad". */
  flash(code: string, kind: 'ok' | 'bad'): void {
    const k = this.keys.get(code);
    if (!k) return;
    k.classList.remove('tw-key-ok', 'tw-key-bad');
    void k.offsetWidth; // restart the animation
    k.classList.add(kind === 'ok' ? 'tw-key-ok' : 'tw-key-bad');
  }

  private key(code: string, units = 1): HTMLElement {
    const k = el('div', `tw-key tw-f${fingerOf(code)}`);
    k.style.flexGrow = String(units);
    k.style.flexBasis = `${units * 2}em`;
    k.dataset.code = code;
    this.keys.set(code, k);
    return k;
  }

  private build(): void {
    const l = this.layout;
    const iso = l.form === 'iso';
    this.keys.clear();
    const rows: HTMLElement[] = [];
    rows.push(el('div', 'tw-kb-row', ...ROWS[0].map((c) => this.key(c)), this.key('Backspace', WIDE.Backspace)));
    rows.push(el('div', 'tw-kb-row', this.key('Tab', WIDE.Tab), ...ROWS[1].map((c) => this.key(c)), this.key(iso ? 'EnterTop' : 'Backslash', 1.5)));
    rows.push(el('div', 'tw-kb-row', this.key('CapsLock', WIDE.CapsLock), ...ROWS[2].map((c) => this.key(c)),
      iso ? this.key('Backslash') : null, this.key('Enter', iso ? 1.25 : WIDE.Enter)));
    rows.push(el('div', 'tw-kb-row', this.key('ShiftLeft', iso ? 1.25 : WIDE.ShiftLeft), iso ? this.key('IntlBackslash') : null,
      ...ROWS[3].map((c) => this.key(c)), this.key('ShiftRight', WIDE.ShiftRight)));
    rows.push(el('div', 'tw-kb-row', this.key('ControlLeft', 1.5), this.key('AltLeft', 1.5), this.key('Space', 7), this.key('AltRight', 1.5), this.key('ControlRight', 1.5)));
    this.board.replaceChildren(...rows);
    this.title.textContent = l.name;
    this.tabs.replaceChildren(...l.levels.map((name, i) => {
      // a level with nothing on it (QWERTY's AltGr) gets no tab
      if (i > 0 && ![...this.keys.keys()].some((code) => l.keys[code]?.[i])) return '';
      const b = el('button', { className: 'tw-kb-tab', type: 'button', textContent: name || t('plain', 'ohne') });
      b.dataset.level = String(i);
      b.addEventListener('click', () => {
        this.pinned = !(this.pinned && this.level === i);
        this.level = i;
        this.labels();
        this.light();
      });
      return b;
    }));
    this.labels();
    this.light();
  }

  private labels(): void {
    const l = this.layout;
    const fixed: Record<string, string> = { Backspace: '⌫', Tab: '⇥', Enter: '⏎', EnterTop: '', ShiftLeft: '⇧', ShiftRight: '⇧', Space: '',
      ControlLeft: t('Ctrl', 'Strg'), ControlRight: t('Ctrl', 'Strg'), AltLeft: 'Alt', CapsLock: '⇪', AltRight: l.family === 'neo' ? '' : 'AltGr' };
    for (const [code, k] of this.keys) {
      let label = '';
      let mod = false;
      if (l.family === 'neo' && l.mod3.includes(code)) { label = 'M3'; mod = true; }
      else if (l.family === 'neo' && l.mod4.includes(code)) { label = 'M4'; mod = true; }
      else if (code in fixed) { label = fixed[code]; mod = true; }
      else {
        const c = l.keys[code]?.[this.level] ?? '';
        label = c.startsWith(DEAD) ? c : c;
        k.classList.toggle('tw-key-dead', c.startsWith(DEAD));
      }
      k.textContent = label;
      k.classList.toggle('tw-key-mod', mod);
      k.classList.toggle('tw-key-empty', !label && !mod);
    }
    for (const b of this.tabs.children) {
      const on = (b as HTMLElement).dataset.level === String(this.level);
      b.classList.toggle('tw-on', on);
      b.classList.toggle('tw-pinned', on && this.pinned);
    }
  }

  private light(): void {
    for (const [code, k] of this.keys) {
      k.classList.toggle('tw-key-next', this.next?.code === code);
      k.classList.toggle('tw-key-hold', !!this.next?.hold.includes(code));
    }
  }
}
