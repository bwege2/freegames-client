// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/ChillingDart.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Buff, Chill, ItemSpriteSheet;

export class ChillingDart extends TippedDart {
  _ChillingDart(): this {
    this._TippedDart();
    this.image_ = ItemSpriteSheet.CHILLING_DART;
    return this;
  }
  proc(attacker: Char, defender: Char, damage: number): number {
    if (!this.processingChargedShot || attacker.alignment !== defender.alignment) {
      if (Dungeon.level.water[defender.pos]) {
        Buff.prolong(defender, $J.cls(Chill), Chill.DURATION);
      } else {
        Buff.prolong(defender, $J.cls(Chill), 6);
      }
    }
    return super.proc(attacker, defender, damage);
  }
}

$J.define(ChillingDart, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.ChillingDart', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.TippedDart', ctors: { '': '_ChillingDart' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Chill = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Chill');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
