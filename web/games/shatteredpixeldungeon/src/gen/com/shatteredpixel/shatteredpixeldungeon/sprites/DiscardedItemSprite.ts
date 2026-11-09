// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/DiscardedItemSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { ItemSprite } from './ItemSprite.ts';

let DungeonTilemap, Game;

export class DiscardedItemSprite extends ItemSprite {
  _DiscardedItemSprite(): this {
    this._ItemSprite$();
    return this;
  }
  drop$(): void {
    this.scale_.set$float(1);
    this.am = 1;
    if (this.emitter_ != null) {
      this.emitter_.killAndErase();
    }
    this.origin.set$float$float(Math.fround(this.width_ / 2), Math.fround(this.height_ - $J.idiv(DungeonTilemap.SIZE, 2)));
    this.angularSpeed = 720;
  }
  update(): void {
    super.update();
    this.scale_.set$float(this.scale_.x = Math.fround(this.scale_.x - Game.elapsed));
    this.y = Math.fround(this.y + Math.fround(12 * Game.elapsed));
    if ((this.am = Math.fround(this.am - Game.elapsed)) <= Math.fround(0)) {
      this.remove$();
    }
  }
}

$J.define(DiscardedItemSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.DiscardedItemSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite', ctors: { '': '_DiscardedItemSprite' }, meths: { 'drop()': 'drop$' } });
$J.module(() => {
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Game = $J.load('com.watabou.noosa.Game');
});
