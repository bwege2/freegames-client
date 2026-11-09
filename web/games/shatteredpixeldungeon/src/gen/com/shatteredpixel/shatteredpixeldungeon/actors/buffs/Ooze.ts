// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Ooze.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Actor, Buff$buffType, Messages, BuffIndicator, GLog;

export class Ooze extends Buff {
  static readonly DURATION: number = 20;
  left_: number = 0;
  acted: boolean = false;
  static readonly LEFT: string = 'left';
  static readonly ACTED: string = 'acted';
  _Ooze(): this {
    this._Buff();
    this.type_ = Buff$buffType.NEGATIVE;
    this.announced = true;
    this.acted = false;
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(Ooze.LEFT, this.left_);
    bundle.put$String$boolean(Ooze.ACTED, this.acted);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.left_ = bundle.getFloat(Ooze.LEFT);
    this.acted = bundle.getBoolean(Ooze.ACTED);
  }
  icon(): number {
    return BuffIndicator.OOZE;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(Ooze.DURATION - this.left_)) / Ooze.DURATION));
  }
  iconTextDisplay(): string {
    return String($J.d2i(this.left_));
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.dispTurns$float(this.left_)]);
  }
  set(left: number): void {
    this.left_ = left;
    this.acted = false;
    if (this.target != null) {
      this.target.needsIncomingDOTUpdate = true;
    }
  }
  extend(duration: number): void {
    this.left_ = Math.fround(this.left_ + duration);
    if (this.target != null) {
      this.target.needsIncomingDOTUpdate = true;
    }
  }
  act(): boolean {
    if (this.acted && Dungeon.level.water[this.target.pos] && !this.target.flying) {
      this.detach();
    } else if (this.target.isAlive()) {
      this.acted = true;
      if (Dungeon.scalingDepth() > 5) {
        this.target.damage((1 + $J.idiv(Dungeon.scalingDepth(), 5)) | 0, this);
      } else if (Dungeon.scalingDepth() === 5) {
        this.target.damage(1, this);
      } else if ($J.d2i(this.left_) % 2 === 0) {
        this.target.damage(1, this);
      }
      if (!this.target.isAlive() && this.target === Dungeon.hero) {
        Dungeon.fail(this);
        GLog.n(Messages.get$Object$String$ObjectArr(this, 'ondeath', []), []);
      }
      this.spend(Actor.TICK);
      this.left_ = Math.fround(this.left_ - Actor.TICK);
      if (this.left_ <= Math.fround(0)) {
        this.detach();
      }
    } else {
      this.detach();
    }
    if (Dungeon.level.water[this.target.pos] && !this.target.flying) {
      this.detach();
    }
    this.target.needsIncomingDOTUpdate = true;
    return true;
  }
  detach(): void {
    this.target.needsIncomingDOTUpdate = true;
    super.detach();
  }
  totalIncomingDMG(): number {
    if (Dungeon.scalingDepth() > 5) {
      let dmg = (1 + $J.idiv(Dungeon.scalingDepth(), 5)) | 0;
      return $J.d2i((Math.ceil(this.left_) * dmg));
    } else if (Dungeon.scalingDepth() === 5) {
      return $J.d2i((Math.ceil(this.left_)));
    } else {
      return $J.d2i((Math.ceil(this.left_) / 2));
    }
  }
}

$J.define(Ooze, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Ooze', { kind: 'class', ifaces: ['com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$DOTbuff'], sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Ooze' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
