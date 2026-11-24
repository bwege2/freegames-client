// 0 A.D.'s compiled skeleton animation format, PSA ("Pyrogenesis Skeleton Animation"), written
// by CSkeletonAnimDef::Save and read by CSkeletonAnimDef::Load (source/graphics/SkeletonAnimDef.cpp).
// The files have no bone names: key i is bone i of the model, in the model's own order.
//
// Header: char[4]="PSSA", u32 version, u32 payloadSize; string name; f32 frameTime (ms);
// u32 numKeys (bones); u32 numFrames; keys: translation 3f, rotation 4f xyzw (28 bytes each).
//
// BuildBoneMatrices (the original's sampler) is reproduced in sample(): linear translation, slerp
// rotation, frame index modulo frames, and a non-looping animation holds its final frame instead
// of interpolating back to the first.

import { Quaternion, Vector3 } from 'three';

export interface PsaKey {
  translation: Vector3;
  rotation: Quaternion;
}

export interface PsaAnimation {
  name: string;
  frameTime: number;
  numKeys: number;
  numFrames: number;
  keys: PsaKey[];
  duration: number;
}

export function parsePsa(buffer: ArrayBuffer): PsaAnimation {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const magic = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  if (magic !== 'PSSA') throw new Error(`PSA: bad magic ${JSON.stringify(magic)}`);
  const version = view.getUint32(4, true);
  const payload = view.getUint32(8, true);
  if (payload !== buffer.byteLength - 12) throw new Error(`PSA: payload ${payload}, file ${buffer.byteLength - 12}`);
  if (version !== 1) throw new Error(`PSA: unsupported version ${version}`);
  let o = 12;
  const length = view.getUint32(o, true); o += 4;
  if (o + length > buffer.byteLength) throw new Error('PSA: truncated name');
  const name = new TextDecoder().decode(bytes.subarray(o, o + length)); o += length;
  const frameTime = view.getFloat32(o, true); o += 4;
  const numKeys = view.getUint32(o, true); o += 4;
  const numFrames = view.getUint32(o, true); o += 4;
  const count = numKeys * numFrames;
  if (o + count * 28 !== buffer.byteLength) throw new Error(`PSA: ${count} keys need ${count * 28} bytes, have ${buffer.byteLength - o}`);
  const keys: PsaKey[] = new Array(count);
  for (let i = 0; i < count; i++) {
    keys[i] = {
      translation: new Vector3(view.getFloat32(o, true), view.getFloat32(o + 4, true), view.getFloat32(o + 8, true)),
      rotation: new Quaternion(view.getFloat32(o + 12, true), view.getFloat32(o + 16, true), view.getFloat32(o + 20, true), view.getFloat32(o + 24, true)),
    };
    o += 28;
  }
  if (!(frameTime > 0) || numFrames < 1 || numKeys < 1) throw new Error(`PSA: bad header ${frameTime}ms ${numKeys} keys ${numFrames} frames`);
  return { name, frameTime, numKeys, numFrames, keys, duration: frameTime * numFrames };
}

/**
 * The original CSkeletonAnimDef::BuildBoneMatrices at `time` ms: write translation+rotation per
 * bone into `out`. `loop` false holds the final frame after the end (death animations).
 */
export function samplePsa(anim: PsaAnimation, time: number, loop: boolean, out: PsaKey[]): PsaKey[] {
  const fstart = time / anim.frameTime;
  let start = Math.floor(fstart);
  const delta = fstart - start;
  start %= anim.numFrames;
  if (start < 0) start += anim.numFrames;
  let end = (start + 1) % anim.numFrames;
  if (!loop && end === 0) {
    for (let i = 0; i < anim.numKeys; i++) {
      const key = anim.keys[start * anim.numKeys + i];
      if (!out[i]) out[i] = { translation: new Vector3(), rotation: new Quaternion() };
      out[i].translation.copy(key.translation);
      out[i].rotation.copy(key.rotation);
    }
    return out;
  }
  for (let i = 0; i < anim.numKeys; i++) {
    const a = anim.keys[start * anim.numKeys + i];
    const b = anim.keys[end * anim.numKeys + i];
    if (!out[i]) out[i] = { translation: new Vector3(), rotation: new Quaternion() };
    out[i].translation.lerpVectors(a.translation, b.translation, delta);
    out[i].rotation.slerpQuaternions(a.rotation, b.rotation, delta);
  }
  return out;
}
