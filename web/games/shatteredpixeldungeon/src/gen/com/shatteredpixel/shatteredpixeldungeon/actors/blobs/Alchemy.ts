// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/blobs/Alchemy.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Blob } from './Blob.ts';

let Dungeon, Speck, Notes$Landmark;

export class Alchemy extends Blob {
  pos: number = 0;
  _Alchemy(): this {
    this._Blob();
    this.alwaysVisible = true;
    return this;
  }
  landmark(): Notes$Landmark {
    return Notes$Landmark.ALCHEMY;
  }
  evolve(): void {
    let cell: number;
    for (let i = (this.area.top_ - 1) | 0; i <= this.area.bottom_; i++) {
      for (let j = (this.area.left_ - 1) | 0; j <= this.area.right_; j++) {
        cell = (j + Math.imul(i, Dungeon.level.width())) | 0;
        if (Dungeon.level.insideMap(cell)) {
          this.off[cell] = this.cur[cell];
          this.volume_ = (this.volume_ + this.off[cell]) | 0;
        }
      }
    }
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    emitter.start(Speck.factory$int(Speck.BUBBLE), Math.fround(0.33), 0);
  }
}

$J.define(Alchemy, 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Alchemy', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_Alchemy' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Notes$Landmark = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark');
});
