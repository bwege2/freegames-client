// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/blobs/StenchGas.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Statistics, Actor, Buff, Paralysis, FetidRat, Speck, Messages;

export class StenchGas extends Blob {
  _StenchGas(): this {
    this._Blob();
    return this;
  }
  evolve(): void {
    super.evolve();
    let ch: Char;
    let cell: number;
    let fetidRatSpawned = false;
    for (const $it0 = Dungeon.level.mobs.iterator(); $it0.hasNext(); ) {
      let m = $it0.next();
      if (m instanceof FetidRat) {
        fetidRatSpawned = true;
        break;
      }
    }
    for (let i = this.area.left_; i < this.area.right_; i++) {
      for (let j = this.area.top_; j < this.area.bottom_; j++) {
        cell = (i + Math.imul(j, Dungeon.level.width())) | 0;
        if (this.cur[cell] > 0 && (ch = Actor.findChar(cell)) != null) {
          if (!ch.isImmune(this.getClass())) {
            if (ch === Dungeon.hero && ch.buff($J.cls(Paralysis)) == null && fetidRatSpawned) {
              Statistics.questScores[0] = (Statistics.questScores[0] - 100) | 0;
            }
            Buff.prolong(ch, $J.cls(Paralysis), Math.fround(Paralysis.DURATION / 5));
          }
        }
      }
    }
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    emitter.pour(Speck.factory$int(Speck.STENCH), Math.fround(0.4));
  }
  tileDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
}

$J.define(StenchGas, 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.StenchGas', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_StenchGas' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  FetidRat = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.FetidRat');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
});
