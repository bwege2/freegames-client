// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/bombs/WoollyBomb.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { Bomb } from './Bomb.ts';

let Assets$Sounds, Dungeon, Actor, Sheep, CellEmitter, Speck, GameScene, ItemSpriteSheet, Sample, BArray, PathFinder;

export class WoollyBomb extends Bomb {
  _WoollyBomb(): this {
    this._Bomb();
    this.image_ = ItemSpriteSheet.WOOLY_BOMB;
    return this;
  }
  explosionRange(): number {
    return 2;
  }
  explode(cell: number): void {
    super.explode(cell);
    PathFinder.buildDistanceMap$int$booleanArr$int(cell, BArray.not(Dungeon.level.solid, null), (this.explosionRange() + 2) | 0);
    let spawnPoints = new ArrayList();
    for (let i = 0; i < PathFinder.distance.length; i++) {
      if (PathFinder.distance[i] < 2147483647) {
        spawnPoints.add(i);
      }
    }
    for (const $it0 = spawnPoints.iterator(); $it0.hasNext(); ) {
      let i = $it0.next();
      if (Dungeon.level.insideMap(i) && Actor.findChar(i) == null && !(Dungeon.level.pit[i])) {
        let sheep = new Sheep()._Sheep();
        sheep.initialize(Math.fround(Dungeon.bossLevel$() ? 20 : 200));
        sheep.pos = i;
        GameScene.add$Mob(sheep);
        Dungeon.level.occupyCell(sheep);
        CellEmitter.get(i).burst(Speck.factory$int(Speck.WOOL), 4);
      }
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.PUFF);
    Sample.INSTANCE.play$Object(Assets$Sounds.SHEEP);
  }
  value(): number {
    return Math.imul(this.quantity, ((20 + 30) | 0));
  }
}

$J.define(WoollyBomb, 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.WoollyBomb', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb', ctors: { '': '_WoollyBomb' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Sheep = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Sheep');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
