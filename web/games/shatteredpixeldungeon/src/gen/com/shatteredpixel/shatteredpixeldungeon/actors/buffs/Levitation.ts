// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/Levitation.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Buff, Buff$buffType, Roots, TimekeepersHourglass$timeFreeze, Swiftthistle$TimeBubble, GameScene, CharSprite$State, BuffIndicator, Game;

export class Levitation extends FlavourBuff {
  static readonly DURATION: number = 20;
  _Levitation(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    return this;
  }
  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      target.flying = true;
      Buff.detach(target, $J.cls(Roots));
      return true;
    } else {
      return false;
    }
  }
  detach(): void {
    this.target.flying = false;
    super.detach();
    if (Game.scene() instanceof GameScene) {
      Dungeon.level.occupyCell(this.target);
    }
  }
  detachesWithinDelay(delay: number): boolean {
    if (this.target.buff($J.cls(Swiftthistle$TimeBubble)) != null) {
      return false;
    }
    if (this.target.buff($J.cls(TimekeepersHourglass$timeFreeze)) != null) {
      return false;
    }
    return this.cooldown() < delay;
  }
  icon(): number {
    return BuffIndicator.LEVITATION;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, Math.fround(2.1), 2.5);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(Levitation.DURATION - this.visualcooldown())) / Levitation.DURATION));
  }
  fx(on: boolean): void {
    if (on) {
      this.target.sprite_.add(CharSprite$State.LEVITATING);
    } else {
      this.target.sprite_.remove$State(CharSprite$State.LEVITATING);
    }
  }
}

$J.define(Levitation, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Levitation', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_Levitation' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  Roots = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Roots');
  TimekeepersHourglass$timeFreeze = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TimekeepersHourglass$timeFreeze');
  Swiftthistle$TimeBubble = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Swiftthistle$TimeBubble');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  Game = $J.load('com.watabou.noosa.Game');
});
