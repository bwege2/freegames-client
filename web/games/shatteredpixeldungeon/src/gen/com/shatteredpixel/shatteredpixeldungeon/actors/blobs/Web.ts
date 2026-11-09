// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/blobs/Web.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Actor, Buff, Roots, WebParticle, Messages;

export class Web extends Blob {
  _Web(): this {
    this._Blob();
    this.actPriority = (Actor.HERO_PRIO + 1) | 0;
    return this;
  }
  evolve(): void {
    let cell: number;
    let l = Dungeon.level;
    for (let i = this.area.left_; i < this.area.right_; i++) {
      for (let j = this.area.top_; j < this.area.bottom_; j++) {
        cell = (i + Math.imul(j, l.width())) | 0;
        this.off[cell] = this.cur[cell] > 0 ? (this.cur[cell] - 1) | 0 : 0;
        this.volume_ = (this.volume_ + this.off[cell]) | 0;
        if (this.off[cell] === 0 && this.cur[cell] > 0) {
          this.cellsToFlagUpdate.add(cell);
        }
      }
    }
  }
  seed(level: Level, cell: number, amount: number): void {
    super.seed(level, cell, amount);
    level.updateCellFlags(cell);
  }
  static affectChar(ch: Char): void {
    Buff.prolong(ch, $J.cls(Roots), Roots.DURATION);
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    emitter.pour(WebParticle.FACTORY, 0.25);
  }
  clear(cell: number): void {
    super.clear(cell);
    if (this.cur == null) {
      return;
    }
    Dungeon.level.updateCellFlags(cell);
  }
  fullyClear(): void {
    super.fullyClear();
    Dungeon.level.buildFlagMaps();
  }
  onBuildFlagMaps(l: Level): void {
    if (this.volume_ > 0) {
      for (let i = 0; i < l.length(); i++) {
        this.onUpdateCellFlags(l, i);
      }
    }
  }
  onUpdateCellFlags(l: Level, cell: number): void {
    if (this.volume_ > 0 && this.cur[cell] > 0) {
      l.solid[cell] = true;
      l.flamable[cell] = true;
    }
  }
  tileDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
}

$J.define(Web, 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Web', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_Web' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Roots = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Roots');
  WebParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.WebParticle');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
});
