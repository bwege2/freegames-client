// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Dread.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Actor, Buff$buffType, Terror, Mob, Messages, BuffIndicator;

export class Dread extends Buff {
  left_: number = 0;
  object: number = 0;
  static readonly DURATION: number = 20;
  static readonly LEFT: string = 'left';
  static readonly OBJECT: string = 'object';
  _Dread(): this {
    this._Buff();
    this.left_ = $J.d2i(Dread.DURATION);
    this.object = 0;
    this.type_ = Buff$buffType.NEGATIVE;
    this.announced = true;
    this.immunities_.add($J.cls(Terror));
    return this;
  }
  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      Buff.detach(target, $J.cls(Terror));
      return true;
    } else {
      return false;
    }
  }
  act(): boolean {
    if (!Dungeon.level.heroFOV[this.target.pos] && Dungeon.level.distance(this.target.pos, Dungeon.hero.pos) >= 6) {
      if (this.target instanceof Mob) {
        (this.target).EXP = $J.idiv((this.target).EXP, 2);
      }
      this.target.destroy();
      this.target.sprite_.killAndErase();
      Dungeon.level.mobs.remove(this.target);
    } else {
      this.left_--;
      if (this.left_ <= 0) {
        this.detach();
      }
    }
    this.spend(Actor.TICK);
    return true;
  }
  extend(duration: number): void {
    this.left_ = $J.d2i(Math.fround(this.left_ + duration));
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Dread.LEFT, this.left_);
    bundle.put$String$int(Dread.OBJECT, this.object);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.object = bundle.getInt(Dread.OBJECT);
    this.left_ = bundle.getInt(Dread.LEFT);
  }
  icon(): number {
    return BuffIndicator.TERROR;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(Dread.DURATION - this.left_)) / Dread.DURATION));
  }
  iconTextDisplay(): string {
    return String(this.left_);
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, 0, 0);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.left_]);
  }
  recover(): void {
    this.left_ = (this.left_ - 5) | 0;
    if (this.left_ <= 0) {
      this.detach();
    }
  }
}

$J.define(Dread, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Dread', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Dread' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Terror = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Terror');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
