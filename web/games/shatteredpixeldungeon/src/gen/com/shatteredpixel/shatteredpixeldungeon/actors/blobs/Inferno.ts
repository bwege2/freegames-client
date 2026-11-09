// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/blobs/Inferno.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Blizzard, Fire, Freezing, Speck, Messages, GameScene;

export class Inferno extends Blob {
  _Inferno(): this {
    this._Blob();
    return this;
  }
  evolve(): void {
    super.evolve();
    let cell: number;
    let observe = false;
    let fire = Dungeon.level.blobs.get($J.cls(Fire));
    let freeze = Dungeon.level.blobs.get($J.cls(Freezing));
    let bliz = Dungeon.level.blobs.get($J.cls(Blizzard));
    for (let i = (this.area.left_ - 1) | 0; i <= this.area.right_; i++) {
      for (let j = (this.area.top_ - 1) | 0; j <= this.area.bottom_; j++) {
        cell = (i + Math.imul(j, Dungeon.level.width())) | 0;
        if (this.cur[cell] > 0) {
          if (fire != null) {
            fire.clear(cell);
          }
          if (freeze != null) {
            freeze.clear(cell);
          }
          if (bliz != null && bliz.volume_ > 0 && bliz.cur[cell] > 0) {
            bliz.clear(cell);
            this.off[cell] = this.cur[cell] = 0;
            continue;
          }
          Fire.burn(cell);
          if (Dungeon.level.flamable[cell]) {
            Dungeon.level.destroy(cell);
            observe = true;
            GameScene.updateMap$int(cell);
          }
        } else if (Dungeon.level.flamable[cell] && ((this.cur[(cell - 1) | 0]) > 0 || (this.cur[(cell + 1) | 0]) > 0 || (this.cur[(cell - Dungeon.level.width()) | 0]) > 0 || (this.cur[(cell + Dungeon.level.width()) | 0]) > 0)) {
          if (fire == null || fire.cur == null || fire.cur[cell] === 0) {
            GameScene.add$Blob(Blob.seed$int$int$Class(cell, 4, $J.cls(Fire)));
          }
        }
      }
    }
    if (observe) {
      Dungeon.observe$();
    }
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    emitter.pour(Speck.factory$int$boolean(Speck.INFERNO, true), Math.fround(0.4));
  }
  tileDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
}

$J.define(Inferno, 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Inferno', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_Inferno' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Blizzard = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blizzard');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  Freezing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Freezing');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
});
