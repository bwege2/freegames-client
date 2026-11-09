// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/rings/RingOfElements.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, HashSet } from '../../../../../../jre/index.ts';
import { Ring } from './Ring.ts';
import { Ring$RingBuff } from './Ring.ts';

let Dungeon, Electricity, ToxicGas, Burning, Chill, Corrosion, Frost, Ooze, Paralysis, Poison, AntiMagic, Messages, ItemSpriteSheet$Icons;

export class RingOfElements extends Ring {
  static RESISTS: HashSet<JClass> = null;
  _RingOfElements(): this {
    this._Ring();
    this.icon_ = ItemSpriteSheet$Icons.RING_ELEMENTS;
    this.buffClass = $J.cls(RingOfElements$Resistance);
    return this;
  }
  statsInfo(): string {
    if (this.isIdentified()) {
      let info = Messages.get$Object$String$ObjectArr(this, 'stats', [Messages.decimalFormat('#.##', 100 * (1 - $J.pow(Math.fround(0.825), this.soloBuffedBonus())))]);
      if (this.isEquipped(Dungeon.hero) && this.soloBuffedBonus() !== this.combinedBuffedBonus(Dungeon.hero)) {
        info += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'combined_stats', [Messages.decimalFormat('#.##', 100 * (1 - $J.pow(Math.fround(0.825), this.combinedBuffedBonus(Dungeon.hero))))]);
      }
      return info;
    } else {
      return Messages.get$Object$String$ObjectArr(this, 'typical_stats', [Messages.decimalFormat('#.##', 17.5)]);
    }
  }
  upgradeStat1(level: number): string {
    if (this.cursed && this.cursedKnown) {
      level = Math.min(-1, (level - 3) | 0);
    }
    return Messages.decimalFormat('#.##', 100 * (1 - ($J.pow(Math.fround(0.825), (level + 1) | 0)))) + '%';
  }
  buff(): Ring$RingBuff {
    return new RingOfElements$Resistance().$o(this)._RingOfElements$Resistance();
  }
  static resist(target: Char, effect: JClass): number {
    if (Ring.getBuffedBonus(target, $J.cls(RingOfElements$Resistance)) === 0) {
      return 1;
    }
    for (const $it0 = RingOfElements.RESISTS.iterator(); $it0.hasNext(); ) {
      let c = $it0.next();
      if (c.isAssignableFrom(effect)) {
        return Math.fround($J.pow(0.825, Ring.getBuffedBonus(target, $J.cls(RingOfElements$Resistance))));
      }
    }
    return 1;
  }
  static $clinit() {
    RingOfElements.RESISTS = new HashSet();
    RingOfElements.RESISTS.add($J.cls(Burning));
    RingOfElements.RESISTS.add($J.cls(Chill));
    RingOfElements.RESISTS.add($J.cls(Frost));
    RingOfElements.RESISTS.add($J.cls(Ooze));
    RingOfElements.RESISTS.add($J.cls(Paralysis));
    RingOfElements.RESISTS.add($J.cls(Poison));
    RingOfElements.RESISTS.add($J.cls(Corrosion));
    RingOfElements.RESISTS.add($J.cls(ToxicGas));
    RingOfElements.RESISTS.add($J.cls(Electricity));
    RingOfElements.RESISTS.addAll(AntiMagic.RESISTS);
  }
}

export class RingOfElements$Resistance extends Ring$RingBuff {
  _RingOfElements$Resistance(): this {
    this._Ring$RingBuff();
    return this;
  }
}

$J.define(RingOfElements, 'com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfElements', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring', ctors: { '': '_RingOfElements' }, clinit: true, lazy: ['RESISTS'] });
$J.define(RingOfElements$Resistance, 'com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfElements$Resistance', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring$RingBuff', ctors: { '': '_RingOfElements$Resistance' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Electricity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Electricity');
  ToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.ToxicGas');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Chill = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Chill');
  Corrosion = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Corrosion');
  Frost = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Frost');
  Ooze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Ooze');
  Paralysis = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Paralysis');
  Poison = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Poison');
  AntiMagic = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.AntiMagic');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
});
