// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/BlobEmitter.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Emitter } from '../../../watabou/noosa/particles/Emitter.ts';

let Dungeon, DungeonTilemap, Random, RectF;

export class BlobEmitter extends Emitter {
  blob: Blob = null;
  bound: RectF = null;
  _BlobEmitter(blob: Blob): this {
    this._Emitter();
    this.bound = new RectF()._RectF$float$float$float$float(0, 0, 1, 1);
    this.blob = blob;
    blob.use(this);
    return this;
  }
  emit(index: number): void {
    if (this.blob.volume_ <= 0) {
      return;
    }
    if (this.blob.area.isEmpty()) {
      this.blob.setupArea();
    }
    let map = this.blob.cur;
    let size = Math.fround(DungeonTilemap.SIZE);
    let cell: number;
    for (let i = this.blob.area.left_; i < this.blob.area.right_; i++) {
      for (let j = this.blob.area.top_; j < this.blob.area.bottom_; j++) {
        cell = (i + Math.imul(j, Dungeon.level.width())) | 0;
        let visible = cell < Dungeon.level.heroFOV.length && Dungeon.level.heroFOV[cell];
        if (this.blob.alwaysVisible && cell < Dungeon.level.length()) {
          visible = visible || Dungeon.level.mapped[cell] || Dungeon.level.visited[cell];
        }
        if (visible && map[cell] > 0) {
          let x = Math.fround((Math.fround(i + Random.Float$float$float(this.bound.left_, this.bound.right_))) * size);
          let y = Math.fround((Math.fround(j + Random.Float$float$float(this.bound.top_, this.bound.bottom_))) * size);
          this.factory.emit(this, index, x, y);
        }
      }
    }
  }
}

$J.define(BlobEmitter, 'com.shatteredpixel.shatteredpixeldungeon.effects.BlobEmitter', { kind: 'class', sup: 'com.watabou.noosa.particles.Emitter', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob': '_BlobEmitter' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Random = $J.load('com.watabou.utils.Random');
  RectF = $J.load('com.watabou.utils.RectF');
});
