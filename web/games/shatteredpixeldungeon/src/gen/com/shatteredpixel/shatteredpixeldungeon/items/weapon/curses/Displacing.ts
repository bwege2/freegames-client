// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/curses/Displacing.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { Weapon$Enchantment } from '../Weapon.ts';

let Dungeon, Char$Property, Mob, CellEmitter, Speck, ScrollOfTeleportation, ItemSprite$Glowing, Random;

export class Displacing extends Weapon$Enchantment {
  static BLACK: ItemSprite$Glowing = null;
  _Displacing(): this {
    this._Weapon$Enchantment();
    return this;
  }
  proc(weapon: Weapon, attacker: Char, defender: Char, damage: number): number {
    let procChance = Math.fround(Math.fround(1 / 12) * this.procChanceMultiplier(attacker));
    if (Random.Float$() < procChance && !defender.properties().contains(Char$Property.IMMOVABLE)) {
      let oldpos = defender.pos;
      if (ScrollOfTeleportation.teleportChar$Char(defender)) {
        if (Dungeon.level.heroFOV[oldpos]) {
          CellEmitter.get(oldpos).start(Speck.factory$int(Speck.LIGHT), Math.fround(0.2), 3);
        }
        if (defender instanceof Mob && (defender).state_ === (defender).HUNTING) {
          (defender).state_ = (defender).WANDERING;
        }
      }
    }
    return damage;
  }
  curse(): boolean {
    return true;
  }
  glowing(): ItemSprite$Glowing {
    return Displacing.BLACK;
  }
  static $clinit() {
    Displacing.BLACK = new ItemSprite$Glowing()._ItemSprite$Glowing$int(0);
  }
}

$J.define(Displacing, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Displacing', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', ctors: { '': '_Displacing' }, clinit: true, lazy: ['BLACK'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Random = $J.load('com.watabou.utils.Random');
});
