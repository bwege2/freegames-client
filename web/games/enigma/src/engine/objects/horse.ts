// ac_horse (actors/HorseActor.cc): an actor that runs from destination to destination.
import { Actor, GameObject, Register, GridPos, toBool, toDouble, toInt, XLevelRuntime, V2, type Value, type StoneContact, type Item } from '../core.ts';
import { destinationByIndexV } from './misc.ts';

const TRAITS = { name: 'ac_horse', radius: 24.0 / 64, mass: 1.2 };
class Horse extends Actor {
  strength = 10; destidx = 0; target = new V2(); destination: Value = null;
  steady = true; automove = false; newdest = false;
  constructor() { super(TRAITS); }
  traits() { return TRAITS; }
  getClass() { return 'ac_horse'; }
  protected afterClone() { super.afterClone(); this.target = this.target.clone(); }
  getAttr(key: string): Value {
    if (key === 'destination') return this.destination;
    if (key === 'destidx') return this.destidx;
    if (key === 'steady') return this.steady;
    if (key === 'strength') return this.strength;
    return super.getAttr(key);
  }
  setAttr(key: string, val: Value) {
    if (key === 'destination') {
      this.destination = val === undefined ? null : val;
      if (this.destination === null) this.automove = false; else { this.destidx = 0; this.newdest = true; }
    } else if (key === 'destidx') {
      this.destidx = toInt(val);
      if (this.destidx >= 0) this.newdest = true; else this.automove = false;
    } else if (key === 'steady') this.steady = toBool(val);
    else if (key === 'strength') { this.strength = toDouble(val); if (this.strength < 0) this.automove = false; }
    else super.setAttr(key, val);
    if (this.strength >= 0 && this.destidx >= 0 && this.destination !== null) this.automove = true;
  }
  is_dead() { return false; }
  think(dt: number) {
    if (this.automove) {
      this.updateTarget();
      if (this.automove) {
        const v = this.ai.vel, p = this.ai.pos;
        const dx = this.target.x - p.x, dy = this.target.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (!this.steady && (v.x * v.x + v.y * v.y) * 0.6 / this.strength > dist - 0.05) {
          const l = Math.sqrt(v.x * v.x + v.y * v.y);
          const nx = l ? v.x / l : v.x, ny = l ? v.y / l : v.y;
          this.add_force(-nx * this.strength, -ny * this.strength);
        } else {
          const nx = dist ? dx / dist : dx, ny = dist ? dy / dist : dy;
          this.add_force(nx * this.strength, ny * this.strength);
        }
      }
    }
    super.think(dt);
  }
  afterStoneBounce(sc: StoneContact) {
    if (this.automove && sc.stonepos.eq(GridPos.of(this.target))) this.updateTarget(true);
    super.afterStoneBounce(sc);
  }
  private dest(i: number) { return destinationByIndexV(this as unknown as Item, i); }
  private updateTarget(touched = false) {
    if (this.newdest) {
      const t = this.dest(this.destidx);
      if (!t) throw new XLevelRuntime('Horse actor missing valid destination');
      this.target = t;
      this.newdest = false;
    } else {
      const d = Math.sqrt((this.target.x - this.ai.pos.x) ** 2 + (this.target.y - this.ai.pos.y) ** 2);
      if (touched || d < (this.steady ? 0.2 : 0.1)) {
        const id = this.id;
        this.performAction(true);
        if (GameObject.getObject(id) && this.automove) {
          const t = this.dest(++this.destidx);
          if (t) this.target = t;
          else if (toBool(this.getAttr('loop'))) { this.destidx = 0; const t0 = this.dest(0); if (t0) this.target = t0; }
          else this.automove = false;
        }
      }
    }
  }
}
Register('ac_horse', new Horse());
