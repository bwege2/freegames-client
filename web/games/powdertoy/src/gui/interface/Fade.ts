// gui/interface/Fade.h / Fade.cpp: a value that moves towards a target over time (Engine::LastTick).
import { Engine } from './Engine.ts';
import { GetTicks } from './Keys.ts';

export type FadeProfile =
  | { kind: 'linear'; change: number; changeDownward?: number }
  | { kind: 'exponential'; decay: number; margin: number };

function lastTick(): number {
  return Engine.Exists() ? Engine.Ref().LastTick() : GetTicks();
}

export class Fade {
  private target = 0;
  private referenceTick = 0;
  private referenceValue = 0;
  private profile: FadeProfile;

  static LinearProfile(change: number, changeDownward?: number): FadeProfile {
    return { kind: 'linear', change, changeDownward };
  }
  static ExponentialProfile(decay: number, margin: number): FadeProfile {
    return { kind: 'exponential', decay, margin };
  }
  static readonly BasicDimensionProfile: FadeProfile = { kind: 'exponential', decay: Math.fround(1.532496e-06), margin: 0.5 };

  constructor(newProfile: FadeProfile, newTarget = 0, newValue?: number) {
    this.profile = newProfile;
    this.SetTarget(newTarget);
    this.SetValue(newValue === undefined ? newTarget : newValue);
  }
  SetTarget(newTarget: number): void {
    if (this.target === newTarget) return;
    const value = this.GetValue();
    this.target = newTarget;
    this.SetValue(value);
  }
  SetProfile(newProfile: FadeProfile): void {
    this.profile = newProfile;
  }
  SetValue(newValue: number): void {
    this.referenceTick = lastTick();
    this.referenceValue = Math.fround(newValue);
  }
  GetValue(): number {
    const tickBias = 1000;
    const nowTick = lastTick();
    const diffTick = nowTick - this.referenceTick;
    const p = this.profile;
    if (p.kind === 'linear') {
      let change = p.change;
      if (this.target < this.referenceValue) {
        if (p.changeDownward !== undefined) change = p.changeDownward;
        change = -change;
      }
      const maxDiffTick = Math.trunc((this.target - this.referenceValue) / change * tickBias);
      if (diffTick >= maxDiffTick) return this.target;
      return Math.fround(this.referenceValue + diffTick * change / tickBias);
    }
    const diff = Math.abs(this.referenceValue - this.target);
    const maxDiffTick = diff > 0 ? Math.trunc(Math.log(p.margin / diff) / Math.log(p.decay) * tickBias) : 0;
    if (diffTick >= maxDiffTick) return this.target;
    return Math.fround(this.target + (this.referenceValue - this.target) * Math.pow(p.decay, diffTick / tickBias));
  }
  /** operator int */
  Int(): number {
    return Math.trunc(this.GetValue());
  }
  /** operator =(int) */
  Set(v: number): void {
    this.SetValue(v);
  }
}
