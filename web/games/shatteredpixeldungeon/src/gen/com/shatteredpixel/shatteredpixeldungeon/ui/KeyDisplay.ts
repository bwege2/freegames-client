// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/KeyDisplay.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, LinkedHashMap } from '../../../../../jre/index.ts';
import { Visual } from '../../../watabou/noosa/Visual.ts';

let Assets$Interfaces, Dungeon, CrystalKey, GoldenKey, IronKey, WornKey, Notes, Notes$KeyRecord, TextureCache, Quad, Vertexbuffer, NoosaScript;

export class KeyDisplay extends Visual {
  vertices: number[] = null;
  quads: FloatBuffer = null;
  buffer: Vertexbuffer = null;
  tx: SmartTexture = null;
  dirty: boolean = false;
  keys_: number[] = null;
  static keyMap: LinkedHashMap<JClass<Key>, number> = null;
  totalKeys: number = 0;
  _KeyDisplay(): this {
    this._Visual(0, 0, 0, 0);
    this.vertices = $J.newArray(16, 0);
    this.tx = TextureCache.get(Assets$Interfaces.MENU_BTN);
    this.dirty = true;
    this.totalKeys = 0;
    return this;
  }
  updateKeys(): void {
    this.keys_ = $J.newArray((KeyDisplay.keyMap.size() + 1) | 0, 0);
    for (const $it0 = Notes.getRecords$Class($J.cls(Notes$KeyRecord)).iterator(); $it0.hasNext(); ) {
      let rec = $it0.next();
      if (rec.depth() < Dungeon.depth) {
        this.keys_[0] = 1;
      } else if (rec.depth() === Dungeon.depth && Dungeon.branch === 0) {
        this.keys_[KeyDisplay.keyMap.get(rec.type())] += rec.quantity$();
      }
    }
    this.totalKeys = 0;
    for (let k of this.keys_) {
      this.totalKeys = (this.totalKeys + k) | 0;
    }
    this.dirty = true;
  }
  keyCount(): number {
    return this.totalKeys;
  }
  draw(): void {
    super.draw();
    if (this.dirty) {
      this.updateVertices();
      (this.quads).limit(this.quads.position());
      if (this.buffer == null) {
        this.buffer = new Vertexbuffer()._Vertexbuffer(this.quads);
      } else {
        this.buffer.updateVertices$FloatBuffer(this.quads);
      }
    }
    let script = NoosaScript.get();
    this.tx.bind();
    script.camera(this.camera());
    script.uModel.valueM4(this.matrix);
    script.lighting(this.rm, this.gm, this.bm, this.am, this.ra, this.ga, this.ba, this.aa);
    script.drawQuadSet$Vertexbuffer$int$int(this.buffer, this.totalKeys, 0);
  }
  updateVertices(): void {
    let maxRows = $J.idiv($J.d2i((Math.fround(this.height_ + 1))), 5);
    let maxPerRow = $J.idiv($J.d2i((Math.fround(this.width_ + 1))), 4);
    let maxKeys = Math.imul(maxPerRow, maxRows);
    while (this.totalKeys > maxKeys) {
      let mostType = null;
      let mostNum = 0;
      for (const $it1 = KeyDisplay.keyMap.keySet().iterator(); $it1.hasNext(); ) {
        let k = $it1.next();
        if (this.keys_[KeyDisplay.keyMap.get(k)] >= mostNum) {
          mostType = k;
          mostNum = this.keys_[KeyDisplay.keyMap.get(k)];
        }
      }
      this.keys_[KeyDisplay.keyMap.get(mostType)]--;
      this.totalKeys--;
    }
    let rows = $J.d2i(Math.ceil(Math.fround(this.totalKeys / Math.fround(maxPerRow))));
    let shortKeys = Math.fround((Math.imul(rows, 8))) > this.height_;
    let left: number;
    if (this.totalKeys > maxPerRow) {
      left = 0;
    } else {
      left = Math.fround((Math.fround(Math.fround(this.width_ + 1) - (Math.imul(this.totalKeys, 4)))) / 2);
    }
    let top = Math.fround((Math.fround(Math.fround(this.height_ + 1) - (Math.imul(rows, (shortKeys ? 5 : 8))))) / 2);
    this.quads = Quad.createSet(this.totalKeys);
    for (let i = 0; i < this.totalKeys; i++) {
      let keyIdx = 0;
      if (i === 0 && this.keys_[0] > 0) {
        keyIdx = 0;
      } else {
        for (let j = 1; j < this.keys_.length; j++) {
          if (this.keys_[j] > 0) {
            this.keys_[j]--;
            keyIdx = j;
            break;
          }
        }
      }
      let r = this.tx.uvRect(Math.fround((43 + Math.imul(3, keyIdx)) | 0), Math.fround(shortKeys ? 8 : 0), Math.fround((46 + Math.imul(3, keyIdx)) | 0), Math.fround(shortKeys ? 12 : 7));
      this.vertices[2] = r.left_;
      this.vertices[3] = r.top_;
      this.vertices[6] = r.right_;
      this.vertices[7] = r.top_;
      this.vertices[10] = r.right_;
      this.vertices[11] = r.bottom_;
      this.vertices[14] = r.left_;
      this.vertices[15] = r.bottom_;
      this.vertices[0] = left;
      this.vertices[1] = top;
      this.vertices[4] = Math.fround(left + 3);
      this.vertices[5] = top;
      this.vertices[8] = Math.fround(left + 3);
      this.vertices[9] = Math.fround(top + (shortKeys ? 4 : 7));
      this.vertices[12] = left;
      this.vertices[13] = Math.fround(top + (shortKeys ? 4 : 7));
      this.quads.put(this.vertices);
      left = Math.fround(left + 4);
      if (Math.fround(left + 3) > this.width_) {
        left = 0;
        top = Math.fround(top + (shortKeys ? 5 : 8));
      }
    }
    this.dirty = false;
  }
  destroy(): void {
    super.destroy();
    if (this.buffer != null) {
      this.buffer.delete();
    }
  }
  static $clinit() {
    KeyDisplay.keyMap = new LinkedHashMap();
    KeyDisplay.keyMap.put($J.cls(WornKey), 1);
    KeyDisplay.keyMap.put($J.cls(CrystalKey), 2);
    KeyDisplay.keyMap.put($J.cls(GoldenKey), 3);
    KeyDisplay.keyMap.put($J.cls(IronKey), 4);
  }
}

$J.define(KeyDisplay, 'com.shatteredpixel.shatteredpixeldungeon.ui.KeyDisplay', { kind: 'class', sup: 'com.watabou.noosa.Visual', ctors: { '': '_KeyDisplay' }, clinit: true, lazy: ['keyMap'] });
$J.module(() => {
  Assets$Interfaces = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Interfaces');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  CrystalKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.CrystalKey');
  GoldenKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.GoldenKey');
  IronKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.IronKey');
  WornKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.keys.WornKey');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Notes$KeyRecord = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$KeyRecord');
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  Quad = $J.load('com.watabou.glwrap.Quad');
  Vertexbuffer = $J.load('com.watabou.glwrap.Vertexbuffer');
  NoosaScript = $J.load('com.watabou.noosa.NoosaScript');
});
