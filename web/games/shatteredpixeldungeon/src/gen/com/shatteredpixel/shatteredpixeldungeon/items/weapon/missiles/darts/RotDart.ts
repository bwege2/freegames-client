// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/RotDart.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Char$Property, Buff, Corrosion, MissileWeapon, ItemSpriteSheet;

export class RotDart extends TippedDart {
  _RotDart(): this {
    this._TippedDart();
    this.image_ = ItemSpriteSheet.ROT_DART;
    return this;
  }
  proc(attacker: Char, defender: Char, damage: number): number {
    if (this.processingChargedShot && attacker.alignment === defender.alignment) {
    } else if (defender.properties().contains(Char$Property.BOSS) || defender.properties().contains(Char$Property.MINIBOSS)) {
      Buff.affect$Char$Class(defender, $J.cls(Corrosion)).set$float$int(5, $J.idiv(Dungeon.scalingDepth(), 3));
    } else {
      Buff.affect$Char$Class(defender, $J.cls(Corrosion)).set$float$int(10, Dungeon.scalingDepth());
    }
    return super.proc(attacker, defender, damage);
  }
  durabilityPerUse$int(level: number): number {
    return Math.fround(MissileWeapon.MAX_DURABILITY / 5);
  }
}

$J.define(RotDart, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.RotDart', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.TippedDart', ctors: { '': '_RotDart' }, meths: { 'durabilityPerUse(int)': 'durabilityPerUse$int' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Corrosion = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Corrosion');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
