// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/utils/DungeonSeed.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, JObject, JString, Locale, NumberFormatException, StringBuilder } from '../../../../../jre/index.ts';

let Random;

export class DungeonSeed extends JObject {
  static TOTAL_SEEDS: bigint = 0n;
  _DungeonSeed(): this {
    return this;
  }
  static randomSeed(): bigint {
    let seed: bigint;
    let seedText: string;
    do {
      seed = Random.Long$long(DungeonSeed.TOTAL_SEEDS);
      seedText = DungeonSeed.convertToCode(seed);
    } while (seedText.includes('A') || seedText.includes('E') || seedText.includes('I') || seedText.includes('O') || seedText.includes('U'));
    return seed;
  }
  static convertFromCode(code: string): bigint {
    if (code.length === 11 && code.charCodeAt(3) === 45 /* '-' */ && code.charCodeAt(7) === 45 /* '-' */) {
      code = code.toUpperCase();
    }
    code = JString.replaceAll(code, '[-\\s]', '');
    if (code.length !== 9) {
      throw new IllegalArgumentException('codes must be 9 A-Z characters.');
    }
    let result = 0n;
    for (let i = 8; i >= 0; i--) {
      let c = code.charCodeAt(i);
      if (c > 90 /* 'Z' */ || c < 65 /* 'A' */) {
        throw new IllegalArgumentException('codes must be 9 A-Z characters.');
      }
      result = $J.d2l(Number(result) + ((c - 65) | 0) * $J.pow(26, ((8 - i) | 0)));
    }
    return result;
  }
  static convertToCode(seed: bigint): string {
    if (seed < 0n || seed >= DungeonSeed.TOTAL_SEEDS) {
      throw new IllegalArgumentException('seeds must be within the range [0, TOTAL_SEEDS)');
    }
    let interrim = (seed).toString(26);
    let result = new StringBuilder();
    for (let i = 0; i < 9; i++) {
      if (i < interrim.length) {
        let c = interrim.charCodeAt(i);
        if (c <= 57 /* '9' */) {
          c = ((c + 17) | 0) & 0xffff;
        } else {
          c = ((c - 22) | 0) & 0xffff;
        }
        result.append(String.fromCharCode(c));
      } else {
        result.insert(0, String.fromCharCode(65 /* 'A' */));
      }
    }
    result.insert(3, String.fromCharCode(45 /* '-' */));
    result.insert(7, String.fromCharCode(45 /* '-' */));
    return result.toString();
  }
  static convertFromText(inputText: string): bigint {
    if ((inputText.length === 0)) {
      return -1n;
    }
    try {
      return DungeonSeed.convertFromCode(inputText);
    } catch ($e0) {
      if ($J.isa($e0, IllegalArgumentException)) {
        let e = $J.exc($e0);
      } else {
        throw $e0;
      }
    }
    try {
      return $J.lrem($J.parseLong(JString.replaceAll(inputText, '\\s', '')), DungeonSeed.TOTAL_SEEDS);
    } catch ($e1) {
      if ($J.isa($e1, NumberFormatException)) {
        let e = $J.exc($e1);
      } else {
        throw $e1;
      }
    }
    let total = 0n;
    for (let c of JString.toCharArray(inputText)) {
      total = BigInt.asIntN(64, BigInt.asIntN(64, 31n * total) + BigInt(c));
    }
    if (total < 0n) {
      total = BigInt.asIntN(64, total + 9223372036854775807n);
    }
    total = $J.lrem(total, DungeonSeed.TOTAL_SEEDS);
    return total;
  }
  static formatText(inputText: string): string {
    try {
      return DungeonSeed.convertToCode(DungeonSeed.convertFromCode(inputText));
    } catch ($e2) {
      if ($J.isa($e2, IllegalArgumentException)) {
        let e = $J.exc($e2);
        return inputText;
      } else {
        throw $e2;
      }
    }
  }
  static $clinit() {
    DungeonSeed.TOTAL_SEEDS = 5429503678976n;
  }
}

$J.define(DungeonSeed, 'com.shatteredpixel.shatteredpixeldungeon.utils.DungeonSeed', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_DungeonSeed' }, clinit: true, lazy: ['TOTAL_SEEDS'] });
$J.module(() => {
  Random = $J.load('com.watabou.utils.Random');
});
