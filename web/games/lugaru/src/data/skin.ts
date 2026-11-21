// The original's muscle-driven character deformation (Source/Animation/Skeleton.cpp
// FindForwards/FindRotationMuscle, Skeleton::Load and Person::DrawSkeleton). The skeleton
// joints are absolute points; each model vertex belongs to a muscle between two joints.
// Skeleton::Load bakes the rest-pose muscle rotation into the vertex; DrawSkeleton applies
// the inverse of the current rotation and the current joint midpoint.
import { type Vec3, doRotation, normalize, vadd, vsub, vmul, vcross, distance } from './math.ts';
import { type SolidModel } from './model.ts';
import { BODYPART, type SkeletonData, type Muscle, type Joint } from './skeleton.ts';

export interface MuscleRotation {
  r1: number;
  r2: number;
  r3: number;
}

export interface SpecialForwards {
  forward: Vec3;
  lowForward: Vec3;
  special: [Vec3, Vec3, Vec3, Vec3, Vec3];
}

export interface BakedVertex {
  muscle: number;
  /** the rest-pose baked offset, in model units */
  offset: Vec3;
}

const finite = (n: number, fallback = 0): number => (Number.isFinite(n) ? n : fallback);

export function specialForwards(joints: Joint[], skeleton: SkeletonData): SpecialForwards {
  const p = (i: number) => joints[i].position;
  const [f0, f1, f2] = skeleton.forwardJoints;
  const [l0, l1, l2] = skeleton.lowForwardJoints;
  const forward = normalize(vcross(vsub(p(f1), p(f0)), vsub(p(f2), p(f0))));
  const lowForward = normalize(vcross(vsub(p(l1), p(l0)), vsub(p(l2), p(l0))));
  const special: [Vec3, Vec3, Vec3, Vec3, Vec3] = [forward, forward, forward, forward, forward];
  special[0] = forward;
  special[1] = normalize(vadd(
    vsub(p(BODYPART.rightelbow), vmul(vadd(p(BODYPART.rightshoulder), p(BODYPART.rightwrist)), 0.5)),
    vmul(forward, 0.4),
  ));
  special[2] = normalize(vadd(
    vsub(p(BODYPART.leftelbow), vmul(vadd(p(BODYPART.leftshoulder), p(BODYPART.leftwrist)), 0.5)),
    vmul(forward, 0.4),
  ));
  special[3] = normalize(vadd(
    vsub(vmul(vadd(p(BODYPART.righthip), p(BODYPART.rightankle)), 0.5), p(BODYPART.rightknee)),
    vmul(lowForward, 0.4),
  ));
  special[4] = normalize(vadd(
    vsub(vmul(vadd(p(BODYPART.lefthip), p(BODYPART.leftankle)), 0.5), p(BODYPART.leftknee)),
    vmul(lowForward, 0.4),
  ));
  return { forward, lowForward, special };
}

function forwardFor(muscle: Muscle, joints: Joint[], forwards: SpecialForwards): Vec3 {
  const label = joints[muscle.parent1]?.label ?? BODYPART.head;
  switch (label) {
    case BODYPART.head: return forwards.special[0];
    case BODYPART.rightshoulder:
    case BODYPART.rightelbow:
    case BODYPART.rightwrist:
    case BODYPART.righthand: return forwards.special[1];
    case BODYPART.leftshoulder:
    case BODYPART.leftelbow:
    case BODYPART.leftwrist:
    case BODYPART.lefthand: return forwards.special[2];
    case BODYPART.righthip:
    case BODYPART.rightknee:
    case BODYPART.rightankle:
    case BODYPART.rightfoot: return forwards.special[3];
    case BODYPART.lefthip:
    case BODYPART.leftknee:
    case BODYPART.leftankle:
    case BODYPART.leftfoot: return forwards.special[4];
    default: return joints[muscle.parent1]?.lower ? forwards.lowForward : forwards.forward;
  }
}

/** Source/Animation/Skeleton.cpp FindRotationMuscle, with `free == 0`. */
export function findRotationMuscle(
  muscle: Muscle,
  joints: Joint[],
  forwards: SpecialForwards,
): MuscleRotation {
  const p1 = joints[muscle.parent1]?.position ?? { x: 0, y: 0, z: 0 };
  const p2 = joints[muscle.parent2]?.position ?? { x: 0, y: 0, z: 0 };
  let dist = distance(p1, p2);
  let r2 = 0;
  if (dist > 0) r2 = (Math.asin(Math.max(-1, Math.min(1, (p1.y - p2.y) / dist))) * 180) / Math.PI;
  let flat1 = { x: p1.x, y: 0, z: p1.z };
  const flat2 = { x: p2.x, y: 0, z: p2.z };
  dist = distance(flat1, flat2);
  let r1 = 0;
  if (dist > 0) {
    r1 = (Math.acos(Math.max(-1, Math.min(1, (flat1.z - flat2.z) / dist))) * 180) / Math.PI;
    if (flat1.x > flat2.x) r1 = 360 - r1;
  }
  let fwd = forwardFor(muscle, joints, forwards);
  const label1 = joints[muscle.parent1]?.label;
  const label2 = joints[muscle.parent2]?.label;
  if (label1 === BODYPART.rightfoot || label2 === BODYPART.rightfoot ||
      label1 === BODYPART.leftfoot || label2 === BODYPART.leftfoot) {
    fwd = { x: fwd.x, y: fwd.y - 0.3, z: fwd.z };
  }
  fwd = doRotation(fwd, 0, r1 - 90, 0);
  fwd = doRotation(fwd, 0, 0, r2 - 90);
  fwd = { x: fwd.x, y: 0, z: fwd.z };
  const l = Math.hypot(fwd.x, fwd.z);
  if (l < 1e-9) return { r1: finite(r1), r2: finite(r2), r3: 0 };
  fwd = { x: fwd.x / l, y: 0, z: fwd.z / l };
  let r3 = (Math.acos(Math.max(-1, Math.min(1, -fwd.z))) * 180) / Math.PI;
  if (0 > fwd.x) r3 = 360 - r3;
  return { r1: finite(r1), r2: finite(r2), r3: finite(r3) };
}

export function allMuscleRotations(
  joints: Joint[],
  skeleton: SkeletonData,
  forwards = specialForwards(joints, skeleton),
): MuscleRotation[] {
  return skeleton.muscles.map((m) => findRotationMuscle(m, joints, forwards));
}

/**
 * Bake the rest pose into every model vertex: the equivalent of Skeleton::Load's
 * model[k].vertex[i] = rotate3(rotate2-90(rotate1-90(vertex - mid))).
 * `model` must already be rotated/scaled as the original does before this step.
 */
export function bakeCharacterModel(model: SolidModel, skeleton: SkeletonData): BakedVertex[] {
  const joints = skeleton.joints;
  const forwards = specialForwards(joints, skeleton);
  const rotations = allMuscleRotations(joints, skeleton, forwards);
  const owner = new Int32Array(model.vertices.length).fill(-1);
  for (let m = 0; m < skeleton.muscles.length; m++) {
    for (const v of skeleton.muscles[m].vertices) {
      if (v >= 0 && v < owner.length) owner[v] = m;
    }
  }
  const baked: BakedVertex[] = new Array(model.vertices.length);
  for (let i = 0; i < model.vertices.length; i++) {
    const m = owner[i];
    if (m < 0) {
      baked[i] = { muscle: 0, offset: { x: 0, y: 0, z: 0 } };
      continue;
    }
    const muscle = skeleton.muscles[m];
    const p1 = joints[muscle.parent1].position;
    const p2 = joints[muscle.parent2].position;
    const mid = vmul(vadd(p1, p2), 0.5);
    const v = vsub(model.vertices[i], mid);
    const r = rotations[m];
    let bakedV = doRotation(v, 0, r.r1 - 90, 0);
    bakedV = doRotation(bakedV, 0, 0, r.r2 - 90);
    bakedV = doRotation(bakedV, 0, r.r3, 0);
    baked[i] = { muscle: m, offset: bakedV };
  }
  return baked;
}

/** The runtime half: mid + R(-r1+90) R(-r2+90) R(-r3) * offset. */
export function deformCharacter(
  baked: BakedVertex[],
  skeleton: SkeletonData,
  joints: Joint[],
  out: Float32Array,
): void {
  const forwards = specialForwards(joints, skeleton);
  const rotations = allMuscleRotations(joints, skeleton, forwards);
  for (let i = 0; i < baked.length; i++) {
    const b = baked[i];
    const muscle = skeleton.muscles[b.muscle];
    const p1 = joints[muscle.parent1].position;
    const p2 = joints[muscle.parent2].position;
    const mid = vmul(vadd(p1, p2), 0.5);
    const r = rotations[b.muscle];
    let v = doRotation(b.offset, 0, -r.r3, 0);
    v = doRotation(v, 0, 0, -r.r2 + 90);
    v = doRotation(v, 0, -r.r1 + 90, 0);
    out[i * 3] = mid.x + v.x;
    out[i * 3 + 1] = mid.y + v.y;
    out[i * 3 + 2] = mid.z + v.z;
  }
}
