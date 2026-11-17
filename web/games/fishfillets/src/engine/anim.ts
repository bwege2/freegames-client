// Anim.cpp and the view effects (src/effect/Effect*.cpp): which picture of a model is shown, and the
// state of its effect. Drawing goes through a Blitter, so the same code runs headless (no blitter).
import { rng } from './random.ts';

/** an image of an anim: a data file, or a coloured shape (ShapeBuilder) */
export type ImgRef = { path: string } | { shape: { x: number; y: number }[]; w: number; h: number; weight: number };

export interface Blitter {
  /** draws picture `img` at x, y with the effect `effect` */
  blit(img: ImgRef, x: number, y: number, effect: Effect): void;
}

export type EffectName = 'none' | 'mirror' | 'invisible' | 'reverse' | 'zx' | 'disintegrate';

export class Effect {
  name: EffectName;
  /** EffectDisintegrate::m_disint */
  disint = 400;
  /** EffectZx */
  zx = 1;
  phase = 0;
  countHeight = 0;
  stripeHeight = 38.5;
  constructor(name: EffectName) { this.name = name; }

  isDisintegrated(): boolean { return this.name === 'disintegrate' && this.disint === 0; }
  isInvisible(): boolean { return this.name === 'invisible' || this.isDisintegrated(); }

  updateEffect(): void {
    if (this.name === 'disintegrate') {
      if (this.disint > 0) {
        this.disint -= 30;
        if (this.disint < 0) this.disint = 0;
      }
    } else if (this.name === 'zx') {
      this.phase = (this.phase + 1) % 500;
      if (this.phase === 1) {
        this.zx = 1;
        this.stripeHeight = 38.5;
      } else if (this.phase >= 2 && this.phase <= 51) {
        this.stripeHeight = (this.stripeHeight * 3 * (0.97 + rng.randomReal(0.06)) + 38.5) / 4.0;
      } else if (this.phase === 52) {
        this.zx = 3;
        this.stripeHeight = 3.4;
      } else {
        this.stripeHeight = (this.stripeHeight * 3 * (0.95 + rng.randomReal(0.1)) + 3.4) / 4.0;
      }
    }
  }
}

export const SIDE_LEFT = 0, SIDE_RIGHT = 1;

class ImagePack {
  map = new Map<string, ImgRef[]>();
  add(name: string, img: ImgRef): void {
    let l = this.map.get(name);
    if (!l) this.map.set(name, (l = []));
    l.push(img);
  }
  count(name: string): number { return this.map.get(name)?.length ?? 0; }
  get(name: string, rank: number): ImgRef {
    const l = this.map.get(name);
    if (!l || rank >= l.length || rank < 0) throw new Error(`no such resource at index: ${name} ${rank}`);
    return l[rank];
  }
}

export class Anim {
  effect = new Effect('none');
  viewShift = { x: 0, y: 0 };
  packs = [new ImagePack(), new ImagePack()];
  animName = '';
  animPhase = 0;
  run = false;
  specialAnimName = '';
  specialAnimPhase = 0;
  warn: (msg: string) => void = () => {};

  drawAt(blitter: Blitter | null, x: number, y: number, side: number): void {
    if (!this.effect.isInvisible()) {
      const pack = this.packs[side];
      const img = pack.get(this.animName, this.animPhase);
      blitter?.blit(img, x, y, this.effect);
      if (this.run) {
        this.animPhase++;
        if (this.animPhase >= pack.count(this.animName)) this.animPhase = 0;
      }
      if (this.specialAnimName !== '') {
        blitter?.blit(pack.get(this.specialAnimName, this.specialAnimPhase), x, y, this.effect);
      }
    }
    this.effect.updateEffect();
  }

  addAnim(name: string, img: ImgRef, side = SIDE_LEFT): void {
    this.packs[side].add(name, img);
  }

  runAnim(name: string, startPhase = 0): void {
    if (this.animName !== name) this.setAnim(name, startPhase);
    this.run = true;
  }

  setAnim(name: string, phase: number): void {
    this.run = false;
    this.animName = name;
    this.animPhase = phase;
    const count = this.packs[SIDE_LEFT].count(name);
    if (this.animPhase >= count) {
      this.animPhase = count === 0 ? 0 : this.animPhase % count;
      this.warn(`anim phase over-flow: ${name} ${phase} ${count}`);
    }
  }

  useSpecialAnim(name: string, phase: number): void {
    this.specialAnimName = name;
    this.specialAnimPhase = phase;
    if (name === '') return;
    const count = this.packs[SIDE_LEFT].count(name);
    if (this.specialAnimPhase >= count) {
      if (count === 0) {
        this.specialAnimName = '';
        this.specialAnimPhase = 0;
      } else {
        this.specialAnimPhase %= count;
      }
      this.warn(`special anim phase over-flow: ${name} ${phase} ${count}`);
    }
  }

  changeEffect(name: EffectName): void { this.effect = new Effect(name); }

  setEffect(name: string): void {
    if (name === 'none' || name === 'mirror' || name === 'invisible' || name === 'reverse' || name === 'zx') this.changeEffect(name);
    else this.warn(`unknown view effect: ${name}`);
  }

  countAnimPhases(anim: string, side = SIDE_LEFT): number { return this.packs[side].count(anim); }
  isDisintegrated(): boolean { return this.effect.isDisintegrated(); }
  isInvisible(): boolean { return this.effect.isInvisible(); }

  getState(): string {
    const enc = (s: string) => s.replace(/&/g, '&amp;').replace(/,/g, '&comma;');
    return [enc(this.effect.name), this.viewShift.x, this.viewShift.y, enc(this.animName), this.animPhase,
      this.run ? 1 : 0, enc(this.specialAnimName), this.specialAnimPhase].join(',');
  }

  restoreState(state: string): void {
    const v = cppSplit(state, ',');
    if (v.length !== 8) { this.warn(`invalid anim state: ${state}`); return; }
    const dec = (s: string) => s.replace(/&comma;/g, ',').replace(/&amp;/g, '&');
    const int = (s: string) => readInt(s) ?? 0;
    const effectName = dec(v[0]);
    const x = int(v[1]), y = int(v[2]);
    this.animName = dec(v[3]);
    this.animPhase = int(v[4]);
    this.run = int(v[5]) !== 0;
    this.specialAnimName = dec(v[6]);
    this.specialAnimPhase = int(v[7]);
    this.setEffect(effectName);
    this.viewShift = { x, y };
  }
}

/** StringTool::split: segments without the separator; an empty last segment is dropped */
export function cppSplit(str: string, sep: string): string[] {
  const out = str.split(sep);
  if (out[out.length - 1] === '') out.pop();
  return out;
}

/** StringTool::readInt: strtol(s, &end, 0), only when the whole string is a number */
export function readInt(s: string): number | undefined {
  const m = /^\s*([-+]?)(0[xX][0-9a-fA-F]+|0[0-7]*|[1-9][0-9]*)$/.exec(s);
  if (!m) return undefined;
  const body = m[2];
  const v = /^0[xX]/.test(body) ? parseInt(body.slice(2), 16) : body.length > 1 && body[0] === '0' ? parseInt(body, 8) : parseInt(body, 10);
  return m[1] === '-' ? -v : v;
}
