// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/stones/StoneOfFear.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Actor, Char$Alignment, Buff, Terror, Flare, Item, ItemSpriteSheet, DungeonTilemap, Sample;

export class StoneOfFear extends Runestone {
  _StoneOfFear(): this {
    this._Runestone();
    this.image_ = ItemSpriteSheet.STONE_FEAR;
    return this;
  }
  activate(cell: number): void {
    let ch = Actor.findChar(cell);
    if (ch != null && ch.alignment !== Char$Alignment.ALLY) {
      Buff.affect$Char$Class$float(ch, $J.cls(Terror), Terror.DURATION).object = Item.curUser.id();
    }
    new Flare()._Flare(5, 16).color$int$boolean(16711680, true).show$Group$PointF$float(Dungeon.hero.sprite_.parent, DungeonTilemap.tileCenterToWorld(cell), 2);
    Sample.INSTANCE.play$Object(Assets$Sounds.READ);
  }
}

$J.define(StoneOfFear, 'com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfFear', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.stones.Runestone', ctors: { '': '_StoneOfFear' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Terror = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Terror');
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
