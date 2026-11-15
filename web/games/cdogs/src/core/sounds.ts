// C-Dogs SDL 2.5.0, translated: sounds.c (which sound to play, where it is heard). Playing is the platform's
// (platform/audio.ts, Web Audio). GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
//
// StrSound picks one file of a random group with rand() ("Don't get the last sound used"): the game's random
// stream depends on it, so the port asks for sounds exactly where the original does, even while muted.
import {
  rand, cmod, svec2_zero, svec2_is_zero, svec2_subtract, svec2_length, svec2_distance_squared, svec2,
  CalcClosestPointOnLineSegmentToPoint, HasClearLineJMRaytrace, svec2i_assign_vec2, sqrtf, f32, toInt, MPI,
  SQUARED, TILE_WIDTH, type Vec2,
} from './base.ts';

/** a loaded sound file (Mix_Chunk): its path under the data root */
export type SoundRef = { path: string } | null;

interface SoundData {
  random: boolean;
  normal: SoundRef;
  sounds: SoundRef[];
  lastPlayed: number;
}

export interface SoundPlayer {
  /** play now; bearing 0-359 degrees (Mix_SetPosition), distance 0-255; returns a channel id or -1 */
  play(ref: SoundRef, bearingDegrees: number, distance: number, muffled: boolean): number;
  halt(channel: number): void;
}

const SOUND_EXTS = ['.ogg', '.OGG', '.wav', '.WAV', '.mp3', '.MP3'];

export class SoundDevice {
  isInitialised = true;
  /** the port: the original passes no device to the first frame's events (game.c GameUpdate) */
  muted = false;
  sounds = new Map<string, SoundData>();
  customSounds = new Map<string, SoundData>();
  earLeft1 = svec2_zero();
  earLeft2 = svec2_zero();
  earRight1 = svec2_zero();
  earRight2 = svec2_zero();
  player: SoundPlayer | null = null;
  /** the pause menu turns the music down (music.isReduced, MUSIC_REDUCTION_RATE) */
  musicReduced = false;
  /** the screen width the original computes distances with (Res.x) */
  screenWidth = 320;
}
export const gSoundDevice = new SoundDevice();

/**
 * SoundLoadDir: files are paths relative to the sound directory ("footsteps/boots/0.ogg"), root is the path
 * prefix the refs get ("sounds/" or a campaign's "missions/x.cdogscpn/sounds/"). exists() tells whether a path
 * (relative to the sound directory) is a file.
 */
export function SoundLoadDir(sounds: Map<string, SoundData>, files: string[], root: string,
  exists: (rel: string) => boolean): void {
  for (const name of files) {
    const slash = name.lastIndexOf('/');
    const base = name.slice(slash + 1);
    if (base.startsWith('.')) continue;
    const dot = base.lastIndexOf('.');
    const baseNoExt = dot >= 0 ? base.slice(0, dot) : base;
    const nameNoExt = dot >= 0 ? name.slice(0, name.length - (base.length - dot)) : name;
    const ext = dot >= 0 ? base.slice(dot) : '';
    const isNumber = /^\d*$/.test(baseNoExt);
    if (isNumber) {
      if (parseInt(baseNoExt || '0', 10) !== 0) continue;
      const dir = name.slice(0, slash + 1);
      const group: SoundData = { random: true, normal: null, sounds: [], lastPlayed: 0 };
      for (let i = 0; ; i++) {
        const p = `${dir}${i}${ext}`;
        if (!SOUND_EXTS.includes(ext) || !exists(p)) break;
        group.sounds.push({ path: root + p });
      }
      sounds.set(nameNoExt.slice(0, nameNoExt.lastIndexOf('/')), group);
    } else {
      if (!SOUND_EXTS.includes(ext)) continue;
      sounds.set(nameNoExt, { random: false, normal: { path: root + name }, sounds: [], lastPlayed: 0 });
    }
  }
}

function SoundDataGet(s: SoundData): SoundRef {
  if (!s.random) return s.normal;
  if (s.sounds.length === 0) return null;
  let idx = s.lastPlayed;
  while (s.sounds.length > 1 && idx === s.lastPlayed) idx = cmod(rand(), s.sounds.length);
  s.lastPlayed = idx;
  return s.sounds[idx];
}

export function StrSound(s: string | null | undefined): SoundRef {
  if (s == null || s.length === 0 || !gSoundDevice.isInitialised) return null;
  const c = gSoundDevice.customSounds.get(s);
  if (c) return SoundDataGet(c);
  const d = gSoundDevice.sounds.get(s);
  if (d) return SoundDataGet(d);
  return null;
}

const OUT_OF_SIGHT_DISTANCE_PLUS = 100;
function SoundPlayAtPosition(device: SoundDevice, data: SoundRef, dp: Vec2, isMuffled: boolean): number {
  if (!device.isInitialised || data == null) return -1;
  let distance = 0;
  let bearingDegrees = 0;
  const screen = f32(device.screenWidth);
  const halfScreen = f32(screen / 2);
  if (!svec2_is_zero(dp)) {
    const d = svec2_length(dp);
    const maxDistance = sqrtf(f32(f32(screen * screen) + f32(halfScreen * halfScreen)));
    distance = toInt(f32(f32(d * 255) / maxDistance));
    const bearing = Math.atan(dp.x / halfScreen);
    bearingDegrees = toInt((bearing * 180) / MPI) << 16 >> 16;
    if (bearingDegrees < 0) bearingDegrees += 360;
  }
  if (isMuffled) distance += OUT_OF_SIGHT_DISTANCE_PLUS;
  if (distance > 255) return -1;
  return device.player ? device.player.play(data, bearingDegrees, distance, isMuffled) : 0;
}

export function SoundPlay(device: SoundDevice | null, data: SoundRef): void {
  if (!device || !device.isInitialised) return;
  SoundPlayAtPosition(device, data, svec2_zero(), false);
}

export function SoundSetEar(isLeft: boolean, idx: number, pos: Vec2): void {
  if (isLeft) {
    if (idx === 0) gSoundDevice.earLeft1 = pos;
    else gSoundDevice.earLeft2 = pos;
  } else if (idx === 0) gSoundDevice.earRight1 = pos;
  else gSoundDevice.earRight2 = pos;
}
export function SoundSetEarsSide(isLeft: boolean, pos: Vec2): void {
  SoundSetEar(isLeft, 0, pos);
  SoundSetEar(isLeft, 1, pos);
}
export function SoundSetEars(pos: Vec2): void {
  SoundSetEarsSide(true, pos);
  SoundSetEarsSide(false, pos);
}

/** set by map.ts: is the tile at a pixel position opaque (IsPosNoSee) */
export const soundHooks = { isPosNoSee: (_v: { x: number; y: number }): boolean => false };

export function SoundPlayAt(device: SoundDevice | null, data: SoundRef, pos: Vec2): number {
  return SoundPlayAtPlusDistance(device, data, pos, 0);
}
export function SoundPlayAtPlusDistance(device: SoundDevice | null, data: SoundRef, pos: Vec2,
  plusDistance: number): number {
  if (device == null || !device.isInitialised) return -1;
  const closestLeftEar = svec2_distance_squared(pos, device.earLeft1) < svec2_distance_squared(pos, device.earLeft2)
    ? device.earLeft1 : device.earLeft2;
  const closestRightEar = svec2_distance_squared(pos, device.earRight1) <
    svec2_distance_squared(pos, device.earRight2) ? device.earRight1 : device.earRight2;
  const origin = CalcClosestPointOnLineSegmentToPoint(closestLeftEar, closestRightEar, pos);
  let isMuffled = false;
  if (svec2_distance_squared(pos, origin) > SQUARED(TILE_WIDTH)) {
    if (!HasClearLineJMRaytrace(svec2i_assign_vec2(pos), svec2i_assign_vec2(origin), (v) => soundHooks.isPosNoSee(v))) {
      isMuffled = true;
    }
  }
  const dp = svec2_subtract(pos, origin);
  return SoundPlayAtPosition(gSoundDevice, data, svec2(dp.x, f32(Math.abs(dp.y) + plusDistance)), isMuffled);
}

export function SoundHalt(channel: number): void {
  if (gSoundDevice.player && channel >= 0) gSoundDevice.player.halt(channel);
}

