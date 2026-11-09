// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/utils/BitmapCache.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Exception, Gdx, HashMap, JObject, Pixmap } from '../../../../jre/index.ts';

let Game;

export class BitmapCache extends JObject {
  static readonly DEFAULT: string = '__default';
  static layers: HashMap<string, BitmapCache$Layer> = null;
  _BitmapCache(): this {
    return this;
  }
  static get$String(assetName: string): Pixmap {
    return BitmapCache.get$String$String(BitmapCache.DEFAULT, assetName);
  }
  static get$String$String(layerName: string, assetName: string): Pixmap {
    let layer: BitmapCache$Layer;
    if (!BitmapCache.layers.containsKey(layerName)) {
      layer = new BitmapCache$Layer()._BitmapCache$Layer();
      BitmapCache.layers.put(layerName, layer);
    } else {
      layer = BitmapCache.layers.get(layerName);
    }
    if (layer.containsKey(assetName)) {
      return layer.get(assetName);
    } else {
      try {
        let bmp = new Pixmap(Gdx.files.internal(assetName));
        layer.put(assetName, bmp);
        return bmp;
      } catch ($e0) {
        if ($J.isa($e0, Exception)) {
          let e = $J.exc($e0);
          Game.reportException(e);
          return null;
        } else {
          throw $e0;
        }
      }
    }
  }
  static clear$String(layerName: string): void {
    if (BitmapCache.layers.containsKey(layerName)) {
      BitmapCache.layers.get(layerName).clear();
      BitmapCache.layers.remove(layerName);
    }
  }
  static clear$(): void {
    for (const $it1 = BitmapCache.layers.values().iterator(); $it1.hasNext(); ) {
      let layer = $it1.next();
      layer.clear();
    }
    BitmapCache.layers.clear();
  }
  static $clinit() {
    BitmapCache.layers = new HashMap();
  }
}

export class BitmapCache$Layer extends HashMap {
  _BitmapCache$Layer(): this {
    this._HashMap();
    return this;
  }
  clear(): void {
    for (const $it2 = this.values().iterator(); $it2.hasNext(); ) {
      let bmp = $it2.next();
      bmp.dispose();
    }
    super.clear();
  }
}

$J.define(BitmapCache, 'com.watabou.utils.BitmapCache', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_BitmapCache' }, meths: { 'clear()': 'clear$', 'clear(java.lang.String)': 'clear$String', 'get(java.lang.String,java.lang.String)': 'get$String$String', 'get(java.lang.String)': 'get$String' }, clinit: true, lazy: ['layers'] });
$J.define(BitmapCache$Layer, 'com.watabou.utils.BitmapCache$Layer', { kind: 'class', sup: 'java.util.HashMap', ctors: { '': '_BitmapCache$Layer' } });
$J.module(() => {
  Game = $J.load('com.watabou.noosa.Game');
});
