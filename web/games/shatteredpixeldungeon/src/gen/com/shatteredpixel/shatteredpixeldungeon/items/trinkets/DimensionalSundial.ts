// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/trinkets/DimensionalSundial.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Calendar } from '../../../../../../jre/index.ts';
import { Trinket } from './Trinket.ts';

let Messages, ItemSpriteSheet, GLog;

export class DimensionalSundial extends Trinket {
  static sundialWarned: boolean = false;
  _DimensionalSundial(): this {
    this._Trinket();
    this.image_ = ItemSpriteSheet.SUNDIAL;
    return this;
  }
  upgradeEnergyCost(): number {
    return (6 + Math.imul(2, this.level$())) | 0;
  }
  statsDesc(): string {
    if (this.isIdentified()) {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [$J.d2i((Math.fround(100 * (Math.fround(1 - DimensionalSundial.enemySpawnMultiplierDaytime$int(this.buffedLvl())))))), $J.d2i((Math.fround(100 * (Math.fround(DimensionalSundial.enemySpawnMultiplierNighttime$int(this.buffedLvl()) - 1)))))]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_stats_desc', [$J.d2i((Math.fround(100 * (Math.fround(1 - DimensionalSundial.enemySpawnMultiplierDaytime$int(0)))))), $J.d2i((Math.fround(100 * (Math.fround(DimensionalSundial.enemySpawnMultiplierNighttime$int(0) - 1)))))]);
    }
  }
  static spawnMultiplierAtCurrentTime(): number {
    if (Trinket.trinketLevel($J.cls(DimensionalSundial)) !== -1) {
      let cal = Calendar.getInstance();
      if (cal.get(11) >= 20 || cal.get(11) <= 7) {
        if (!DimensionalSundial.sundialWarned) {
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(DimensionalSundial), 'warning', []), []);
          DimensionalSundial.sundialWarned = true;
        }
        return DimensionalSundial.enemySpawnMultiplierNighttime$();
      } else {
        return DimensionalSundial.enemySpawnMultiplierDaytime$();
      }
    } else {
      return 1;
    }
  }
  static enemySpawnMultiplierDaytime$(): number {
    return DimensionalSundial.enemySpawnMultiplierDaytime$int(Trinket.trinketLevel($J.cls(DimensionalSundial)));
  }
  static enemySpawnMultiplierDaytime$int(level: number): number {
    if (level === -1) {
      return 1;
    } else {
      return Math.fround(Math.fround(0.95) - Math.fround(Math.fround(0.05) * level));
    }
  }
  static enemySpawnMultiplierNighttime$(): number {
    return DimensionalSundial.enemySpawnMultiplierNighttime$int(Trinket.trinketLevel($J.cls(DimensionalSundial)));
  }
  static enemySpawnMultiplierNighttime$int(level: number): number {
    if (level === -1) {
      return 1;
    } else {
      return Math.fround(1.25 + Math.fround(0.25 * level));
    }
  }
  static $clinit() {
    DimensionalSundial.sundialWarned = false;
  }
}

$J.define(DimensionalSundial, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.DimensionalSundial', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket', ctors: { '': '_DimensionalSundial' }, meths: { 'enemySpawnMultiplierNighttime(int)': 'enemySpawnMultiplierNighttime$int', 'enemySpawnMultiplierNighttime()': 'enemySpawnMultiplierNighttime$', 'enemySpawnMultiplierDaytime(int)': 'enemySpawnMultiplierDaytime$int', 'enemySpawnMultiplierDaytime()': 'enemySpawnMultiplierDaytime$' }, clinit: true, lazy: ['sundialWarned'] });
$J.module(() => {
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
});
