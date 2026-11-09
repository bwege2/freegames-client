// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/rings/RingOfEvasion.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class RingOfEvasion extends Ring {
  _RingOfEvasion(): this {
    this._Ring();
    this.icon_ = ItemSpriteSheet$Icons.RING_EVASION;
    this.buffClass = $J.cls(RingOfEvasion$Evasion);
    return this;
  }
  statsInfo(): string {
    if (this.isIdentified()) {
      let info = Messages.get$Object$String$ObjectArr(this, 'stats', [Messages.decimalFormat('#.##', 100 * ($J.pow(1.125, this.soloBuffedBonus()) - 1))]);
      if (this.isEquipped(Dungeon.hero) && this.soloBuffedBonus() !== this.combinedBuffedBonus(Dungeon.hero)) {
        info += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'combined_stats', [Messages.decimalFormat('#.##', 100 * ($J.pow(1.125, this.combinedBuffedBonus(Dungeon.hero)) - 1))]);
      }
      return info;
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_stats', [Messages.decimalFormat('#.##', 12.5)]);
    }
  }
  upgradeStat1(level: number): string {
    if (this.cursed && this.cursedKnown) {
      level = Math.min(-1, (level - 3) | 0);
    }
    return Messages.decimalFormat('#.##', 100 * (($J.pow(1.125, (level + 1) | 0)) - 1)) + '%';
  }
  buff(): Ring$RingBuff {
    return new RingOfEvasion$Evasion().$o(this)._RingOfEvasion$Evasion();
  }
  static evasionMultiplier(target: Char): number {
    return Math.fround($J.pow(1.125, Ring.getBuffedBonus(target, $J.cls(RingOfEvasion$Evasion))));
  }
}

export class RingOfEvasion$Evasion extends Ring$RingBuff {
  _RingOfEvasion$Evasion(): this {
    this._Ring$RingBuff();
    return this;
  }
}

$J.define(RingOfEvasion, 'com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEvasion', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring', ctors: { '': '_RingOfEvasion' } });
$J.define(RingOfEvasion$Evasion, 'com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEvasion$Evasion', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring$RingBuff', ctors: { '': '_RingOfEvasion$Evasion' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
});
