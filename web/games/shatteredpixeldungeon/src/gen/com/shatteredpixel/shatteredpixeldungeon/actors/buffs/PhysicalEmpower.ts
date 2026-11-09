// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/PhysicalEmpower.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Buff$buffType, Talent, Messages, BuffIndicator;

export class PhysicalEmpower extends Buff {
  dmgBoost: number = 0;
  left_: number = 0;
  static readonly BOOST: string = 'boost';
  static readonly LEFT: string = 'left';
  _PhysicalEmpower(): this {
    this._Buff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  icon(): number {
    return BuffIndicator.UPGRADE;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, 0.5, 0);
  }
  iconFadePercent(): number {
    let max = Math.fround((1 + Dungeon.hero.pointsInTalent(Talent.STRENGTHENING_MEAL)) | 0);
    return Math.max(0, Math.fround((Math.fround(max - this.left_)) / max));
  }
  iconTextDisplay(): string {
    return String(this.left_);
  }
  desc(): string {
    return Messages.get$Object$String$ObjectArr(this, 'desc', [this.dmgBoost, this.left_]);
  }
  set(dmg: number, hits: number): void {
    if (Math.imul(dmg, hits) > Math.imul(this.dmgBoost, this.left_)) {
      this.dmgBoost = dmg;
      this.left_ = hits;
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(PhysicalEmpower.BOOST, this.dmgBoost);
    bundle.put$String$int(PhysicalEmpower.LEFT, this.left_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.dmgBoost = bundle.getInt(PhysicalEmpower.BOOST);
    this.left_ = bundle.getInt(PhysicalEmpower.LEFT);
  }
}

$J.define(PhysicalEmpower, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.PhysicalEmpower', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_PhysicalEmpower' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
