// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Barkskin.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Buff$buffType, Hero, Talent, Messages, BuffIndicator;

export class Barkskin extends Buff {
  level_: number = 0;
  interval: number = 0;
  static readonly LEVEL: string = 'level';
  static readonly INTERVAL: string = 'interval';
  _Barkskin(): this {
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
    if (this.level_ <= value) {
      this.level_ = value;
      this.interval = time;
      this.spend(Math.fround(Math.fround(time - this.cooldown()) - 1));
    }
  }
  delay(value: number): void {
    this.spend(value);
  }
  icon(): number {
    return BuffIndicator.BARKSKIN;
  }
  iconFadePercent(): number {
    if (this.target instanceof Hero) {
      let max = Math.fround($J.idiv(Math.imul((this.target).lvl, (this.target).pointsInTalent(Talent.BARKSKIN)), 2));
      max = Math.max(max, Math.fround((2 + $J.idiv((this.target).lvl, 3)) | 0));
      return Math.max(0, Math.fround((Math.fround(max - this.level_)) / max));
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
    bundle.put$String$int(Barkskin.INTERVAL, this.interval);
    bundle.put$String$int(Barkskin.LEVEL, this.level_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.interval = bundle.getInt(Barkskin.INTERVAL);
    this.level_ = bundle.getInt(Barkskin.LEVEL);
  }
  static currentLevel(ch: Char): number {
    let level = 0;
    for (const $it0 = ch.buffs$Class($J.cls(Barkskin)).iterator(); $it0.hasNext(); ) {
      let b = $it0.next();
      level = Math.max(level, b.level_);
    }
    return level;
  }
  static conditionallyAppend(ch: Char, level: number, interval: number): void {
    for (const $it1 = ch.buffs$Class($J.cls(Barkskin)).iterator(); $it1.hasNext(); ) {
      let b = $it1.next();
      if (b.interval === interval) {
        b.set(level, interval);
        return;
      }
    }
    Buff.append$Char$Class(ch, $J.cls(Barkskin)).set(level, interval);
  }
}

$J.define(Barkskin, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Barkskin', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Barkskin' } });
$J.module(() => {
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
