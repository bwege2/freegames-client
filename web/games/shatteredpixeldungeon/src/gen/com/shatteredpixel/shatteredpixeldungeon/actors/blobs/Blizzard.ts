// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/blobs/Blizzard.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Fire, Freezing, Inferno, Speck, Messages;

export class Blizzard extends Blob {
  _Blizzard(): this {
    this._Blob();
    return this;
  }
  evolve(): void {
    super.evolve();
    let cell: number;
    let fire = Dungeon.level.blobs.get($J.cls(Fire));
    let freeze = Dungeon.level.blobs.get($J.cls(Freezing));
    let inf = Dungeon.level.blobs.get($J.cls(Inferno));
    for (let i = this.area.left_; i < this.area.right_; i++) {
      for (let j = this.area.top_; j < this.area.bottom_; j++) {
        cell = (i + Math.imul(j, Dungeon.level.width())) | 0;
        if (this.cur[cell] > 0) {
          if (fire != null) {
            fire.clear(cell);
          }
          if (freeze != null) {
            freeze.clear(cell);
          }
          if (inf != null && inf.volume_ > 0 && inf.cur[cell] > 0) {
            inf.clear(cell);
            this.off[cell] = this.cur[cell] = 0;
            continue;
          }
          Freezing.freeze(cell);
          Freezing.freeze(cell);
        }
      }
    }
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    emitter.pour(Speck.factory$int$boolean(Speck.BLIZZARD, true), Math.fround(0.4));
  }
  tileDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
}

$J.define(Blizzard, 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blizzard', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_Blizzard' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  Freezing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Freezing');
  Inferno = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Inferno');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
});
