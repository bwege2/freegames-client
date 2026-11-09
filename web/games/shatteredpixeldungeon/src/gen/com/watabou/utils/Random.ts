// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/utils/Random.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayDeque, Collections, JObject, Random as Random$lib, RuntimeException } from '../../../../jre/index.ts';

let Game;

export class Random extends JObject {
  static generators: ArrayDeque<Random> = null;
  static oracle: boolean = false;
  static oracleNext: bigint = 0n;
  _Random(): this {
    return this;
  }
  static resetGenerators(): void {
    Random.generators = new ArrayDeque();
    Random.generators.push(Random.unseeded());
  }
  static pushGenerator$(): void {
    Random.generators.push(Random.unseeded());
  }
  static unseeded(): Random {
    return Random.oracle ? new Random$lib(BigInt.asIntN(64, (Random.oracleNext = BigInt.asIntN(64, Random.oracleNext + 1n)) - 1n)) : new Random$lib();
  }
  static oracleLong(): bigint {
    return BigInt.asIntN(64, (Random.oracleNext = BigInt.asIntN(64, Random.oracleNext + 1n)) - 1n);
  }
  static pushGenerator$long(seed: bigint): void {
    Random.generators.push(new Random$lib(Random.scrambleSeed(seed)));
  }
  static scrambleSeed(seed: bigint): bigint {
    seed = seed ^ $J.lushr(seed, 32);
    seed = BigInt.asIntN(64, seed * -4710160504952957587n);
    seed = seed ^ $J.lushr(seed, 29);
    seed = BigInt.asIntN(64, seed * -4710160504952957587n);
    seed = seed ^ $J.lushr(seed, 32);
    seed = BigInt.asIntN(64, seed * -4710160504952957587n);
    seed = seed ^ $J.lushr(seed, 29);
    return seed;
  }
  static popGenerator(): void {
    if (Random.generators.size() === 1) {
      Game.reportException(new RuntimeException('tried to pop the last random number generator!'));
    } else {
      Random.generators.pop();
    }
  }
  static Float$(): number {
    return Random.Float$boolean(true);
  }
  static Float$boolean(useGeneratorStack: boolean): number {
    if (useGeneratorStack) {
      return Random.generators.peekFirst().nextFloat();
    } else {
      return Random.generators.peekLast().nextFloat();
    }
  }
  static Float$float(max: number): number {
    return Math.fround(Random.Float$() * max);
  }
  static Float$float$float(min: number, max: number): number {
    return Math.fround(min + Random.Float$float(Math.fround(max - min)));
  }
  static NormalFloat(min: number, max: number): number {
    return Math.fround(min + (Math.fround((Math.fround(Random.Float$float(Math.fround(max - min)) + Random.Float$float(Math.fround(max - min)))) / 2)));
  }
  static Int$(): number {
    return Random.Int$boolean(true);
  }
  static Int$boolean(useGeneratorStack: boolean): number {
    if (useGeneratorStack) {
      return Random.generators.peekFirst().nextInt();
    } else {
      return Random.generators.peekLast().nextInt();
    }
  }
  static Int$int(max: number): number {
    return Random.Int$int$boolean(max, true);
  }
  static Int$int$boolean(max: number, useGeneratorStack: boolean): number {
    if (max <= 0) {
      return 0;
    } else if (useGeneratorStack) {
      return Random.generators.peekFirst().nextInt(max);
    } else {
      return Random.generators.peekLast().nextInt(max);
    }
  }
  static Int$int$int(min: number, max: number): number {
    return (min + (Random.Int$int((max - min) | 0))) | 0;
  }
  static IntRange(min: number, max: number): number {
    return (min + (Random.Int$int((max - min + 1) | 0))) | 0;
  }
  static NormalIntRange(min: number, max: number): number {
    return (min + $J.d2i((Math.fround(Math.fround((Math.fround(Random.Float$() + Random.Float$())) * ((max - min + 1) | 0)) / 2)))) | 0;
  }
  static InvNormalIntRange(min: number, max: number): number {
    let roll1 = Random.Float$();
    let roll2 = Random.Float$();
    if (Math.fround(Math.abs(Math.fround(roll1 - 0.5))) >= Math.fround(Math.abs(Math.fround(roll2 - 0.5)))) {
      return (min + $J.d2i((Math.fround(roll1 * ((max - min + 1) | 0))))) | 0;
    } else {
      return (min + $J.d2i((Math.fround(roll2 * ((max - min + 1) | 0))))) | 0;
    }
  }
  static Long$(): bigint {
    return Random.Long$boolean(true);
  }
  static Long$boolean(useGeneratorStack: boolean): bigint {
    if (useGeneratorStack) {
      return Random.generators.peekFirst().nextLong();
    } else {
      return Random.generators.peekLast().nextLong();
    }
  }
  static Long$long(max: bigint): bigint {
    let result = Random.Long$();
    if (result < 0n) {
      result = BigInt.asIntN(64, result + 9223372036854775807n);
    }
    return $J.lrem(result, max);
  }
  static chances$floatArr(chances: number[]): number {
    let length = chances.length;
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum = Math.fround(sum + Math.max(0, chances[i]));
    }
    if (sum <= Math.fround(0)) {
      return -1;
    }
    let value = Random.Float$float(sum);
    sum = 0;
    for (let i = 0; i < length; i++) {
      sum = Math.fround(sum + Math.max(0, chances[i]));
      if (value < sum) {
        return i;
      }
    }
    return -1;
  }
  static chances$HashMap<K>(chances: HashMap<K, number>): K {
    let size = chances.size();
    let values = chances.keySet().toArray();
    let probs = $J.newArray(size, 0);
    let sum = 0;
    for (let i = 0; i < size; i++) {
      probs[i] = +$J.boxF(chances.get(values[i]));
      sum = Math.fround(sum + probs[i]);
    }
    if (sum <= Math.fround(0)) {
      return null;
    }
    let value = Random.Float$float(sum);
    sum = probs[0];
    for (let i = 0; i < size; i++) {
      if (value < sum) {
        return values[i];
      }
      sum = Math.fround(sum + (probs[(i + 1) | 0]));
    }
    return null;
  }
  static index(collection: Collection<any>): number {
    return Random.Int$int(collection.size());
  }
  static oneOf<T>(array: T[]): T {
    return array[Random.Int$int(array.length)];
  }
  static element$ObjectArr<T>(array: T[]): T {
    return Random.element$ObjectArr$int(array, array.length);
  }
  static element$ObjectArr$int<T>(array: T[], max: number): T {
    return array[Random.Int$int(max)];
  }
  static element$Collection<T>(collection: Collection<T>): T {
    let size = collection.size();
    return size > 0 ? collection.toArray()[Random.Int$int(size)] : null;
  }
  static shuffle$List<T>(list: List<T>): void {
    Collections.shuffle(list, Random.generators.peek());
  }
  static shuffle$intArr(array: number[]): void {
    for (let i = 0; i < ((array.length - 1) | 0); i++) {
      let j = Random.Int$int$int(i, array.length);
      if (j !== i) {
        let t = array[i];
        array[i] = array[j];
        array[j] = t;
      }
    }
  }
  static shuffle$ObjectArr<T>(array: T[]): void {
    for (let i = 0; i < ((array.length - 1) | 0); i++) {
      let j = Random.Int$int$int(i, array.length);
      if (j !== i) {
        let t = array[i];
        array[i] = array[j];
        array[j] = t;
      }
    }
  }
  static shuffle$ObjectArr$ObjectArr<U, V>(u: U[], v: V[]): void {
    for (let i = 0; i < ((u.length - 1) | 0); i++) {
      let j = Random.Int$int$int(i, u.length);
      if (j !== i) {
        let ut = u[i];
        u[i] = u[j];
        u[j] = ut;
        let vt = v[i];
        v[i] = v[j];
        v[j] = vt;
      }
    }
  }
  static $clinit() {
    Random.resetGenerators();
    Random.oracle = false;
    Random.oracleNext = 0n;
  }
}

$J.define(Random, 'com.watabou.utils.Random', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Random' }, meths: { 'shuffle(java.lang.Object[],java.lang.Object[])': 'shuffle$ObjectArr$ObjectArr', 'shuffle(java.lang.Object[])': 'shuffle$ObjectArr', 'shuffle(int[])': 'shuffle$intArr', 'shuffle(java.util.List)': 'shuffle$List', 'element(java.util.Collection)': 'element$Collection', 'element(java.lang.Object[],int)': 'element$ObjectArr$int', 'element(java.lang.Object[])': 'element$ObjectArr', 'chances(java.util.HashMap)': 'chances$HashMap', 'chances(float[])': 'chances$floatArr', 'Long(long)': 'Long$long', 'Long(boolean)': 'Long$boolean', 'Long()': 'Long$', 'Int(int,int)': 'Int$int$int', 'Int(int,boolean)': 'Int$int$boolean', 'Int(int)': 'Int$int', 'Int(boolean)': 'Int$boolean', 'Int()': 'Int$', 'Float(float,float)': 'Float$float$float', 'Float(float)': 'Float$float', 'Float(boolean)': 'Float$boolean', 'Float()': 'Float$', 'pushGenerator(long)': 'pushGenerator$long', 'pushGenerator()': 'pushGenerator$' }, clinit: true, lazy: ['generators', 'oracle', 'oracleNext'] });
$J.module(() => {
  Game = $J.load('com.watabou.noosa.Game');
});
