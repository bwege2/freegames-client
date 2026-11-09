// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/rings/RingOfForce.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { Ring } from './Ring.ts';
import { Ring$RingBuff } from './Ring.ts';
import { Buff } from '../../actors/buffs/Buff.ts';

let Dungeon, Actor, Buff$buffType, MonkEnergy$MonkAbility$FlurryEmpowerTracker, MonkEnergy$MonkAbility$UnarmedAbilityTracker, Hero, HeroClass, SpiritForm$SpiritFormBuff, MeleeWeapon, MeleeWeapon$Charger, Messages, CharSprite, ItemSpriteSheet$Icons, AttackIndicator, BuffIndicator, GLog;

export class RingOfForce extends Ring {
  static AC_ABILITY: string = null;
  _RingOfForce(): this {
    this._Ring();
    this.icon_ = ItemSpriteSheet$Icons.RING_FORCE;
    this.buffClass = $J.cls(RingOfForce$Force);
    return this;
  }
  buff(): Ring$RingBuff {
    return new RingOfForce$Force().$o(this)._RingOfForce$Force();
  }
  static armedDamageBonus(ch: Char): number {
    return Ring.getBuffedBonus(ch, $J.cls(RingOfForce$Force));
  }
  doUnequip$Hero$boolean$boolean(hero: Hero, collect: boolean, single: boolean): boolean {
    if (super.doUnequip$Hero$boolean$boolean(hero, collect, single)) {
      if (hero.buff($J.cls(RingOfForce$BrawlersStance)) != null && hero.buff($J.cls(RingOfForce$Force)) == null) {
        hero.buff($J.cls(RingOfForce$BrawlersStance)).active = false;
      }
      return true;
    } else {
      return false;
    }
  }
  static tier(str: number): number {
    let tier = Math.max(1, Math.fround(((str - 8) | 0) / 2));
    if (tier > Math.fround(5)) {
      tier = Math.fround(5 + Math.fround((Math.fround(tier - 5)) / 2));
    }
    return tier;
  }
  static damageRoll(hero: Hero): number {
    let usingForce = hero.buff($J.cls(RingOfForce$Force)) != null;
    if (hero.buff($J.cls(SpiritForm$SpiritFormBuff)) != null && hero.buff($J.cls(SpiritForm$SpiritFormBuff)).ring() instanceof RingOfForce) {
      usingForce = true;
    }
    if (hero.buff($J.cls(MonkEnergy$MonkAbility$UnarmedAbilityTracker)) != null) {
      usingForce = false;
    }
    if (usingForce) {
      let level = Ring.getBuffedBonus(hero, $J.cls(RingOfForce$Force));
      let tier = RingOfForce.tier(hero.STR());
      let dmg = Hero.heroDamageIntRange(RingOfForce.min(level, tier), RingOfForce.max(level, tier));
      if (hero.buff($J.cls(RingOfForce$BrawlersStance)) != null && hero.buff($J.cls(RingOfForce$BrawlersStance)).active) {
        dmg = (dmg + $J.roundf(Math.fround(Math.fround(3 + tier) + (Math.fround(level * (Math.fround((Math.fround(4 + Math.fround(2 * tier))) / 8))))))) | 0;
      }
      return dmg;
    } else {
      return Hero.heroDamageIntRange(1, Math.max((hero.STR() - 8) | 0, 1));
    }
  }
  static min(lvl: number, tier: number): number {
    if (lvl <= 0) {
      tier = 1;
    }
    return Math.max(0, $J.roundf(Math.fround(tier + lvl)));
  }
  static max(lvl: number, tier: number): number {
    if (lvl <= 0) {
      tier = 1;
    }
    return Math.max(0, $J.roundf(Math.fround(Math.fround(5 * (Math.fround(tier + 1))) + Math.fround(lvl * (Math.fround(tier + 1))))));
  }
  statsInfo(): string {
    let tier = RingOfForce.tier(Dungeon.hero != null ? Dungeon.hero.STR() : 10);
    if (this.isIdentified()) {
      let level = this.soloBuffedBonus();
      let info = Messages.get$Object$String$ObjectArr(this, 'stats', [RingOfForce.min(level, tier), RingOfForce.max(level, tier), level]);
      if (this.isEquipped(Dungeon.hero) && this.soloBuffedBonus() !== this.combinedBuffedBonus(Dungeon.hero)) {
        level = this.combinedBuffedBonus(Dungeon.hero);
        info += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'combined_stats', [RingOfForce.min(level, tier), RingOfForce.max(level, tier), level]);
      }
      return info;
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_stats', [RingOfForce.min(1, tier), RingOfForce.max(1, tier), 1]);
    }
  }
  upgradeStat1(level: number): string {
    if (this.cursed && this.cursedKnown) {
      level = Math.min(-1, (level - 3) | 0);
    }
    let tier = RingOfForce.tier(Dungeon.hero != null ? Dungeon.hero.STR() : 10);
    return RingOfForce.min((level + 1) | 0, tier) + '-' + RingOfForce.max((level + 1) | 0, tier);
  }
  upgradeStat2(level: number): string {
    if (this.cursed && this.cursedKnown) {
      level = Math.min(-1, (level - 3) | 0);
    }
    return String((level + 1) | 0);
  }
  upgradeStat3(level: number): string {
    if (this.cursed && this.cursedKnown) {
      level = Math.min(-1, (level - 3) | 0);
    }
    if (Dungeon.hero != null && Dungeon.hero.heroClass === HeroClass.DUELIST) {
      let tier = RingOfForce.tier(Dungeon.hero != null ? Dungeon.hero.STR() : 10);
      let bonus = $J.roundf(Math.fround(Math.fround(3 + tier) + (Math.fround(level * (Math.fround((Math.fround(4 + Math.fround(2 * tier))) / 8))))));
      return ((RingOfForce.min((level + 1) | 0, tier) + bonus) | 0) + '-' + ((RingOfForce.max((level + 1) | 0, tier) + bonus) | 0);
    } else {
      return null;
    }
  }
  activate(ch: Char): void {
    super.activate(ch);
    if (ch instanceof Hero && (ch).heroClass === HeroClass.DUELIST) {
      Buff.affect$Char$Class(ch, $J.cls(MeleeWeapon$Charger));
    }
  }
  defaultAction(): string {
    if (Dungeon.hero != null && Dungeon.hero.heroClass === HeroClass.DUELIST) {
      return RingOfForce.AC_ABILITY;
    } else {
      return super.defaultAction();
    }
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    if (this.isEquipped(hero) && hero.heroClass === HeroClass.DUELIST) {
      actions.add(RingOfForce.AC_ABILITY);
    }
    return actions;
  }
  actionName(action: string, hero: Hero): string {
    if ($J.equals(action, RingOfForce.AC_ABILITY)) {
      return Messages.upperCase(Messages.get$Object$String$ObjectArr(this, 'ability_name', []));
    } else {
      return super.actionName(action, hero);
    }
  }
  execute$Hero$String(hero: Hero, action: string): void {
    if ($J.equals(action, RingOfForce.AC_ABILITY)) {
      if (!this.isEquipped(hero)) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(MeleeWeapon), 'ability_need_equip', []), []);
      } else if (hero.buff($J.cls(RingOfForce$BrawlersStance)) != null) {
        if (!hero.buff($J.cls(RingOfForce$BrawlersStance)).active) {
          hero.buff($J.cls(RingOfForce$BrawlersStance)).reset();
        } else {
          hero.buff($J.cls(RingOfForce$BrawlersStance)).active = false;
        }
        BuffIndicator.refreshHero();
        AttackIndicator.updateState();
        hero.sprite_.operate$int(hero.pos);
      } else {
        Buff.affect$Char$Class(hero, $J.cls(RingOfForce$BrawlersStance)).reset();
        AttackIndicator.updateState();
        hero.sprite_.operate$int(hero.pos);
      }
    } else {
      super.execute$Hero$String(hero, action);
    }
  }
  info(): string {
    let info = super.info();
    if (Dungeon.hero != null && Dungeon.hero.heroClass === HeroClass.DUELIST && (this.anonymous || this.isIdentified() || this.isEquipped(Dungeon.hero))) {
      let level = this.isIdentified() ? (this.isEquipped(Dungeon.hero) ? Ring.getBuffedBonus(Dungeon.hero, $J.cls(RingOfForce$Force)) : this.soloBuffedBonus()) : 0;
      let tier = RingOfForce.tier(Dungeon.hero.STR());
      let dmgBoost = $J.roundf(Math.fround(Math.fround(3 + tier) + (Math.fround(level * (Math.fround((Math.fround(4 + Math.fround(2 * tier))) / 8))))));
      if (this.isIdentified()) {
        info += '\n\n' + (Messages.get$Object$String$ObjectArr(this, 'ability_desc', [(RingOfForce.min(level, tier) + dmgBoost) | 0, (RingOfForce.max(level, tier) + dmgBoost) | 0]));
      } else {
        info += '\n\n' + (Messages.get$Object$String$ObjectArr(this, 'typical_ability_desc', [(RingOfForce.min(level, tier) + dmgBoost) | 0, (RingOfForce.max(level, tier) + dmgBoost) | 0]));
      }
    }
    return info;
  }
  static fightingUnarmed(hero: Hero): boolean {
    if (hero.belongings.attackingWeapon() == null || hero.buff($J.cls(MonkEnergy$MonkAbility$UnarmedAbilityTracker)) != null) {
      return true;
    }
    if (hero.belongings.thrownWeapon != null || hero.belongings.abilityWeapon != null) {
      return false;
    }
    let stance = hero.buff($J.cls(RingOfForce$BrawlersStance));
    if (stance != null && stance.active) {
      if (hero.buff($J.cls(RingOfForce$Force)) == null) {
        stance.active = false;
        AttackIndicator.updateState();
        return false;
      } else {
        return true;
      }
    }
    return false;
  }
  static unarmedGetsWeaponEnchantment(hero: Hero): boolean {
    if (hero.belongings.attackingWeapon() == null) {
      return false;
    }
    if (hero.buff($J.cls(MonkEnergy$MonkAbility$UnarmedAbilityTracker)) != null) {
      return hero.buff($J.cls(MonkEnergy$MonkAbility$FlurryEmpowerTracker)) != null;
    }
    let stance = hero.buff($J.cls(RingOfForce$BrawlersStance));
    if (stance != null && stance.active) {
      return true;
    }
    return false;
  }
  static unarmedGetsWeaponAugment(hero: Hero): boolean {
    if (hero.belongings.attackingWeapon() == null || hero.buff($J.cls(MonkEnergy$MonkAbility$UnarmedAbilityTracker)) != null) {
      return false;
    }
    let stance = hero.buff($J.cls(RingOfForce$BrawlersStance));
    if (stance != null && stance.active) {
      return true;
    }
    return false;
  }
  static $clinit() {
    RingOfForce.AC_ABILITY = 'ABILITY';
  }
}

export class RingOfForce$Force extends Ring$RingBuff {
  _RingOfForce$Force(): this {
    this._Ring$RingBuff();
    return this;
  }
}

export class RingOfForce$BrawlersStance extends Buff {
  active: boolean = false;
  minTurnsLeft: number = 0;
  static readonly ACTIVE: string = 'active';
  static readonly MIN_TURNS_LEFT: string = 'min_turns_left';
  _RingOfForce$BrawlersStance(): this {
    this._Buff();
    this.announced = true;
    this.type_ = Buff$buffType.POSITIVE;
    this.active = true;
    return this;
  }
  reset(): void {
    if (!this.active) {
      this.target.sprite_.showStatus(CharSprite.POSITIVE, Messages.titleCase(this.name()), []);
    }
    this.active = true;
    this.minTurnsLeft = 50;
  }
  icon(): number {
    return this.active ? BuffIndicator.DUEL_BRAWL : BuffIndicator.NONE;
  }
  act(): boolean {
    this.minTurnsLeft--;
    if (!this.active && this.minTurnsLeft <= 0) {
      this.detach();
    }
    this.spend(Actor.TICK);
    return true;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$boolean(RingOfForce$BrawlersStance.ACTIVE, this.active);
    bundle.put$String$int(RingOfForce$BrawlersStance.MIN_TURNS_LEFT, this.minTurnsLeft);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.active = bundle.getBoolean(RingOfForce$BrawlersStance.ACTIVE);
    this.minTurnsLeft = bundle.getInt(RingOfForce$BrawlersStance.MIN_TURNS_LEFT);
  }
}

$J.define(RingOfForce, 'com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfForce', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring', ctors: { '': '_RingOfForce' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String', 'doUnequip(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,boolean,boolean)': 'doUnequip$Hero$boolean$boolean' }, clinit: true, lazy: ['AC_ABILITY'] });
$J.define(RingOfForce$Force, 'com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfForce$Force', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring$RingBuff', ctors: { '': '_RingOfForce$Force' }, inner: true });
$J.define(RingOfForce$BrawlersStance, 'com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfForce$BrawlersStance', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_RingOfForce$BrawlersStance' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  MonkEnergy$MonkAbility$FlurryEmpowerTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$FlurryEmpowerTracker');
  MonkEnergy$MonkAbility$UnarmedAbilityTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MonkEnergy$MonkAbility$UnarmedAbilityTracker');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  SpiritForm$SpiritFormBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.SpiritForm$SpiritFormBuff');
  MeleeWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon');
  MeleeWeapon$Charger = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon$Charger');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  AttackIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.AttackIndicator');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
