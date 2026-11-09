// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/LockedFloor.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Buff } from './Buff.ts';

let Challenges, Dungeon, Actor, BuffIndicator;

export class LockedFloor extends Buff {
  left_: number = 0;
  LEFT: string = null;
  _LockedFloor(): this {
    this._Buff();
    this.left_ = Math.fround(Dungeon.isChallenged(Challenges.STRONGER_BOSSES) ? 20 : 50);
    this.LEFT = 'left';
    return this;
  }
  act(): boolean {
    this.spend(Actor.TICK);
    if (!Dungeon.level.locked) {
      this.detach();
    }
    if (this.left_ >= Math.fround(1)) {
      this.left_--;
    }
    return true;
  }
  addTime(time: number): void {
    this.left_ = Math.fround(this.left_ + time);
    this.left_ = Math.min(this.left_, 50);
  }
  removeTime(time: number): void {
    this.left_ = Math.fround(this.left_ - time);
  }
  regenOn(): boolean {
    return this.left_ >= Math.fround(1);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(this.LEFT, this.left_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.left_ = bundle.getFloat(this.LEFT);
  }
  icon(): number {
    return BuffIndicator.LOCKED_FLOOR;
  }
}

$J.define(LockedFloor, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.LockedFloor', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_LockedFloor' } });
$J.module(() => {
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
