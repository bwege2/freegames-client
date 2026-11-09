// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Whip.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject } from '../../../../../../../jre/index.ts';
import { MeleeWeapon } from './MeleeWeapon.ts';

let Assets$Sounds, Dungeon, Actor, Char, Char$Alignment, Invisibility, Messages, ItemSpriteSheet, GLog;

export class Whip extends MeleeWeapon {
  _Whip(): this {
    this._MeleeWeapon();
    this.image_ = ItemSpriteSheet.WHIP;
    this.hitSound_ = Assets$Sounds.HIT;
    this.hitSoundPitch = Math.fround(1.1);
    this.tier_ = 3;
    this.RCH = 3;
    return this;
  }
  max$int(lvl: number): number {
    return (Math.imul(5, (this.tier_)) + Math.imul(lvl, (this.tier_))) | 0;
  }
  duelistAbility(hero: Hero, target: number): void {
    let targets = new ArrayList();
    let closest = null;
    hero.belongings.abilityWeapon = this;
    for (const $it0 = Actor.chars().iterator(); $it0.hasNext(); ) {
      let ch = $it0.next();
      if (ch.alignment === Char$Alignment.ENEMY && !hero.isCharmedBy(ch) && Dungeon.level.heroFOV[ch.pos] && hero.canAttack(ch)) {
        targets.add(ch);
        if (closest == null || Dungeon.level.trueDistance(hero.pos, closest.pos) > Dungeon.level.trueDistance(hero.pos, ch.pos)) {
          closest = ch;
        }
      }
    }
    hero.belongings.abilityWeapon = null;
    if (targets.isEmpty()) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'ability_no_target', []), []);
      return;
    }
    this.throwSound();
    let finalClosest = closest;
    hero.sprite_.attack$int$Callback(hero.pos, new (Whip$1())().$o(this).$c(hero, finalClosest, targets));
  }
  abilityInfo(): string {
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'ability_desc', [this.augment.damageFactor$int(this.min$()), this.augment.damageFactor$int(this.max$())]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_ability_desc', [this.min$int(0), this.max$int(0)]);
    }
  }
  upgradeAbilityStat(level: number): string {
    return this.augment.damageFactor$int(this.min$int(level)) + '-' + this.augment.damageFactor$int(this.max$int(level));
  }
}

let $Whip$1: any = null;
/** An anonymous class (Whip.java:81). */
function Whip$1(): any {
  return $Whip$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$outer.beforeAbilityUsed(this.$cv_hero, this.$cv_finalClosest);
      for (const $it1 = this.$cv_targets.iterator(); $it1.hasNext(); ) {
        let ch = $it1.next();
        this.$cv_hero.attack$Char$float$float$float(ch, 1, 0, Math.fround(Char.INFINITE_ACCURACY));
        if (!ch.isAlive()) {
          MeleeWeapon.onAbilityKill(this.$cv_hero, ch);
        }
      }
      Invisibility.dispel$();
      this.$cv_hero.spendAndNext(this.$cv_hero.attackDelay());
      this.$outer.afterAbilityUsed(this.$cv_hero);
    }
    $c($hero, $finalClosest, $targets): this {
      this.$cv_hero = $hero; this.$cv_finalClosest = $finalClosest; this.$cv_targets = $targets;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Whip$1', ['com.watabou.utils.Callback']);
}

$J.define(Whip, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Whip', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon', ctors: { '': '_Whip' }, meths: { 'max(int)': 'max$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
