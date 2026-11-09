// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/utils/BArray.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class BArray extends JObject {
  static falseArray: boolean[] = null;
  _BArray(): this {
    return this;
  }
  static setFalse(toBeFalse: boolean[]): void {
    if (BArray.falseArray == null || BArray.falseArray.length < toBeFalse.length) {
      BArray.falseArray = $J.newArray(toBeFalse.length, false);
    }
    $J.system_arraycopy(BArray.falseArray, 0, toBeFalse, 0, toBeFalse.length);
  }
  static and(a: boolean[], b: boolean[], result: boolean[]): boolean[] {
    let length = a.length;
    if (result == null) {
      result = $J.newArray(length, false);
    }
    for (let i = 0; i < length; i++) {
      result[i] = a[i] && b[i];
    }
    return result;
  }
  static or$booleanArr$booleanArr$booleanArr(a: boolean[], b: boolean[], result: boolean[]): boolean[] {
    return BArray.or$booleanArr$booleanArr$int$int$booleanArr(a, b, 0, a.length, result);
  }
  static or$booleanArr$booleanArr$int$int$booleanArr(a: boolean[], b: boolean[], offset: number, length: number, result: boolean[]): boolean[] {
    if (result == null) {
      result = $J.newArray(length, false);
    }
    for (let i = offset; i < ((offset + length) | 0); i++) {
      result[i] = a[i] || b[i];
    }
    return result;
  }
  static not(a: boolean[], result: boolean[]): boolean[] {
    let length = a.length;
    if (result == null) {
      result = $J.newArray(length, false);
    }
    for (let i = 0; i < length; i++) {
      result[i] = !a[i];
    }
    return result;
  }
  static is(a: number[], result: boolean[], v1: number): boolean[] {
    let length = a.length;
    if (result == null) {
      result = $J.newArray(length, false);
    }
    for (let i = 0; i < length; i++) {
      result[i] = a[i] === v1;
    }
    return result;
  }
  static isOneOf(a: number[], result: boolean[], v: number[]): boolean[] {
    let length = a.length;
    let nv = v.length;
    if (result == null) {
      result = $J.newArray(length, false);
    }
    for (let i = 0; i < length; i++) {
      result[i] = false;
      for (let j = 0; j < nv; j++) {
        if (a[i] === v[j]) {
          result[i] = true;
          break;
        }
      }
    }
    return result;
  }
  static isNot(a: number[], result: boolean[], v1: number): boolean[] {
    let length = a.length;
    if (result == null) {
      result = $J.newArray(length, false);
    }
    for (let i = 0; i < length; i++) {
      result[i] = a[i] !== v1;
    }
    return result;
  }
  static isNotOneOf(a: number[], result: boolean[], v: number[]): boolean[] {
    let length = a.length;
    let nv = v.length;
    if (result == null) {
      result = $J.newArray(length, false);
    }
    for (let i = 0; i < length; i++) {
      result[i] = true;
      for (let j = 0; j < nv; j++) {
        if (a[i] === v[j]) {
          result[i] = false;
          break;
        }
      }
    }
    return result;
  }
}

$J.define(BArray, 'com.watabou.utils.BArray', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_BArray' }, meths: { 'or(boolean[],boolean[],int,int,boolean[])': 'or$booleanArr$booleanArr$int$int$booleanArr', 'or(boolean[],boolean[],boolean[])': 'or$booleanArr$booleanArr$booleanArr' } });
