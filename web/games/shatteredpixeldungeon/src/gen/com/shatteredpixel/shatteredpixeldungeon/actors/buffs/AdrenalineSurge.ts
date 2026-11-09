// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/AdrenalineSurge.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Buff$buffType, Messages, BuffIndicator;

export class AdrenalineSurge extends Buff {
  static DURATION: number = 0;
  boost_: number = 0;
  interval: number = 0;
  static readonly BOOST: string = 'boost';
  static readonly INTERVAL: string = 'interval';
  _AdrenalineSurge(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  reset(boost: number, interval: number): void {
    this.boost_ = boost;
    this.interval = interval;
    this.spend(Math.fround(interval - this.cooldown()));
  }
  delay(value: number): void {
    this.spend(value);
  }
  boost(): number {
    return this.boost_;
  }
  act(): boolean {
    this.boost_--;
    if (this.boost_ > 0) {
      this.spend(this.interval);
    } else {
      this.detach();
    }
    return true;
  }
  icon(): number {
    return BuffIndicator.UPGRADE;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, 0.5, 0);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(AdrenalineSurge.DURATION - this.visualcooldown())) / AdrenalineSurge.DURATION));
  }
  iconTextDisplay(): string {
    return String($J.d2i(this.visualcooldown()));
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.boost_, this.dispTurns$float(this.visualcooldown())]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(AdrenalineSurge.BOOST, this.boost_);
    bundle.put$String$float(AdrenalineSurge.INTERVAL, this.interval);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.boost_ = bundle.getInt(AdrenalineSurge.BOOST);
    this.interval = bundle.getFloat(AdrenalineSurge.INTERVAL);
  }
  static $clinit() {
    AdrenalineSurge.DURATION = 200;
  }
}

$J.define(AdrenalineSurge, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.AdrenalineSurge', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_AdrenalineSurge' }, clinit: true, lazy: ['DURATION'] });
$J.module(() => {
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
