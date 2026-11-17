// ac_rotor and ac_top (actors/Rotors.cc) and the ActorsInRangeIterator of actors.cc.
import { Actor, Register, toBool, toDouble, DoubleRand, SendMessage, player, isMarbleOrPearl, len, type Value, type ActorTraits } from '../core.ts';

/** ActorsInRangeIterator: walks the x-sorted actor list left, then right, from the center actor */
function actorsInRange(center: Actor, range: number, accept: (a: Actor) => boolean): Actor[] {
  const out: Actor[] = [];
  const xc = center.ai.pos.x;
  let cur: Actor | null = center;
  let left = true;
  for (;;) {
    if (cur) cur = left ? cur.left : cur.right;
    const cand = cur && Math.abs(xc - cur.ai.pos.x) <= range;
    if (cand) {
      if (accept(cur!) && len(cur!.ai.pos.x - center.ai.pos.x, cur!.ai.pos.y - center.ai.pos.y) < range) out.push(cur!);
    } else if (left) { left = false; cur = center; }
    else break;
  }
  return out;
}

abstract class RotorBase extends Actor {
  range = 5; force = 10; gohome = true; attacknearest = false; prefercurrent = 0;
  attackCurrentOnly = false; keepTime = 0;
  constructor(tr: ActorTraits) {
    super(tr);
    this.setAttr('range', 5.0); this.setAttr('strength', 10.0); this.setAttr('gohome', true);
    this.setAttr('attacknearest', false); this.setAttr('prefercurrent', 0.0);
  }
  setAttr(key: string, val: Value) {
    if (key === 'range') this.range = toDouble(val);
    else if (key === 'strength') this.force = toDouble(val);
    else if (key === 'gohome') this.gohome = toBool(val);
    else if (key === 'attacknearest') this.attacknearest = toBool(val);
    else if (key === 'prefercurrent') this.prefercurrent = toDouble(val);
    super.setAttr(key, val);
  }
  is_dead() { return false; }
  think(dt: number) {
    const cforce = this.force / 6;
    let target: Actor | null = null;
    let tx = 0, ty = 0;
    this.keepTime -= dt;
    if (this.keepTime < 0) {
      this.keepTime = DoubleRand(0.8, 1.6);
      this.attackCurrentOnly = DoubleRand(0.0, 1.0) < this.prefercurrent;
    }
    for (const a of actorsInRange(this, this.range, isMarbleOrPearl)) {
      if (!a.is_movable() || a.is_invisible()) continue;
      const vx = a.ai.pos.x - this.ai.pos.x, vy = a.ai.pos.y - this.ai.pos.y;
      if ((this.attacknearest && !this.attackCurrentOnly) || (this.attackCurrentOnly && a === player.mainActor(player.current))) {
        if (!target || len(vx, vy) < len(tx, ty)) { target = a; tx = vx; ty = vy; }
      } else if (!this.attackCurrentOnly) {
        target = a;
        const l = len(vx, vy);
        tx += vx / l; ty += vy / l;
      }
    }
    if (!target && this.gohome) { const r = this.get_respawnpos(); tx = r.x - this.ai.pos.x; ty = r.y - this.ai.pos.y; }
    const d = len(tx, ty);
    if (d > 0.2) { tx /= d; ty /= d; }
    this.add_force(tx * cforce, ty * cforce);
    super.think(dt);
  }
}
class Rotor extends RotorBase {
  constructor() { super({ name: 'ac_rotor', radius: 22.0 / 64, mass: 0.8 }); }
  traits() { return { name: 'ac_rotor', radius: 22.0 / 64, mass: 0.8 }; }
  getClass() { return 'ac_rotor'; }
  on_collision(a: Actor) { if (a.is_on_floor()) SendMessage(a, '_shatter'); return false; }
}
class Top extends RotorBase {
  constructor() { super({ name: 'ac_top', radius: 16.0 / 64, mass: 0.8 }); }
  traits() { return { name: 'ac_top', radius: 16.0 / 64, mass: 0.8 }; }
  getClass() { return 'ac_top'; }
  on_collision(a: Actor) { SendMessage(a, '_shatter'); return true; }
}
Register('ac_rotor', new Rotor());
Register('ac_top', new Top());
