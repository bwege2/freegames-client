// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/FrostImbue.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Buff, Buff$buffType, Chill, Frost, SnowParticle, BuffIndicator;

export class FrostImbue extends FlavourBuff {
  static readonly DURATION: number = 50;
  _FrostImbue(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    this.announced = true;
    this.immunities_.add($J.cls(Frost));
    this.immunities_.add($J.cls(Chill));
    return this;
  }
  proc(enemy: Char): void {
    Buff.affect$Char$Class$float(enemy, $J.cls(Chill), 3);
    enemy.sprite_.emitter().burst(SnowParticle.FACTORY, 3);
  }
  icon(): number {
    return BuffIndicator.IMBUE;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(0, 2, 3);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(FrostImbue.DURATION - this.visualcooldown())) / FrostImbue.DURATION));
  }
  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      Buff.detach(target, $J.cls(Frost));
      Buff.detach(target, $J.cls(Chill));
      return true;
    } else {
      return false;
    }
  }
}

$J.define(FrostImbue, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FrostImbue', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_FrostImbue' } });
$J.module(() => {
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Chill = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Chill');
  Frost = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Frost');
  SnowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SnowParticle');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
