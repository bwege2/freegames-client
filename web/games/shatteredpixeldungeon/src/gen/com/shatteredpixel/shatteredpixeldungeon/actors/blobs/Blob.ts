// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/blobs/Blob.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { Actor } from '../Actor.ts';

let Dungeon, Rect, Reflection;

export class Blob extends Actor {
  volume_: number = 0;
  cur: number[] = null;
  off: number[] = null;
  emitter_: BlobEmitter = null;
  area: Rect = null;
  alwaysVisible: boolean = false;
  static readonly CUR: string = 'cur';
  static readonly START: string = 'start';
  static readonly LENGTH: string = 'length';
  cellsToFlagUpdate: ArrayList<number> = null;
  _Blob(): this {
    this._Actor();
    this.actPriority = Actor.BLOB_PRIO;
    this.volume_ = 0;
    this.area = new Rect()._Rect$();
    this.alwaysVisible = false;
    this.cellsToFlagUpdate = new ArrayList();
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    if (this.volume_ > 0) {
      let start: number;
      for (start = 0; start < Dungeon.level.length(); start++) {
        if (this.cur[start] > 0) {
          break;
        }
      }
      let end: number;
      for (end = (Dungeon.level.length() - 1) | 0; end > start; end--) {
        if (this.cur[end] > 0) {
          break;
        }
      }
      bundle.put$String$int(Blob.START, start);
      bundle.put$String$int(Blob.LENGTH, this.cur.length);
      bundle.put$String$intArr(Blob.CUR, this.trim(start, (end + 1) | 0));
    }
  }
  trim(start: number, end: number): number[] {
    let len = (end - start) | 0;
    let copy = $J.newArray(len, 0);
    $J.system_arraycopy(this.cur, start, copy, 0, len);
    return copy;
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    if (bundle.contains(Blob.CUR)) {
      this.cur = $J.newArray(bundle.getInt(Blob.LENGTH), 0);
      this.off = $J.newArray(this.cur.length, 0);
      let data = bundle.getIntArray(Blob.CUR);
      let start = bundle.getInt(Blob.START);
      for (let i = 0; i < data.length; i++) {
        (this.cur[(i + start) | 0]) = data[i];
        this.volume_ = (this.volume_ + data[i]) | 0;
      }
    }
  }
  act(): boolean {
    this.spend(Actor.TICK);
    if (this.volume_ > 0) {
      if (this.area.isEmpty()) {
        this.setupArea();
      }
      this.volume_ = 0;
      this.evolve();
      let tmp = this.off;
      this.off = this.cur;
      this.cur = tmp;
      for (const $it0 = this.cellsToFlagUpdate.iterator(); $it0.hasNext(); ) {
        let i = $it0.next();
        Dungeon.level.updateCellFlags(i);
      }
      this.cellsToFlagUpdate.clear();
    } else {
      if (!this.area.isEmpty()) {
        this.area.setEmpty();
        $J.system_arraycopy(this.cur, 0, this.off, 0, this.cur.length);
      }
    }
    return true;
  }
  setupArea(): void {
    for (let cell = 0; cell < this.cur.length; cell++) {
      if (this.cur[cell] !== 0) {
        this.area.union$int$int(cell % Dungeon.level.width(), $J.idiv(cell, Dungeon.level.width()));
      }
    }
  }
  use(emitter: BlobEmitter): void {
    this.emitter_ = emitter;
  }
  evolve(): void {
    let blocking = Dungeon.level.solid;
    let cell: number;
    for (let i = (this.area.top_ - 1) | 0; i <= this.area.bottom_; i++) {
      for (let j = (this.area.left_ - 1) | 0; j <= this.area.right_; j++) {
        cell = (j + Math.imul(i, Dungeon.level.width())) | 0;
        if (Dungeon.level.insideMap(cell)) {
          if (!blocking[cell]) {
            let count = 1;
            let sum = this.cur[cell];
            if (j > this.area.left_ && !(blocking[(cell - 1) | 0])) {
              sum = (sum + (this.cur[(cell - 1) | 0])) | 0;
              count++;
            }
            if (j < this.area.right_ && !(blocking[(cell + 1) | 0])) {
              sum = (sum + (this.cur[(cell + 1) | 0])) | 0;
              count++;
            }
            if (i > this.area.top_ && !(blocking[(cell - Dungeon.level.width()) | 0])) {
              sum = (sum + (this.cur[(cell - Dungeon.level.width()) | 0])) | 0;
              count++;
            }
            if (i < this.area.bottom_ && !(blocking[(cell + Dungeon.level.width()) | 0])) {
              sum = (sum + (this.cur[(cell + Dungeon.level.width()) | 0])) | 0;
              count++;
            }
            let value = sum >= count ? (($J.idiv(sum, count)) - 1) | 0 : 0;
            this.off[cell] = value;
            if (value > 0) {
              if (i < this.area.top_) {
                this.area.top_ = i;
              } else if (i >= this.area.bottom_) {
                this.area.bottom_ = (i + 1) | 0;
              }
              if (j < this.area.left_) {
                this.area.left_ = j;
              } else if (j >= this.area.right_) {
                this.area.right_ = (j + 1) | 0;
              }
            }
            this.volume_ = (this.volume_ + value) | 0;
          } else {
            this.off[cell] = 0;
          }
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
    this.cur[cell] = (this.cur[cell] + amount) | 0;
    this.volume_ = (this.volume_ + amount) | 0;
    this.area.union$int$int(cell % level.width(), $J.idiv(cell, level.width()));
  }
  clear(cell: number): void {
    if (this.volume_ === 0) {
      return;
    }
    this.volume_ = (this.volume_ - this.cur[cell]) | 0;
    this.cur[cell] = 0;
  }
  fullyClear(): void {
    this.volume_ = 0;
    this.area.setEmpty();
    this.cur = $J.newArray(Dungeon.level.length(), 0);
    this.off = $J.newArray(Dungeon.level.length(), 0);
  }
  onBuildFlagMaps(l: Level): void {
  }
  onUpdateCellFlags(l: Level, cell: number): void {
  }
  landmark(): Notes$Landmark {
    return null;
  }
  tileDesc(): string {
    return null;
  }
  static seed$int$int$Class<T>(cell: number, amount: number, type$: JClass<T>): T {
    return Blob.seed$int$int$Class$Level(cell, amount, type$, Dungeon.level);
  }
  static seed$int$int$Class$Level<T>(cell: number, amount: number, type$: JClass<T>, level: Level): T {
    let gas = level.blobs.get(type$);
    if (gas == null) {
      gas = Reflection.newInstance(type$);
      if (Actor.curActorPriority() < gas.actPriority) {
        gas.spend(1);
      }
    }
    if (gas != null) {
      level.blobs.put(type$, gas);
      gas.seed(level, cell, amount);
    }
    return gas;
  }
  static volumeAt(cell: number, type$: JClass<Blob>): number {
    let gas = Dungeon.level.blobs.get(type$);
    if (gas == null || gas.volume_ === 0) {
      return 0;
    } else {
      return gas.cur[cell];
    }
  }
}

$J.define(Blob, 'com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.Actor', ctors: { '': '_Blob' }, meths: { 'seed(int,int,java.lang.Class,com.shatteredpixel.shatteredpixeldungeon.levels.Level)': 'seed$int$int$Class$Level', 'seed(int,int,java.lang.Class)': 'seed$int$int$Class' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Rect = $J.load('com.watabou.utils.Rect');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
