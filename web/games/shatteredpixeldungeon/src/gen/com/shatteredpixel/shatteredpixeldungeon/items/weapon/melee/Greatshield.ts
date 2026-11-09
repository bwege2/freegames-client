// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/melee/Greatshield.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { MeleeWeapon } from './MeleeWeapon.ts';

let RoundShield, Messages, ItemSpriteSheet;

export class Greatshield extends MeleeWeapon {
  _Greatshield(): this {
    this._MeleeWeapon();
    this.image_ = ItemSpriteSheet.GREATSHIELD;
    this.tier_ = 5;
    return this;
  }
  max$int(lvl: number): number {
    return ($J.roundf(Math.fround(3 * ((this.tier_ + 1) | 0))) + Math.imul(lvl, ((this.tier_ - 1) | 0))) | 0;
  }
  defenseFactor(owner: Char): number {
    return this.DRMax$();
  }
  DRMax$(): number {
    return this.DRMax$int(this.buffedLvl());
  }
  DRMax$int(lvl: number): number {
    return (6 + Math.imul(2, lvl)) | 0;
  }
  statsInfo(): string {
    if (this.isIdentified()) {
      return Messages.get$Object$String$ObjectArr(this, 'stats_desc', [(6 + Math.imul(2, this.buffedLvl())) | 0]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_stats_desc', [6]);
    }
  }
  duelistAbility(hero: Hero, target: number): void {
    RoundShield.guardAbility(hero, (3 + this.buffedLvl()) | 0, this);
  }
  abilityInfo(): string {
    if (this.levelKnown) {
      return Messages.get$Object$String$ObjectArr(this, 'ability_desc', [(3 + this.buffedLvl()) | 0]);
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_ability_desc', [3]);
    }
  }
  upgradeAbilityStat(level: number): string {
    return String((3 + level) | 0);
  }
}

$J.define(Greatshield, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Greatshield', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon', ctors: { '': '_Greatshield' }, meths: { 'DRMax(int)': 'DRMax$int', 'DRMax()': 'DRMax$', 'max(int)': 'max$int' } });
$J.module(() => {
  RoundShield = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.RoundShield');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
});
