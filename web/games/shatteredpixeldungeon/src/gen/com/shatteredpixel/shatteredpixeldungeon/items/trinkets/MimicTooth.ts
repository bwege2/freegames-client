// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/trinkets/MimicTooth.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class MimicTooth extends Trinket {
  _MimicTooth(): this {
    this._Trinket();
    this.image_ = ItemSpriteSheet.MIMIC_TOOTH;
    return this;
  }
  upgradeEnergyCost(): number {
    return (6 + Math.imul(2, this.level$())) | 0;
  }
  statsDesc(): string {
    if (this.isIdentified()) {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [Messages.decimalFormat('#.##', MimicTooth.mimicChanceMultiplier$int(this.buffedLvl())), Messages.decimalFormat('#.##', Math.fround(100 * MimicTooth.ebonyMimicChance$int(this.buffedLvl())))]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_stats_desc', [Messages.decimalFormat('#.##', MimicTooth.mimicChanceMultiplier$int(0)), Messages.decimalFormat('#.##', Math.fround(100 * MimicTooth.ebonyMimicChance$int(0)))]);
    }
  }
  static mimicChanceMultiplier$(): number {
    return MimicTooth.mimicChanceMultiplier$int(Trinket.trinketLevel($J.cls(MimicTooth)));
  }
  static mimicChanceMultiplier$int(level: number): number {
    if (level === -1) {
      return 1;
    } else {
      return Math.fround(1.5 + Math.fround(0.5 * level));
    }
  }
  static stealthyMimics(): boolean {
    return Trinket.trinketLevel($J.cls(MimicTooth)) >= 0;
  }
  static ebonyMimicChance$(): number {
    return MimicTooth.ebonyMimicChance$int(Trinket.trinketLevel($J.cls(MimicTooth)));
  }
  static ebonyMimicChance$int(level: number): number {
    if (level >= 0) {
      return Math.fround(0.125 + Math.fround(0.125 * level));
    } else {
      return 0;
    }
  }
}

$J.define(MimicTooth, 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.MimicTooth', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.trinkets.Trinket', ctors: { '': '_MimicTooth' }, meths: { 'ebonyMimicChance(int)': 'ebonyMimicChance$int', 'ebonyMimicChance()': 'ebonyMimicChance$', 'mimicChanceMultiplier(int)': 'mimicChanceMultiplier$int', 'mimicChanceMultiplier()': 'mimicChanceMultiplier$' } });
$J.module(() => {
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
