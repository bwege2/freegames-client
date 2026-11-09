// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/mechanics/ShadowCaster.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Exception, JObject } from '../../../../../jre/index.ts';

let Game, BArray;

export class ShadowCaster extends JObject {
  static readonly MAX_DISTANCE: number = 20;
  static rounding: number[][] = null;
  _ShadowCaster(): this {
    return this;
  }
  static castShadow(x: number, y: number, w: number, fieldOfView: boolean[], blocking: boolean[], distance: number): void {
    if (distance >= ShadowCaster.MAX_DISTANCE) {
      distance = ShadowCaster.MAX_DISTANCE;
    }
    BArray.setFalse(fieldOfView);
    (fieldOfView[(Math.imul(y, w) + x) | 0]) = true;
    try {
      ShadowCaster.scanOctant(distance, fieldOfView, blocking, 1, x, y, w, 0, 1, +1, -1, false);
      ShadowCaster.scanOctant(distance, fieldOfView, blocking, 1, x, y, w, 0, 1, -1, +1, true);
      ShadowCaster.scanOctant(distance, fieldOfView, blocking, 1, x, y, w, 0, 1, +1, +1, true);
      ShadowCaster.scanOctant(distance, fieldOfView, blocking, 1, x, y, w, 0, 1, +1, +1, false);
      ShadowCaster.scanOctant(distance, fieldOfView, blocking, 1, x, y, w, 0, 1, -1, +1, false);
      ShadowCaster.scanOctant(distance, fieldOfView, blocking, 1, x, y, w, 0, 1, +1, -1, true);
      ShadowCaster.scanOctant(distance, fieldOfView, blocking, 1, x, y, w, 0, 1, -1, -1, true);
      ShadowCaster.scanOctant(distance, fieldOfView, blocking, 1, x, y, w, 0, 1, -1, -1, false);
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        Game.reportException(e);
        BArray.setFalse(fieldOfView);
      } else {
        throw $e0;
      }
    }
  }
  static scanOctant(distance: number, fov: boolean[], blocking: boolean[], row: number, x: number, y: number, w: number, lSlope: number, rSlope: number, mX: number, mY: number, mXY: boolean): void {
    let inBlocking = false;
    let start: number;
    let end: number;
    let col: number;
    let roundingAtDist: number[];
    if (distance === 2) {
      roundingAtDist = ShadowCaster.rounding[distance].slice();
      roundingAtDist[2] = 2;
    } else {
      roundingAtDist = ShadowCaster.rounding[distance];
    }
    for (; row <= distance; row++) {
      if (rSlope < lSlope) {
        return;
      }
      if (lSlope === 0) {
        start = 0;
      } else {
        start = $J.d2i(Math.floor((row - 0.5) * lSlope + 0.499));
      }
      if (rSlope === 1) {
        end = roundingAtDist[row];
      } else {
        end = Math.min(roundingAtDist[row], $J.d2i(Math.ceil((row + 0.5) * rSlope - 0.499)));
      }
      let cell = (x + Math.imul(y, w)) | 0;
      if (mXY) {
        cell = (cell + (Math.imul(Math.imul(mX, start), w) + Math.imul(mY, row))) | 0;
      } else {
        cell = (cell + (Math.imul(mX, start) + Math.imul(Math.imul(mY, row), w))) | 0;
      }
      for (col = start; col <= end; col++) {
        if (col === end && inBlocking && $J.d2i(Math.ceil((row - 0.5) * rSlope - 0.499)) !== end) {
          break;
        }
        fov[cell] = true;
        if (blocking[cell]) {
          if (!inBlocking) {
            inBlocking = true;
            if (col !== start) {
              ShadowCaster.scanOctant(distance, fov, blocking, (row + 1) | 0, x, y, w, lSlope, (col - 0.5) / (row + 0.5), mX, mY, mXY);
            }
          }
        } else {
          if (inBlocking) {
            inBlocking = false;
            lSlope = (col - 0.5) / (row - 0.5);
          }
        }
        if (!mXY) {
          cell = (cell + mX) | 0;
        } else {
          cell = (cell + Math.imul(mX, w)) | 0;
        }
      }
      if (inBlocking) {
        return;
      }
    }
  }
  static $clinit() {
    ShadowCaster.rounding = $J.newArray((ShadowCaster.MAX_DISTANCE + 1) | 0, null);
    for (let i = 1; i <= ShadowCaster.MAX_DISTANCE; i++) {
      ShadowCaster.rounding[i] = $J.newArray((i + 1) | 0, 0);
      for (let j = 1; j <= i; j++) {
        ShadowCaster.rounding[i][j] = $J.l2i($J.lmin(BigInt(j), $J.lround(i * (Math.cos(Math.asin(j / (i + 0.5)))))));
      }
    }
  }
}

$J.define(ShadowCaster, 'com.shatteredpixel.shatteredpixeldungeon.mechanics.ShadowCaster', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_ShadowCaster' }, clinit: true, lazy: ['rounding'] });
$J.module(() => {
  Game = $J.load('com.watabou.noosa.Game');
  BArray = $J.load('com.watabou.utils.BArray');
});
