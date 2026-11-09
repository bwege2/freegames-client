// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Sword.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../../jre/index.ts';
import { MeleeWeapon } from './MeleeWeapon.ts';
import { FlavourBuff } from '../../../actors/buffs/FlavourBuff.ts';

let Assets$Sounds, Dungeon, Actor, Char, Buff, Buff$buffType, Invisibility, Messages, ItemSpriteSheet, AttackIndicator, BuffIndicator, GLog, Sample;

export class Sword extends MeleeWeapon {
  _Sword(): this {
    this._MeleeWeapon();
    this.image_ = ItemSpriteSheet.SWORD;
    this.hitSound_ = Assets$Sounds.HIT_SLASH;
    this.hitSoundPitch = 1;
    this.tier_ = 3;
    return this;
  }
  baseChargeUse(hero: Hero, target: Char): number {
    if (hero.buff($J.cls(Sword$CleaveTracker)) != null) {
      return 0;
    } else {
      return 1;
    }
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  duelistAbility(hero: Hero, target: number): void {
    let dmgBoost = this.augment.damageFactor$int((5 + this.buffedLvl()) | 0);
    Sword.cleaveAbility(hero, target, 1, dmgBoost, this);
  }
  abilityInfo(): string {
    let dmgBoost = this.levelKnown ? (5 + this.buffedLvl()) | 0 : 5;
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'ability_desc', [this.augment.damageFactor$int((this.min$() + dmgBoost) | 0), this.augment.damageFactor$int((this.max$() + dmgBoost) | 0)]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_ability_desc', [(this.min$int(0) + dmgBoost) | 0, (this.max$int(0) + dmgBoost) | 0]);
    }
  }
  upgradeAbilityStat(level: number): string {
    let dmgBoost = (5 + level) | 0;
    return this.augment.damageFactor$int((this.min$int(level) + dmgBoost) | 0) + '-' + this.augment.damageFactor$int((this.max$int(level) + dmgBoost) | 0);
  }
  static cleaveAbility(hero: Hero, target: number, dmgMulti: number, dmgBoost: number, wep: MeleeWeapon): void {
    if (target == null) {
      return;
    }
    let enemy = Actor.findChar(target);
    if (enemy == null || enemy === hero || hero.isCharmedBy(enemy) || !Dungeon.level.heroFOV[target]) {
      GLog.w(Messages.get$Object$String$ObjectArr(wep, 'ability_no_target', []), []);
      return;
    }
    hero.belongings.abilityWeapon = wep;
    if (!hero.canAttack(enemy)) {
      GLog.w(Messages.get$Object$String$ObjectArr(wep, 'ability_target_range', []), []);
      hero.belongings.abilityWeapon = null;
      return;
    }
    hero.belongings.abilityWeapon = null;
    hero.sprite_.attack$int$Callback(enemy.pos, new (Sword$1())().$c(wep, hero, enemy, dmgMulti, dmgBoost));
  }
}

export class Sword$CleaveTracker extends FlavourBuff {
  _Sword$CleaveTracker(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.DUEL_CLEAVE;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(5 - this.visualcooldown())) / 5));
  }
}

let $Sword$1: any = null;
/** An anonymous class (Sword.java:105). */
function Sword$1(): any {
  return $Sword$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$cv_wep.beforeAbilityUsed(this.$cv_hero, this.$cv_enemy);
      AttackIndicator.target(this.$cv_enemy);
      if (this.$cv_hero.attack$Char$float$float$float(this.$cv_enemy, this.$cv_dmgMulti, Math.fround(this.$cv_dmgBoost), Math.fround(Char.INFINITE_ACCURACY))) {
        Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STRONG);
      }
      Invisibility.dispel$();
      if (!this.$cv_enemy.isAlive()) {
        this.$cv_hero.next();
        MeleeWeapon.onAbilityKill(this.$cv_hero, this.$cv_enemy);
        if (this.$cv_hero.buff($J.cls(Sword$CleaveTracker)) != null) {
          this.$cv_hero.buff($J.cls(Sword$CleaveTracker)).detach();
        } else {
          Buff.prolong(this.$cv_hero, $J.cls(Sword$CleaveTracker), 4);
        }
      } else {
        this.$cv_hero.spendAndNext(this.$cv_hero.attackDelay());
        if (this.$cv_hero.buff($J.cls(Sword$CleaveTracker)) != null) {
          this.$cv_hero.buff($J.cls(Sword$CleaveTracker)).detach();
        }
      }
      this.$cv_wep.afterAbilityUsed(this.$cv_hero);
    }
    $c($wep, $hero, $enemy, $dmgMulti, $dmgBoost): this {
      this.$cv_wep = $wep; this.$cv_hero = $hero; this.$cv_enemy = $enemy; this.$cv_dmgMulti = $dmgMulti; this.$cv_dmgBoost = $dmgBoost;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Sword$1', ['com.watabou.utils.Callback']);
}

$J.define(Sword, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Sword', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon', ctors: { '': '_Sword' } });
$J.define(Sword$CleaveTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Sword$CleaveTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Sword$CleaveTracker' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  AttackIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.AttackIndicator');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
