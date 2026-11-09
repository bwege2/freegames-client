// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Rapier.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Actor, Char, Buff, Invisibility, Item, MeleeWeapon$Charger, Terrain, Door, Messages, PixelScene, ItemSpriteSheet, AttackIndicator, GLog, Sample, PathFinder;

export class Rapier extends MeleeWeapon {
  _Rapier(): this {
    this._MeleeWeapon();
    this.image_ = ItemSpriteSheet.RAPIER;
    this.hitSound_ = Assets$Sounds.HIT_SLASH;
    this.hitSoundPitch = Math.fround(1.3);
    this.tier_ = 1;
    this.bones = false;
    return this;
  }
  max$int(lvl: number): number {
    return (Math.imul(4, ((this.tier_ + 1) | 0)) + Math.imul(lvl, ((this.tier_ + 1) | 0))) | 0;
  }
  defenseFactor(owner: Char): number {
    return 1;
  }
  targetingPrompt(): string {
    return Messages.get$Object$String$ObjectArr(this, 'prompt', []);
  }
  duelistAbility(hero: Hero, target: number): void {
    let dmgBoost = this.augment.damageFactor$int((5 + $J.roundf(Math.fround(1.5 * this.buffedLvl()))) | 0);
    Rapier.lungeAbility(hero, target, 1, dmgBoost, this);
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
  static lungeAbility(hero: Hero, target: number, dmgMulti: number, dmgBoost: number, wep: MeleeWeapon): void {
    if (target == null) {
      return;
    }
    let enemy = Actor.findChar(target);
    if (Dungeon.level.heroFOV[target]) {
      if (enemy == null || enemy === hero || hero.isCharmedBy(enemy)) {
        GLog.w(Messages.get$Object$String$ObjectArr(wep, 'ability_no_target', []), []);
        return;
      }
    }
    if (hero.rooted || Dungeon.level.distance(hero.pos, target) < 2 || ((Dungeon.level.distance(hero.pos, target) - 1) | 0) > wep.reachFactor(hero)) {
      GLog.w(Messages.get$Object$String$ObjectArr(wep, 'ability_target_range', []), []);
      if (hero.rooted) {
        PixelScene.shake(1, 1);
      }
      return;
    }
    let lungeCell = -1;
    for (let i of PathFinder.NEIGHBOURS8) {
      if (Dungeon.level.distance((hero.pos + i) | 0, target) <= wep.reachFactor(hero) && (Actor.findChar((hero.pos + i) | 0)) == null && (Dungeon.level.passable[(hero.pos + i) | 0] || (Dungeon.level.avoid[(hero.pos + i) | 0] && hero.flying))) {
        if (lungeCell === -1 || Dungeon.level.trueDistance((hero.pos + i) | 0, target) < Dungeon.level.trueDistance(lungeCell, target)) {
          lungeCell = (hero.pos + i) | 0;
        }
      }
    }
    if (lungeCell === -1) {
      GLog.w(Messages.get$Object$String$ObjectArr(wep, 'ability_target_range', []), []);
      return;
    }
    let dest = lungeCell;
    hero.busy();
    Sample.INSTANCE.play$Object(Assets$Sounds.MISS);
    hero.sprite_.jump$int$int$float$float$Callback(hero.pos, dest, 0, Math.fround(0.1), new (Rapier$1())().$c(hero, dest, wep, enemy, dmgMulti, dmgBoost));
  }
}

let $Rapier$1$1: any = null;
/** An anonymous class (Rapier.java:145). */
function Rapier$1$1(): any {
  return $Rapier$1$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$cv_wep.beforeAbilityUsed(this.$cv_hero, this.$cv_enemy);
      AttackIndicator.target(this.$cv_enemy);
      if (this.$cv_hero.attack$Char$float$float$float(this.$cv_enemy, this.$cv_dmgMulti, Math.fround(this.$cv_dmgBoost), Math.fround(Char.INFINITE_ACCURACY))) {
        Sample.INSTANCE.play$Object(Assets$Sounds.HIT_STRONG);
        if (!this.$cv_enemy.isAlive()) {
          MeleeWeapon.onAbilityKill(this.$cv_hero, this.$cv_enemy);
        }
      }
      Invisibility.dispel$();
      this.$cv_hero.spendAndNext(this.$cv_hero.attackDelay());
      this.$cv_wep.afterAbilityUsed(this.$cv_hero);
    }
    $c($wep, $hero, $enemy, $dmgMulti, $dmgBoost): this {
      this.$cv_wep = $wep; this.$cv_hero = $hero; this.$cv_enemy = $enemy; this.$cv_dmgMulti = $dmgMulti; this.$cv_dmgBoost = $dmgBoost;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Rapier$1$1', ['com.watabou.utils.Callback']);
}

let $Rapier$1: any = null;
/** An anonymous class (Rapier.java:133). */
function Rapier$1(): any {
  return $Rapier$1 ??= $J.local(class extends JObject {
    call(): void {
      if (Dungeon.level.map_[this.$cv_hero.pos] === Terrain.OPEN_DOOR) {
        Door.leave(this.$cv_hero.pos);
      }
      this.$cv_hero.pos = this.$cv_dest;
      Dungeon.level.occupyCell(this.$cv_hero);
      Dungeon.observe$();
      this.$cv_hero.belongings.abilityWeapon = this.$cv_wep;
      if (this.$cv_enemy != null && this.$cv_hero.canAttack(this.$cv_enemy)) {
        this.$cv_hero.sprite_.attack$int$Callback(this.$cv_enemy.pos, new (Rapier$1$1())().$o(this).$c(this.$cv_wep, this.$cv_hero, this.$cv_enemy, this.$cv_dmgMulti, this.$cv_dmgBoost));
      } else {
        let charger = Buff.affect$Char$Class(this.$cv_hero, $J.cls(MeleeWeapon$Charger));
        charger.partialCharge = Math.fround(charger.partialCharge - 1);
        while (charger.partialCharge < Math.fround(0) && charger.charges > 0) {
          charger.charges--;
          charger.partialCharge++;
        }
        this.$cv_hero.belongings.abilityWeapon = null;
        Item.updateQuickslot();
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(Rapier), 'ability_no_target', []), []);
        this.$cv_hero.spendAndNext(Math.fround(1 / this.$cv_hero.speed()));
      }
    }
    $c($hero, $dest, $wep, $enemy, $dmgMulti, $dmgBoost): this {
      this.$cv_hero = $hero; this.$cv_dest = $dest; this.$cv_wep = $wep; this.$cv_enemy = $enemy; this.$cv_dmgMulti = $dmgMulti; this.$cv_dmgBoost = $dmgBoost;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Rapier$1', ['com.watabou.utils.Callback']);
}

$J.define(Rapier, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Rapier', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon', ctors: { '': '_Rapier' }, meths: { 'max(int)': 'max$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  MeleeWeapon$Charger = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon$Charger');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Door = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.Door');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  AttackIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.AttackIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
