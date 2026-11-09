// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/blobs/Electricity.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Actor, Buff, Paralysis, SparkParticle, Wand, MagesStaff, Messages, GLog, PathFinder, Random;

export class Electricity extends Blob {
  water: boolean[] = null;
  _Electricity(): this {
    this._Blob();
    this.actPriority = (Actor.MOB_PRIO - 1) | 0;
    return this;
  }
  evolve(): void {
    this.water = Dungeon.level.water;
    let cell: number;
    for (let i = (this.area.left_ - 1) | 0; i <= this.area.right_; i++) {
      for (let j = (this.area.top_ - 1) | 0; j <= this.area.bottom_; j++) {
        cell = (i + Math.imul(j, Dungeon.level.width())) | 0;
        if (this.cur[cell] > 0) {
          this.spreadFromCell(cell, this.cur[cell]);
        }
      }
    }
    for (let i = (this.area.left_ - 1) | 0; i <= this.area.right_; i++) {
      for (let j = (this.area.top_ - 1) | 0; j <= this.area.bottom_; j++) {
        cell = (i + Math.imul(j, Dungeon.level.width())) | 0;
        if (this.cur[cell] > 0) {
          let ch = Actor.findChar(cell);
          if (ch != null && !ch.isImmune(this.getClass())) {
            if (ch.buff($J.cls(Paralysis)) == null) {
              Buff.prolong(ch, $J.cls(Paralysis), Math.fround(this.cur[cell]));
            }
            if (this.cur[cell] % 2 === 1) {
              ch.damage($J.roundf(Random.Float$float(Math.fround(2 + Math.fround(Dungeon.scalingDepth() / 5)))), this);
              if (!ch.isAlive() && ch === Dungeon.hero) {
                Dungeon.fail(this);
                GLog.n(Messages.get$Object$String$ObjectArr(this, 'ondeath', []), []);
              }
            }
          }
          let h = Dungeon.level.heaps.get(cell);
          if (h != null) {
            let toShock = h.peek();
            if (toShock instanceof Wand) {
              (toShock).gainCharge$float(Math.fround(0.333));
            } else if (toShock instanceof MagesStaff) {
              (toShock).gainCharge$float(Math.fround(0.333));
            }
          }
          this.off[cell] = (this.cur[cell] - 1) | 0;
          this.volume_ = (this.volume_ + this.off[cell]) | 0;
        } else {
          this.off[cell] = 0;
        }
      }
    }
  }
  spreadFromCell(cell: number, power: number): void {
    if (this.cur[cell] === 0) {
      this.area.union$int$int(cell % Dungeon.level.width(), $J.idiv(cell, Dungeon.level.width()));
    }
    this.cur[cell] = Math.max(this.cur[cell], power);
    for (let c of PathFinder.NEIGHBOURS4) {
      if (this.water[(cell + c) | 0] && (this.cur[(cell + c) | 0]) < power) {
        this.spreadFromCell((cell + c) | 0, power);
      }
    }
  }
  use(emitter: BlobEmitter): void {
    super.use(emitter);
    emitter.start(SparkParticle.FACTORY, Math.fround(0.05), 0);
  }
  tileDesc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
}

$J.define(Electricity, 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Electricity', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', ctors: { '': '_Electricity' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  SparkParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  MagesStaff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MagesStaff');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
