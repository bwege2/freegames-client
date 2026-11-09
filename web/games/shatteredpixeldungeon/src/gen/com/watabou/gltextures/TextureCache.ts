// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/gltextures/TextureCache.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Exception, Gdx, HashMap, Integer, JObject, JString, Pixmap, Pixmap_Format } from '../../../../jre/index.ts';

let SmartTexture, Texture, Game;

export class TextureCache extends JObject {
  static all: HashMap<any, SmartTexture> = null;
  _TextureCache(): this {
    return this;
  }
  static createSolid(color: number): SmartTexture {
    let key = '1x1:' + color;
    if (TextureCache.all.containsKey(key)) {
      return TextureCache.all.get(key);
    } else {
      let pixmap = new Pixmap(1, 1, Pixmap_Format.RGBA8888);
      pixmap.setColor((color << 8) | (color >>> 24));
      pixmap.fill();
      let tx = new SmartTexture()._SmartTexture$Pixmap(pixmap);
      TextureCache.all.put(key, tx);
      return tx;
    }
  }
  static createGradient(colors: number[]): SmartTexture {
    let key = '' + $J.str(colors);
    if (TextureCache.all.containsKey(key)) {
      return TextureCache.all.get(key);
    } else {
      let pixmap = new Pixmap(colors.length, 1, Pixmap_Format.RGBA8888);
      for (let i = 0; i < colors.length; i++) {
        pixmap.drawPixel(i, 0, (colors[i] << 8) | (colors[i] >>> 24));
      }
      let tx = new SmartTexture()._SmartTexture$Pixmap(pixmap);
      tx.filter(Texture.LINEAR, Texture.LINEAR);
      tx.wrap(Texture.CLAMP, Texture.CLAMP);
      TextureCache.all.put(key, tx);
      return tx;
    }
  }
  static create(key: any, width: number, height: number): SmartTexture {
    if (TextureCache.all.containsKey(key)) {
      return TextureCache.all.get(key);
    } else {
      let tx = new SmartTexture()._SmartTexture$Pixmap(new Pixmap(width, height, Pixmap_Format.RGBA8888));
      tx.filter(Texture.LINEAR, Texture.LINEAR);
      tx.wrap(Texture.CLAMP, Texture.CLAMP);
      TextureCache.all.put(key, tx);
      return tx;
    }
  }
  static remove(key: any): void {
    let tx = TextureCache.all.get(key);
    if (tx != null) {
      TextureCache.all.remove(key);
      tx.delete();
    }
  }
  static get(src: any): SmartTexture {
    if (TextureCache.all.containsKey(src)) {
      return TextureCache.all.get(src);
    } else if (src instanceof SmartTexture) {
      return src;
    } else {
      let tx = new SmartTexture()._SmartTexture$Pixmap(TextureCache.getBitmap(src));
      TextureCache.all.put(src, tx);
      return tx;
    }
  }
  static clear(): void {
    for (const $it0 = TextureCache.all.values().iterator(); $it0.hasNext(); ) {
      let txt = $it0.next();
      txt.delete();
    }
    TextureCache.all.clear();
  }
  static reload(): void {
    for (const $it1 = TextureCache.all.values().iterator(); $it1.hasNext(); ) {
      let tx = $it1.next();
      tx.reload();
    }
  }
  static getBitmap(src: any): Pixmap {
    try {
      if ($J.isa(src, Integer)) {
        return null;
      } else if ($J.isa(src, JString)) {
        return new Pixmap(Gdx.files.internal(src));
      } else if ($J.isa(src, Pixmap)) {
        return src;
      } else {
        return null;
      }
    } catch ($e2) {
      if ($J.isa($e2, Exception)) {
        let e = $J.exc($e2);
        Game.reportException(e);
        return null;
      } else {
        throw $e2;
      }
    }
  }
  static contains(key: any): boolean {
    return TextureCache.all.containsKey(key);
  }
  static $clinit() {
    TextureCache.all = new HashMap();
  }
}

$J.define(TextureCache, 'com.watabou.gltextures.TextureCache', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_TextureCache' }, clinit: true, lazy: ['all'] });
$J.module(() => {
  SmartTexture = $J.load('com.watabou.gltextures.SmartTexture');
  Texture = $J.load('com.watabou.glwrap.Texture');
  Game = $J.load('com.watabou.noosa.Game');
});
