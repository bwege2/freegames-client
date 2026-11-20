// Madness Interactive Reloaded port (GPL-3.0). What the game systems need from the scene: time
// (Walgelijk's Time: DeltaTime, SecondsSinceLoad, scaled by TimeScale), the level, physics, data, sound and
// the routines the original runs with MadnessUtils.DelayPausable / RoutineForSecondsPausable.
import type { Level, Registry } from '../data/registry.ts';
import type { PhysicsWorld } from '../engine/physics.ts';

export interface TextureSize { w: number; h: number }

export interface Audio {
  /** AudioRenderer.PlayOnce(sound, volume, pitch) */
  play(path: string, volume?: number, pitch?: number): void;
}

export interface Clock {
  /** Time.DeltaTime (scaled) */
  dt: number;
  /** Time.SecondsSinceLoad (scaled) */
  time: number;
  /** Time.SecondsSinceSceneChange */
  sinceSceneChange: number;
  timeScale: number;
}

export interface SceneBase {
  readonly clock: Clock;
  readonly reg: Registry;
  readonly physics: PhysicsWorld;
  readonly level: Level | null;
  readonly audio: Audio;
  textureSize(path: string): TextureSize;
  /** MadnessUtils.DelayPausable */
  delay(seconds: number, fn: () => void): void;
  /** MadnessUtils.RoutineForSecondsPausable */
  routineFor(seconds: number, fn: (dt: number) => void): void;
}
