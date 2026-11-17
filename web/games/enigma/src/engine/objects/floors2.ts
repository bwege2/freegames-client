// Floors: floors/BridgeFloor.cc.
import { Floor, Register, GetStone, SendMessage, toStr, XLevelRuntime, type GridPos, type Message, type Value, type Actor, type Stone } from '../core.ts';

const CLOSED = 0, OPEN = 1, CLOSING = 2, OPENING = 3;
class BridgeFloor extends Floor {
  explicit = false;
  constructor(flavor: string) {
    super();
    Floor.prototype.setAttr.call(this, 'flavor', flavor);
    Floor.prototype.setAttr.call(this, 'burnable', flavor !== 'gc');
    this.state = OPEN;
  }
  getClass() { return 'fl_bridge'; }
  setAttr(key: string, val: Value) {
    if (key === 'flavor') {
      const f = toStr(val);
      if (!['gc', 'bw', 'bs', 'be', 'bn'].includes(f)) throw new XLevelRuntime('BridgeFloor illegal flavor value');
      super.setAttr('flavor', val);
      super.setAttr('burnable', f !== 'gc');
      if (this.isDisplayable() && this.state <= OPEN) this.init_model();
      return;
    }
    super.setAttr(key, val);
  }
  private closedByStone() { const st = GetStone(this.pos); return st !== null && !st.is_floating(); }
  message(m: Message): Value {
    if (m.message === '_init') {
      this.state = this.explicit || this.closedByStone() ? CLOSED : OPEN;
      this.init_model();
      return null;
    }
    return super.message(m);
  }
  externalState() { return this.state === CLOSED ? 0 : 1; }
  setState(ext: number) {
    if (this.isDisplayable()) {
      const st = GetStone(this.pos);
      if (ext === 1 && (this.state === CLOSED || this.state === CLOSING) && (st === null || st.is_floating())) this.setIState(OPENING);
      else if (ext === 0 && (this.state === OPEN || this.state === OPENING)) this.setIState(CLOSING);
    } else this.state = ext;
    this.explicit = ext !== 1;
  }
  toggleState() {
    if ((this.state === CLOSED || this.state === CLOSING) && this.closedByStone()) this.explicit = !this.explicit;
    else if (this.state === CLOSED || this.state === CLOSING) this.setState(1);
    else this.setState(0);
  }
  getModelName() { return this.basename() + (this.state === OPEN ? 'open' : 'closed'); }
  on_creation(p: GridPos) {
    this.state = this.explicit || this.closedByStone() ? CLOSED : OPEN;
    super.on_creation(p);
  }
  animcb() {
    if (this.state === OPENING) this.state = OPEN; else if (this.state === CLOSING) this.state = CLOSED;
    this.init_model();
  }
  stone_change(st: Stone | null) {
    if (st && !st.is_floating() && (this.state === OPEN || this.state === OPENING)) this.setIState(CLOSING);
    else if ((st === null || st.is_floating()) && (this.state === CLOSED || this.state === CLOSING) && !this.explicit) this.setIState(OPENING);
  }
  actor_contact(a: Actor) { if (this.state !== CLOSED) SendMessage(a, '_fall'); }
  private basename() {
    const f = toStr(this.getAttr('flavor'));
    return ['gc', 'bw', 'bs', 'be', 'bn'].includes(f) ? `fl_bridge_${f}_` : '';
  }
  private setIState(n: number) {
    if (n === OPENING) { if (this.state === CLOSING) this.get_model()?.reverse(); else this.set_anim(this.basename() + 'opening'); }
    else if (n === CLOSING) { if (this.state === OPENING) this.get_model()?.reverse(); else this.set_anim(this.basename() + 'closing'); }
    this.state = n;
  }
}
Register('fl_bridge', new BridgeFloor('gc'));
for (const f of ['gc', 'bn', 'be', 'bs', 'bw']) Register(`fl_bridge_${f}`, new BridgeFloor(f));
