// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/bombs/Firebomb.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Bomb } from './Bomb.ts';

let Assets$Sounds, Dungeon, Blob, Fire, CellEmitter, FlameParticle, GameScene, ItemSpriteSheet, Sample, BArray, PathFinder;

export class Firebomb extends Bomb {
  _Firebomb(): this {
    this._Bomb();
    this.image_ = ItemSpriteSheet.FIRE_BOMB;
    return this;
  }
  explosionRange(): number {
    return 2;
  }
  explode(cell: number): void {
    super.explode(cell);
    PathFinder.buildDistanceMap$int$booleanArr$int(cell, BArray.not(Dungeon.level.solid, null), this.explosionRange());
    for (let i = 0; i < PathFinder.distance.length; i++) {
      if (PathFinder.distance[i] < 2147483647) {
        if (Dungeon.level.pit[i]) {
          GameScene.add$Blob(Blob.seed$int$int$Class(i, 2, $J.cls(Fire)));
        } else {
          GameScene.add$Blob(Blob.seed$int$int$Class(i, 10, $J.cls(Fire)));
        }
        CellEmitter.get(i).burst(FlameParticle.FACTORY, 5);
      }
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
  }
  value(): number {
    return Math.imul(this.quantity, ((20 + 30) | 0));
  }
}

$J.define(Firebomb, 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Firebomb', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb', ctors: { '': '_Firebomb' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  FlameParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlameParticle');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
