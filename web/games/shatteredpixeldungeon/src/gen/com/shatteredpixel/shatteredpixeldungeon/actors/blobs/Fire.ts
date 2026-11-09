// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/blobs/Fire.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Actor, Freezing, Buff, Burning, FlameParticle, Messages, GameScene;

export class Fire extends Blob {
  _Fire(): this {
    this._Blob();
    return this;
  }
  evolve(): void {
    let flamable = Dungeon.level.flamable;
    let cell: number;
    let fire: number;
    let freeze = Dungeon.level.blobs.get($J.cls(Freezing));
    let observe = false;
    for (let i = (this.area.left_ - 1) | 0; i <= this.area.right_; i++) {
      for (let j = (this.area.top_ - 1) | 0; j <= this.area.bottom_; j++) {
        cell = (i + Math.imul(j, Dungeon.level.width())) | 0;
        if (this.cur[cell] > 0) {
          if (freeze != null && freeze.volume_ > 0 && freeze.cur[cell] > 0) {
            freeze.clear(cell);
            this.off[cell] = this.cur[cell] = 0;
            continue;
          }
          Fire.burn(cell);
          fire = (this.cur[cell] - 1) | 0;
          if (fire <= 0 && flamable[cell]) {
            Dungeon.level.destroy(cell);
            observe = true;
            GameScene.updateMap$int(cell);
          }
        } else if (freeze == null || freeze.volume_ <= 0 || freeze.cur[cell] <= 0) {
          if (flamable[cell] && ((this.cur[(cell - 1) | 0]) > 0 || (this.cur[(cell + 1) | 0]) > 0 || (this.cur[(cell - Dungeon.level.width()) | 0]) > 0 || (this.cur[(cell + Dungeon.level.width()) | 0]) > 0)) {
            fire = 4;
            Fire.burn(cell);
            this.area.union$int$int(i, j);
          } else {
            fire = 0;
          }
        } else {
          fire = 0;
        }
        this.volume_ = (this.volume_ + (this.off[cell] = fire)) | 0;
      }
    }
    if (observe) {
      Dungeon.observe$();
    }
  }
  static burn(pos: number): void {
    let ch = Actor.findChar(pos);
    if (ch != null && !ch.isImmune($J.cls(Fire))) {
      Buff.affect$Char$Class(ch, $J.cls(Burning)).reignite$Char(ch);
    }
    let heap = Dungeon.level.heaps.get(pos);
    if (heap != null) {
      heap.burn();
    }
    let plant = Dungeon.level.plants.get(pos);
    if (plant != null) {
      plant.wither();
    }
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    emitter.pour(FlameParticle.FACTORY, Math.fround(0.03));
  }
  tileDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
}

$J.define(Fire, 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_Fire' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Freezing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Freezing');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  FlameParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlameParticle');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
});
