// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Spear.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Actor, Char, Invisibility, Pushing, WandOfBlastWave, Ballistica, Messages, ItemSpriteSheet, AttackIndicator, GLog, Sample;

export class Spear extends MeleeWeapon {
  _Spear(): this {
    this._MeleeWeapon();
    this.image_ = ItemSpriteSheet.SPEAR;
    this.hitSound_ = Assets$Sounds.HIT_STAB;
    this.hitSoundPitch = Math.fround(0.9);
    this.tier_ = 2;
    this.DLY = 1.5;
    this.RCH = 2;
    return this;
  }
  max$int(lvl: number): number {
    return ($J.roundf(Math.fround(Math.fround(6.67) * ((this.tier_ + 1) | 0))) + Math.imul(lvl, $J.roundf(Math.fround(Math.fround(1.33) * ((this.tier_ + 1) | 0))))) | 0;
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  duelistAbility(hero: Hero, target: number): void {
    let dmgBoost = this.augment.damageFactor$int((9 + $J.roundf(Math.fround(2 * this.buffedLvl()))) | 0);
    Spear.spikeAbility(hero, target, 1, dmgBoost, this);
  }
  abilityInfo(): string {
    let dmgBoost = this.levelKnown ? (9 + $J.roundf(Math.fround(2 * this.buffedLvl()))) | 0 : 9;
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'ability_desc', [this.augment.damageFactor$int((this.min$() + dmgBoost) | 0), this.augment.damageFactor$int((this.max$() + dmgBoost) | 0)]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_ability_desc', [(this.min$int(0) + dmgBoost) | 0, (this.max$int(0) + dmgBoost) | 0]);
    }
  }
  upgradeAbilityStat(level: number): string {
    let dmgBoost = (9 + $J.roundf(Math.fround(2 * level))) | 0;
    return this.augment.damageFactor$int((this.min$int(level) + dmgBoost) | 0) + '-' + this.augment.damageFactor$int((this.max$int(level) + dmgBoost) | 0);
  }
  static spikeAbility(hero: Hero, target: number, dmgMulti: number, dmgBoost: number, wep: MeleeWeapon): void {
    if (target == null) {
      return;
    }
    let enemy = Actor.findChar(target);
    if (enemy == null || enemy === hero || hero.isCharmedBy(enemy) || !Dungeon.level.heroFOV[target]) {
      GLog.w(Messages.get$Object$String$ObjectArr(wep, 'ability_no_target', []), []);
      return;
    }
    hero.belongings.abilityWeapon = wep;
    if (!hero.canAttack(enemy) || Dungeon.level.adjacent(hero.pos, enemy.pos)) {
      GLog.w(Messages.get$Object$String$ObjectArr(wep, 'ability_target_range', []), []);
      hero.belongings.abilityWeapon = null;
      return;
    }
    hero.belongings.abilityWeapon = null;
    hero.sprite_.attack$int$Callback(enemy.pos, new (Spear$1())().$c(wep, hero, enemy, dmgMulti, dmgBoost));
  }
}

let $Spear$1: any = null;
/** An anonymous class (Spear.java:104). */
function Spear$1(): any {
  return $Spear$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$cv_wep.beforeAbilityUsed(this.$cv_hero, this.$cv_enemy);
      AttackIndicator.target(this.$cv_enemy);
      let oldPos = this.$cv_enemy.pos;
      if (this.$cv_hero.attack$Char$float$float$float(this.$cv_enemy, this.$cv_dmgMulti, Math.fround(this.$cv_dmgBoost), Math.fround(Char.INFINITE_ACCURACY))) {
        if (this.$cv_enemy.isAlive() && this.$cv_enemy.pos === oldPos && !Pushing.pushingExistsForChar(this.$cv_enemy)) {
          let trajectory = new Ballistica()._Ballistica(this.$cv_hero.pos, this.$cv_enemy.pos, Ballistica.STOP_TARGET);
          trajectory = new Ballistica()._Ballistica(trajectory.collisionPos, trajectory.path.get((trajectory.path.size() - 1) | 0), Ballistica.PROJECTILE);
          WandOfBlastWave.throwChar(this.$cv_enemy, trajectory, 1, true, false, this.$cv_hero);
        } else if (!this.$cv_enemy.isAlive()) {
          MeleeWeapon.onAbilityKill(this.$cv_hero, this.$cv_enemy);
        }
        Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STRONG);
      }
      Invisibility.dispel$();
      this.$cv_hero.spendAndNext(this.$cv_hero.attackDelay());
      this.$cv_wep.afterAbilityUsed(this.$cv_hero);
    }
    $c($wep, $hero, $enemy, $dmgMulti, $dmgBoost): this {
      this.$cv_wep = $wep; this.$cv_hero = $hero; this.$cv_enemy = $enemy; this.$cv_dmgMulti = $dmgMulti; this.$cv_dmgBoost = $dmgBoost;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Spear$1', ['com.watabou.utils.Callback']);
}

$J.define(Spear, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Spear', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon', ctors: { '': '_Spear' }, meths: { 'max(int)': 'max$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Pushing = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Pushing');
  WandOfBlastWave = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfBlastWave');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  AttackIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.AttackIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
