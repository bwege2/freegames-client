// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/Patch.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../jre/index.ts';

let Random;

export class Patch extends JObject {
  _Patch(): this {
    return this;
  }
  static generate(w: number, h: number, fill: number, clustering: number, forceFillRate: boolean): boolean[] {
    let length = Math.imul(w, h);
    let cur = $J.newArray(length, false);
    let off = $J.newArray(length, false);
    let fillDiff = -$J.roundf(Math.fround(length * fill));
    if (forceFillRate && clustering > 0) {
      fill = Math.fround(fill + Math.fround((Math.fround(0.5 - fill)) * 0.5));
    }
    for (let i = 0; i < length; i++) {
      off[i] = Random.Float$() < fill;
      if (off[i]) {
        fillDiff++;
      }
    }
    for (let i = 0; i < clustering; i++) {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let pos = (x + Math.imul(y, w)) | 0;
          let count = 0;
          let neighbours = 0;
          if (y > 0) {
            if (x > 0) {
              if (off[(pos - w - 1) | 0]) {
                count++;
              }
              neighbours++;
            }
            if (off[(pos - w) | 0]) {
              count++;
            }
            neighbours++;
            if (x < ((w - 1) | 0)) {
              if (off[(pos - w + 1) | 0]) {
                count++;
              }
              neighbours++;
            }
          }
          if (x > 0) {
            if (off[(pos - 1) | 0]) {
              count++;
            }
            neighbours++;
          }
          if (off[pos]) {
            count++;
          }
          neighbours++;
          if (x < ((w - 1) | 0)) {
            if (off[(pos + 1) | 0]) {
              count++;
            }
            neighbours++;
          }
          if (y < ((h - 1) | 0)) {
            if (x > 0) {
              if (off[(pos + w - 1) | 0]) {
                count++;
              }
              neighbours++;
            }
            if (off[(pos + w) | 0]) {
              count++;
            }
            neighbours++;
            if (x < ((w - 1) | 0)) {
              if (off[(pos + w + 1) | 0]) {
                count++;
              }
              neighbours++;
            }
          }
          cur[pos] = Math.imul(2, count) >= neighbours;
          if (cur[pos] !== off[pos]) {
            fillDiff = (fillDiff + (cur[pos] ? +1 : -1)) | 0;
          }
        }
      }
      let tmp = cur;
      cur = off;
      off = tmp;
    }
    if (forceFillRate && Math.min(w, h) > 2) {
      let neighbours = [(-w - 1) | 0, -w, (-w + 1) | 0, -1, 0, +1, (+w - 1) | 0, +w, (+w + 1) | 0];
      let growing = fillDiff < 0;
      while (fillDiff !== 0) {
        let cell: number;
        let tries = 0;
        do {
          cell = ((Random.Int$int$int(1, (w - 1) | 0)) + Math.imul(Random.Int$int$int(1, (h - 1) | 0), w)) | 0;
          tries++;
        } while (off[cell] !== growing && Math.imul(tries, 10) < length);
        for (let i of neighbours) {
          if (fillDiff !== 0 && (off[(cell + i) | 0]) !== growing) {
            (off[(cell + i) | 0]) = growing;
            fillDiff = (fillDiff + (growing ? +1 : -1)) | 0;
          }
        }
      }
    }
    return off;
  }
}

$J.define(Patch, 'com.shatteredpixel.shatteredpixeldungeon.levels.Patch', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Patch' } });
$J.module(() => {
  Random = $J.load('com.watabou.utils.Random');
});
