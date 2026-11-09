// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Greataxe.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Actor, Char, Invisibility, Weapon, Messages, ItemSpriteSheet, AttackIndicator, GLog, Sample;

export class Greataxe extends MeleeWeapon {
  _Greataxe(): this {
    this._MeleeWeapon();
    this.image_ = ItemSpriteSheet.GREATAXE;
    this.hitSound_ = Assets$Sounds.HIT_SLASH;
    this.hitSoundPitch = 1;
    this.tier_ = 5;
    return this;
  }
  max$int(lvl: number): number {
    return (Math.imul(5, ((this.tier_ + 4) | 0)) + Math.imul(lvl, ((this.tier_ + 1) | 0))) | 0;
  }
  STRReq$int(lvl: number): number {
    let req = Weapon.STRReq((this.tier_ + 1) | 0, lvl);
    if (this.masteryPotionBonus) {
      req = (req - 2) | 0;
    }
    return req;
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  duelistAbility(hero: Hero, target: number): void {
    if (Math.fround(hero.HP / Math.fround(hero.HT)) >= 0.5) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'ability_cant_use', []), []);
      return;
    }
    if (target == null) {
      return;
    }
    let enemy = Actor.findChar(target);
    if (enemy == null || enemy === hero || hero.isCharmedBy(enemy) || !Dungeon.level.heroFOV[target]) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'ability_no_target', []), []);
      return;
    }
    hero.belongings.abilityWeapon = this;
    if (!hero.canAttack(enemy)) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'ability_target_range', []), []);
      hero.belongings.abilityWeapon = null;
      return;
    }
    hero.belongings.abilityWeapon = null;
    hero.sprite_.attack$int$Callback(enemy.pos, new (Greataxe$1())().$o(this).$c(hero, enemy));
  }
  abilityInfo(): string {
    let dmgBoost = this.levelKnown ? (15 + Math.imul(2, this.buffedLvl())) | 0 : 15;
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'ability_desc', [this.augment.damageFactor$int((this.min$() + dmgBoost) | 0), this.augment.damageFactor$int((this.max$() + dmgBoost) | 0)]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_ability_desc', [(this.min$int(0) + dmgBoost) | 0, (this.max$int(0) + dmgBoost) | 0]);
    }
  }
  upgradeAbilityStat(level: number): string {
    let dmgBoost = (15 + Math.imul(2, level)) | 0;
    return this.augment.damageFactor$int((this.min$int(level) + dmgBoost) | 0) + '-' + this.augment.damageFactor$int((this.max$int(level) + dmgBoost) | 0);
  }
}

let $Greataxe$1: any = null;
/** An anonymous class (Greataxe.java:92). */
function Greataxe$1(): any {
  return $Greataxe$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$outer.beforeAbilityUsed(this.$cv_hero, this.$cv_enemy);
      AttackIndicator.target(this.$cv_enemy);
      let dmgBoost = this.$outer.augment.damageFactor$int((15 + Math.imul(2, this.$outer.buffedLvl())) | 0);
      if (this.$cv_hero.attack$Char$float$float$float(this.$cv_enemy, 1, Math.fround(dmgBoost), Math.fround(Char.INFINITE_ACCURACY))) {
        Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STRONG);
      }
      Invisibility.dispel$();
      if (!this.$cv_enemy.isAlive()) {
        this.$cv_hero.next();
        MeleeWeapon.onAbilityKill(this.$cv_hero, this.$cv_enemy);
      } else {
        this.$cv_hero.spendAndNext(this.$cv_hero.attackDelay());
      }
      this.$outer.afterAbilityUsed(this.$cv_hero);
    }
    $c($hero, $enemy): this {
      this.$cv_hero = $hero; this.$cv_enemy = $enemy;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Greataxe$1', ['com.watabou.utils.Callback']);
}

$J.define(Greataxe, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Greataxe', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon', ctors: { '': '_Greataxe' }, meths: { 'STRReq(int)': 'STRReq$int', 'max(int)': 'max$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  AttackIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.AttackIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
