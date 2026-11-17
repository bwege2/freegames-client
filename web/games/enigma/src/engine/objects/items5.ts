// items/Sword.cc, GlassesItem.cc, StripItem.cc, RubberbandItem.cc, Landmine.cc.
import {
  Item, GameObject, Register, server, player, GameTimer, SendMessage, BroadcastMessage, MakeObject, AddOther,
  glassesHooks, toBool, getObjectList, toObject, objValue, len, OBJBIT_LIGHTNEWDIRS, itf_static, itf_freezable,
  WESTBIT, EASTBIT, NORTHBIT, SOUTHBIT, ITEM_DROP, ITEM_KILL, GridPos,
  type Actor, type ItemTraits, type Stone, type V2, type TimeHandler, type Other,
} from '../core.ts';
import { updateCurrentLightDirs } from './laser.ts';

// ----- it_sword
class Sword extends Item implements TimeHandler {
  isNew: boolean; keptLight = 0;
  constructor(isNew: boolean) { super(); this.isNew = isNew; }
  traits(): ItemTraits { return { name: 'it_sword', flags: 0, radius: 0 }; }
  getClass() { return 'it_sword'; }
  on_creation(p: GridPos) {
    if (this.isNew) GameTimer.set_alarm(this, 0.2, false);
    else { this.objFlags = (this.objFlags & ~OBJBIT_LIGHTNEWDIRS) | this.keptLight; this.activatePhoto(); }
    super.on_creation(p);
  }
  on_removal(p: GridPos) {
    this.keptLight = this.objFlags & OBJBIT_LIGHTNEWDIRS;
    GameTimer.remove_alarm(this);
    this.isNew = false;
    super.on_removal(p);
  }
  lightDirChanged(o: number, n: number) { if ((n & ~o) !== 0) { this.sound_event('itemtransform'); this.transform('it_hammer_new'); } }
  on_pickup(_a: Actor) { this.keptLight = 0; }
  alarm() { this.isNew = false; updateCurrentLightDirs(this); this.activatePhoto(); }
}
Register('it_sword', new Sword(false)); Register('it_sword_new', new Sword(true));

// ----- it_glasses
const G_DEATH = 1, G_HOLLOW = 2, G_LIGHTPASSENGER = 16, G_MAX = 63;
function updateGlasses() {
  const ci = player.inventory(player.current);
  let v = 0, i = -1;
  while ((i = ci.find('it_glasses', i + 1)) !== -1) v |= (ci.get_item(i) as Item).state;
  if (v !== server.GlassesVisibility) {
    server.GlassesVisibility = v;
    BroadcastMessage('_glasses', v, false, true, true);
  }
}
glassesHooks.update = updateGlasses;
class Glasses extends Item {
  constructor(s: number) { super(); this.state = s; }
  traits(): ItemTraits { return { name: this.state !== 0 ? 'it_glasses' : 'it_glasses_broken', flags: 0, radius: 0 }; }
  getClass() { return 'it_glasses'; }
  maxState() { return G_MAX; }
  toggleState() {}
  setState(s: number) {
    this.state = s;
    if (this.isDisplayable()) this.init_model(); else { updateGlasses(); player.onInventory(); }
  }
  init_model() { this.set_model(this.state > 0 ? 'it_glasses' : 'it_glasses_broken'); }
  on_drop(_a: Actor) { updateGlasses(); }
  on_pickup(_a: Actor) { updateGlasses(); }
  on_stonehit(_st: Stone) { if (this.state > 0) { this.sound_event('shatter'); this.setState(0); } }
}
Register('it_glasses_broken', new Glasses(0)); Register('it_glasses', new Glasses(G_DEATH + G_HOLLOW + G_LIGHTPASSENGER));

// ----- it_strip
const STRIP = ['', 'w', 's', 'sw', 'e', 'ew', 'es', 'esw', 'n', 'nw', 'ns', 'nsw', 'ne', 'new', 'nes', 'nesw'];
class StripItem extends Item {
  constructor(c: string) { super(); this.setAttr('connections', c); }
  traits(): ItemTraits { const c = STRIP[this.getConnections()]; return { name: c ? `it_strip_${c}` : 'it_strip', flags: itf_static | itf_freezable, radius: 0 }; }
  getClass() { return 'it_strip'; }
  setState(_s: number) {}
  getModelName() { return `it_strip${this.getConnections()}`; }
  covers_floor(pos: V2, a: Actor | null) {
    if (!GridPos.of(pos).eq(this.pos)) return false;
    const v = a ? len(a.ai.vel.x, a.ai.vel.y) : 0;
    const MAXDIST = 0.183125 + Math.min(Math.max(v / 400, 0.0), 0.125);
    const yc = this.pos.y + 0.5, xc = this.pos.x + 0.5;
    const c = this.getConnections();
    return (Math.abs(pos.y - yc) <= MAXDIST && (Math.abs(pos.x - xc) <= MAXDIST ||
      (pos.x <= xc + MAXDIST && (c & WESTBIT) !== 0) || (pos.x >= xc - MAXDIST && (c & EASTBIT) !== 0))) ||
      (Math.abs(pos.x - xc) <= MAXDIST && ((pos.y <= yc + MAXDIST && (c & NORTHBIT) !== 0) || (pos.y >= yc - MAXDIST && (c & SOUTHBIT) !== 0)));
  }
  getFriction(pos: V2, def: number, a: Actor) {
    const v = this.getAttr('friction');
    return v !== undefined && v !== null && this.covers_floor(pos, a) ? Number(v) : def;
  }
  calcMouseforce(a: Actor, mx: number, my: number, fx: number, fy: number): [number, number] {
    const v = this.getAttr('adhesion');
    return v !== undefined && v !== null && this.covers_floor(a.ai.pos, a) ? [mx * Number(v), my * Number(v)] : [fx, fy];
  }
}
STRIP.forEach((c) => Register(c ? `it_strip_${c}` : 'it_strip', new StripItem(c)));

// ----- it_rubberband
class RubberbandItem extends Item {
  traits(): ItemTraits { return { name: 'it_rubberband', flags: 0, radius: 0 }; }
  getClass() { return 'it_rubberband'; }
  activate(a: Actor, _p: GridPos) {
    const ol = getObjectList(this.getAttr('anchor2'), a);
    if (ol.length === 0) return ITEM_DROP;
    const anchor2 = ol[0];
    if (toBool(this.getAttr('scissor'))) SendMessage(a, 'disconnect');
    this.sound_event('rubberband');
    let already = false;
    for (const r of getObjectList(a.getAttr('rubbers'), null)) if (r && toObject(r.getAttr('anchor2')) === anchor2) { already = true; break; }
    if (!already && anchor2 !== a) {
      const obj = MakeObject('ot_rubberband')!;
      const id = obj.id;
      obj.setAttr('anchor1', objValue(a));
      obj.setAttr('anchor2', objValue(anchor2));
      for (const k of ['strength', 'length', 'threshold', 'max', 'min']) obj.setAttr(k, this.getAttr(k));
      AddOther(obj as unknown as Other);
      this.transferIdentity(obj);
      SendMessage(obj, '_performaction');
      if (GameObject.getObject(id)) SendMessage(obj, '_recheck');
      return ITEM_KILL;
    }
    return ITEM_DROP;
  }
}
Register('it_rubberband', new RubberbandItem());

// ----- it_landmine
class Landmine extends Item {
  traits(): ItemTraits { return { name: 'it_landmine', flags: itf_static, radius: 0 }; }
  getClass() { return 'it_landmine'; }
  actor_hit(a: Actor) {
    if (!a.is_flying()) { const c = this.pos.center(); if (len(a.ai.pos.x - c.x, a.ai.pos.y - c.y) < 0.3) this.explode(); }
    return false;
  }
  on_stonehit(_st: Stone) { this.explode(); }
  private explode() { this.sound_event('landmine'); this.replace('it_explosion_hollow'); }
}
Register('it_landmine', new Landmine());
