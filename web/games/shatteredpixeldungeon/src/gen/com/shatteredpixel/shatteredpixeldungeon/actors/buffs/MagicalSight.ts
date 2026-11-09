// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/buffs/MagicalSight.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Blindness, Buff, Buff$buffType, GameScene, BuffIndicator;

export class MagicalSight extends FlavourBuff {
  static readonly DURATION: number = 50;
  static readonly DISTANCE: number = 12;
  _MagicalSight(): this {
    this._FlavourBuff();
    this.type_ = Buff$buffType.POSITIVE;
    this.immunities_.add($J.cls(Blindness));
    return this;
  }
  icon(): number {
    return BuffIndicator.MIND_VISION;
  }
  tintIcon(icon: Image): void {
    icon.hardlight$float$float$float(1, Math.fround(1.67), 1);
  }
  iconFadePercent(): number {
    return Math.max(0, Math.fround((Math.fround(MagicalSight.DURATION - this.visualcooldown())) / MagicalSight.DURATION));
  }
  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      Buff.detach(target, $J.cls(Blindness));
      return true;
    }
    return false;
  }
  detach(): void {
    super.detach();
    Dungeon.observe$();
    GameScene.updateFog$();
  }
}

$J.define(MagicalSight, 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicalSight', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_MagicalSight' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
});
