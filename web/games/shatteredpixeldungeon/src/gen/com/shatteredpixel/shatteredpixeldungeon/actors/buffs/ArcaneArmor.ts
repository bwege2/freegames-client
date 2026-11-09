// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/ArcaneArmor.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Buff$buffType, Hero, Messages, BuffIndicator;

export class ArcaneArmor extends Buff {
  level_: number = 0;
  interval: number = 0;
  static readonly LEVEL: string = 'level';
  static readonly INTERVAL: string = 'interval';
  _ArcaneArmor(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    this.level_ = 0;
    this.interval = 1;
    return this;
  }
  act(): boolean {
    if (this.target.isAlive()) {
      this.spend(Math.fround(this.interval));
      if (--this.level_ <= 0) {
        this.detach();
      }
    } else {
      this.detach();
    }
    return true;
  }
  level(): number {
    return this.level_;
  }
  set(value: number, time: number): void {
    if (Math.sqrt(this.interval) * this.level_ < Math.sqrt(time) * value) {
      this.level_ = value;
      this.interval = time;
      this.spend(Math.fround(Math.fround(time - this.cooldown()) - 1));
    }
  }
  delay(value: number): void {
    this.spend(value);
  }
  icon(): number {
    return BuffIndicator.ARMOR;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, 0.5, 2);
  }
  iconFadePercent(): number {
    if (this.target instanceof Hero) {
      let max = Math.fround(($J.idiv((this.target).lvl, 2) + 5) | 0);
      return Math.fround((Math.fround(max - this.level_)) / max);
    }
    return 0;
  }
  iconTextDisplay(): string {
    return String(this.level_);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.level_, this.dispTurns$float(this.visualcooldown())]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(ArcaneArmor.INTERVAL, this.interval);
    bundle.put$String$int(ArcaneArmor.LEVEL, this.level_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.interval = bundle.getInt(ArcaneArmor.INTERVAL);
    this.level_ = bundle.getInt(ArcaneArmor.LEVEL);
  }
}

$J.define(ArcaneArmor, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.ArcaneArmor', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_ArcaneArmor' } });
$J.module(() => {
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
