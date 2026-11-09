// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/artifacts/TimekeepersHourglass.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2026 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { Artifact } from './Artifact.ts';
import { Artifact$ArtifactBuff } from './Artifact.ts';
import { Item } from '../Item.ts';

let Assets$Sounds, Dungeon, Statistics, Actor, Buff, Buff$buffType, Hunger, Invisibility, MagicImmune, Regeneration, Hero, Talent, RingOfEnergy, Catalog, Messages, Rotberry, GameScene, CharSprite$State, ItemSprite, ItemSpriteSheet, BuffIndicator, GLog, WndOptions, Sample, Emitter, Random;

export class TimekeepersHourglass extends Artifact {
  static readonly AC_ACTIVATE: string = 'ACTIVATE';
  sandBags: number = 0;
  static readonly SANDBAGS: string = 'sandbags';
  static readonly BUFF: string = 'buff';
  _TimekeepersHourglass(): this {
    this._Artifact();
    this.image_ = ItemSpriteSheet.ARTIFACT_HOURGLASS;
    this.levelCap = 5;
    this.charge_ = (5 + this.level$()) | 0;
    this.partialCharge = 0;
    this.chargeCap_ = (5 + this.level$()) | 0;
    this.defaultAction_ = TimekeepersHourglass.AC_ACTIVATE;
    this.sandBags = 0;
    return this;
  }
  resetForTrinity(visibleLevel: number): void {
    super.resetForTrinity(visibleLevel);
    this.charge_ = ($J.idiv(visibleLevel, 2) - 1) | 0;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    if (this.isEquipped(hero) && !this.cursed && hero.buff($J.cls(MagicImmune)) == null && (this.charge_ > 0 || this.activeBuff_ != null)) {
      actions.add(TimekeepersHourglass.AC_ACTIVATE);
    }
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if (hero.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    if ($J.equals(action, TimekeepersHourglass.AC_ACTIVATE)) {
      if (!this.isEquipped(hero)) {
        GLog.i(Messages.get$Class$String$ObjectArr($J.cls(Artifact), 'need_to_equip', []), []);
      } else if (this.activeBuff_ != null) {
        if (this.activeBuff_ instanceof TimekeepersHourglass$timeStasis) {
        } else {
          this.activeBuff_.detach();
          GLog.i(Messages.get$Object$String$ObjectArr(this, 'deactivate', []), []);
        }
      } else if (this.charge_ <= 0) {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'no_charge', []), []);
      } else if (this.cursed) {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'cursed', []), []);
      } else {
        GameScene.show(new (TimekeepersHourglass$1())().$o(this)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(this), Messages.titleCase(this.name()), Messages.get$Object$String$ObjectArr(this, 'prompt', []), [Messages.get$Object$String$ObjectArr(this, 'stasis', []), Messages.get$Object$String$ObjectArr(this, 'freeze', [])]));
      }
    }
  }
  activate(ch: Char): void {
    super.activate(ch);
    if (this.activeBuff_ != null) {
      this.activeBuff_.attachTo(ch);
    }
  }
  doUnequip$Hero$boolean$boolean(hero: Hero, collect: boolean, single: boolean): boolean {
    if (super.doUnequip$Hero$boolean$boolean(hero, collect, single)) {
      if (this.activeBuff_ != null) {
        this.activeBuff_.detach();
        this.activeBuff_ = null;
      }
      return true;
    } else {
      return false;
    }
  }
  passiveBuff(): Artifact$ArtifactBuff {
    return new TimekeepersHourglass$hourglassRecharge().$o(this)._TimekeepersHourglass$hourglassRecharge();
  }
  charge(target: Hero, amount: number): void {
    if (this.charge_ < this.chargeCap_ && !this.cursed && target.buff($J.cls(MagicImmune)) == null) {
      this.partialCharge = Math.fround(this.partialCharge + Math.fround(0.25 * amount));
      while (this.partialCharge >= Math.fround(1)) {
        this.partialCharge--;
        this.charge_++;
      }
      if (this.charge_ >= this.chargeCap_) {
        this.partialCharge = 0;
      }
      Item.updateQuickslot();
    }
  }
  upgrade$(): Item {
    this.chargeCap_ = (this.chargeCap_ + 1) | 0;
    while (((this.level$() + 1) | 0) > this.sandBags) {
      this.sandBags++;
    }
    return super.upgrade$();
  }
  desc(): string {
    let desc = super.desc();
    if (this.isEquipped(Dungeon.hero)) {
      if (!this.cursed) {
        if (this.level$() < this.levelCap) {
          desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_hint', []);
        }
      } else {
        desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_cursed', []);
      }
    }
    return desc;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(TimekeepersHourglass.SANDBAGS, this.sandBags);
    if (this.activeBuff_ != null) {
      bundle.put$String$Bundlable(TimekeepersHourglass.BUFF, this.activeBuff_);
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.sandBags = bundle.getInt(TimekeepersHourglass.SANDBAGS);
    if (bundle.contains(TimekeepersHourglass.BUFF)) {
      let buffBundle = bundle.getBundle(TimekeepersHourglass.BUFF);
      if (buffBundle.contains(TimekeepersHourglass$timeFreeze.PRESSES)) {
        this.activeBuff_ = new TimekeepersHourglass$timeFreeze().$o(this)._TimekeepersHourglass$timeFreeze();
      } else {
        this.activeBuff_ = new TimekeepersHourglass$timeStasis().$o(this)._TimekeepersHourglass$timeStasis();
      }
      this.activeBuff_.restoreFromBundle(buffBundle);
    }
  }
}

export class TimekeepersHourglass$hourglassRecharge extends Artifact$ArtifactBuff {
  _TimekeepersHourglass$hourglassRecharge(): this {
    this._Artifact$ArtifactBuff();
    return this;
  }
  act(): boolean {
    if (this.$outer.charge_ < this.$outer.chargeCap_ && !this.$outer.cursed && this.target.buff($J.cls(MagicImmune)) == null && Regeneration.regenOn()) {
      let chargeGain = Math.fround(1 / (Math.fround(90 - Math.fround(((this.$outer.chargeCap_ - this.$outer.charge_) | 0) * 3))));
      chargeGain = Math.fround(chargeGain * RingOfEnergy.artifactChargeMultiplier(this.target));
      this.$outer.partialCharge = Math.fround(this.$outer.partialCharge + chargeGain);
      while (this.$outer.partialCharge >= Math.fround(1)) {
        this.$outer.partialCharge--;
        this.$outer.charge_++;
        if (this.$outer.charge_ === this.$outer.chargeCap_) {
          this.$outer.partialCharge = 0;
        }
      }
    } else if (this.$outer.cursed && Random.Int$int(10) === 0) {
      (this.target).spend(Actor.TICK);
    }
    Item.updateQuickslot();
    this.spend(Actor.TICK);
    return true;
  }
}

export class TimekeepersHourglass$timeStasis extends Artifact$ArtifactBuff {
  _TimekeepersHourglass$timeStasis(): this {
    this._Artifact$ArtifactBuff();
    this.type_ = Buff$buffType.POSITIVE;
    this.actPriority = (Actor.BUFF_PRIO - 3) | 0;
    return this;
  }
  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      Invisibility.dispel$();
      let usedCharge = Math.min(this.$outer.charge_, 2);
      this.spend(Math.fround(Math.imul(5, usedCharge)));
      let hunger = Buff.affect$Char$Class(target, $J.cls(Hunger));
      if (hunger != null && !hunger.isStarving()) {
        hunger.satisfy(Math.fround(Math.imul(5, usedCharge)));
      }
      this.$outer.charge_ = (this.$outer.charge_ - usedCharge) | 0;
      target.invisible++;
      target.paralysed++;
      target.next();
      Item.updateQuickslot();
      if (Dungeon.hero != null) {
        Dungeon.observe$();
      }
      return true;
    } else {
      return false;
    }
  }
  act(): boolean {
    this.detach();
    return true;
  }
  detach(): void {
    if (this.target.invisible > 0) {
      this.target.invisible--;
    }
    if (this.target.paralysed > 0) {
      this.target.paralysed--;
    }
    super.detach();
    this.$outer.activeBuff_ = null;
    Dungeon.observe$();
  }
  fx(on: boolean): void {
    if (on) {
      this.target.sprite_.add(CharSprite$State.PARALYSED);
    } else {
      if (this.target.paralysed === 0) {
        this.target.sprite_.remove$State(CharSprite$State.PARALYSED);
      }
      if (this.target.invisible === 0) {
        this.target.sprite_.remove$State(CharSprite$State.INVISIBLE);
      }
    }
  }
}

export class TimekeepersHourglass$timeFreeze extends Artifact$ArtifactBuff {
  turnsToCost: number = 0;
  presses: ArrayList<number> = null;
  static readonly PRESSES: string = 'presses';
  static readonly TURNSTOCOST: string = 'turnsToCost';
  _TimekeepersHourglass$timeFreeze(): this {
    this._Artifact$ArtifactBuff();
    this.type_ = Buff$buffType.POSITIVE;
    this.turnsToCost = 2;
    this.presses = new ArrayList();
    return this;
  }
  processTime(time: number): void {
    this.turnsToCost = Math.fround(this.turnsToCost - time);
    while (this.turnsToCost < Math.fround(-Math.fround(0.001))) {
      this.turnsToCost = Math.fround(this.turnsToCost + 2);
      this.$outer.charge_--;
    }
    Item.updateQuickslot();
    if (this.$outer.charge_ < 0 || this.$outer.charge_ === 0 && this.turnsToCost <= Math.fround(0)) {
      this.$outer.charge_ = 0;
      this.detach();
    }
  }
  setDelayedPress(cell: number): void {
    if (!this.presses.contains(cell)) {
      this.presses.add(cell);
    }
  }
  triggerPresses(): void {
    let toTrigger = this.presses;
    this.presses = new ArrayList();
    Actor.add$Actor(new (TimekeepersHourglass$timeFreeze$1())().$o(this).$c(toTrigger)._Actor().$init_anon());
  }
  disarmPresses(): void {
    for (const $it1 = this.presses.iterator(); $it1.hasNext(); ) {
      let cell = $it1.next();
      let p = Dungeon.level.plants.get(cell);
      if (p != null && !(p instanceof Rotberry)) {
        Dungeon.level.uproot(cell);
      }
      let t = Dungeon.level.traps.get(cell);
      if (t != null && t.disarmedByActivation) {
        t.disarm();
      }
    }
    this.presses = new ArrayList();
  }
  detach(): void {
    Item.updateQuickslot();
    super.detach();
    this.$outer.activeBuff_ = null;
    this.triggerPresses();
    this.target.next();
  }
  fx(on: boolean): void {
    if (!(this.target instanceof Hero)) {
      return;
    }
    Emitter.freezeEmitters = on;
    if (on) {
      for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
        if (mob.sprite_ != null) {
          mob.sprite_.add(CharSprite$State.PARALYSED);
        }
      }
    } else {
      for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
        if (mob.paralysed <= 0) {
          mob.sprite_.remove$State(CharSprite$State.PARALYSED);
        }
      }
    }
  }
  icon(): number {
    return BuffIndicator.TIME;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, 0.5, 0);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(2 - this.turnsToCost)) / 2));
  }
  iconTextDisplay(): string {
    return String($J.d2i((Math.fround(this.turnsToCost + Math.fround(0.001)))));
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [Messages.decimalFormat('#.##', Math.max(0, this.turnsToCost))]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    let values = $J.newArray(this.presses.size(), 0);
    for (let i = 0; i < values.length; i++) {
      values[i] = this.presses.get(i);
    }
    bundle.put$String$intArr(TimekeepersHourglass$timeFreeze.PRESSES, values);
    bundle.put$String$float(TimekeepersHourglass$timeFreeze.TURNSTOCOST, this.turnsToCost);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    let values = bundle.getIntArray(TimekeepersHourglass$timeFreeze.PRESSES);
    for (let value of values) {
      this.presses.add(value);
    }
    this.turnsToCost = bundle.getFloat(TimekeepersHourglass$timeFreeze.TURNSTOCOST);
  }
}

export class TimekeepersHourglass$sandBag extends Item {
  _TimekeepersHourglass$sandBag(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.SANDBAG;
    return this;
  }
  doPickUp$Hero$int(hero: Hero, pos: number): boolean {
    Catalog.setSeen($J.getClass(this));
    Statistics.itemTypesDiscovered.add($J.getClass(this));
    let hourglass = hero.belongings.getItem($J.cls(TimekeepersHourglass));
    if (hourglass != null && !hourglass.cursed) {
      hourglass.upgrade$();
      Catalog.countUses(hourglass.getClass(), 2);
      Sample.INSTANCE.play$Object(Assets$Sounds.DEWDROP);
      if (hourglass.level$() === hourglass.levelCap) {
        GLog.p(Messages.get$Object$String$ObjectArr(this, 'maxlevel', []), []);
      } else {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'levelup', []), []);
      }
      GameScene.pickUp(this, pos);
      hero.spendAndNext(this.pickupDelay());
      return true;
    } else {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_hourglass', []), []);
      return false;
    }
  }
  value(): number {
    return 30;
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return true;
  }
}

let $TimekeepersHourglass$1: any = null;
/** An anonymous class (TimekeepersHourglass.java:119). */
function TimekeepersHourglass$1(): any {
  return $TimekeepersHourglass$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        GLog.i(Messages.get$Class$String$ObjectArr($J.cls(TimekeepersHourglass), 'onstasis', []), []);
        GameScene.flash$int(-2130706433);
        Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
        this.$outer.activeBuff_ = new TimekeepersHourglass$timeStasis().$o(this.$outer)._TimekeepersHourglass$timeStasis();
        Talent.onArtifactUsed(Dungeon.hero);
        this.$outer.activeBuff_.attachTo(Dungeon.hero);
      } else if (index === 1) {
        for (let mob of $J.toArrayInto(Dungeon.level.mobs.toArray(), $J.newArray(0, null))) {
          if (Dungeon.level.heroFOV[mob.pos]) {
            Artifact.artifactProc(mob, this.$outer.visiblyUpgraded(), 1);
          }
        }
        GLog.i(Messages.get$Class$String$ObjectArr($J.cls(TimekeepersHourglass), 'onfreeze', []), []);
        GameScene.flash$int(-2130706433);
        Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
        Invisibility.dispel$Char(Dungeon.hero);
        this.$outer.activeBuff_ = new TimekeepersHourglass$timeFreeze().$o(this.$outer)._TimekeepersHourglass$timeFreeze();
        Talent.onArtifactUsed(Dungeon.hero);
        this.$outer.activeBuff_.attachTo(Dungeon.hero);
        this.$outer.charge_--;
        (this.$outer.activeBuff_).processTime(0);
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TimekeepersHourglass$1', []);
}

let $TimekeepersHourglass$timeFreeze$1: any = null;
/** An anonymous class (TimekeepersHourglass.java:387). */
function TimekeepersHourglass$timeFreeze$1(): any {
  return $TimekeepersHourglass$timeFreeze$1 ??= $J.local(class extends Actor {
    $init_anon() {
      this.actPriority = Actor.VFX_PRIO;
      return this;
    }
    act(): boolean {
      for (const $it0 = this.$cv_toTrigger.iterator(); $it0.hasNext(); ) {
        let cell = $it0.next();
        let p = Dungeon.level.plants.get(cell);
        if (p != null) {
          p.trigger();
        }
        let t = Dungeon.level.traps.get(cell);
        if (t != null) {
          t.trigger();
        }
      }
      Actor.remove(this);
      return true;
    }
    $c($toTrigger): this {
      this.$cv_toTrigger = $toTrigger;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TimekeepersHourglass$timeFreeze$1', []);
}

$J.define(TimekeepersHourglass, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TimekeepersHourglass', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact', ctors: { '': '_TimekeepersHourglass' }, meths: { 'upgrade()': 'upgrade$', 'doUnequip(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,boolean,boolean)': 'doUnequip$Hero$boolean$boolean', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' } });
$J.define(TimekeepersHourglass$hourglassRecharge, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TimekeepersHourglass$hourglassRecharge', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact$ArtifactBuff', ctors: { '': '_TimekeepersHourglass$hourglassRecharge' }, inner: true });
$J.define(TimekeepersHourglass$timeStasis, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TimekeepersHourglass$timeStasis', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact$ArtifactBuff', ctors: { '': '_TimekeepersHourglass$timeStasis' }, inner: true });
$J.define(TimekeepersHourglass$timeFreeze, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TimekeepersHourglass$timeFreeze', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact$ArtifactBuff', ctors: { '': '_TimekeepersHourglass$timeFreeze' }, inner: true });
$J.define(TimekeepersHourglass$sandBag, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TimekeepersHourglass$sandBag', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_TimekeepersHourglass$sandBag' }, meths: { 'doPickUp(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,int)': 'doPickUp$Hero$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Regeneration = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  RingOfEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEnergy');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Rotberry = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Rotberry');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Emitter = $J.load('com.watabou.noosa.particles.Emitter');
  Random = $J.load('com.watabou.utils.Random');
});
