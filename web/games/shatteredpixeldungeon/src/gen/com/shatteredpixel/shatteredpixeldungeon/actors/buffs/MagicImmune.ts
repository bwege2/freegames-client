// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/MagicImmune.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { FlavourBuff } from './FlavourBuff.ts';

let Buff$buffType, Hero, AntiMagic, BuffIndicator;

export class MagicImmune extends FlavourBuff {
  static readonly DURATION: number = 20;
  _MagicImmune(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    this.announced = true;
    this.immunities_.addAll(AntiMagic.RESISTS);
    return this;
  }
  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      for (const $it0 = target.buffs$().iterator(); $it0.hasNext(); ) {
        let b = $it0.next();
        for (const $it1 = this.immunities_.iterator(); $it1.hasNext(); ) {
          let immunity = $it1.next();
          if (b.getClass().isAssignableFrom(immunity)) {
            b.detach();
            break;
          }
        }
      }
      if (target instanceof Hero) {
        (target).updateHT(false);
      }
      return true;
    } else {
      return false;
    }
  }
  detach(): void {
    super.detach();
    if (this.target instanceof Hero) {
      (this.target).updateHT(false);
    }
  }
  icon(): number {
    return BuffIndicator.COMBO;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(0, 1, 0);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(MagicImmune.DURATION - this.visualcooldown())) / MagicImmune.DURATION));
  }
}

$J.define(MagicImmune, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_MagicImmune' } });
$J.module(() => {
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  AntiMagic = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.AntiMagic');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
