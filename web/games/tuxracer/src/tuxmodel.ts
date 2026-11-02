// Tux's model from the original's tux.tcl: the scene graph the Tcl script builds (spheres with
// transforms), its materials, joints and the intro keyframes, extracted to model.json by
// re/tuxracer/tools/extract.tcl. The renderer rebuilds the graph with three.js and applies the
// original's joint angles (src/tux.c) and trick rotations (src/phys_sim.c adjust_orientation).
import * as THREE from 'three';
import model from '../assets/model.json';

interface ModelNode {
  type: 'transform' | 'sphere' | 'root' | string;
  parent: string | null;
  ops: ({ op: 'rotate'; axis: string; angle: number }
    | { op: 'translate'; v: number[] }
    | { op: 'scale'; origin: number[]; factor: number[] })[];
  material?: string;
  resolution?: number;
  shadow?: boolean;
  eye?: string;
}
interface ModelData {
  root: string;
  nodes: Record<string, ModelNode>;
  materials: Record<string, { diffuse: number[]; specular: number[]; shine: number }>;
  joints: Record<string, string>;
  keyframes: number[][];
}

const MODEL = model as unknown as ModelData;
const DEG = Math.PI / 180;

export interface TuxJoints {
  turnFact: number;
  braking: boolean;
  paddlingFactor: number;
  speed: number;
  localForceZ: number;
  flapFactor: number;
}

export class TuxView {
  readonly root = new THREE.Group();
  private readonly groups: Record<string, THREE.Group> = {};
  private readonly jointGroups: Record<string, THREE.Group> = {};
  private readonly sphereGeometries = new Map<number, THREE.SphereGeometry>();
  private readonly materials = new Map<string, THREE.MeshPhongMaterial>();

  constructor() {
    const children: Record<string, string[]> = {};
    for (const [name, node] of Object.entries(MODEL.nodes)) {
      if (node.parent) (children[node.parent] ??= []).push(name);
    }
    const build = (name: string, inherited?: string): THREE.Group => {
      const node = MODEL.nodes[name];
      const materialName = node.material ?? inherited;
      const start = new THREE.Group();
      let cur = start;
      for (const op of node.ops) {
        if (op.op === 'rotate') {
          const g = new THREE.Group();
          if (op.axis === 'x') g.rotation.x = op.angle * DEG;
          else if (op.axis === 'y') g.rotation.y = op.angle * DEG;
          else g.rotation.z = op.angle * DEG;
          cur.add(g); cur = g;
        } else if (op.op === 'translate') {
          const g = new THREE.Group();
          g.position.set(op.v[0], op.v[1], op.v[2]);
          cur.add(g); cur = g;
        } else {
          const a = new THREE.Group(); a.position.set(-op.origin[0], -op.origin[1], -op.origin[2]);
          const b = new THREE.Group(); b.scale.set(op.factor[0], op.factor[1], op.factor[2]);
          const c = new THREE.Group(); c.position.set(op.origin[0], op.origin[1], op.origin[2]);
          cur.add(a); a.add(b); b.add(c); cur = c;
        }
      }
      const anim = new THREE.Group();
      cur.add(anim);
      this.groups[name] = anim;
      if (node.type === 'sphere') {
        const div = Math.min(16, Math.max(3, Math.round(6 * (node.resolution ?? 1))));
        let geom = this.sphereGeometries.get(div);
        if (!geom) {
          geom = new THREE.SphereGeometry(1, 2 * div, div);
          this.sphereGeometries.set(div, geom);
        }
        let mat = materialName ? this.materials.get(materialName) : undefined;
        if (!mat) {
          const m = materialName ? MODEL.materials[materialName] : undefined;
          mat = m
            ? new THREE.MeshPhongMaterial({
              color: new THREE.Color(m.diffuse[0], m.diffuse[1], m.diffuse[2]),
              specular: new THREE.Color(m.specular[0], m.specular[1], m.specular[2]),
              shininess: m.shine,
            })
            : new THREE.MeshPhongMaterial({ color: 0x0000ff, shininess: 0 });
          if (materialName) this.materials.set(materialName, mat);
        }
        anim.add(new THREE.Mesh(geom, mat));
      }
      for (const child of children[name] ?? []) anim.add(build(child, materialName));
      return start;
    };
    this.root.add(build(MODEL.root));
    for (const [joint, name] of Object.entries(MODEL.joints)) {
      if (this.groups[name]) this.jointGroups[joint] = this.groups[name];
    }
  }

  /** The keys of the intro, applied to the root (src/keyframe.c update_key_frame). */
  setKeyFrame(time: number, findY: (x: number, z: number) => number, startX: number, startY: number): boolean {
    const frames = MODEL.keyframes;
    let idx = 1;
    while (idx < frames.length && time >= frames[idx][0]) idx++;
    if (idx >= frames.length) return false;
    const a = frames[idx - 1], b = frames[idx];
    const frac = Math.abs(a[0] - b[0]) < 1e-13 ? 1 : (time - b[0]) / (a[0] - b[0]);
    const lerp = (i: number) => frac * a[i] + (1 - frac) * b[i];
    const x = lerp(1) + startX;
    const z = -lerp(2) + startY;
    const y = lerp(3) + findY(x, z);
    this.root.position.set(x, y, z);
    this.root.quaternion.setFromEuler(new THREE.Euler(lerp(5) * DEG, lerp(4) * DEG, 0, 'YXZ'));
    this.rotateJoint('leftShoulder', 'z', lerp(6));
    this.rotateJoint('rightShoulder', 'z', lerp(7));
    this.rotateJoint('leftHip', 'z', lerp(8));
    this.rotateJoint('rightHip', 'z', lerp(9));
    return true;
  }

  /** The original's adjust_tux_joints(). */
  applyJoints(o: TuxJoints): void {
    const MAX_ARM_ANGLE = 30, MAX_PADDLING_ANGLE = 35, MAX_EXT_PADDLING_ANGLE = 30, MAX_KICK_PADDLING_ANGLE = 20;
    const paddling = MAX_PADDLING_ANGLE * Math.sin(o.paddlingFactor * Math.PI);
    const ext = MAX_EXT_PADDLING_ANGLE * Math.sin(o.paddlingFactor * Math.PI);
    const kick = MAX_KICK_PADDLING_ANGLE * Math.sin(o.paddlingFactor * Math.PI * 2);
    const turnLeft = Math.max(-o.turnFact, 0) * MAX_ARM_ANGLE;
    const turnRight = Math.max(o.turnFact, 0) * MAX_ARM_ANGLE;
    const brake = o.braking ? MAX_ARM_ANGLE : 0;
    const flap = MAX_ARM_ANGLE * (0.5 + 0.5 * Math.sin(Math.PI * o.flapFactor * 6 - Math.PI / 2));
    const forceAngle = Math.max(-20, Math.min(20, -o.localForceZ / 300));
    const turnLeg = o.turnFact * 10;
    this.rotateJoint('leftShoulder', 'z', Math.min(brake + paddling + turnLeft, MAX_ARM_ANGLE) + flap);
    this.rotateJoint('rightShoulder', 'z', Math.min(brake + paddling + turnRight, MAX_ARM_ANGLE) + flap);
    this.rotateJoint('leftShoulder', 'y', -ext);
    this.rotateJoint('rightShoulder', 'y', ext);
    this.rotateJoint('leftHip', 'z', -20 + turnLeg + forceAngle);
    this.rotateJoint('rightHip', 'z', -20 - turnLeg + forceAngle);
    this.rotateJoint('leftKnee', 'z', -10 + turnLeg - Math.min(35, o.speed) + kick + forceAngle);
    this.rotateJoint('rightKnee', 'z', -10 - turnLeg - Math.min(35, o.speed) - kick + forceAngle);
    this.rotateJoint('leftAnkle', 'z', -20 + Math.min(50, o.speed));
    this.rotateJoint('rightAnkle', 'z', -20 + Math.min(50, o.speed));
    this.rotateJoint('tail', 'z', o.turnFact * 20);
    this.rotateJoint('neck', 'z', -50);
    this.rotateJoint('head', 'z', -30);
    this.rotateJoint('head', 'y', -o.turnFact * 70);
  }

  private rotateJoint(joint: string, axis: 'x' | 'y' | 'z', angle: number): void {
    const g = this.jointGroups[joint];
    if (!g) return;
    if (axis === 'z') g.rotation.z = angle * DEG;
    else if (axis === 'y') g.rotation.y = angle * DEG;
    else g.rotation.x = angle * DEG;
  }

  resetJoints(): void {
    for (const g of Object.values(this.jointGroups)) g.rotation.set(0, 0, 0);
  }
}

export const TUX_MODEL = MODEL;
