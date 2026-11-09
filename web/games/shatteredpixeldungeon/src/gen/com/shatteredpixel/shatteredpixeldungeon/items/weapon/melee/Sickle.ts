// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Sickle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Actor, Char, Buff, Invisibility, Messages, ItemSpriteSheet, AttackIndicator, GLog, Sample;

export class Sickle extends MeleeWeapon {
  _Sickle(): this {
    this._MeleeWeapon();
    this.image_ = ItemSpriteSheet.SICKLE;
    this.hitSound_ = Assets$Sounds.HIT_SLASH;
    this.hitSoundPitch = 1;
    this.tier_ = 2;
    this.ACC = Math.fround(0.68);
    return this;
  }
  max$int(lvl: number): number {
    return ($J.roundf(Math.fround(Math.fround(6.67) * ((this.tier_ + 1) | 0))) + Math.imul(lvl, ((this.tier_ + 1) | 0))) | 0;
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  duelistAbility(hero: Hero, target: number): void {
    let bleedAmt = this.augment.damageFactor$int($J.roundf(Math.fround(15 + Math.fround(2.5 * this.buffedLvl()))));
    Sickle.harvestAbility(hero, target, 0, bleedAmt, this);
  }
  abilityInfo(): string {
    let bleedAmt = this.levelKnown ? $J.roundf(Math.fround(15 + Math.fround(2.5 * this.buffedLvl()))) : 15;
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'ability_desc', [this.augment.damageFactor$int(bleedAmt)]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_ability_desc', [bleedAmt]);
    }
  }
  upgradeAbilityStat(level: number): string {
    return String(this.augment.damageFactor$int($J.roundf(Math.fround(15 + Math.fround(2.5 * level)))));
  }
  static harvestAbility(hero: Hero, target: number, bleedMulti: number, bleedBoost: number, wep: MeleeWeapon): void {
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
    hero.sprite_.attack$int$Callback(enemy.pos, new (Sickle$1())().$c(wep, hero, enemy, bleedMulti, bleedBoost));
  }
}

export class Sickle$HarvestBleedTracker extends FlavourBuff {
  _Sickle$HarvestBleedTracker(): this {
    this._FlavourBuff();
    return this;
  }
}

let $Sickle$1: any = null;
/** An anonymous class (Sickle.java:103). */
function Sickle$1(): any {
  return $Sickle$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$cv_wep.beforeAbilityUsed(this.$cv_hero, this.$cv_enemy);
      AttackIndicator.target(this.$cv_enemy);
      Buff.affect$Char$Class$float(this.$cv_hero, $J.cls(Sickle$HarvestBleedTracker), 0);
      if (this.$cv_hero.attack$Char$float$float$float(this.$cv_enemy, this.$cv_bleedMulti, Math.fround(this.$cv_bleedBoost), Math.fround(Char.INFINITE_ACCURACY))) {
        Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STRONG);
      }
      Invisibility.dispel$();
      this.$cv_hero.spendAndNext(this.$cv_hero.attackDelay());
      if (!this.$cv_enemy.isAlive()) {
        MeleeWeapon.onAbilityKill(this.$cv_hero, this.$cv_enemy);
      }
      this.$cv_wep.afterAbilityUsed(this.$cv_hero);
    }
    $c($wep, $hero, $enemy, $bleedMulti, $bleedBoost): this {
      this.$cv_wep = $wep; this.$cv_hero = $hero; this.$cv_enemy = $enemy; this.$cv_bleedMulti = $bleedMulti; this.$cv_bleedBoost = $bleedBoost;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Sickle$1', ['com.watabou.utils.Callback']);
}

$J.define(Sickle, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Sickle', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon', ctors: { '': '_Sickle' }, meths: { 'max(int)': 'max$int' } });
$J.define(Sickle$HarvestBleedTracker, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Sickle$HarvestBleedTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Sickle$HarvestBleedTracker' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  AttackIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.AttackIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
