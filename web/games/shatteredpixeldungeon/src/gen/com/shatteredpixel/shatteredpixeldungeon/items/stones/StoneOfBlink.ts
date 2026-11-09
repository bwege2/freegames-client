// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/stones/StoneOfBlink.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { Runestone } from './Runestone.ts';

let Actor, Item, ScrollOfTeleportation, Ballistica, ItemSpriteSheet;

export class StoneOfBlink extends Runestone {
  static throwPath: Ballistica = null;
  _StoneOfBlink(): this {
    this._Runestone();
    this.image_ = ItemSpriteSheet.STONE_BLINK;
    return this;
  }
  throwPos(user: Hero, dst: number): number {
    StoneOfBlink.throwPath = new Ballistica()._Ballistica(user.pos, dst, Ballistica.PROJECTILE);
    return StoneOfBlink.throwPath.collisionPos;
  }
  onThrow(cell: number): void {
    if (Actor.findChar(cell) != null && StoneOfBlink.throwPath.dist >= 1) {
      cell = StoneOfBlink.throwPath.path.get((StoneOfBlink.throwPath.dist - 1) | 0);
    }
    StoneOfBlink.throwPath = null;
    super.onThrow(cell);
  }
  activate(cell: number): void {
    ScrollOfTeleportation.teleportToLocation(Item.curUser, cell);
  }
}

$J.define(StoneOfBlink, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfBlink', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.stones.Runestone', ctors: { '': '_StoneOfBlink' } });
$J.module(() => {
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
