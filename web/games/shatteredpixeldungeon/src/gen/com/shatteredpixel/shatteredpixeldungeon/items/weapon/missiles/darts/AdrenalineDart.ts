// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/AdrenalineDart.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Adrenaline, Buff, Cripple, Hero, ItemSpriteSheet;

export class AdrenalineDart extends TippedDart {
  _AdrenalineDart(): this {
    this._TippedDart();
    this.image_ = ItemSpriteSheet.ADRENALINE_DART;
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
      Buff.prolong(defender, $J.cls(Adrenaline), Adrenaline.DURATION);
      return 0;
    } else {
      Buff.prolong(defender, $J.cls(Cripple), Math.fround(Cripple.DURATION / 2));
    }
    return super.proc(attacker, defender, damage);
  }
}

$J.define(AdrenalineDart, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.AdrenalineDart', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.TippedDart', ctors: { '': '_AdrenalineDart' } });
$J.module(() => {
  Adrenaline = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Adrenaline');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Cripple = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Cripple');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
