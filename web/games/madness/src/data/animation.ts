// Madness Interactive Reloaded port (GPL-3.0). Animation/AnimationDeserialiser.cs, CharacterAnimation.cs,
// LimbAnimation.cs, HandLimbAnimation.cs, AnimationConstraint.cs and Character/ActiveCharacterAnimation.cs.
import { evalCurve, lerp, lerpV, v2, type Key, type Vec2 } from '../engine/util.ts';

export const HandLook = { Fist: 0, HoldPistol: 1, HoldUnderside: 2, HoldRifle: 3, Point: 4, Open: 5, HoldStock: 6 } as const;
export type HandLook = number;
export const HAND_LOOKS = ['Fist', 'HoldPistol', 'HoldUnderside', 'HoldRifle', 'Point', 'Open', 'HoldStock'];

/** AnimationConstraint flags */
export const AC = {
  AllowAll: 0,
  PreventDying: 1 << 0,
  PreventWalking: 1 << 1,
  PreventAiming: 1 << 2,
  PreventDodge: 1 << 3,
  PreventShooting: 1 << 4,
  PreventMelee: 1 << 5,
  PreventBeingShot: 1 << 6,
  PreventBeingMeleed: 1 << 7,
  PreventRagdoll: 1 << 8,
  PreventWorldInteraction: 1 << 9,
  PreventThrowing: 1 << 10,
  PreventIronSight: 1 << 11,
  PreventBlock: 1 << 11,
  PreventMixTransition: 1 << 12,
  PreventFlip: 1 << 13,
  FaceForwards: 1 << 14,
  PreventDeathAnimation: 1 << 15,
  PreventAllAttacking: (1 << 5) | (1 << 4) | (1 << 10),
  PreventAllMovement: (1 << 1) | (1 << 2) | (1 << 13),
  PreventAllDamage: (1 << 6) | (1 << 7),
  PreventAll: 0xffffffff,
} as const;
const CONSTRAINT_NAMES = Object.keys(AC) as (keyof typeof AC)[];

export class LimbAnimation {
  duration = 0;
  adjustForAim = false;
  translation: Key<Vec2>[] | null = null;
  rotation: Key<number>[] | null = null;
  scale: Key<Vec2>[] | null = null;
  handLooks: { time: number; look: HandLook }[] | null = null;
  evalTranslation(t: number): Vec2 { const r = this.translation ? evalCurve(this.translation, t, lerpV, v2()) : v2(); return v2(r.x, r.y); }
  evalRotation(t: number): number { return this.rotation ? evalCurve(this.rotation, t, lerp, 0) : 0; }
  evalScale(t: number): Vec2 { const r = this.scale ? evalCurve(this.scale, t, lerpV, v2(1, 1)) : v2(1, 1); return v2(r.x, r.y); }
  /** HandLimbAnimation.GetHandLookForTime */
  handLookFor(time: number): HandLook | null {
    if (!this.handLooks) return null;
    for (let i = this.handLooks.length - 1; i >= 0; i--) if (this.handLooks[i].time <= time) return this.handLooks[i].look;
    return null;
  }
}

export class CharacterAnimation {
  constraints: { time: number; constraints: number }[] = [];
  head: LimbAnimation | null = null;
  body: LimbAnimation | null = null;
  hands: LimbAnimation[] | null = null;
  totalDuration = 0;
  doSmoothing = false;
  relativeHandPosition = false;
  readonly name: string;
  readonly group: string;
  constructor(name: string, group: string) { this.name = name; this.group = group; }
  calculateTotalDuration(): void {
    this.totalDuration = 0;
    if (this.head) this.totalDuration = Math.max(this.head.duration, this.totalDuration);
    if (this.body) this.totalDuration = Math.max(this.body.duration, this.totalDuration);
    if (this.hands) for (const h of this.hands) this.totalDuration = Math.max(h.duration, this.totalDuration);
  }
}

const TimePattern = /(\d|\.)+s/;
const FramePattern = /\d+/;
const DegreePattern = /-?(\d|\.)+deg/;
const PixelPattern = /-?(\d|\.)+px/g;
const HandPattern = /([a-zA-Z]+)/g;
const IntegerPattern = /-?\d+/;
const FloatPattern = /-?(\d|\.)+/;
const ConstraintPattern = /(constraints)\((\w| )*\)/;
const LimbScalePattern = /(scale)\((\d+\.?\d*),\s*(\d+\.?\d*)\)/;

interface KeyframeLine { time: number; position?: Vec2; angle?: number; hand?: HandLook; scale?: Vec2 }

/** AnimationDeserialiser.Load */
export function parseAnimation(text: string, name: string, group: string): CharacterAnimation {
  const anim = new CharacterAnimation(name, group);
  let current: KeyframeLine[] = [];
  let target: LimbAnimation | null = null;
  let writingHand = false;
  let framerate = 24;
  let globalSpeed = 1;
  let globalScale = 1;
  const markEnd = (): void => {
    if (!target) { current = []; return; }
    let duration = -1;
    for (const k of current) duration = Math.max(k.time, duration);
    target.duration = duration;
    if (writingHand) target.handLooks = [];
    for (const k of current) {
      const scaled = k.time / duration;
      if (k.position) (target.translation ??= []).push({ value: v2(k.position.x * globalScale, k.position.y * globalScale), position: scaled });
      if (k.angle !== undefined) (target.rotation ??= []).push({ value: k.angle, position: scaled });
      if (k.scale) (target.scale ??= []).push({ value: k.scale, position: scaled });
      if (writingHand && k.hand !== undefined && target.handLooks) target.handLooks.push({ time: scaled, look: k.hand });
    }
    current = [];
  };
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);
  for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
    const line = lines[lineNumber].trim();
    if (line.startsWith('#')) continue;
    switch (line) {
      case 'BODY': markEnd(); anim.body = target = new LimbAnimation(); writingHand = false; break;
      case 'HEAD': markEnd(); anim.head = target = new LimbAnimation(); writingHand = false; break;
      case 'HAND': markEnd(); target = new LimbAnimation(); (anim.hands ??= []).push(target); writingHand = true; break;
      case 'aim': if (!target) throw new Error(`aim flag outside a block at line ${lineNumber + 1}`); target.adjustForAim = true; break;
      case 'smooth': anim.doSmoothing = true; break;
      case 'relative': anim.relativeHandPosition = true; break;
      case '': break;
      default: {
        if (line.startsWith('fps ')) { framerate = parseInt(IntegerPattern.exec(line)![0], 10); continue; }
        if (line.startsWith('speed ')) { const m = FloatPattern.exec(line); if (m) globalSpeed = parseFloat(m[0]); continue; }
        if (line.startsWith('scale ')) { globalScale = parseFloat(FloatPattern.exec(line)![0]); continue; }
        if (!target) break;
        const k: KeyframeLine = { time: 0 };
        const time = TimePattern.exec(line);
        if (!time) {
          const frame = FramePattern.exec(line);
          if (!frame) throw new Error(`no time at line ${lineNumber + 1} of ${name}`);
          k.time = Math.fround(parseInt(frame[0], 10) / framerate / globalSpeed);
        } else k.time = parseFloat(time[0]) / globalSpeed;
        const px = line.match(PixelPattern);
        if (px && px.length > 0) {
          if (px.length !== 2) throw new Error(`keyframe needs 0 or 2 positions at line ${lineNumber + 1}`);
          k.position = v2(parseFloat(px[0]), parseFloat(px[1]));
        }
        const deg = DegreePattern.exec(line);
        if (deg) k.angle = parseFloat(deg[0]);
        if (writingHand) {
          const words = (line.match(HandPattern) ?? []).map((w) => w.toLowerCase());
          for (let i = 0; i < HAND_LOOKS.length; i++) if (words.includes(HAND_LOOKS[i].toLowerCase())) { k.hand = i; break; }
        }
        const cons = ConstraintPattern.exec(line);
        if (cons) {
          const inside = cons[0].slice(cons[0].indexOf('(') + 1, cons[0].indexOf(')'));
          let flags = 0;
          for (const entry of inside.split(' ').map((s) => s.trim()).filter(Boolean)) {
            const n = CONSTRAINT_NAMES.find((c) => c.toLowerCase() === entry.toLowerCase());
            if (n) flags = (flags | AC[n]) >>> 0;
          }
          anim.constraints.push({ time: k.time, constraints: flags });
        }
        const sc = LimbScalePattern.exec(line);
        if (sc) k.scale = v2(parseFloat(sc[2]), parseFloat(sc[3]));
        current.push(k);
      }
    }
  }
  markEnd();
  anim.constraints.sort((a, b) => (a.time === b.time ? 0 : a.time > b.time ? 1 : -1));
  anim.calculateTotalDuration();
  return anim;
}

/** Character/ActiveCharacterAnimation.cs */
export class ActiveAnimation {
  unscaledTimer = 0;
  onEnd: (() => void) | null = null;
  readonly animation: CharacterAnimation;
  speed: number;
  constructor(animation: CharacterAnimation, speed: number) { this.animation = animation; this.speed = speed; }
  get isOver(): boolean { return this.unscaledTimer > this.animation.totalDuration; }
  isAlmostOver(p = 0.95): boolean { return this.unscaledTimer > this.animation.totalDuration * p; }
  progress(a: LimbAnimation): number { return this.unscaledTimer / a.duration; }
  stop(): void { this.unscaledTimer = Number.MAX_VALUE; }
}
