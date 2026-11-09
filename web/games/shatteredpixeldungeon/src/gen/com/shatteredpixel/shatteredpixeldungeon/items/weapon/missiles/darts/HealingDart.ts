// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/HealingDart.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Buff, Healing, Hero, PotionOfHealing, ItemSpriteSheet;

export class HealingDart extends TippedDart {
  _HealingDart(): this {
    this._TippedDart();
    this.image_ = ItemSpriteSheet.HEALING_DART;
    this.usesTargeting_ = false;
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
    if (this.processingChargedShot && (defender === attacker || attacker.alignment !== defender.alignment)) {
      return super.proc(attacker, defender, damage);
    }
    PotionOfHealing.cure(defender);
    Buff.affect$Char$Class(defender, $J.cls(Healing)).setHeal$int$float$int($J.d2i((Math.fround(Math.fround(0.5 * defender.HT) + 30))), 0.25, 0);
    if (attacker.alignment === defender.alignment) {
      return 0;
    }
    return super.proc(attacker, defender, damage);
  }
}

$J.define(HealingDart, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.HealingDart', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.TippedDart', ctors: { '': '_HealingDart' } });
$J.module(() => {
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Healing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Healing');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
