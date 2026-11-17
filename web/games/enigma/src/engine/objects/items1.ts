// Items: items/Trigger.cc, DocumentItem.cc, ExtraLife.cc, Hammer.cc, SimpleItems.cc, Coin.cc.
import {
  Item, GameObject, Register, server, player, toStr, toBool, toInt, toDouble, GameTimer, GetFloor, GetItem, GetStone, SendMessage,
  KillItem, MakeFloor, MakeItem, SetFloor, SetItem, GetActorsInsideField, BroadcastMessage, world, WarpActor, host,
  NORTH, NODIR, itf_none, itf_static, itf_indestructible, itf_animation, itf_inflammable, itf_norespawn, itf_fireproof,
  itf_portable, itf_freezable, ITEM_DROP, ITEM_KILL, ITEM_KEEP,
  type ItemTraits, type GridPos, type Message, type Value, type Actor, type Stone, type TimeHandler,
} from '../core.ts';
import { levelText } from './stones1.ts';

const T = (name: string, flags = itf_none, radius = 0): ItemTraits => ({ name, flags, radius: Math.fround(radius) });

class SimpleItem extends Item {
  tr: ItemTraits;
  constructor(tr: ItemTraits) { super(); this.tr = tr; }
  traits() { return this.tr; }
}

// ----- trigger
class Trigger extends SimpleItem {
  constructor() { super(T('it_trigger', itf_static | itf_indestructible)); this.setAttr('invisible', false); }
  message(m: Message): Value {
    if (m.message === 'signal' && server.EnigmaCompatibility < 1.10) { this.performAction(toBool(m.value)); return null; }
    if (m.message === '_init') {
      this.state = 0;
      const id = this.id;
      this.updateIState(this.countActors(), server.EnigmaCompatibility >= 1.10);
      if (GameObject.getObject(id)) this.init_model();
      return null;
    }
    if (m.message === '_jumping') this.updateIState(toBool(m.value) ? -1 : 1);
    else if (m.message === '_dying') {
      const ac = m.sender as Actor | null;
      if (ac && 'ai' in ac) {
        if (toBool(m.value) && !ac.is_flying()) this.updateIState(-1);
        else if (!toBool(m.value)) this.updateIState(1);
      }
    }
    return super.message(m);
  }
  externalState() { return this.state !== 0 ? 1 : 0; }
  setState(_s: number) {}
  on_creation(_p: GridPos) {
    this.state = 0;
    this.updateIState(this.countActors(), true);
    if (this.isDisplayable()) this.init_model();
  }
  init_model() {
    if (toBool(this.getAttr('invisible'))) this.set_model('invisible');
    else this.set_model(this.state !== 0 ? 'it_trigger_down' : 'it_trigger_up');
  }
  actor_enter(a: Actor) { if (!(a.is_flying() || a.isMoribund())) this.updateIState(1, !server.WorldInitialized); }
  actor_leave(a: Actor) { if (!(a.is_flying() || a.isMoribund())) this.updateIState(-1, !server.WorldInitialized); }
  stone_change(_st: Stone | null) { this.updateIState(0); }
  countActors() { return GetActorsInsideField(this.pos).filter((a) => !(a.is_flying() || a.isMoribund())).length; }
  updateIState(diff: number, refuse = false) {
    const old = this.state;
    this.state += 2 * diff;
    const st = GetStone(this.pos);
    this.state &= ~1;
    if (st && (!st.is_floating() || st.getClass() === 'st_puzzle')) this.state |= 1;
    if ((old === 0 && this.state !== 0) || (old !== 0 && this.state === 0)) {
      this.init_model();
      if (!refuse) {
        if (this.state !== 0) { this.sound_event('triggerdown'); this.performAction(true); }
        else { this.sound_event('triggerup'); this.performAction(false); }
      }
    }
  }
}
Register('it_trigger', new Trigger());

// ----- document
class DocumentItem extends SimpleItem {
  constructor() { super(T('it_document', itf_inflammable)); }
  message(m: Message): Value {
    if (m.message === 'ignite' || m.message === '_explosion') { this.replace('it_explosion_nil'); return null; }
    return super.message(m);
  }
  activate(_a: Actor, _p: GridPos) {
    const v = this.getAttr('text');
    if (v !== undefined) host.showText(levelText(toStr(v)));
    return ITEM_KILL;
  }
}
Register('it_document', new DocumentItem());

// ----- items that turn into others under laser light (extralife, hammer, ...)
class NewItem extends SimpleItem implements TimeHandler {
  isNew: boolean;
  constructor(tr: ItemTraits, isNew: boolean) { super(tr); this.isNew = isNew; }
  on_creation(p: GridPos) {
    if (this.isNew) GameTimer.set_alarm(this, 0.2, false); else this.activatePhoto();
    super.on_creation(p);
  }
  on_removal(p: GridPos) { GameTimer.remove_alarm(this); this.isNew = false; super.on_removal(p); }
  alarm() { this.isNew = false; this.activatePhoto(); }
  dispose() { GameTimer.remove_alarm(this); super.dispose(); }
}
class ExtraLife extends NewItem {
  constructor(n: boolean) { super(T('it_extralife'), n); }
  lightDirChanged(o: number, n: number) { if ((n & ~o) !== 0) { this.sound_event('itemtransform'); this.replace('it_glasses'); } }
  setup_successor(n: Item) { n.setState(server.ExtralifeGlasses); }
}
class Hammer extends NewItem {
  constructor(n: boolean) { super(T('it_hammer'), n); }
  lightDirChanged(o: number, n: number) { if ((n & ~o) !== 0) { this.sound_event('itemtransform'); this.transform('it_sword_new'); } }
}
Register('it_extralife', new ExtraLife(false)); Register('it_extralife_new', new ExtraLife(true));
Register('it_hammer', new Hammer(false)); Register('it_hammer_new', new Hammer(true));

// ----- SimpleItems.cc
class Banana extends SimpleItem {
  constructor() { super(T('it_banana')); }
  processLight(_d: number) { this.sound_event('itemtransform'); this.transform('it_cherry'); }
  on_stonehit() { this.transform('it_squashed'); }
}
class Brush extends SimpleItem {
  constructor() { super(T('it_brush', itf_inflammable)); }
  activate(_a: Actor, p: GridPos) { const it = GetItem(p); if (it) SendMessage(it, '_brush'); return ITEM_DROP; }
}
class Cherry extends SimpleItem {
  constructor() { super(T('it_cherry')); }
  activate(a: Actor, _p: GridPos) { return toBool(SendMessage(a, '_invisibility')) ? ITEM_KILL : ITEM_DROP; }
  on_stonehit() { this.transform('it_squashed'); }
  on_drop(_a: Actor) { this.transform('it_squashed'); }
}
class DeathItem extends SimpleItem {
  constructor() { super(T('it_death', itf_static | itf_indestructible)); }
  animcb() { this.set_model('it_death'); this.state = 0; }
  actor_hit(a: Actor) {
    if (!a.ai.grabbed) {
      SendMessage(a, '_shatter');
      if (this.state === 0) { this.state = 1; this.set_anim('it_death_anim'); }
    }
    return false;
  }
}
class Debris extends SimpleItem {
  constructor(t: number) { super(T(t === 0 ? 'it_debris' : 'it_debris_water', itf_static | itf_animation | itf_indestructible | itf_fireproof)); this.state = t; }
  animcb() { SetFloor(this.pos, MakeFloor(this.state === 0 ? 'fl_abyss' : 'fl_water')); this.kill(); }
  actor_hit(a: Actor) { SendMessage(a, '_fall'); return false; }
}
const EXPL = ['it_explosion_nil', 'it_explosion_hollow', 'it_explosion_crack', 'it_explosion_debris'];
class Explosion extends SimpleItem {
  constructor(s: number) { super(T(EXPL[s], itf_static | itf_animation | itf_indestructible | itf_norespawn | itf_fireproof)); this.state = s; }
  traits() { return T(EXPL[Math.max(0, Math.min(3, this.state))], itf_static | itf_animation | itf_indestructible | itf_norespawn | itf_fireproof); }
  getClass() { return 'it_explosion'; }
  message(m: Message): Value {
    if (m.message === '_cannonball') { this.state = 3; return null; }
    if (m.message === '_freeze') { this.kill(); return null; }
    return super.message(m);
  }
  setState(_s: number) {}
  init_model() { this.set_anim('it_explosion'); }
  animcb() {
    const fl = GetFloor(this.pos);
    if (this.state !== 0 && fl && fl.is_destructible()) {
      if (this.state === 1) this.replace('it_meditation_hollow');
      else if (this.state === 2) this.replace('it_crack_m_water');
      else {
        let abyss = true;
        if (server.SubSoil === 1) abyss = false;
        else if (server.SubSoil === 2) {
          for (let d = NORTH; d !== NODIR; d--) { const f = GetFloor(this.pos.move(d)); if (f && f.getClass() === 'fl_water') { abyss = false; break; } }
        }
        this.replace(abyss ? 'it_debris' : 'it_debris_water');
      }
    } else this.kill();
  }
  actor_hit(a: Actor) { SendMessage(a, '_shatter'); return false; }
}
class FlagItem extends SimpleItem {
  constructor(c: number) { super(T('it_flag_black')); Item.prototype.setAttr.call(this, 'color', c); }
  traits() { return T(toInt(this.getAttr('color')) === 1 ? 'it_flag_white' : 'it_flag_black'); }
  getClass() { return 'it_flag'; }
  setAttr(key: string, val: Value) { if (key === 'color' && (toInt(val) < 0 || toInt(val) > 1)) return; super.setAttr(key, val); }
  on_drop(_a: Actor) { player.setRespawnPositions(this.pos, this.getAttr('color')); }
  on_pickup(_a: Actor) { player.removeRespawnPositions(this.getAttr('color')); }
}
class Key extends SimpleItem {
  constructor() { super(T('it_key')); }
  setAttr(key: string, val: Value) { super.setAttr(key, val); if (key === 'invisible' || key === 'code') player.onInventory(); }
  get_inventory_model() {
    const show = !toBool(this.getAttr('invisible'));
    const code = toInt(this.getAttr('code'));
    return show && code >= 1 && code <= 8 ? `it_key_${code}` : 'it_key';
  }
}
class Pencil extends SimpleItem {
  constructor() { super(T('it_pencil')); }
  activate(a: Actor, p: GridPos) {
    if (GetItem(p)) return ITEM_KEEP;
    if (a.is_flying()) return ITEM_DROP;
    const fl = GetFloor(p)!.getClass();
    if (fl === 'fl_abyss' || fl === 'fl_water' || fl === 'fl_swamp' || fl === 'fl_bridge') return ITEM_KEEP;
    if (fl === 'fl_ice') SetItem(p, MakeItem('it_crack_s_water'));
    else { const n = MakeItem('it_cross'); this.transferIdentity(n); SetItem(p, n); }
    return ITEM_KILL;
  }
}
class Pin extends SimpleItem {
  constructor() { super(T('it_pin')); }
  setOwner(pl: number) {
    const old = this.getOwner();
    super.setOwner(pl);
    if (old !== null && old !== -1) BroadcastMessage('_update_pin', old, false, false, false, true);
    if (pl !== -1) BroadcastMessage('_update_pin', pl, false, false, false, true);
  }
}
class Ring extends SimpleItem {
  constructor() { super(T('it_ring')); }
  activate(a: Actor, _p: GridPos) {
    if (a.isMoribund()) return ITEM_KEEP;
    const other = world.actorlist.find((x) => x !== a && ((a.traits().name === 'ac_marble_black' && x.traits().name === 'ac_marble_white') ||
      (a.traits().name === 'ac_marble_white' && x.traits().name === 'ac_marble_black')));
    if (other && (a.traits().name === 'ac_marble_black' || a.traits().name === 'ac_marble_white')) {
      const p1 = a.ai.pos.clone();
      a.ai.pos = other.ai.pos.clone(); world.did_move_actor(a);
      other.ai.pos = p1; world.did_move_actor(other);
      this.sound_event('switchmarbles');
    } else { a.find_respawnpos(); a.respawn(); }
    return ITEM_DROP;
  }
}
class Spade extends SimpleItem {
  constructor() { super(T('it_spade')); }
  activate(_a: Actor, p: GridPos) {
    const it = GetItem(p);
    if (it) { const c = p.center(); host.sound('spade', c.x, c.y, 1); SendMessage(it, 'shovel'); return ITEM_KEEP; }
    return ITEM_DROP;
  }
}
class Spoon extends SimpleItem {
  constructor() { super(T('it_spoon')); }
  activate(a: Actor, _p: GridPos) { SendMessage(a, '_suicide'); return ITEM_DROP; }
}
class Spring extends SimpleItem {
  constructor(t: number) { super(T(t === 0 ? 'it_spring_keep' : 'it_spring_drop')); this.state = t; }
  traits() { return T(this.state === 0 ? 'it_spring_keep' : 'it_spring_drop'); }
  getClass() { return 'it_spring'; }
  setState(_s: number) {}
  activate(a: Actor, p: GridPos) {
    if (this.state === 0) { SendMessage(a, '_jump'); return ITEM_KEEP; }
    const it = GetItem(p);
    if (!it || (it.traits().flags & itf_static)) { SendMessage(a, '_jump'); return ITEM_DROP; }
    return ITEM_KEEP;
  }
}
class Springboard extends SimpleItem {
  constructor() { super(T('it_springboard', itf_static | itf_portable | itf_freezable)); }
  actor_hit(a: Actor) {
    const yc = this.pos.y + 0.5, xc = this.pos.x + 0.5;
    if (a.is_on_floor() && Math.abs(a.ai.pos.y - yc) <= 0.3 && Math.abs(a.ai.pos.x - xc) <= 0.3) {
      this.set_anim('it_springboard_anim');
      SendMessage(a, '_jump');
    }
    return false;
  }
  animcb() { this.set_model('it_springboard'); }
}
class Squashed extends SimpleItem {
  constructor() { super(T('it_squashed', itf_static)); }
  message(m: Message): Value {
    if (m.message === '_brush' || m.message === '_freeze') { KillItem(this.pos); return null; }
    return super.message(m);
  }
}
class Weight extends SimpleItem {
  constructor() { super(T('it_weight')); }
  setAttr(key: string, val: Value) {
    if (key === 'mass') {
      const oldM = toDouble(this.getAttr('mass')), newM = toDouble(val);
      if (newM !== oldM && newM > 0) {
        super.setAttr('mass', newM);
        const owner = this.getOwner();
        if (owner !== null) {
          const inv = player.inventory(toInt(owner));
          inv.attrs.set('mass', toDouble(inv.getAttr('mass')) + newM - oldM);
          BroadcastMessage('_update_mass', owner, false, false, false, true);
        }
      }
      return;
    }
    super.setAttr(key, val);
  }
  setOwner(pl: number) {
    const old = this.getOwner();
    if (pl === -1) { const p = this.getOwnerPos(); if (p.x >= 0) SendMessage(GetFloor(p), '_add_mass', -toDouble(this.getAttr('mass')), this); }
    super.setOwner(pl);
    if (old !== null && old !== -1) {
      const inv = player.inventory(toInt(old));
      inv.attrs.set('mass', toDouble(inv.getAttr('mass')) - toDouble(this.getAttr('mass')));
      BroadcastMessage('_update_mass', old, false, false, false, true);
    }
    if (pl !== -1) {
      const inv = player.inventory(pl);
      inv.attrs.set('mass', toDouble(inv.getAttr('mass')) + toDouble(this.getAttr('mass')));
      BroadcastMessage('_update_mass', pl, false, false, false, true);
    }
  }
  on_creation(p: GridPos) { super.on_creation(p); SendMessage(GetFloor(p), '_add_mass', this.getAttr('mass'), this); }
  on_removal(p: GridPos) { SendMessage(GetFloor(this.pos), '_add_mass', -toDouble(this.getAttr('mass')), this); super.on_removal(p); }
  activate() { return ITEM_KEEP; }
}
class Yinyang extends SimpleItem {
  constructor() { super(T('it_yinyang')); }
  get_inventory_model() { return player.current === 0 ? 'it_yinyang' : 'it_yangyin'; }
  activate(_a: Actor, p: GridPos) {
    if (player.numberOfRealPlayers() >= 2) player.setCurrent(1 - player.current);
    const c = p.center();
    host.sound('switchplayer', c.x, c.y, 1);
    return ITEM_KEEP;
  }
}
Register('it_banana', new Banana()); Register('it_brush', new Brush()); Register('it_cherry', new Cherry());
Register('it_coffee', new SimpleItem(T('it_coffee'))); Register('it_death', new DeathItem());
Register('it_debris', new Debris(0)); Register('it_debris_water', new Debris(1));
Register('it_explosion', new Explosion(0)); Register('it_explosion_nil', new Explosion(0)); Register('it_explosion_hollow', new Explosion(1));
Register('it_explosion_crack', new Explosion(2)); Register('it_explosion_debris', new Explosion(3));
Register('it_flag', new FlagItem(0)); Register('it_flag_black', new FlagItem(0)); Register('it_flag_white', new FlagItem(1));
Register('it_floppy', new SimpleItem(T('it_floppy'))); Register('it_magicwand', new SimpleItem(T('it_magicwand')));
Register('it_key', new Key()); Register('it_pencil', new Pencil()); Register('it_pin', new Pin()); Register('it_ring', new Ring());
Register('it_spade', new Spade()); Register('it_spoon', new Spoon()); Register('it_spring', new Spring(0));
Register('it_spring_keep', new Spring(0)); Register('it_spring_drop', new Spring(1)); Register('it_springboard', new Springboard());
Register('it_squashed', new Squashed()); Register('it_weight', new Weight()); Register('it_wrench', new SimpleItem(T('it_wrench')));
Register('it_yinyang', new Yinyang());

// ----- coins
const COINS = ['it_coin_s', 'it_coin_m', 'it_coin_l'];
class Coin extends SimpleItem {
  constructor(t: number) { super(T(COINS[t])); this.state = t; this.setAttr('coin_value', t === 0 ? 3.0 : t === 1 ? 6.0 : 12.0); }
  traits() { return T(COINS[this.state]); }
  getClass() { return 'it_coin'; }
  setState(_s: number) {}
  processLight(_d: number) {
    this.sound_event('itemtransform');
    this.transform(['it_umbrella_new', 'it_hammer_new', 'it_extralife_new'][this.state]);
  }
  on_stonehit() {
    if (this.state <= 1) { this.state++; this.setAttr('coin_value', this.state === 1 ? 6.0 : 12.0); this.init_model(); }
  }
}
Register('it_coin', new Coin(0)); Register('it_coin_s', new Coin(0)); Register('it_coin_m', new Coin(1)); Register('it_coin_l', new Coin(2));
export const _keep = [WarpActor, toStr];
