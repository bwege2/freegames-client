// @ts-nocheck
// MathUtils.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*******************************************************************************
 * Copyright 2011 See AUTHORS file.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
import { $J, JObject } from '../../../../../jre/index.ts';

let RandomXS128;

/**
 * Utility and fast math functions.
 * <p>
 * Thanks to Riven on JavaGaming.org for the basis of sin/cos/floor/ceil.
 * @author Nathan Sweet
 */
export class MathUtils extends JObject {
  static readonly nanoToSec: number = Math.fround(1E-9);
  static readonly FLOAT_ROUNDING_ERROR: number = Math.fround(1E-6);
  static readonly PI: number = Math.fround(3.1415927);
  static readonly PI2: number = Math.fround(6.2831855);
  static readonly HALF_PI: number = Math.fround(1.5707964);
  static readonly E: number = Math.fround(2.7182817);
  static readonly SIN_BITS: number = 14;
  static readonly SIN_MASK: number = 16383;
  static readonly SIN_COUNT: number = 16384;
  static readonly radFull: number = Math.fround(6.2831855);
  static readonly degFull: number = 360;
  static readonly radToIndex: number = Math.fround(2607.5945);
  static readonly degToIndex: number = Math.fround(45.511112);
  /**
   * multiply by this to convert from radians to degrees
   */
  static readonly radiansToDegrees: number = Math.fround(57.295776);
  static readonly radDeg: number = Math.fround(57.295776);
  /**
   * multiply by this to convert from degrees to radians
   */
  static readonly degreesToRadians: number = Math.fround(0.017453292);
  static readonly degRad: number = Math.fround(0.017453292);
  static random: Random = null;
  static readonly BIG_ENOUGH_INT: number = 16384;
  static readonly BIG_ENOUGH_FLOOR: number = 16384;
  static readonly CEIL: number = 0.9999999;
  static readonly BIG_ENOUGH_CEIL: number = 16384.999999999996;
  static readonly BIG_ENOUGH_ROUND: number = 16384.5;
  /**
   * Returns the next power of two. Returns the specified value if the value is already a power of two.
   */
  static nextPowerOfTwo(value: number): number {
    if (value === 0) {
      return 1;
    }
    value--;
    value |= value >> 1;
    value |= value >> 2;
    value |= value >> 4;
    value |= value >> 8;
    value |= value >> 16;
    return (value + 1) | 0;
  }
  static $clinit() {
    MathUtils.random = new RandomXS128()._RandomXS128$();
  }
}

$J.define(MathUtils, 'com.badlogic.gdx.math.MathUtils', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_MathUtils' }, meths: { 'isEqual(float,float,float)': 'isEqual$float$float$float', 'isEqual(float,float)': 'isEqual$float$float', 'isZero(float,float)': 'isZero$float$float', 'isZero(float)': 'isZero$float', 'clamp(double,double,double)': 'clamp$double$double$double', 'clamp(float,float,float)': 'clamp$float$float$float', 'clamp(long,long,long)': 'clamp$long$long$long', 'clamp(int,int,int)': 'clamp$int$int$int', 'clamp(short,short,short)': 'clamp$short$short$short', 'randomTriangular(float,float,float)': 'randomTriangular$float$float$float', 'randomTriangular(float,float)': 'randomTriangular$float$float', 'randomTriangular(float)': 'randomTriangular$float', 'randomTriangular()': 'randomTriangular$', 'random(float,float)': 'random$float$float', 'random(float)': 'random$float', 'random()': 'random$', 'randomBoolean(float)': 'randomBoolean$float', 'randomBoolean()': 'randomBoolean$', 'random(long,long)': 'random$long$long', 'random(long)': 'random$long', 'random(int,int)': 'random$int$int', 'random(int)': 'random$int' }, clinit: true, lazy: ['random'] });
$J.module(() => {
  RandomXS128 = $J.load('com.badlogic.gdx.math.RandomXS128');
});
