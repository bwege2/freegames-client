// The original's skeleton files (Source/Animation/Joint.cpp, Muscle.cpp, Skeleton::Load):
//   int32 numJoints
//   per joint: 3 float position, float length, float mass, byte hasparent, byte locked,
//              int32 modelnum, byte visible, byte sametwist, int32 label, int32 hasgun,
//              byte lower, int32 parentID
//   int32 numMuscles
//   per muscle: float length, targetlength, minlength, maxlength, strength, int32 type,
//               int32 numvertices, int32 vertices..., byte visible, int32 parent1, int32 parent2
//   int32 forwardJoint[3], int32 lowForwardJoint[3]
import { Reader } from './binary.ts';
import { type Vec3 } from './math.ts';

/** bodypart enum in Source/Animation/Joint.hpp */
export const BODYPART = {
  head: 0,
  neck: 1,
  leftshoulder: 2,
  leftelbow: 3,
  leftwrist: 4,
  lefthand: 5,
  rightshoulder: 6,
  rightelbow: 7,
  rightwrist: 8,
  righthand: 9,
  abdomen: 10,
  lefthip: 11,
  righthip: 12,
  groin: 13,
  leftknee: 14,
  leftankle: 15,
  leftfoot: 16,
  rightknee: 17,
  rightankle: 18,
  rightfoot: 19,
} as const;

export interface Joint {
  position: Vec3;
  length: number;
  mass: number;
  hasParent: boolean;
  locked: boolean;
  modelNum: number;
  visible: boolean;
  sameTwist: boolean;
  /** one of BODYPART */
  label: number;
  hasGun: number;
  lower: boolean;
  parent: number;
}

export interface Muscle {
  length: number;
  targetLength: number;
  minLength: number;
  maxLength: number;
  strength: number;
  /** 0 boneconnect, 1 constraint, 2 muscle */
  type: number;
  vertices: number[];
  verticesLow: number[];
  visible: boolean;
  parent1: number;
  parent2: number;
}

export interface SkeletonData {
  joints: Joint[];
  muscles: Muscle[];
  forwardJoints: [number, number, number];
  lowForwardJoints: [number, number, number];
}

export function parseSkeleton(data: ArrayBuffer | Uint8Array): SkeletonData {
  const r = new Reader(data);
  const numJoints = r.i32();
  if (numJoints <= 0 || numJoints > 100) throw new Error(`bad skeleton joint count ${numJoints}`);
  const joints: Joint[] = [];
  for (let i = 0; i < numJoints; i++) {
    const position = { x: r.f32(), y: r.f32(), z: r.f32() };
    const length = r.f32();
    const mass = r.f32();
    const hasParent = r.u8() !== 0;
    const locked = r.u8() !== 0;
    const modelNum = r.i32();
    const visible = r.u8() !== 0;
    const sameTwist = r.u8() !== 0;
    const label = r.i32();
    const hasGun = r.i32();
    const lower = r.u8() !== 0;
    const parent = r.i32();
    joints.push({ position, length, mass, hasParent, locked, modelNum, visible, sameTwist, label, hasGun, lower, parent });
  }
  const numMuscles = r.i32();
  if (numMuscles < 0 || numMuscles > 1000) throw new Error(`bad skeleton muscle count ${numMuscles}`);
  const muscles: Muscle[] = [];
  for (let i = 0; i < numMuscles; i++) {
    const length = r.f32();
    const targetLength = r.f32();
    const minLength = r.f32();
    const maxLength = r.f32();
    const strength = r.f32();
    const type = r.i32();
    const numVertices = r.i32();
    const vertices: number[] = [];
    for (let j = 0; j < numVertices; j++) vertices.push(r.i32());
    const visible = r.u8() !== 0;
    const parent1 = r.i32();
    const parent2 = r.i32();
    muscles.push({
      length, targetLength, minLength, maxLength, strength, type, vertices,
      verticesLow: [], visible, parent1, parent2,
    });
  }
  const forwardJoints: [number, number, number] = [r.i32(), r.i32(), r.i32()];
  const lowForwardJoints: [number, number, number] = [r.i32(), r.i32(), r.i32()];
  return { joints, muscles, forwardJoints, lowForwardJoints };
}
