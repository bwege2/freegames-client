// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/GreaterHaste.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Actor, Buff$buffType, Talent, Messages, BuffIndicator;

export class GreaterHaste extends Buff {
  left_: number = 0;
  static readonly LEFT: string = 'left';
  _GreaterHaste(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  act(): boolean {
    this.spendMove();
    this.spend(Actor.TICK);
    return true;
  }
  spendMove(): void {
    this.left_--;
    if (this.left_ <= 0) {
      this.detach();
    }
  }
  set(time: number): void {
    this.left_ = time;
  }
  extend(duration: number): void {
    this.left_ = $J.d2i(Math.fround(this.left_ + duration));
  }
  icon(): number {
    return BuffIndicator.HASTE;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, Math.fround(0.3), 0);
  }
  iconFadePercent(): number {
    let duration = Math.fround((1 + Math.imul(2, Dungeon.hero.pointsInTalent(Talent.LETHAL_HASTE))) | 0);
    return Math.max(0, Math.fround((Math.fround(duration - this.left_)) / duration));
  }
  iconTextDisplay(): string {
    return String(this.left_);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.left_]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(GreaterHaste.LEFT, this.left_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.left_ = bundle.getInt(GreaterHaste.LEFT);
  }
}

$J.define(GreaterHaste, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.GreaterHaste', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_GreaterHaste' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
