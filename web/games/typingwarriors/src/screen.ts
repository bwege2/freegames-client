// Typing Warriors: GPL-3.0-or-later (LICENSE.md).
// What every typing screen is made of: the frame (head, body, helper keyboard, the key input), the
// text pad with its cursor, and the note that says what the keys tell about the layout.
import { HelperKeyboard } from './keyboard.ts';
import { LayoutDetector, type Key, type Layout } from './layouts.ts';
import type { Profile } from './profile.ts';
import { KeyInput, Sounds, button, el, t } from './ui.ts';
import type { GameContext } from '../../../src/sdk/index.ts';

/** What the screens share. */
export interface Env {
  ctx: GameContext;
  root: HTMLElement;
  profile: Profile;
  sounds: Sounds;
  save(): void;
}

/** A text to type: done characters dimmed, the cursor on the next one, the view following it. */
export class TextPad {
  readonly root: HTMLElement;
  private chars: HTMLElement[] = [];
  private pos = 0;
  private readonly lines: number;

  /** `segments`: offsets where a new segment starts (Switch Wars); segments alternate between two colours */
  constructor(text: string, segments: number[] = [], lines = 3) {
    this.lines = lines;
    this.root = el('div', 'tw-pad');
    this.root.style.setProperty('--tw-lines', String(lines));
    const inner = el('div', 'tw-pad-inner');
    let word = el('span', 'tw-word');
    let seg = 0;
    for (let i = 0; i < text.length; i++) {
      while (seg < segments.length && i >= segments[seg]) seg++;
      const c = text[i];
      const s = el('span', `tw-ch${segments.length ? ` tw-seg${seg % 2}` : ''}`);
      s.textContent = c === ' ' ? ' ' : c;
      if (c === ' ') s.classList.add('tw-space');
      this.chars.push(s);
      word.append(s);
      if (c === ' ') {
        inner.append(word);
        word = el('span', 'tw-word');
      }
    }
    inner.append(word);
    this.root.append(inner);
    this.setPos(0);
  }

  setPos(pos: number): void {
    const from = Math.min(this.pos, pos), to = Math.max(this.pos, pos);
    for (let i = from; i <= to && i < this.chars.length; i++) {
      this.chars[i].classList.toggle('tw-done', i < pos);
      this.chars[i].classList.remove('tw-cur', 'tw-miss');
    }
    this.pos = pos;
    const cur = this.chars[pos];
    if (cur) {
      cur.classList.add('tw-cur');
      // keep the cursor's line the second of the visible ones
      const line = cur.offsetHeight || 1;
      const top = Math.max(0, cur.offsetTop - line * (this.lines > 1 ? 1 : 0));
      if (Math.abs(this.root.scrollTop - top) > 2) this.root.scrollTop = top;
    }
  }

  /** the cursor's character was missed */
  miss(): void {
    const cur = this.chars[this.pos];
    if (!cur) return;
    cur.classList.remove('tw-miss');
    void cur.offsetWidth;
    cur.classList.add('tw-miss');
  }
}

/**
 * Says what the pressed keys tell about the active layout, next to the helper keyboard: they fit the
 * chosen one, they fit others, or there is nothing to go by.
 */
export class LayoutNote {
  readonly root = el('span', 'tw-note');
  readonly detector = new LayoutDetector();
  private noCode = 0;
  private readonly env: Env;
  private layout: Layout;

  constructor(env: Env, layout: Layout) {
    this.env = env;
    this.layout = layout;
    this.show();
  }

  /** another layout is due (Switch Wars): what the keys said about the last one no longer counts */
  setLayout(l: Layout): void {
    if (l === this.layout) return;
    this.layout = l;
    this.detector.reset();
    this.noCode = 0;
    this.show();
  }

  add(k: Key): void {
    if (!k.code) this.noCode++;
    this.detector.add(k);
    this.show();
  }

  private show(): void {
    const r = this.root;
    r.className = 'tw-note';
    if (this.env.profile.trustLayout) {
      r.textContent = t('Layout check off', 'Layout-Prüfung aus');
      return;
    }
    if (this.detector.seen < 3) {
      r.textContent = this.noCode >= 3
        ? t('This keyboard sends no key codes: the layout cannot be checked', 'Diese Tastatur meldet keine Tastencodes: das Layout ist nicht prüfbar')
        : '';
      return;
    }
    const v = this.detector.verdict(this.layout);
    if (v === 'yes') {
      r.textContent = t(`✓ your keys fit ${this.layout.name}`, `✓ deine Tasten passen zu ${this.layout.name}`);
      r.classList.add('tw-note-ok');
    } else if (v === 'no') {
      const c = this.detector.candidates().slice(0, 3).map((l) => l.name);
      r.textContent = c.length
        ? t(`✗ your keys look like ${c.join(' / ')}, not ${this.layout.name}`, `✗ deine Tasten sehen nach ${c.join(' / ')} aus, nicht nach ${this.layout.name}`)
        : t(`✗ your keys do not fit ${this.layout.name} (nor any layout the game knows)`, `✗ deine Tasten passen nicht zu ${this.layout.name} (und zu keinem bekannten Layout)`);
      r.classList.add('tw-note-bad');
    } else {
      r.textContent = '';
    }
  }
}

/** The frame of a typing screen. */
export class TypeScreen {
  readonly root: HTMLElement;
  readonly title: HTMLElement;
  readonly stats: HTMLElement;
  readonly body: HTMLElement;
  readonly foot: HTMLElement;
  readonly input: KeyInput;
  readonly kb: HelperKeyboard;
  readonly note: LayoutNote;
  private readonly kbWrap: HTMLElement;
  private readonly abort = new AbortController();
  readonly env: Env;

  constructor(env: Env, title: string, layout: Layout, onBack: () => void) {
    this.env = env;
    this.title = el('h2', 'tw-title', title);
    this.stats = el('div', 'tw-stats');
    this.body = el('div', 'tw-body');
    this.foot = el('div', 'tw-foot');
    this.kb = new HelperKeyboard(layout);
    this.note = new LayoutNote(env, layout);
    this.kbWrap = el('div', 'tw-kbwrap', this.kb.root, this.note.root);
    const toggle = button(t('Keyboard', 'Tastatur'), () => {
      env.profile.helper = !env.profile.helper;
      env.save();
      this.showKb();
      this.input.focus();
    }, 'tw-quiet');
    this.root = el('div', 'tw-screen tw-typing',
      el('div', 'tw-head', button('←', onBack, 'tw-quiet tw-back'), this.title, this.stats, toggle),
      this.body, this.foot, this.kbWrap);
    const signal = AbortSignal.any([env.ctx.signal, this.abort.signal]);
    this.input = new KeyInput(this.root, signal);
    // a tap anywhere but on a button brings the keys back
    this.root.addEventListener('pointerup', (e) => {
      if (!(e.target as HTMLElement).closest('button, select, a')) this.input.focus();
    }, { signal });
    this.showKb();
    env.root.replaceChildren(this.root);
    this.input.focus();
  }

  get signal(): AbortSignal {
    return this.abort.signal;
  }

  setLayout(l: Layout): void {
    this.kb.setLayout(l);
    this.note.setLayout(l);
  }

  /** chips in the head: [label, value] */
  setStats(items: [string, string][]): void {
    this.stats.replaceChildren(...items.map(([k, v]) => el('span', 'tw-chip', el('b', {}, v), ` ${k}`)));
  }

  private showKb(): void {
    this.kbWrap.classList.toggle('tw-hidden', !this.env.profile.helper);
  }

  close(): void {
    this.abort.abort();
  }
}

export { wpmOf } from './lessons.ts';
