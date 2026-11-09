// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/gltextures/Atlas.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, HashMap, JObject } from '../../../../jre/index.ts';

let RectF;

export class Atlas extends JObject {
  tx: SmartTexture = null;
  namedFrames: HashMap<any, RectF> = null;
  uvLeft: number = 0;
  uvTop: number = 0;
  uvWidth: number = 0;
  uvHeight: number = 0;
  cols: number = 0;
  _Atlas(tx: SmartTexture): this {
    this.tx = tx;
    tx.atlas = this;
    this.namedFrames = new HashMap();
    return this;
  }
  add$Object$int$int$int$int(key: any, left: number, top: number, right: number, bottom: number): void {
    this.add$Object$RectF(key, Atlas.uvRect(this.tx, left, top, right, bottom));
  }
  add$Object$RectF(key: any, rect: RectF): void {
    this.namedFrames.put(key, rect);
  }
  grid$int(width: number): void {
    this.grid$int$int(width, this.tx.height_);
  }
  grid$int$int(width: number, height: number): void {
    this.grid$int$int$int$int$int(0, 0, width, height, $J.idiv(this.tx.width_, width));
  }
  grid$int$int$int$int$int(left: number, top: number, width: number, height: number, cols: number): void {
    this.uvLeft = Math.fround(Math.fround(left) / this.tx.width_);
    this.uvTop = Math.fround(Math.fround(top) / this.tx.height_);
    this.uvWidth = Math.fround(Math.fround(width) / this.tx.width_);
    this.uvHeight = Math.fround(Math.fround(height) / this.tx.height_);
    this.cols = cols;
  }
  get$int(index: number): RectF {
    let x = Math.fround(index % this.cols);
    let y = Math.fround($J.idiv(index, this.cols));
    let l = Math.fround(this.uvLeft + Math.fround(x * this.uvWidth));
    let t = Math.fround(this.uvTop + Math.fround(y * this.uvHeight));
    return new RectF()._RectF$float$float$float$float(l, t, Math.fround(l + this.uvWidth), Math.fround(t + this.uvHeight));
  }
  get$Object(key: any): RectF {
    return this.namedFrames.get(key);
  }
  width(rect: RectF): number {
    return Math.fround(rect.width() * this.tx.width_);
  }
  height(rect: RectF): number {
    return Math.fround(rect.height() * this.tx.height_);
  }
  static uvRect(tx: SmartTexture, left: number, top: number, right: number, bottom: number): RectF {
    return new RectF()._RectF$float$float$float$float(Math.fround(Math.fround(left) / tx.width_), Math.fround(Math.fround(top) / tx.height_), Math.fround(Math.fround(right) / tx.width_), Math.fround(Math.fround(bottom) / tx.height_));
  }
}

$J.define(Atlas, 'com.watabou.gltextures.Atlas', { kind: 'class', sup: 'java.lang.Object', ctors: { 'com.watabou.gltextures.SmartTexture': '_Atlas' }, meths: { 'get(java.lang.Object)': 'get$Object', 'get(int)': 'get$int', 'grid(int,int,int,int,int)': 'grid$int$int$int$int$int', 'grid(int,int)': 'grid$int$int', 'grid(int)': 'grid$int', 'add(java.lang.Object,com.watabou.utils.RectF)': 'add$Object$RectF', 'add(java.lang.Object,int,int,int,int)': 'add$Object$int$int$int$int' } });
$J.module(() => {
  RectF = $J.load('com.watabou.utils.RectF');
});
