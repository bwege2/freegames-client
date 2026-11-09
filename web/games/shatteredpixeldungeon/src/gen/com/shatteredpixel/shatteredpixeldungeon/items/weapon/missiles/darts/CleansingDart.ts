// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/CleansingDart.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../../jre/index.ts';
import { TippedDart } from './TippedDart.ts';

let Dungeon, Actor, Buff$buffType, ChampionEnemy, FlavourBuff, Hero, Mob, PotionOfCleansing, PotionOfCleansing$Cleanse, Crossbow$ChargedShot, ItemSpriteSheet;

export class CleansingDart extends TippedDart {
  _CleansingDart(): this {
    this._TippedDart();
    this.image_ = ItemSpriteSheet.CLEANSING_DART;
    return this;
  }
  damageRoll(owner: Char): number {
    if (owner instanceof Hero) {
      if ((owner).attackTarget().alignment === owner.alignment) {
        return 0;
      }
    }
    return super.damageRoll(owner);
  }
  proc(attacker: Char, defender: Char, damage: number): number {
    if (this.processingChargedShot && defender === attacker) {
    } else if (attacker.alignment === defender.alignment) {
      PotionOfCleansing.cleanse$Char$float(defender, Math.fround(PotionOfCleansing$Cleanse.DURATION * 2));
      return 0;
    } else {
      for (const $it0 = defender.buffs$().iterator(); $it0.hasNext(); ) {
        let b = $it0.next();
        if (!(b instanceof ChampionEnemy) && b.type_ === Buff$buffType.POSITIVE && !(b instanceof Crossbow$ChargedShot)) {
          b.detach();
        }
      }
      if (!defender.isAlive()) {
        defender.die(attacker);
        return super.proc(attacker, defender, damage);
      }
      if (defender instanceof Mob) {
        new (CleansingDart$1())().$o(this).$c(defender)._FlavourBuff().$init_anon().attachTo(defender);
      }
    }
    return super.proc(attacker, defender, damage);
  }
}

let $CleansingDart$1: any = null;
/** An anonymous class (CleansingDart.java:74). */
function CleansingDart$1(): any {
  return $CleansingDart$1 ??= $J.local(class extends FlavourBuff {
    $init_anon() {
      this.actPriority = Actor.VFX_PRIO;
      return this;
    }
    act(): boolean {
      if ((this.$cv_defender).state_ === (this.$cv_defender).HUNTING || (this.$cv_defender).state_ === (this.$cv_defender).FLEEING) {
        (this.$cv_defender).state_ = (this.$cv_defender).WANDERING;
      }
      (this.$cv_defender).beckon(Dungeon.level.randomDestination(this.$cv_defender));
      this.$cv_defender.sprite_.showLost();
      return super.act();
    }
    $c($defender): this {
      this.$cv_defender = $defender;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.CleansingDart$1', []);
}

$J.define(CleansingDart, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.CleansingDart', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.TippedDart', ctors: { '': '_CleansingDart' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  ChampionEnemy = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ChampionEnemy');
  FlavourBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  PotionOfCleansing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfCleansing');
  PotionOfCleansing$Cleanse = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfCleansing$Cleanse');
  Crossbow$ChargedShot = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Crossbow$ChargedShot');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
