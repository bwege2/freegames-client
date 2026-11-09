// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/KindOfWeapon.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JString } from '../../../../../jre/index.ts';
import { EquipableItem } from './EquipableItem.ts';

let Assets$Sounds, Badges, Dungeon, Actor, Buff, Hero, HeroClass, HeroSubClass, Talent, Talent$SwiftEquipCooldown, Item, Messages, GameScene, ItemSprite, GLog, WndOptions, Sample, BArray, PathFinder, Random;

export class KindOfWeapon extends EquipableItem {
  hitSound_: string = null;
  hitSoundPitch: number = 0;
  static isSwiftEquipping: boolean = false;
  _KindOfWeapon(): this {
    this._EquipableItem();
    this.hitSound_ = Assets$Sounds.HIT;
    this.hitSoundPitch = 1;
    return this;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    if (hero.subClass === HeroSubClass.CHAMPION && $J.equals(action, EquipableItem.AC_EQUIP)) {
      this.usesTargeting_ = false;
      let primaryName = Messages.titleCase(hero.belongings.weapon_ != null ? hero.belongings.weapon_.trueName() : Messages.get$Class$String$ObjectArr($J.cls(KindOfWeapon), 'empty', []));
      let secondaryName = Messages.titleCase(hero.belongings.secondWep_ != null ? hero.belongings.secondWep_.trueName() : Messages.get$Class$String$ObjectArr($J.cls(KindOfWeapon), 'empty', []));
      if (primaryName.length > 18) {
        primaryName = primaryName.substring(0, 15) + '...';
      }
      if (secondaryName.length > 18) {
        secondaryName = secondaryName.substring(0, 15) + '...';
      }
      GameScene.show(new (KindOfWeapon$1())().$o(this).$c(hero)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(this), Messages.titleCase(this.name()), Messages.get$Class$String$ObjectArr($J.cls(KindOfWeapon), 'which_equip_msg', []), [Messages.get$Class$String$ObjectArr($J.cls(KindOfWeapon), 'which_equip_primary', [primaryName]), Messages.get$Class$String$ObjectArr($J.cls(KindOfWeapon), 'which_equip_secondary', [secondaryName])]));
    } else {
      super.execute$Hero$String(hero, action);
    }
  }
  isEquipped(hero: Hero): boolean {
    return hero != null && (hero.belongings.weapon() === this || hero.belongings.secondWep() === this);
  }
  timeToEquip(hero: Hero): number {
    return KindOfWeapon.isSwiftEquipping ? 0 : super.timeToEquip(hero);
  }
  doEquip(hero: Hero): boolean {
    KindOfWeapon.isSwiftEquipping = false;
    if (hero.belongings.contains(this) && hero.hasTalent(Talent.SWIFT_EQUIP)) {
      if (hero.buff($J.cls(Talent$SwiftEquipCooldown)) == null || hero.buff($J.cls(Talent$SwiftEquipCooldown)).hasSecondUse()) {
        KindOfWeapon.isSwiftEquipping = true;
      }
    }
    if (hero.heroClass !== HeroClass.CLERIC && hero.hasTalent(Talent.HOLY_INTUITION) && this.cursed && !this.cursedKnown && Random.Int$int(20) < ((1 + Math.imul(2, hero.pointsInTalent(Talent.HOLY_INTUITION))) | 0)) {
      this.cursedKnown = true;
      GLog.p(Messages.get$Object$String$ObjectArr(this, 'curse_detected', []), []);
      return false;
    }
    this.detachAll(hero.belongings.backpack);
    if (hero.belongings.weapon_ == null || hero.belongings.weapon_.doUnequip$Hero$boolean(hero, true)) {
      hero.belongings.weapon_ = this;
      this.activate(hero);
      Talent.onItemEquipped(hero, this);
      Badges.validateDuelistUnlock();
      Item.updateQuickslot();
      this.cursedKnown = true;
      if (this.cursed) {
        EquipableItem.equipCursed(hero);
        GLog.n(Messages.get$Class$String$ObjectArr($J.cls(KindOfWeapon), 'equip_cursed', []), []);
      }
      hero.spendAndNext(this.timeToEquip(hero));
      if (KindOfWeapon.isSwiftEquipping) {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'swift_equip', []), []);
        if (hero.buff($J.cls(Talent$SwiftEquipCooldown)) == null) {
          Buff.affect$Char$Class$float(hero, $J.cls(Talent$SwiftEquipCooldown), 19).secondUse = hero.pointsInTalent(Talent.SWIFT_EQUIP) === 2;
        } else if (hero.buff($J.cls(Talent$SwiftEquipCooldown)).hasSecondUse()) {
          hero.buff($J.cls(Talent$SwiftEquipCooldown)).secondUse = false;
        }
        KindOfWeapon.isSwiftEquipping = false;
      }
      return true;
    } else {
      KindOfWeapon.isSwiftEquipping = false;
      this.collect$Bag(hero.belongings.backpack);
      return false;
    }
  }
  equipSecondary(hero: Hero): boolean {
    KindOfWeapon.isSwiftEquipping = false;
    if (hero.belongings.contains(this) && hero.hasTalent(Talent.SWIFT_EQUIP)) {
      if (hero.buff($J.cls(Talent$SwiftEquipCooldown)) == null || hero.buff($J.cls(Talent$SwiftEquipCooldown)).hasSecondUse()) {
        KindOfWeapon.isSwiftEquipping = true;
      }
    }
    let wasInInv = hero.belongings.contains(this);
    this.detachAll(hero.belongings.backpack);
    if (hero.belongings.secondWep_ == null || hero.belongings.secondWep_.doUnequip$Hero$boolean(hero, true)) {
      hero.belongings.secondWep_ = this;
      this.activate(hero);
      Talent.onItemEquipped(hero, this);
      Badges.validateDuelistUnlock();
      Item.updateQuickslot();
      this.cursedKnown = true;
      if (this.cursed) {
        EquipableItem.equipCursed(hero);
        GLog.n(Messages.get$Class$String$ObjectArr($J.cls(KindOfWeapon), 'equip_cursed', []), []);
      }
      hero.spendAndNext(this.timeToEquip(hero));
      if (KindOfWeapon.isSwiftEquipping) {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'swift_equip', []), []);
        if (hero.buff($J.cls(Talent$SwiftEquipCooldown)) == null) {
          Buff.affect$Char$Class$float(hero, $J.cls(Talent$SwiftEquipCooldown), 19).secondUse = hero.pointsInTalent(Talent.SWIFT_EQUIP) === 2;
        } else if (hero.buff($J.cls(Talent$SwiftEquipCooldown)).hasSecondUse()) {
          hero.buff($J.cls(Talent$SwiftEquipCooldown)).secondUse = false;
        }
        KindOfWeapon.isSwiftEquipping = false;
      }
      return true;
    } else {
      KindOfWeapon.isSwiftEquipping = false;
      this.collect$Bag(hero.belongings.backpack);
      return false;
    }
  }
  doUnequip$Hero$boolean$boolean(hero: Hero, collect: boolean, single: boolean): boolean {
    let second = hero.belongings.secondWep_ === this;
    if (second) {
      hero.belongings.secondWep_ = null;
    }
    if (super.doUnequip$Hero$boolean$boolean(hero, collect, single)) {
      if (!second) {
        hero.belongings.weapon_ = null;
      }
      return true;
    } else {
      if (second) {
        hero.belongings.secondWep_ = this;
      }
      return false;
    }
  }
  min$(): number {
    return this.min$int(this.buffedLvl());
  }
  max$(): number {
    return this.max$int(this.buffedLvl());
  }
  damageRoll(owner: Char): number {
    if (owner instanceof Hero) {
      return Hero.heroDamageIntRange(this.min$(), this.max$());
    } else {
      return Random.NormalIntRange(this.min$(), this.max$());
    }
  }
  accuracyFactor(owner: Char, target: Char): number {
    return 1;
  }
  delayFactor(owner: Char): number {
    return 1;
  }
  reachFactor(owner: Char): number {
    return 1;
  }
  canReach(owner: Char, target: number): boolean {
    let reach = this.reachFactor(owner);
    if (Dungeon.level.distance(owner.pos, target) > reach) {
      return false;
    } else {
      let passable = BArray.not(Dungeon.level.solid, null);
      for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
        let ch = $it0.next();
        if (ch !== owner) {
          passable[ch.pos] = false;
        }
      }
      PathFinder.buildDistanceMap$int$booleanArr$int(target, passable, reach);
      return PathFinder.distance[owner.pos] <= reach;
    }
  }
  defenseFactor(owner: Char): number {
    return 0;
  }
  proc(attacker: Char, defender: Char, damage: number): number {
    return damage;
  }
  hitSound(pitch: number): void {
    Sample.INSTANCE.play$Object$float$float(this.hitSound_, 1, Math.fround(pitch * this.hitSoundPitch));
  }
  static $clinit() {
    KindOfWeapon.isSwiftEquipping = false;
  }
}

let $KindOfWeapon$1: any = null;
/** An anonymous class (KindOfWeapon.java:63). */
function KindOfWeapon$1(): any {
  return $KindOfWeapon$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      super.onSelect(index);
      if (index === 0 || index === 1) {
        let slot = Dungeon.quickslot.getSlot(this.$outer);
        EquipableItem.slotOfUnequipped = -1;
        if (index === 0) {
          this.$outer.doEquip(this.$cv_hero);
        } else {
          this.$outer.equipSecondary(this.$cv_hero);
        }
        if (slot !== -1) {
          Dungeon.quickslot.setSlot(slot, this.$outer);
          Item.updateQuickslot();
        } else if (EquipableItem.slotOfUnequipped !== -1 && this.$outer.defaultAction() != null) {
          Dungeon.quickslot.setSlot(EquipableItem.slotOfUnequipped, this.$outer);
          Item.updateQuickslot();
        }
      }
    }
    $c($hero): this {
      this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.KindOfWeapon$1', []);
}

$J.define(KindOfWeapon, 'com.shatteredpixel.shatteredpixeldungeon.items.KindOfWeapon', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.EquipableItem', ctors: { '': '_KindOfWeapon' }, meths: { 'max(int)': 'max$int', 'min(int)': 'min$int', 'max()': 'max$', 'min()': 'min$', 'doUnequip(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,boolean,boolean)': 'doUnequip$Hero$boolean$boolean', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' }, clinit: true, lazy: ['isSwiftEquipping'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$SwiftEquipCooldown = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$SwiftEquipCooldown');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
