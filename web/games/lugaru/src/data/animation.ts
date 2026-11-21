// The original's animation files (Source/Animation/Animation.cpp):
//   int32 numFrames, int32 numJoints
//   per frame: numJoints * (float x,y,z), numJoints * float twist,
//              numJoints * byte onground, float speed
//   per frame: numJoints * float twist2
//   per frame: int32 label  (the C++ reads it with "Bf" into an int, i.e. the four
//                          big-endian bytes are the integer label)
//   int32 weaponTargetNum
//   per frame: 3 float weaponTarget
import { Reader } from './binary.ts';
import { type Vec3 } from './math.ts';

export interface AnimationJoint {
  position: Vec3;
  twist: number;
  twist2: number;
  onGround: boolean;
}

export interface AnimationFrame {
  joints: AnimationJoint[];
  speed: number;
  label: number;
  weaponTarget: Vec3;
}

export type AnimationHeight = 'lowheight' | 'middleheight' | 'highheight';
export type AnimationAttack = 'neutral' | 'normalattack' | 'reversed' | 'reversal';

export interface AnimationData {
  frames: AnimationFrame[];
  numJoints: number;
  height: AnimationHeight;
  attack: AnimationAttack;
  /** average of the last frame's joints below y=1, with y zeroed (Animation::offset) */
  offset: Vec3;
}

export interface AnimationDef {
  id: string;
  file: string;
  height: AnimationHeight;
  attack: AnimationAttack;
  bits: string;
}

export function parseAnimation(
  data: ArrayBuffer | Uint8Array,
  height: AnimationHeight = 'middleheight',
  attack: AnimationAttack = 'neutral',
): AnimationData {
  const r = new Reader(data);
  const numFrames = r.i32();
  const numJoints = r.i32();
  if (numFrames < 0 || numFrames > 1000 || numJoints <= 0 || numJoints > 100) {
    throw new Error(`bad animation header ${numFrames}/${numJoints}`);
  }
  const frames: AnimationFrame[] = new Array(numFrames);
  for (let f = 0; f < numFrames; f++) {
    const joints: AnimationJoint[] = new Array(numJoints);
    for (let j = 0; j < numJoints; j++) {
      joints[j] = { position: { x: r.f32(), y: r.f32(), z: r.f32() }, twist: 0, twist2: 0, onGround: false };
    }
    for (let j = 0; j < numJoints; j++) joints[j].twist = r.f32();
    for (let j = 0; j < numJoints; j++) joints[j].onGround = r.u8() !== 0;
    const speed = r.f32();
    frames[f] = { joints, speed, label: 0, weaponTarget: { x: 0, y: 0, z: 0 } };
  }
  for (let f = 0; f < numFrames; f++) {
    for (let j = 0; j < numJoints; j++) frames[f].joints[j].twist2 = r.f32();
  }
  for (let f = 0; f < numFrames; f++) frames[f].label = r.i32();
  // The shipped animation files end after the labels; the original reads a weapon-target
  // count and per-frame targets anyway (past EOF, unused). Tolerate either form.
  if (r.remaining >= 4) {
    const weaponTargetNum = r.i32();
    if (weaponTargetNum < 0) throw new Error(`bad weapon target count ${weaponTargetNum}`);
    for (let f = 0; f < numFrames; f++) {
      if (r.remaining >= 12) frames[f].weaponTarget = { x: r.f32(), y: r.f32(), z: r.f32() };
    }
  }
  let offset = { x: 0, y: 0, z: 0 };
  if (numFrames) {
    const last = frames[numFrames - 1];
    for (const j of last.joints) {
      if (j.position.y < 1) {
        offset.x += j.position.x;
        offset.y += j.position.y;
        offset.z += j.position.z;
      }
    }
    offset = { x: offset.x / numJoints, y: 0, z: offset.z / numJoints };
  }
  return { frames, numJoints, height, attack, offset };
}
