// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/rings/RingOfTenacity.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Ring } from './Ring.ts';
import { Ring$RingBuff } from './Ring.ts';

let Dungeon, Messages, ItemSpriteSheet$Icons;

export class RingOfTenacity extends Ring {
  _RingOfTenacity(): this {
    this._Ring();
    this.icon_ = ItemSpriteSheet$Icons.RING_TENACITY;
    this.buffClass = $J.cls(RingOfTenacity$Tenacity);
    return this;
  }
  statsInfo(): string {
    if (this.isIdentified()) {
      let info = Messages.get$Object$String$ObjectArr(this, 'stats', [Messages.decimalFormat('#.##', 100 * (1 - $J.pow(Math.fround(0.85), this.soloBuffedBonus())))]);
      if (this.isEquipped(Dungeon.hero) && this.soloBuffedBonus() !== this.combinedBuffedBonus(Dungeon.hero)) {
        info += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'combined_stats', [Messages.decimalFormat('#.##', 100 * (1 - $J.pow(Math.fround(0.85), this.combinedBuffedBonus(Dungeon.hero))))]);
      }
      return info;
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_stats', [Messages.decimalFormat('#.##', 15)]);
    }
  }
  upgradeStat1(level: number): string {
    if (this.cursed && this.cursedKnown) {
      level = Math.min(-1, (level - 3) | 0);
    }
    return Messages.decimalFormat('#.##', 100 * (1 - ($J.pow(Math.fround(0.85), (level + 1) | 0)))) + '%';
  }
  buff(): Ring$RingBuff {
    return new RingOfTenacity$Tenacity().$o(this)._RingOfTenacity$Tenacity();
  }
  static damageMultiplier(t: Char): number {
    return Math.fround($J.pow(0.85, Math.fround(Ring.getBuffedBonus(t, $J.cls(RingOfTenacity$Tenacity)) * (Math.fround(Math.fround(((t.HT - t.HP) | 0)) / t.HT)))));
  }
}

export class RingOfTenacity$Tenacity extends Ring$RingBuff {
  _RingOfTenacity$Tenacity(): this {
    this._Ring$RingBuff();
    return this;
  }
}

$J.define(RingOfTenacity, 'com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfTenacity', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring', ctors: { '': '_RingOfTenacity' } });
$J.define(RingOfTenacity$Tenacity, 'com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfTenacity$Tenacity', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring$RingBuff', ctors: { '': '_RingOfTenacity$Tenacity' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
});
