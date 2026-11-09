// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Crossbow.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { MeleeWeapon } from './MeleeWeapon.ts';
import { Buff } from '../../../actors/buffs/Buff.ts';

let Assets$Sounds, Dungeon, Actor, Buff$buffType, Hero, WandOfBlastWave, Ballistica, Messages, ItemSpriteSheet, BuffIndicator, GLog;

export class Crossbow extends MeleeWeapon {
  _Crossbow(): this {
    this._MeleeWeapon();
    this.image_ = ItemSpriteSheet.CROSSBOW;
    this.hitSound_ = Assets$Sounds.HIT;
    this.hitSoundPitch = 1;
    this.tier_ = 4;
    return this;
  }
  doUnequip$Hero$boolean$boolean(hero: Hero, collect: boolean, single: boolean): boolean {
    if (super.doUnequip$Hero$boolean$boolean(hero, collect, single)) {
      if (hero.buff($J.cls(Crossbow$ChargedShot)) != null && !(hero.belongings.weapon() instanceof Crossbow) && !(hero.belongings.secondWep() instanceof Crossbow)) {
        hero.buff($J.cls(Crossbow$ChargedShot)).detach();
      }
      return true;
    } else {
      return false;
    }
  }
  accuracyFactor(owner: Char, target: Char): number {
    if (owner.buff($J.cls(Crossbow$ChargedShot)) != null) {
      Actor.add$Actor(new (Crossbow$1())().$o(this).$c(owner, target)._Actor().$init_anon());
      return Infinity;
    } else {
      return super.accuracyFactor(owner, target);
    }
  }
  proc(attacker: Char, defender: Char, damage: number): number {
    let dmg = super.proc(attacker, defender, damage);
    if (attacker === Dungeon.hero && Dungeon.hero.buff($J.cls(Crossbow$ChargedShot)) != null && Dungeon.hero.belongings.attackingWeapon() === this) {
      let trajectory = new Ballistica()._Ballistica(attacker.pos, defender.pos, Ballistica.STOP_TARGET);
      trajectory = new Ballistica()._Ballistica(trajectory.collisionPos, trajectory.path.get((trajectory.path.size() - 1) | 0), Ballistica.PROJECTILE);
      WandOfBlastWave.throwChar(defender, trajectory, 4, true, true, this);
      attacker.buff($J.cls(Crossbow$ChargedShot)).detach();
    }
    return dmg;
  }
  max$int(lvl: number): number {
    return (Math.imul(4, ((this.tier_ + 1) | 0)) + Math.imul(lvl, (this.tier_))) | 0;
  }
  dartMin$(): number {
    return this.dartMin$int(this.buffedLvl());
  }
  dartMin$int(lvl: number): number {
    return (4 + lvl) | 0;
  }
  dartMax$(): number {
    return this.dartMax$int(this.buffedLvl());
  }
  dartMax$int(lvl: number): number {
    return (12 + Math.imul(3, lvl)) | 0;
  }
  statsInfo(): string {
    if (this.isIdentified()) {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [this.dartMin$(), this.dartMax$()]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_stats_desc', [this.dartMin$int(0), this.dartMax$int(0)]);
    }
  }
  duelistAbility(hero: Hero, target: number): void {
    if (hero.buff($J.cls(Crossbow$ChargedShot)) != null) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'ability_cant_use', []), []);
      return;
    }
    this.beforeAbilityUsed(hero, null);
    Buff.affect$Char$Class(hero, $J.cls(Crossbow$ChargedShot));
    hero.sprite_.operate$int(hero.pos);
    hero.next();
    this.afterAbilityUsed(hero);
  }
  abilityInfo(): string {
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'ability_desc', [(3 + this.buffedLvl()) | 0, (3 + this.buffedLvl()) | 0]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_ability_desc', [3, 3]);
    }
  }
  upgradeAbilityStat(level: number): string {
    return String((3 + level) | 0);
  }
}

export class Crossbow$ChargedShot extends Buff {
  _Crossbow$ChargedShot(): this {
    this._Buff();
    this.announced = true;
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.DUEL_XBOW;
  }
}

let $Crossbow$1: any = null;
/** An anonymous class (Crossbow.java:67). */
function Crossbow$1(): any {
  return $Crossbow$1 ??= $J.local(class extends Actor {
    $init_anon() {
      this.actPriority = Actor.VFX_PRIO;
      return this;
    }
    act(): boolean {
      if (this.$cv_owner instanceof Hero && !this.$cv_target.isAlive()) {
        MeleeWeapon.onAbilityKill(this.$cv_owner, this.$cv_target);
      }
      Actor.remove(this);
      return true;
    }
    $c($owner, $target): this {
      this.$cv_owner = $owner; this.$cv_target = $target;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Crossbow$1', []);
}

$J.define(Crossbow, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Crossbow', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon', ctors: { '': '_Crossbow' }, meths: { 'dartMax(int)': 'dartMax$int', 'dartMax()': 'dartMax$', 'dartMin(int)': 'dartMin$int', 'dartMin()': 'dartMin$', 'max(int)': 'max$int', 'doUnequip(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,boolean,boolean)': 'doUnequip$Hero$boolean$boolean' } });
$J.define(Crossbow$ChargedShot, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Crossbow$ChargedShot', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Crossbow$ChargedShot' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  WandOfBlastWave = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
