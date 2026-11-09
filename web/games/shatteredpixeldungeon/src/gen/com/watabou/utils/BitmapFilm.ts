// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/utils/BitmapFilm.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Rect;

export class BitmapFilm extends JObject {
  bitmap_: Pixmap = null;
  frames: HashMap<any, Rect> = null;
  $init_BitmapFilm() {
    this.frames = new HashMap();
  }
  _BitmapFilm$Pixmap(bitmap: Pixmap): this {
    this.$init_BitmapFilm();
    this.bitmap_ = bitmap;
    this.add(null, new Rect()._Rect$int$int$int$int(0, 0, bitmap.getWidth(), bitmap.getHeight()));
    return this;
  }
  _BitmapFilm$Pixmap$int(bitmap: Pixmap, width: number): this {
    this._BitmapFilm$Pixmap$int$int(bitmap, width, bitmap.getHeight());
    return this;
  }
  _BitmapFilm$Pixmap$int$int(bitmap: Pixmap, width: number, height: number): this {
    this.$init_BitmapFilm();
    this.bitmap_ = bitmap;
    let cols = $J.idiv(bitmap.getWidth(), width);
    let rows = $J.idiv(bitmap.getHeight(), height);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let rect = new Rect()._Rect$int$int$int$int(Math.imul(j, width), Math.imul(i, height), Math.imul(((j + 1) | 0), width), Math.imul(((i + 1) | 0), height));
        this.add((Math.imul(i, cols) + j) | 0, rect);
      }
    }
    return this;
  }
  add(id: any, rect: Rect): void {
    this.frames.put(id, rect);
  }
  get(id: any): Rect {
    return this.frames.get(id);
  }
}

$J.define(BitmapFilm, 'com.watabou.utils.BitmapFilm', { kind: 'class', sup: 'java.lang.Object', ctors: { 'com.badlogic.gdx.graphics.Pixmap,int,int': '_BitmapFilm$Pixmap$int$int', 'com.badlogic.gdx.graphics.Pixmap,int': '_BitmapFilm$Pixmap$int', 'com.badlogic.gdx.graphics.Pixmap': '_BitmapFilm$Pixmap' } });
$J.module(() => {
  Rect = $J.load('com.watabou.utils.Rect');
});
