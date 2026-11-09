// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/trinkets/VialOfBlood.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Messages, ItemSpriteSheet;

export class VialOfBlood extends Trinket {
  _VialOfBlood(): this {
    this._Trinket();
    this.image_ = ItemSpriteSheet.BLOOD_VIAL;
    return this;
  }
  upgradeEnergyCost(): number {
    return (6 + Math.imul(2, this.level$())) | 0;
  }
  statsDesc(): string {
    if (this.isIdentified()) {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [Messages.decimalFormat('#.##', Math.fround(100 * (Math.fround(VialOfBlood.totalHealMultiplier$int(this.buffedLvl()) - 1)))), String(VialOfBlood.maxHealPerTurn$int(this.buffedLvl()))]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_stats_desc', [Messages.decimalFormat('#.##', Math.fround(100 * (Math.fround(VialOfBlood.totalHealMultiplier$int(0) - 1)))), String(VialOfBlood.maxHealPerTurn$int(0))]);
    }
  }
  static delayBurstHealing(): boolean {
    return Trinket.trinketLevel($J.cls(VialOfBlood)) !== -1;
  }
  static bloodVialLevel(): number {
    return Trinket.trinketLevel($J.cls(VialOfBlood));
  }
  static totalHealMultiplier$(): number {
    return VialOfBlood.totalHealMultiplier$int(Trinket.trinketLevel($J.cls(VialOfBlood)));
  }
  static totalHealMultiplier$int(level: number): number {
    if (level === -1) {
      return 1;
    } else {
      return Math.fround(1 + Math.fround(0.125 * ((level + 1) | 0)));
    }
  }
  static maxHealPerTurn$(): number {
    return VialOfBlood.maxHealPerTurn$int(Trinket.trinketLevel($J.cls(VialOfBlood)));
  }
  static maxHealPerTurn$int(level: number): number {
    let maxHP = Dungeon.hero == null ? 20 : Dungeon.hero.HT;
    if (level === -1) {
      return maxHP;
    } else {
      switch (level) {
        case 0:
        default:
          return (4 + $J.roundf(Math.fround(Math.fround(0.15) * maxHP))) | 0;
        case 1:
          return (3 + $J.roundf(Math.fround(Math.fround(0.1) * maxHP))) | 0;
        case 2:
          return (2 + $J.roundf(Math.fround(Math.fround(0.07) * maxHP))) | 0;
        case 3:
          return (1 + $J.roundf(Math.fround(Math.fround(0.05) * maxHP))) | 0;
      }
    }
  }
}

$J.define(VialOfBlood, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.VialOfBlood', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket', ctors: { '': '_VialOfBlood' }, meths: { 'maxHealPerTurn(int)': 'maxHealPerTurn$int', 'maxHealPerTurn()': 'maxHealPerTurn$', 'totalHealMultiplier(int)': 'totalHealMultiplier$int', 'totalHealMultiplier()': 'totalHealMultiplier$' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
