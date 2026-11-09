// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/tiles/custom/Carpet.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { CustomTilemap } from '../CustomTilemap.ts';

let Assets$Environment, Dungeon, Messages, SparseArray;

export class Carpet extends CustomTilemap {
  tileOverrides: SparseArray<number> = null;
  static readonly SKIP: number = -1;
  static readonly CITY_STATUE: number = 80;
  static readonly CITY_PEDESTAL: number = 81;
  static readonly CITY_ENTRANCE: number = 82;
  static readonly CITY_STATUE_TR: number = 83;
  static readonly CITY_STATUE_BR: number = 84;
  static readonly CITY_STATUE_TL: number = 85;
  static readonly CITY_STATUE_BL: number = 86;
  static readonly CITY_PEDESTAL_TR: number = 87;
  static readonly CITY_PEDESTAL_TL: number = 88;
  static readonly OVERRIDES_KEYS: string = 'overrides_keys';
  static readonly OVERRIDES_VALUES: string = 'overrides_values';
  _Carpet(): this {
    this._CustomTilemap();
    this.texture_ = Assets$Environment.CARPET;
    this.tileOverrides = new SparseArray()._SparseArray();
    return this;
  }
  overrideTile$int$int$int(x: number, y: number, override: number): void {
    this.tileOverrides.put((x + Math.imul(this.tileW, y)) | 0, override);
  }
  overrideTile$Level$int$int$int(level: Level, x: number, y: number, override: number): void {
    x = (x - this.tileX) | 0;
    y = (y - this.tileY) | 0;
    this.tileOverrides.put((x + Math.imul(this.tileW, y)) | 0, override);
  }
  overrideTile$int$Level$int(tile: number, level: Level, override: number): void {
    let x = (tile % level.width() - this.tileX) | 0;
    let y = ($J.idiv(tile, level.width()) - this.tileY) | 0;
    this.tileOverrides.put((x + Math.imul(this.tileW, y)) | 0, override);
  }
  create(): Tilemap {
    let v = super.create();
    let data = $J.newArray(Math.imul(this.tileW, this.tileH), 0);
    let regionOfs = Math.imul(16, ($J.idiv(((Dungeon.depth - 1) | 0), 5)));
    let i = 0;
    for (let y = 0; y < this.tileH; y++) {
      for (let x = 0; x < this.tileW; x++) {
        if (this.tileOverrides.containsKey(i)) {
          data[i] = this.tileOverrides.get(i);
        } else {
          data[i] = regionOfs;
          if (y === 0) {
            data[i] = (data[i] + 1) | 0;
          }
          if (x === ((this.tileW - 1) | 0)) {
            data[i] = (data[i] + 2) | 0;
          }
          if (y === ((this.tileH - 1) | 0)) {
            data[i] = (data[i] + 4) | 0;
          }
          if (x === 0) {
            data[i] = (data[i] + 8) | 0;
          }
        }
        i++;
      }
    }
    v.map(data, this.tileW);
    return v;
  }
  name(tileX: number, tileY: number): string {
    let cell = (tileX + Math.imul(this.tileW, tileY)) | 0;
    if (this.tileOverrides.containsKey(cell)) {
      return null;
    }
    return Messages.get$Object$String$ObjectArr(this, 'name', []);
  }
  desc(tileX: number, tileY: number): string {
    let cell = (tileX + Math.imul(this.tileW, tileY)) | 0;
    if (this.tileOverrides.containsKey(cell)) {
      return null;
    }
    return Messages.get$Object$String$ObjectArr(this, 'desc', []);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    let keys = this.tileOverrides.keyArray();
    let values = $J.newArray(keys.length, 0);
    for (let i = 0; i < keys.length; i++) {
      values[i] = this.tileOverrides.get(keys[i]);
    }
    bundle.put$String$intArr(Carpet.OVERRIDES_KEYS, keys);
    bundle.put$String$intArr(Carpet.OVERRIDES_VALUES, values);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.tileOverrides.clear();
    let keys = bundle.getIntArray(Carpet.OVERRIDES_KEYS);
    let values = bundle.getIntArray(Carpet.OVERRIDES_VALUES);
    for (let i = 0; i < keys.length; i++) {
      this.tileOverrides.put(keys[i], values[i]);
    }
  }
}

$J.define(Carpet, 'com.shatteredpixel.shatteredpixeldungeon.tiles.custom.Carpet', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.tiles.CustomTilemap', ctors: { '': '_Carpet' }, meths: { 'overrideTile(int,com.shatteredpixel.shatteredpixeldungeon.levels.Level,int)': 'overrideTile$int$Level$int', 'overrideTile(com.shatteredpixel.shatteredpixeldungeon.levels.Level,int,int,int)': 'overrideTile$Level$int$int$int', 'overrideTile(int,int,int)': 'overrideTile$int$int$int' } });
$J.module(() => {
  Assets$Environment = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Environment');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  SparseArray = $J.load('com.watabou.utils.SparseArray');
});
