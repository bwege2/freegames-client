// Madness Interactive Reloaded port (GPL-3.0). Ragdolls: Character/Ragdoll.cs (BuildDefaultRagdoll),
// Physics/Systems/VerletPhysicsSystem.cs (200 steps per second), Components/VerletNodeComponent.cs, VerletLinkComponent.cs,
// MadnessUtils.TurnIntoRagdoll, RagdollLifetimeSystem.cs and RagdollSleepingSystem.cs.
import { transformNormal, transformPoint, type Transform } from '../engine/matrix.ts';
import { Layers, nearestPoint, sampleNormal } from '../engine/physics.ts';
import {
  add, dist, len, lenSq, mul, nanFallbackV, normalize, pickRandom, smoothAngleApproach, smoothApproachV, sub, v2, vectorToAngle, type Vec2, dot,
} from '../engine/util.ts';
import type { AnimatedLimb, BodyPart, Character } from './character.ts';
import type { Scene } from './scene.ts';
import { SOUNDS } from './combat.ts';

export class VerletNode {
  position: Vec2;
  previousPosition: Vec2;
  acceleration = v2();
  previousVelocity = v2();
  friction = 1;
  radius: number;
  mass: number;
  constructor(p: Vec2, radius: number, mass = 1) { this.position = { ...p }; this.previousPosition = { ...p }; this.radius = radius; this.mass = mass; }
}
const Mode = { Keep: 0, Max: 1, Min: 2, MinMax: 3 } as const;
type Mode = number;
interface Link { a: VerletNode; b: VerletNode; target: number; mode: Mode; minMax: Vec2 }
interface TransformLink { up: VerletNode; center: VerletNode; transform: Transform; localOffset: Vec2; localRotationalOffset: number }

const GRAVITY = v2(0, -20);
const RATE = 200;

const projectOnPlane = (v: Vec2, n: Vec2): Vec2 => sub(v, mul(n, dot(v, n)));

export class Ragdoll {
  nodes: VerletNode[] = [];
  links: Link[] = [];
  transforms: TransformLink[] = [];
  lifetime = 0;
  sleepingTime = 0;
  shouldDelete = true;
  private nodeOf = new Map<unknown, VerletNode>();
  readonly character: Character;
  constructor(character: Character) { this.character = character; }
  /** a bullet hitting a ragdoll: VerletNodeComponent.Acceleration on the body part's node */
  push(part: BodyPart, acc: Vec2): void {
    const n = this.nodeOf.get(part);
    if (n) n.acceleration = add(n.acceleration, acc);
  }
  static build(_s: Scene, c: Character, center: Vec2): Ragdoll {
    const r = new Ragdoll(c);
    const pos = c.positioning;
    const scale = pos.scale;
    const fl = pos.isFlipped ? -1 : 1;
    const head = pos.head;
    const body = pos.body;
    const node = (origin: AnimatedLimb & { impact?: { translation: Vec2 }; velocity?: Vec2 }, local: Vec2, t: Transform, radius: number, mass = 1): VerletNode => {
      const n = new VerletNode(transformPoint(local, t.localToWorld), 17 * scale, 1);
      n.radius = radius;
      n.mass = mass;
      if (origin.impact) {
        n.acceleration = add(n.acceleration, mul(origin.impact.translation, 1.9 + 1));
        if (len(n.acceleration) > 25) n.acceleration = mul(normalize(n.acceleration), 25);
      }
      if (origin.velocity) n.acceleration = add(n.acceleration, mul(origin.velocity, 0.01 * 0.2));
      r.nodes.push(n);
      return n;
    };
    const link = (a: VerletNode, b: VerletNode, mode: Mode = Mode.Keep, extra?: { target?: number; minMax?: Vec2 }): void => {
      r.links.push({ a, b, mode, target: extra?.target ?? dist(a.position, b.position), minMax: extra?.minMax ?? v2() });
    };
    const tlink = (t: Transform, up: VerletNode, cn: VerletNode, rotOffset?: number): void => {
      const upVec = normalize(sub(up.position, cn.position));
      const right = v2(upVec.y, -upVec.x);
      r.transforms.push({
        transform: t, up, center: cn,
        localRotationalOffset: rotOffset ?? t.rotation - vectorToAngle(right),
        localOffset: transformNormal(sub(t.position, cn.position), t.worldToLocal),
      });
    };
    const h1 = node(head, v2(-0.25 * fl, -0.35), head.transform, 17 * scale);
    const h2 = node(head, v2(-0.25 * fl, 0.3), head.transform, 17 * scale);
    const nose = node(head, v2(0.4 * fl, 0), head.transform, 17 * scale);
    tlink(head.transform, h2, h1);
    link(h1, h2); link(h2, nose); link(nose, h1);
    const neck = node(body, v2(0, 0.3), body.transform, 60 * scale, 2);
    const b1 = node(body, v2(-0.25 * fl, 0), body.transform, 17 * scale);
    const b2 = node(body, v2(0.3 * fl, 0), body.transform, 17 * scale);
    const bottom = node(body, v2(0, -0.32), body.transform, 70 * scale, 5);
    tlink(body.transform, neck, bottom);
    link(neck, h2); link(neck, nose); link(h1, neck, Mode.Max);
    link(b2, nose, Mode.MinMax, { minMax: v2(107 * scale, 260 * scale) });
    link(bottom, nose, Mode.MinMax, { minMax: v2(300 * scale, 400 * scale) });
    link(bottom, nose, Mode.Min, { target: 230 * scale });
    link(b1, h2, Mode.Min, { target: 190 * scale });
    link(b1, b2); link(b1, neck); link(b2, neck); link(b1, bottom); link(neck, bottom); link(b2, bottom);
    const hand1 = pos.hands[0];
    const hand2 = pos.hands[1];
    const hn1 = node(hand1, v2(), hand1.transform, 25 * scale);
    const hn2 = node(hand2, v2(), hand2.transform, 25 * scale);
    tlink(hand1.transform, neck, hn1);
    r.transforms[r.transforms.length - 1].localRotationalOffset = -90;
    tlink(hand2.transform, neck, hn2);
    r.transforms[r.transforms.length - 1].localRotationalOffset = -90;
    link(hn1, neck, Mode.Max, { target: 280 * scale });
    link(hn2, neck, Mode.Max, { target: 280 * scale });
    r.nodeOf.set(head, h1);
    r.nodeOf.set(body, neck);
    void center;
    return r;
  }
}

/** VerletPhysicsSystem.Update over every ragdoll, with its fixed-rate distributor */
export class VerletSystem {
  private acc = 0;
  update(s: Scene, ragdolls: Ragdoll[]): void {
    const dt = s.clock.dt;
    this.acc += dt;
    let cycles = Math.floor(this.acc * RATE);
    this.acc -= cycles / RATE;
    cycles = Math.max(0, Math.min(256, cycles));
    for (let i = 0; i < cycles; i++) {
      for (const r of ragdolls) for (const n of r.nodes) this.solveMotion(s, n);
      for (const r of ragdolls) for (const l of r.links) solveConstraint(l);
    }
    for (const r of ragdolls) for (const t of r.transforms) {
      const center = t.center.position;
      const upVec = normalize(sub(t.up.position, center));
      const right = v2(upVec.y, -upVec.x);
      t.transform.rotation = smoothAngleApproach(t.transform.rotation, t.localRotationalOffset + vectorToAngle(right), 35, dt);
      t.transform.position = smoothApproachV(t.transform.position, add(center, transformNormal(t.localOffset, t.transform.localToWorld)), 35, dt);
      t.transform.recalc();
    }
  }
  private solveMotion(s: Scene, n: VerletNode): void {
    const ph = s.physics;
    n.position = nanFallbackV(n.position);
    n.previousPosition = nanFallbackV(n.previousPosition);
    let vel = sub(n.position, n.previousPosition);
    n.previousPosition = { ...n.position };
    vel = add(vel, mul(n.acceleration, 2));
    vel = add(vel, mul(GRAVITY, (1 / RATE) * 3));
    const hit = ph.raycast(n.position, vel, Math.max(len(vel), n.radius), Layers.BlockPhysics);
    if (hit) {
      vel = projectOnPlane(vel, hit.normal);
      n.position = add(nearestPoint(hit.body.collider, n.position), mul(hit.normal, n.radius));
      n.previousPosition = { ...n.position };
      n.position = add(n.position, mul(vel, 0.9));
    } else {
      let inside = ph.queryCircle(add(n.position, vel), n.radius, Layers.BlockPhysics);
      if (inside.length === 0) n.position = add(n.position, vel);
      else {
        let normal = v2();
        let it = 0;
        while (it < 100 && inside.length > 0) {
          normal = sampleNormal(inside[0].collider, n.position);
          n.position = add(n.position, mul(normal, 0.5));
          it++;
          inside = ph.queryCircle(add(n.position, vel), n.radius, Layers.BlockPhysics);
        }
        n.previousPosition = { ...n.position };
        vel = projectOnPlane(vel, normal);
        n.position = add(n.position, mul(vel, 1 - n.friction));
      }
    }
    n.acceleration = v2();
    if (lenSq(vel) < 10 && lenSq(sub(n.previousVelocity, vel)) > 65) s.audio.play(pickRandom(SOUNDS.softBodyImpact), 0.4);
    n.previousVelocity = vel;
  }
}

function solveConstraint(l: Link): void {
  const { a, b } = l;
  const aInf = b.mass / (a.mass + b.mass);
  const bInf = 1 - aInf;
  const d = len(sub(a.position, b.position));
  let target = l.target;
  switch (l.mode) {
    case Mode.Max: if (d <= target) return; break;
    case Mode.Min: if (d > target) return; break;
    case Mode.MinMax:
      if (d > l.minMax.x && d < l.minMax.y) return;
      target = d < l.minMax.x ? l.minMax.x : l.minMax.y;
      break;
    default: break;
  }
  const m = mul(add(a.position, b.position), 0.5);
  const diff = (d - target) * 0.45;
  a.position = add(a.position, mul(normalize(sub(m, a.position)), diff * aInf));
  b.position = add(b.position, mul(normalize(sub(m, b.position)), diff * bInf));
}

/** RagdollSleepingSystem + RagdollLifetimeSystem for one ragdoll: true when it should be stamped and removed */
export function ragdollLifetime(r: Ragdoll, dt: number): 'keep' | 'stamp' | 'delete' {
  let vx = 0;
  let vy = 0;
  for (const n of r.nodes) { vx = Math.max(vx, Math.abs(n.previousVelocity.x)); vy = Math.max(vy, Math.abs(n.previousVelocity.y)); }
  if (vx * vx + vy * vy < 100) r.sleepingTime += dt; else r.sleepingTime = 0;
  if (!r.shouldDelete) return 'keep';
  r.lifetime += dt;
  if (r.lifetime > 10 || r.sleepingTime > 2) return r.lifetime <= 10 ? 'stamp' : 'delete';
  return 'keep';
}
