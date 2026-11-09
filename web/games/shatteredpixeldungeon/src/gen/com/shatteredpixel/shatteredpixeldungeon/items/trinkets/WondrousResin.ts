// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/trinkets/WondrousResin.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Trinket } from './Trinket.ts';

let Messages, ItemSpriteSheet;

export class WondrousResin extends Trinket {
  static forcePositive: boolean = false;
  _WondrousResin(): this {
    this._Trinket();
    this.image_ = ItemSpriteSheet.WONDROUS_RESIN;
    return this;
  }
  upgradeEnergyCost(): number {
    return (10 + Math.imul(5, this.level$())) | 0;
  }
  statsDesc(): string {
    if (this.isIdentified()) {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [Messages.decimalFormat('#.##', Math.fround(100 * WondrousResin.positiveCurseEffectChance$int(this.buffedLvl()))), Messages.decimalFormat('#.##', Math.fround(100 * WondrousResin.extraCurseEffectChance$int(this.buffedLvl())))]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_stats_desc', [Messages.decimalFormat('#.##', Math.fround(100 * WondrousResin.positiveCurseEffectChance$int(0))), Messages.decimalFormat('#.##', Math.fround(100 * WondrousResin.extraCurseEffectChance$int(0)))]);
    }
  }
  static positiveCurseEffectChance$(): number {
    if (WondrousResin.forcePositive) {
      return 1;
    }
    return WondrousResin.positiveCurseEffectChance$int(Trinket.trinketLevel($J.cls(WondrousResin)));
  }
  static positiveCurseEffectChance$int(level: number): number {
    if (level >= 0) {
      return Math.fround(0.25 + Math.fround(0.25 * level));
    } else {
      return 0;
    }
  }
  static extraCurseEffectChance$(): number {
    return WondrousResin.extraCurseEffectChance$int(Trinket.trinketLevel($J.cls(WondrousResin)));
  }
  static extraCurseEffectChance$int(level: number): number {
    if (level >= 0) {
      return Math.fround(0.125 + Math.fround(0.125 * level));
    } else {
      return 0;
    }
  }
  static $clinit() {
    WondrousResin.forcePositive = false;
  }
}

$J.define(WondrousResin, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.WondrousResin', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket', ctors: { '': '_WondrousResin' }, meths: { 'extraCurseEffectChance(int)': 'extraCurseEffectChance$int', 'extraCurseEffectChance()': 'extraCurseEffectChance$', 'positiveCurseEffectChance(int)': 'positiveCurseEffectChance$int', 'positiveCurseEffectChance()': 'positiveCurseEffectChance$' }, clinit: true, lazy: ['forcePositive'] });
$J.module(() => {
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
