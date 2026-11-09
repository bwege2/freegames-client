// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/rings/RingOfSharpshooting.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class RingOfSharpshooting extends Ring {
  _RingOfSharpshooting(): this {
    this._Ring();
    this.icon_ = ItemSpriteSheet$Icons.RING_SHARPSHOOT;
    this.buffClass = $J.cls(RingOfSharpshooting$Aim);
    return this;
  }
  statsInfo(): string {
    if (this.isIdentified()) {
      let info = Messages.get$Object$String$ObjectArr(this, 'stats', [this.soloBuffedBonus(), Messages.decimalFormat('#.##', 100 * ($J.pow(1.2, this.soloBonus()) - 1))]);
      if (this.isEquipped(Dungeon.hero) && this.soloBuffedBonus() !== this.combinedBuffedBonus(Dungeon.hero)) {
        info += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'combined_stats', [this.combinedBuffedBonus(Dungeon.hero), Messages.decimalFormat('#.##', 100 * ($J.pow(1.2, this.combinedBonus(Dungeon.hero)) - 1))]);
      }
      return info;
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_stats', [1, Messages.decimalFormat('#.##', 20)]);
    }
  }
  upgradeStat1(level: number): string {
    if (this.cursed && this.cursedKnown) {
      level = Math.min(-1, (level - 3) | 0);
    }
    return String((level + 1) | 0);
  }
  upgradeStat2(level: number): string {
    if (this.cursed && this.cursedKnown) {
      level = Math.min(-1, (level - 3) | 0);
    }
    return Messages.decimalFormat('#.##', 100 * (($J.pow(1.2, (level + 1) | 0)) - 1)) + '%';
  }
  buff(): Ring$RingBuff {
    return new RingOfSharpshooting$Aim().$o(this)._RingOfSharpshooting$Aim();
  }
  static levelDamageBonus(target: Char): number {
    return Ring.getBuffedBonus(target, $J.cls(RingOfSharpshooting$Aim));
  }
  static durabilityMultiplier(target: Char): number {
    return Math.fround(($J.pow(1.2, Ring.getBonus(target, $J.cls(RingOfSharpshooting$Aim)))));
  }
}

export class RingOfSharpshooting$Aim extends Ring$RingBuff {
  _RingOfSharpshooting$Aim(): this {
    this._Ring$RingBuff();
    return this;
  }
}

$J.define(RingOfSharpshooting, 'com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfSharpshooting', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring', ctors: { '': '_RingOfSharpshooting' } });
$J.define(RingOfSharpshooting$Aim, 'com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfSharpshooting$Aim', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring$RingBuff', ctors: { '': '_RingOfSharpshooting$Aim' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
});
