// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Light.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Buff$buffType, CharSprite$State, BuffIndicator;

export class Light extends FlavourBuff {
  static readonly DURATION: number = 250;
  static readonly DISTANCE: number = 6;
  _Light(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      if (Dungeon.level != null) {
        target.viewDistance = Math.max(Dungeon.level.viewDistance, Light.DISTANCE);
        Dungeon.observe$();
      }
      return true;
    } else {
      return false;
    }
  }
  detach(): void {
    this.target.viewDistance = Dungeon.level.viewDistance;
    Dungeon.observe$();
    super.detach();
  }
  weaken(amount: number): void {
    this.spend(Math.fround(-amount));
  }
  icon(): number {
    return BuffIndicator.LIGHT;
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(Light.DURATION - this.visualcooldown())) / Light.DURATION));
  }
  fx(on: boolean): void {
    if (on) {
      this.target.sprite_.add(CharSprite$State.ILLUMINATED);
    } else {
      this.target.sprite_.remove$State(CharSprite$State.ILLUMINATED);
    }
  }
}

$J.define(Light, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Light', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Light' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
