// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Charm.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Char, Char$Alignment, Buff$buffType, BuffIndicator;

export class Charm extends FlavourBuff {
  object: number = 0;
  ignoreHeroAllies: boolean = false;
  static readonly DURATION: number = 10;
  static readonly OBJECT: string = 'object';
  static readonly IGNORE_ALLIES: string = 'ignore_allies';
  ignoreNextHit: boolean = false;
  _Charm(): this {
    this._FlavourBuff();
    this.object = 0;
    this.ignoreHeroAllies = false;
    this.type_ = Buff$buffType.NEGATIVE;
    this.announced = true;
    this.ignoreNextHit = false;
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Charm.OBJECT, this.object);
    bundle.put$String$boolean(Charm.IGNORE_ALLIES, this.ignoreHeroAllies);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.object = bundle.getInt(Charm.OBJECT);
    this.ignoreHeroAllies = bundle.getBoolean(Charm.IGNORE_ALLIES);
  }
  icon(): number {
    return BuffIndicator.HEART;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(Charm.DURATION - this.visualcooldown())) / Charm.DURATION));
  }
  recover(src: any): void {
    if (this.ignoreHeroAllies && src instanceof Char) {
      if (src !== Dungeon.hero && (src).alignment === Char$Alignment.ALLY) {
        return;
      }
    }
    if (this.ignoreNextHit) {
      this.ignoreNextHit = false;
      return;
    }
    this.spend(Math.fround(-5));
    if (this.cooldown() <= Math.fround(0)) {
      this.detach();
    }
  }
}

$J.define(Charm, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Charm', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Charm' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
