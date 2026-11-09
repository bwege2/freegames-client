// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/utils/GameMath.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../jre/index.ts';

let Game;

export class GameMath extends JObject {
  _GameMath(): this {
    return this;
  }
  static speed(speed: number, acc: number): number {
    if (acc !== Math.fround(0)) {
      speed = Math.fround(speed + Math.fround(acc * Game.elapsed));
    }
    return speed;
  }
  static gate(min: number, value: number, max: number): number {
    if (value < min) {
      return min;
    } else if (value > max) {
      return max;
    } else {
      return value;
    }
  }
}

$J.define(GameMath, 'com.watabou.utils.GameMath', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_GameMath' } });
$J.module(() => {
  Game = $J.load('com.watabou.noosa.Game');
});
