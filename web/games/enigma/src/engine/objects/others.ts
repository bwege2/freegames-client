// Objects without a grid position (others/*.cc): ot_timer (TimerGadget.cc), ot_counter (CounterGadget.cc),
// ot_wire (Wire.cc) and ot_rubberband (Rubberband.cc).
import {
  Other, Actor, Stone, GameObject, Register, GameTimer, KillOther, SendMessage, display, server, XLevelRuntime, V2,
  toBool, toInt, toDouble, toObject, objValue, getObjectList, makeGroup, ACTOR, STONE,
  type Message, type Value, type TimeHandler,
} from '../core.ts';
import type { RubberHandle } from '../display.ts';

const OBJBIT_ADDED = 1 << 24;

// ----- ot_timer
const OFF = 0, ON = 1, ON_TRUE = 2; // ON_FALSE = 3
class TimerGadget extends Other implements TimeHandler {
  constructor() { super(); this.state = ON; }
  getClass() { return 'ot_timer'; }
  externalState() { return this.state === OFF ? 0 : 1; }
  setState(ext: number) {
    if (this.objFlags & OBJBIT_ADDED) {
      if (ext !== this.externalState()) {
        this.state = ext;
        if (ext === 1) this.updateAlarm(); else GameTimer.remove_alarm(this);
      }
    } else this.state = ext;
  }
  postAddition() { this.objFlags |= OBJBIT_ADDED; this.updateAlarm(); super.postAddition(); }
  preRemoval() { this.objFlags &= ~OBJBIT_ADDED; super.preRemoval(); }
  dispose() { GameTimer.remove_alarm(this); super.dispose(); }
  alarm() {
    const actionValue = this.state === ON_TRUE;
    this.state ^= 1; // ON_TRUE <-> ON_FALSE
    if (!toBool(this.getAttr('loop'))) this.setState(OFF);
    this.performAction(actionValue);
  }
  private updateAlarm() {
    if (this.state === ON) {
      this.state = ON_TRUE;
      GameTimer.set_alarm(this, toDouble(this.getAttr('interval')), toBool(this.getAttr('loop')));
    }
  }
}
Register('ot_timer', new TimerGadget());

// ----- ot_counter
class CounterGadget extends Other {
  getClass() { return 'ot_counter'; }
  setAttr(key: string, val: Value) {
    if (key === 'state') { this.state = toInt(val); return; }
    super.setAttr(key, val);
  }
  message(m: Message): Value {
    if (m.message === 'signal') {
      if (toBool(m.value)) this.state++; else this.state--;
      const t = this.getAttr(`target_${this.state}`), a = this.getAttr(`action_${this.state}`);
      if ((t !== undefined && t !== null) || (a !== undefined && a !== null)) this.performAction(true);
      return null;
    }
    return super.message(m);
  }
}
Register('ot_counter', new CounterGadget());

// fellows/rubbers/wires lists of the anchors (ObjectList attributes)
function listOf(o: GameObject, key: string): (GameObject | null)[] { return getObjectList(o.getAttr(key), null); }
function setList(o: GameObject, key: string, l: (GameObject | null)[]) { o.setAttr(key, makeGroup(l)); }
function removeFirst(l: (GameObject | null)[], x: GameObject) { const i = l.indexOf(x); if (i >= 0) l.splice(i, 1); }
function removeAll(l: (GameObject | null)[], x: GameObject) { for (let i = l.length - 1; i >= 0; i--) if (l[i] === x) l.splice(i, 1); }

// ----- ot_wire
class Wire extends Other {
  anchor1: Stone | null = null; anchor2: Stone | null = null; model: RubberHandle | null = null;
  getClass() { return 'ot_wire'; }
  setAttr(key: string, val: Value) {
    if (key === 'anchor1' || key === 'anchor2') {
      const o = toObject(val);
      if (!(o instanceof Stone)) throw new XLevelRuntime(`Wire: '${key}' is no stone`);
      if (key === 'anchor1') {
        const old = this.anchor1;
        this.anchor1 = o;
        if (this.anchor1 === this.anchor2) throw new XLevelRuntime("Wire: 'anchor1' is identical to 'anchor2'");
        this.switchAnchor(old, this.anchor1, this.anchor2);
      } else {
        const old = this.anchor2;
        this.anchor2 = o;
        if (this.anchor1 === this.anchor2) throw new XLevelRuntime("Wire: 'anchor1' is identical to 'anchor2'");
        this.switchAnchor(old, this.anchor2, this.anchor1);
      }
    }
    super.setAttr(key, val);
  }
  getAttr(key: string): Value {
    if (key === 'anchor1') return objValue(this.anchor1);
    if (key === 'anchor2') return objValue(this.anchor2);
    return super.getAttr(key);
  }
  message(m: Message): Value {
    if (m.message === '_performaction') { this.performAction(true); return null; }
    return super.message(m);
  }
  postAddition() {
    this.model = display.addRubber(this.anchor1!.getOwnerPos().center(), this.anchor2!.getOwnerPos().center(), 200, 50, 150, true);
  }
  preRemoval() {
    this.model?.kill();
    this.switchAnchor(this.anchor1, null, this.anchor2);
    this.switchAnchor(this.anchor2, null, this.anchor1);
  }
  tick(_dt: number) {
    this.model?.update_first(this.anchor1!.getOwnerPos().center());
    this.model?.update_second(this.anchor2!.getOwnerPos().center());
  }
  private switchAnchor(oldA: GameObject | null, newA: GameObject | null, other: GameObject | null) {
    if (oldA) {
      let l = listOf(oldA, 'wires'); removeAll(l, this); setList(oldA, 'wires', l);
      if (other) {
        l = listOf(oldA, 'fellows'); removeFirst(l, other); setList(oldA, 'fellows', l);
        l = listOf(other, 'fellows'); removeFirst(l, oldA); setList(other, 'fellows', l);
      }
    }
    if (newA) {
      let l = listOf(newA, 'wires'); l.push(this); setList(newA, 'wires', l);
      if (other) {
        l = listOf(newA, 'fellows');
        if (l.includes(other)) {
          // a replacement for an existing wire: the original only looks at the first wire of the list
          const wl = listOf(newA, 'wires');
          if (wl.length) {
            const w = wl[0];
            if (w instanceof Wire && ((w.anchor1 === newA && w.anchor2 === other) || (w.anchor2 === newA && w.anchor1 === other))) KillOther(w);
          }
          l = listOf(newA, 'fellows');
        }
        l.push(other); setList(newA, 'fellows', l);
        l = listOf(other, 'fellows'); l.push(newA); setList(other, 'fellows', l);
      }
    }
  }
}
Register('ot_wire', new Wire());

// ----- ot_rubberband
const OBJBIT_STONE = 1 << 24, OBJBIT_MAXVIOLATION = 1 << 25, OBJBIT_MINVIOLATION = 1 << 26;
const len = (v: V2) => Math.sqrt(v.x * v.x + v.y * v.y);
const sub = (a: V2, b: V2) => new V2(a.x - b.x, a.y - b.y);
export class Rubberband extends Other {
  strength = 10; outerThreshold = 1; innerThreshold = 0; minLength = 0; maxLength = 0;
  anchor1: Actor | null = null; anchor2: Actor | Stone | null = null;
  model: RubberHandle | null = null;
  getClass() { return 'ot_rubberband'; }
  setAttr(key: string, val: Value) {
    if (key === 'anchor1') {
      const old = this.anchor1;
      const o = toObject(val);
      if (!(o instanceof Actor)) throw new XLevelRuntime("Rubberband: 'anchor1' is no actor");
      this.anchor1 = o;
      if (this.anchor1 === this.anchor2) throw new XLevelRuntime("Rubberband: 'anchor1' is identical to 'anchor2'");
      this.switchAnchor(old, this.anchor1, this.anchor2);
    } else if (key === 'anchor2') {
      const old = this.anchor2;
      const o = toObject(val);
      if (o && o.getObjectType() === ACTOR) {
        this.anchor2 = o as Actor;
        if (this.anchor1 === this.anchor2) throw new XLevelRuntime("Rubberband: 'anchor1' is identical to 'anchor2'");
        this.objFlags &= ~OBJBIT_STONE;
        this.switchAnchor(old, this.anchor2, this.anchor1);
      } else if (o && o.getObjectType() === STONE) {
        this.anchor2 = o as Stone;
        this.objFlags |= OBJBIT_STONE;
        this.switchAnchor(old, this.anchor2, this.anchor1);
      } else throw new XLevelRuntime("Rubberband: 'anchor2' is neither actor nor stone");
    } else if (key === 'strength') this.strength = val === null || val === undefined ? 10.0 : toDouble(val);
    else if (key === 'length') {
      this.outerThreshold = val === null || val === undefined ? 1.0 : toDouble(val);
      if (!(this.outerThreshold >= 0 || this.outerThreshold === -1.0)) throw new XLevelRuntime('Rubberband: length is negative');
    } else if (key === 'threshold') {
      this.innerThreshold = toDouble(val);
      if (!(this.innerThreshold >= 0)) throw new XLevelRuntime('Rubberband: inner threshold is negative');
    } else if (key === 'max') {
      this.maxLength = toDouble(val);
      if (!(this.maxLength >= 0 && (this.maxLength === 0 || this.maxLength >= this.minLength))) throw new XLevelRuntime('Rubberband: max length is negative or less min');
    } else if (key === 'min') {
      this.minLength = toDouble(val);
      if (!(this.minLength >= 0 && (this.maxLength === 0 || this.maxLength >= this.minLength))) throw new XLevelRuntime('Rubberband: min length is negative or greater max');
    }
    super.setAttr(key, val);
  }
  getAttr(key: string): Value {
    switch (key) {
      case 'anchor1': return objValue(this.anchor1);
      case 'anchor2': return objValue(this.anchor2);
      case 'strength': return this.strength;
      case 'length': return this.outerThreshold;
      case 'threshold': return this.innerThreshold;
      case 'max': return this.maxLength;
      case 'min': return this.minLength;
    }
    return super.getAttr(key);
  }
  message(m: Message): Value {
    if (m.message === '_recheck') {
      const l = len(sub(this.posAnchor2(), this.anchor1!.ai.pos));
      let violating = false;
      if (this.maxLength > 0 && l > this.maxLength) { this.objFlags |= OBJBIT_MAXVIOLATION; violating = true; }
      else if (l < this.minLength) { this.objFlags |= OBJBIT_MINVIOLATION; violating = true; }
      if (violating) this.performAction(false);
      return null;
    }
    if (m.message === '_performaction') { this.performAction(true); return null; }
    return super.message(m);
  }
  postAddition() {
    if (!this.anchor1) throw new XLevelRuntime("Rubberband: 'anchor1' is no actor");
    if (!this.anchor2) throw new XLevelRuntime("Rubberband: 'anchor2' is neither actor nor stone");
    if (this.outerThreshold === -1.0) this.outerThreshold = len(sub(this.posAnchor2(), this.anchor1.ai.pos));
    this.model = display.addRubber(this.anchor1.ai.pos, this.posAnchor2(), 240, 140, 20, true);
    SendMessage(this, '_recheck');
  }
  preRemoval() {
    this.model?.kill();
    this.switchAnchor(this.anchor1, null, this.anchor2);
    this.switchAnchor(this.anchor2, null, this.anchor1);
  }
  tick(_dt: number) {
    this.model?.update_first(this.anchor1!.ai.pos);
    this.model?.update_second(this.posAnchor2());
  }
  applyForces(dt: number) {
    const eps = 0.02;
    const a1 = this.anchor1!;
    const v = sub(this.posAnchor2(), a1.ai.pos);
    const l = len(v);
    let fx = 0, fy = 0;
    const { minLength, maxLength } = this;
    if ((this.objFlags & OBJBIT_MAXVIOLATION) && l <= maxLength) this.objFlags &= ~OBJBIT_MAXVIOLATION;
    if ((this.objFlags & OBJBIT_MINVIOLATION) && l >= minLength) this.objFlags &= ~OBJBIT_MINVIOLATION;
    if (minLength + eps <= l && (l <= maxLength - eps || maxLength === 0)) {
      if (l === 0) { fx = 0; fy = 0; }
      else if (l > this.outerThreshold) { fx = v.x * this.strength * (l - this.outerThreshold) / l; fy = v.y * this.strength * (l - this.outerThreshold) / l; }
      else if (l < this.innerThreshold) { fx = v.x * this.strength * (l - this.innerThreshold) / l; fy = v.y * this.strength * (l - this.innerThreshold) / l; }
      a1.ai.force.x += fx; a1.ai.force.y += fy;
      if (!(this.objFlags & OBJBIT_STONE)) { const ai = (this.anchor2 as Actor).ai; ai.force.x -= fx; ai.force.y -= fy; }
    } else if (this.objFlags & OBJBIT_STONE) {
      const ai = a1.ai;
      const vnx = l !== 0 ? v.x / l : v.x, vny = l !== 0 ? v.y / l : v.y; // ecl::normalize
      const isMax = l > maxLength - eps, isMin = l < minLength + eps;
      const numRubbers = listOf(a1, 'rubbers').length;
      let force1 = vnx * ai.force.x + vny * ai.force.y;
      if ((!isMin && force1 > 0) || (!isMax && force1 < 0)) force1 = 0;
      ai.force.x -= force1 * vnx; ai.force.y -= force1 * vny;
      let relspeed = ai.vel.x * vnx + ai.vel.y * vny;
      if ((!isMin && relspeed > 0) || (!isMax && relspeed < 0)) relspeed = 0;
      const k = -(1 + 0.8 / numRubbers);
      fx = k * relspeed * vnx / dt * ai.mass; fy = k * relspeed * vny / dt * ai.mass;
      if (isMax && l > maxLength && relspeed <= 0 && !(this.objFlags & OBJBIT_MAXVIOLATION)) {
        let dlen = Math.min(l - maxLength, l - (minLength + eps));
        dlen = Math.max(0.0, dlen);
        const s = ai.mass * dlen / dt / dt; fx = s * vnx; fy = s * vny;
      }
      if (isMin && l < minLength && relspeed >= 0 && !(this.objFlags & OBJBIT_MINVIOLATION)) {
        let dlen = l - minLength;
        if (maxLength > 0) { dlen = Math.max(l - minLength, l - (maxLength - eps)); dlen = Math.min(0.0, dlen); }
        const s = ai.mass * dlen / dt / dt; fx = s * vnx; fy = s * vny;
      }
      if (isMax && (this.objFlags & OBJBIT_MAXVIOLATION)) { fx += server.RubberViolationStrength * vnx; fy += server.RubberViolationStrength * vny; }
      else if (isMin && (this.objFlags & OBJBIT_MINVIOLATION)) { fx -= server.RubberViolationStrength * vnx; fy -= server.RubberViolationStrength * vny; }
      ai.collforce.x += fx; ai.collforce.y += fy;
    } else {
      const ai1 = a1.ai, ai2 = (this.anchor2 as Actor).ai;
      const vnx = l !== 0 ? v.x / l : v.x, vny = l !== 0 ? v.y / l : v.y;
      const mass = ai1.mass + ai2.mass;
      let isMax = l > maxLength - eps, isMin = l < minLength + eps;
      if (isMax && isMin) { isMax = l > (maxLength - minLength) / 2; isMin = !isMax; }
      const numRubbers = listOf(a1, 'rubbers').length + listOf(this.anchor2!, 'rubbers').length - 1;
      let force1 = vnx * ai1.force.x + vny * ai1.force.y;
      let force2 = vnx * ai2.force.x + vny * ai2.force.y;
      if ((!isMin && force1 > 0) || (!isMax && force1 < 0)) force1 = 0;
      if ((!isMin && force2 < 0) || (!isMax && force2 > 0)) force2 = 0;
      const k1 = -force1 + (force1 + force2) * ai1.mass / mass, k2 = -force2 + (force1 + force2) * ai2.mass / mass;
      ai1.force.x += k1 * vnx; ai1.force.y += k1 * vny;
      ai2.force.x += k2 * vnx; ai2.force.y += k2 * vny;
      let relspeed = vnx * (ai2.vel.x - ai1.vel.x) + vny * (ai2.vel.y - ai1.vel.y);
      const dmu = 2 * ai1.mass * ai2.mass / (ai1.mass + ai2.mass);
      if ((isMax && relspeed < 0) || (isMin && relspeed > 0)) relspeed = 0;
      const s0 = dmu * relspeed / dt;
      fx = s0 * vnx; fy = s0 * vny;
      const damp = 0.5 + 0.4 / numRubbers;
      fx = fx * damp; fy = fy * damp;
      if (isMax && l > maxLength && relspeed >= 0 && !(this.objFlags & OBJBIT_MAXVIOLATION)) {
        let dlen = Math.min(l - maxLength, l - (minLength + eps));
        dlen = Math.max(0.0, dlen);
        const s = dmu * dlen / dt / dt; fx = s * vnx; fy = s * vny;
      }
      if (isMin && l < minLength && relspeed <= 0 && !(this.objFlags & OBJBIT_MINVIOLATION)) {
        let dlen = l - minLength;
        if (maxLength > 0) { dlen = Math.max(l - minLength, l - (maxLength - eps)); dlen = Math.min(0.0, dlen); }
        const s = dmu * dlen / dt / dt; fx = s * vnx; fy = s * vny;
      }
      if (isMax && (this.objFlags & OBJBIT_MAXVIOLATION)) { fx += server.RubberViolationStrength * vnx; fy += server.RubberViolationStrength * vny; }
      else if (isMax && (this.objFlags & OBJBIT_MINVIOLATION)) { fx -= server.RubberViolationStrength * vnx; fy -= server.RubberViolationStrength * vny; }
      ai1.collforce.x += fx; ai1.collforce.y += fy;
      ai2.collforce.x -= fx; ai2.collforce.y -= fy;
    }
  }
  anchor2Object(): GameObject | null { return this.anchor2; }
  posAnchor2(): V2 {
    if (this.objFlags & OBJBIT_STONE) { return (this.anchor2 as Stone).getOwnerPos().center(); }
    return (this.anchor2 as Actor).ai.pos.clone();
  }
  private switchAnchor(oldA: GameObject | null, newA: GameObject | null, other: GameObject | null) {
    if (oldA) {
      let l = listOf(oldA, 'rubbers'); removeAll(l, this); setList(oldA, 'rubbers', l);
      if (other) {
        l = listOf(oldA, 'fellows'); removeFirst(l, other); setList(oldA, 'fellows', l);
        l = listOf(other, 'fellows'); removeFirst(l, oldA); setList(other, 'fellows', l);
      }
    }
    if (newA) {
      if (other) {
        let l = listOf(newA, 'fellows');
        if (l.includes(other)) {
          for (const r of listOf(newA, 'rubbers')) {
            if (r instanceof Rubberband && (other === r.anchor1 || other === r.anchor2Object())) { KillOther(r); break; }
          }
        }
        l = listOf(newA, 'fellows'); l.push(other); setList(newA, 'fellows', l);
        l = listOf(other, 'fellows'); l.push(newA); setList(other, 'fellows', l);
      }
      const l = listOf(newA, 'rubbers'); l.push(this); setList(newA, 'rubbers', l);
    }
  }
}
Register('ot_rubberband', new Rubberband());
