// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/SwarmIntelTracker.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Messages, BuffIndicator;

export class SwarmIntelTracker extends Buff {
  alertRange: number = 0;
  leftAtZero: number = 0;
  static readonly ALERT_RANGE: string = 'alert_range';
  static readonly LEFT: string = 'left';
  _SwarmIntelTracker(): this {
    this._Buff();
    this.alertRange = 0;
    return this;
  }
  act(): boolean {
    this.alertRange = 0;
    let lowestCooldown = 1;
    for (const $it0 = Dungeon.level.mobs.iterator(); $it0.hasNext(); ) {
      let m = $it0.next();
      if (this.target.fieldOfView != null && this.target.fieldOfView.length === Dungeon.level.length() && this.target.fieldOfView[m.pos]) {
        this.alertRange = Math.max(this.alertRange, m.swarmAlertRange());
      }
      if (m.cooldown() < lowestCooldown) {
        lowestCooldown = m.cooldown();
      }
    }
    if (this.alertRange > 0) {
      this.leftAtZero = 5;
    } else {
      this.leftAtZero = Math.fround(this.leftAtZero - this.target.cooldown());
    }
    this.spend(lowestCooldown);
    return true;
  }
  icon(): number {
    if (this.alertRange === 0 && this.leftAtZero <= Math.fround(0)) {
      return BuffIndicator.NONE;
    } else {
      return BuffIndicator.TARGETED;
    }
  }
  iconFadePercent(): number {
    return Math.fround(((12 - this.alertRange) | 0) / 12);
  }
  tintIcon(icon: Image): void {
    if (this.alertRange === 0) {
      icon.brightness(0.5);
    } else {
      icon.resetColor();
    }
  }
  iconTextDisplay(): string {
    return String(this.alertRange);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.alertRange]);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(SwarmIntelTracker.ALERT_RANGE, this.alertRange);
    bundle.put$String$float(SwarmIntelTracker.LEFT, this.leftAtZero);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.alertRange = bundle.getInt(SwarmIntelTracker.ALERT_RANGE);
    this.leftAtZero = Math.fround(bundle.getInt(SwarmIntelTracker.LEFT));
  }
}

$J.define(SwarmIntelTracker, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.SwarmIntelTracker', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_SwarmIntelTracker' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
