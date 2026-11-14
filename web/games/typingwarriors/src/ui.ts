// Typing Warriors: GPL-3.0-or-later (LICENSE.md).
// Small shared pieces of the screens: elements, the two languages, the key input, sounds.
import type { Key } from './layouts.ts';

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> | string = {}, ...kids: (Node | string | null | undefined | false)[]): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (typeof props === 'string') e.className = props;
  else Object.assign(e, props);
  for (const k of kids) if (k !== null && k !== undefined && k !== false) e.append(k);
  return e;
}

export function button(label: string, onClick: () => void, className = ''): HTMLButtonElement {
  const b = el('button', { className: `tw-btn ${className}`, type: 'button', textContent: label });
  b.addEventListener('click', onClick);
  return b;
}

let lang: 'en' | 'de' = 'en';
export const setUiLang = (l: 'en' | 'de'): void => { lang = l; };
export const uiLang = (): 'en' | 'de' => lang;
/** the text in the screens' language */
export const t = (en: string, de: string): string => (lang === 'de' ? de : en);

/**
 * Keys for a typing screen. A text field that stays out of sight takes them, so phone keyboards and
 * input methods work: a hardware key comes as keydown with its code and character; anything else
 * (a phone's keyboard, a dead key's result, an input method) comes as text without a code.
 */
export class KeyInput {
  readonly field: HTMLInputElement;
  /** the keys typed; `special`: "Escape", "Backspace", "Enter", "Tab" */
  onKey: (k: Key) => void = () => { /* set by the screen */ };
  onSpecial: (name: string) => void = () => { /* set by the screen */ };

  constructor(parent: HTMLElement, signal: AbortSignal) {
    const f = this.field = el('input', { className: 'tw-input', type: 'text' });
    f.autocapitalize = 'off';
    f.autocomplete = 'off';
    f.spellcheck = false;
    f.setAttribute('autocorrect', 'off');
    f.setAttribute('aria-label', 'typing input');
    f.enterKeyHint = 'done';
    parent.append(f);
    f.addEventListener('keydown', (e) => {
      if (e.isComposing) return;
      const altGr = e.getModifierState?.('AltGraph');
      if ((e.ctrlKey || e.metaKey) && !altGr) return; // the browser's shortcuts
      if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        this.onSpecial(e.key);
        return;
      }
      // one character (also one beyond the BMP, which is two code units)
      if ([...e.key].length === 1 && e.key !== 'Unidentified') {
        e.preventDefault();
        // phone keyboards report no key ("" or "Unidentified")
        if (e.key.length === 1) this.onKey({ char: e.key, code: e.code === 'Unidentified' ? '' : e.code });
      }
      // "Dead", "Process", "Unidentified": the text arrives by the input event
    }, { signal });
    const text = () => {
      const v = f.value;
      f.value = '';
      for (const c of v) if (c.length === 1 && c !== '\n') this.onKey({ char: c, code: '' });
    };
    f.addEventListener('input', (e) => { if (!(e as InputEvent).isComposing) text(); }, { signal });
    f.addEventListener('compositionend', text, { signal });
  }

  focus(): void {
    this.field.focus({ preventScroll: true });
  }
}

/** Short tones for a typo, a finished word, a win: made here, no sound files. */
export class Sounds {
  on = true;
  private readonly audio: AudioContext;

  constructor(audio: AudioContext) {
    this.audio = audio;
  }

  private tone(freq: number, ms: number, type: OscillatorType, gain: number, at = 0): void {
    if (!this.on || this.audio.state !== 'running') return;
    const t0 = this.audio.currentTime + at;
    const o = this.audio.createOscillator(), g = this.audio.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + ms / 1000);
    o.connect(g).connect(this.audio.destination);
    o.start(t0);
    o.stop(t0 + ms / 1000 + 0.02);
  }

  typo(): void { this.tone(140, 90, 'square', 0.05); }
  word(): void { this.tone(880, 50, 'sine', 0.04); }
  tick(): void { this.tone(520, 70, 'sine', 0.06); }
  go(): void { this.tone(1040, 220, 'sine', 0.08); }
  power(): void { this.tone(660, 80, 'triangle', 0.07); this.tone(990, 120, 'triangle', 0.07, 0.08); }
  lost(): void { this.tone(220, 200, 'sawtooth', 0.05); this.tone(165, 260, 'sawtooth', 0.05, 0.18); }
  win(): void { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 180, 'triangle', 0.07, i * 0.11)); }
  switchNow(): void { this.tone(740, 90, 'square', 0.05); this.tone(554, 140, 'square', 0.05, 0.1); }
}

export const fmtPercent = (x: number): string => `${Math.round(x * 100)} %`;
export const fmtTime = (ms: number): string => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
