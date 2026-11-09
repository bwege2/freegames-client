// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/utils/SparseArray.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Arrays, IntMap } from '../../../../jre/index.ts';

export class SparseArray<T> extends IntMap {
  _SparseArray(): this {
    this._IntMap();
    return this;
  }
  put(key: number, value: T): T {
    return super.put(key, value);
  }
  get(key: number, defaultValue: T): T {
    return super.get(key, defaultValue);
  }
  remove(key: number): T {
    return super.remove(key);
  }
  keyArray(): number[] {
    return this.keys().toArray().toArray();
  }
  valueList(): List<T> {
    return Arrays.asList(...this.values().toArray().toArray$());
  }
}

$J.define(SparseArray, 'com.watabou.utils.SparseArray', { kind: 'class', sup: 'com.badlogic.gdx.utils.IntMap', ctors: { '': '_SparseArray' } });
