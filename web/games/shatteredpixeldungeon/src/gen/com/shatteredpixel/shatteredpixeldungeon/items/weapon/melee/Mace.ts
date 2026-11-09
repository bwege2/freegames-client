// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Mace.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Actor, Char, Buff, Daze, Invisibility, Mob, Messages, ItemSpriteSheet, AttackIndicator, GLog, Sample;

export class Mace extends MeleeWeapon {
  _Mace(): this {
    this._MeleeWeapon();
    this.image_ = ItemSpriteSheet.MACE;
    this.hitSound_ = Assets$Sounds.HIT_CRUSH;
    this.hitSoundPitch = 1;
    this.tier_ = 3;
    this.ACC = Math.fround(1.28);
    return this;
  }
  max$int(lvl: number): number {
    return (Math.imul(4, ((this.tier_ + 1) | 0)) + Math.imul(lvl, ((this.tier_ + 1) | 0))) | 0;
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  duelistAbility(hero: Hero, target: number): void {
    let dmgBoost = this.augment.damageFactor$int((5 + $J.roundf(Math.fround(1.5 * this.buffedLvl()))) | 0);
    Mace.heavyBlowAbility(hero, target, 1, dmgBoost, this);
  }
  abilityInfo(): string {
    let dmgBoost = this.levelKnown ? (5 + $J.roundf(Math.fround(1.5 * this.buffedLvl()))) | 0 : 5;
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'ability_desc', [this.augment.damageFactor$int((this.min$() + dmgBoost) | 0), this.augment.damageFactor$int((this.max$() + dmgBoost) | 0)]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_ability_desc', [(this.min$int(0) + dmgBoost) | 0, (this.max$int(0) + dmgBoost) | 0]);
    }
  }
  upgradeAbilityStat(level: number): string {
    let dmgBoost = (5 + $J.roundf(Math.fround(1.5 * level))) | 0;
    return this.augment.damageFactor$int((this.min$int(level) + dmgBoost) | 0) + '-' + this.augment.damageFactor$int((this.max$int(level) + dmgBoost) | 0);
  }
  static heavyBlowAbility(hero: Hero, target: number, dmgMulti: number, dmgBoost: number, wep: MeleeWeapon): void {
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
    if (enemy instanceof Mob && !(enemy).surprisedBy$Char(hero)) {
      dmgMulti = Math.min(1, dmgMulti);
      dmgBoost = 0;
    }
    let finalDmgMulti = dmgMulti;
    let finalDmgBoost = dmgBoost;
    hero.sprite_.attack$int$Callback(enemy.pos, new (Mace$1())().$c(wep, hero, enemy, finalDmgMulti, finalDmgBoost));
  }
}

let $Mace$1: any = null;
/** An anonymous class (Mace.java:111). */
function Mace$1(): any {
  return $Mace$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$cv_wep.beforeAbilityUsed(this.$cv_hero, this.$cv_enemy);
      AttackIndicator.target(this.$cv_enemy);
      if (this.$cv_hero.attack$Char$float$float$float(this.$cv_enemy, this.$cv_finalDmgMulti, Math.fround(this.$cv_finalDmgBoost), Math.fround(Char.INFINITE_ACCURACY))) {
        Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STRONG);
        if (this.$cv_enemy.isAlive()) {
          Buff.affect$Char$Class$float(this.$cv_enemy, $J.cls(Daze), Daze.DURATION);
        } else {
          MeleeWeapon.onAbilityKill(this.$cv_hero, this.$cv_enemy);
        }
      }
      Invisibility.dispel$();
      this.$cv_hero.spendAndNext(this.$cv_hero.attackDelay());
      this.$cv_wep.afterAbilityUsed(this.$cv_hero);
    }
    $c($wep, $hero, $enemy, $finalDmgMulti, $finalDmgBoost): this {
      this.$cv_wep = $wep; this.$cv_hero = $hero; this.$cv_enemy = $enemy; this.$cv_finalDmgMulti = $finalDmgMulti; this.$cv_finalDmgBoost = $finalDmgBoost;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Mace$1', ['com.watabou.utils.Callback']);
}

$J.define(Mace, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Mace', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon', ctors: { '': '_Mace' }, meths: { 'max(int)': 'max$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Daze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Daze');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  AttackIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.AttackIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
