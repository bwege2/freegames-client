// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/blobs/GooWarn.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Actor, Messages, GooSprite$GooParticle;

export class GooWarn extends Blob {
  pos: number = 0;
  _GooWarn(): this {
    this._Blob();
    this.actPriority = (Actor.MOB_PRIO + 1) | 0;
    return this;
  }
  evolve(): void {
    let cell: number;
    for (let i = this.area.left_; i < this.area.right_; i++) {
      for (let j = this.area.top_; j < this.area.bottom_; j++) {
        cell = (i + Math.imul(j, Dungeon.level.width())) | 0;
        this.off[cell] = this.cur[cell] > 0 ? (this.cur[cell] - 1) | 0 : 0;
        if (this.off[cell] > 0) {
          this.volume_ = (this.volume_ + this.off[cell]) | 0;
        }
      }
    }
  }
  seed(level: Level, cell: number, amount: number): void {
    if (this.cur == null) {
      this.cur = $J.newArray(level.length(), 0);
    }
    if (this.off == null) {
      this.off = $J.newArray(this.cur.length, 0);
    }
    let toAdd = (amount - this.cur[cell]) | 0;
    if (toAdd > 0) {
      this.cur[cell] = (this.cur[cell] + toAdd) | 0;
      this.volume_ = (this.volume_ + toAdd) | 0;
    }
    this.area.union$int$int(cell % level.width(), $J.idiv(cell, level.width()));
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    emitter.pour(GooSprite$GooParticle.FACTORY, Math.fround(0.03));
  }
  tileDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
}

$J.define(GooWarn, 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.GooWarn', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_GooWarn' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GooSprite$GooParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.GooSprite$GooParticle');
});
