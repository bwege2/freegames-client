// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/rings/RingOfMight.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Hero, Messages, ItemSpriteSheet$Icons;

export class RingOfMight extends Ring {
  _RingOfMight(): this {
    this._Ring();
    this.icon_ = ItemSpriteSheet$Icons.RING_MIGHT;
    this.buffClass = $J.cls(RingOfMight$Might);
    return this;
  }
  doEquip(hero: Hero): boolean {
    if (super.doEquip(hero)) {
      hero.updateHT(false);
      return true;
    } else {
      return false;
    }
  }
  doUnequip$Hero$boolean$boolean(hero: Hero, collect: boolean, single: boolean): boolean {
    if (super.doUnequip$Hero$boolean$boolean(hero, collect, single)) {
      hero.updateHT(false);
      return true;
    } else {
      return false;
    }
  }
  upgrade$(): Item {
    super.upgrade$();
    this.updateTargetHT();
    return this;
  }
  level$int(value: number): Item {
    super.level$int(value);
    this.updateTargetHT();
    return this;
  }
  updateTargetHT(): void {
    if (this.buff_ != null && this.buff_.target instanceof Hero) {
      (this.buff_.target).updateHT(false);
    }
  }
  statsInfo(): string {
    if (this.isIdentified()) {
      let info = Messages.get$Object$String$ObjectArr(this, 'stats', [this.soloBonus(), Messages.decimalFormat('#.##', 100 * ($J.pow(1.035, this.soloBuffedBonus()) - 1))]);
      if (this.isEquipped(Dungeon.hero) && this.soloBuffedBonus() !== this.combinedBuffedBonus(Dungeon.hero)) {
        info += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'combined_stats', [Ring.getBonus(Dungeon.hero, $J.cls(RingOfMight$Might)), Messages.decimalFormat('#.##', 100 * ($J.pow(1.035, this.combinedBuffedBonus(Dungeon.hero)) - 1))]);
      }
      return info;
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_stats', [1, Messages.decimalFormat('#.##', 3.5)]);
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
    return Messages.decimalFormat('#.##', 100 * (($J.pow(1.035, (level + 1) | 0)) - 1)) + '%';
  }
  buff(): Ring$RingBuff {
    return new RingOfMight$Might().$o(this)._RingOfMight$Might();
  }
  static strengthBonus(target: Char): number {
    return Ring.getBonus(target, $J.cls(RingOfMight$Might));
  }
  static HTMultiplier(target: Char): number {
    return Math.fround($J.pow(1.035, Ring.getBuffedBonus(target, $J.cls(RingOfMight$Might))));
  }
}

export class RingOfMight$Might extends Ring$RingBuff {
  _RingOfMight$Might(): this {
    this._Ring$RingBuff();
    return this;
  }
}

$J.define(RingOfMight, 'com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfMight', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring', ctors: { '': '_RingOfMight' }, meths: { 'level(int)': 'level$int', 'upgrade()': 'upgrade$', 'doUnequip(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,boolean,boolean)': 'doUnequip$Hero$boolean$boolean' } });
$J.define(RingOfMight$Might, 'com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfMight$Might', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring$RingBuff', ctors: { '': '_RingOfMight$Might' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
});
