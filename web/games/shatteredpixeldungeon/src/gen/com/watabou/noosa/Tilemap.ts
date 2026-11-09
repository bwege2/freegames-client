// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/Tilemap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Arrays } from '../../../../jre/index.ts';
import { Visual } from './Visual.ts';

let TextureCache, Quad, Vertexbuffer, Image, NoosaScriptNoLighting, Rect;

export class Tilemap extends Visual {
  texture_: SmartTexture = null;
  tileset: TextureFilm = null;
  data: number[] = null;
  mapWidth: number = 0;
  mapHeight: number = 0;
  size_: number = 0;
  cellW: number = 0;
  cellH: number = 0;
  vertices: number[] = null;
  quads: FloatBuffer = null;
  buffer: Vertexbuffer = null;
  updated: Rect = null;
  fullUpdate: boolean = false;
  updating: Rect = null;
  topLeftUpdating: number = 0;
  bottomRightUpdating: number = 0;
  _Tilemap(tx: any, tileset: TextureFilm): this {
    this._Visual(0, 0, 0, 0);
    this.texture_ = TextureCache.get(tx);
    this.tileset = tileset;
    let r = tileset.get$Object(0);
    this.cellW = tileset.width$RectF(r);
    this.cellH = tileset.height$RectF(r);
    this.vertices = $J.newArray(16, 0);
    this.updated = new Rect()._Rect$();
    return this;
  }
  map(data: number[], cols: number): void {
    this.data = data;
    this.mapWidth = cols;
    this.mapHeight = $J.idiv(data.length, cols);
    this.size_ = Math.imul(this.mapWidth, this.mapHeight);
    this.width_ = Math.fround(this.cellW * this.mapWidth);
    this.height_ = Math.fround(this.cellH * this.mapHeight);
    this.quads = Quad.createSet(this.size_);
    this.updateMap();
  }
  image(x: number, y: number): Image {
    if (!(this.needsRender((x + Math.imul(this.mapWidth, y)) | 0))) {
      return null;
    } else {
      let img = new Image()._Image$Object(this.texture_);
      img.frame$RectF(this.tileset.get$Object(this.data[(x + Math.imul(this.mapWidth, y)) | 0]));
      return img;
    }
  }
  updateMap(): void {
    this.updated.set$int$int$int$int(0, 0, this.mapWidth, this.mapHeight);
    this.fullUpdate = true;
  }
  updateMapCell(cell: number): void {
    this.updated.union$int$int(cell % this.mapWidth, $J.idiv(cell, this.mapWidth));
  }
  moveToUpdating(): void {
    this.updating = new Rect()._Rect$Rect(this.updated);
    this.updated.setEmpty();
  }
  updateVertices(): void {
    this.moveToUpdating();
    let x1: number;
    let y1: number;
    let x2: number;
    let y2: number;
    let pos: number;
    let uv: RectF;
    y1 = Math.fround(this.cellH * this.updating.top_);
    y2 = Math.fround(y1 + this.cellH);
    for (let i = this.updating.top_; i < this.updating.bottom_; i++) {
      x1 = Math.fround(this.cellW * this.updating.left_);
      x2 = Math.fround(x1 + this.cellW);
      pos = (Math.imul(i, this.mapWidth) + this.updating.left_) | 0;
      for (let j = this.updating.left_; j < this.updating.right_; j++) {
        if (this.topLeftUpdating === -1) {
          this.topLeftUpdating = pos;
        }
        this.bottomRightUpdating = (pos + 1) | 0;
        (this.quads).position(Math.imul(pos, 16));
        uv = this.tileset.get$Object(this.data[pos]);
        if (this.needsRender(pos) && uv != null) {
          this.vertices[0] = x1;
          this.vertices[1] = y1;
          this.vertices[2] = uv.left_;
          this.vertices[3] = uv.top_;
          this.vertices[4] = x2;
          this.vertices[5] = y1;
          this.vertices[6] = uv.right_;
          this.vertices[7] = uv.top_;
          this.vertices[8] = x2;
          this.vertices[9] = y2;
          this.vertices[10] = uv.right_;
          this.vertices[11] = uv.bottom_;
          this.vertices[12] = x1;
          this.vertices[13] = y2;
          this.vertices[14] = uv.left_;
          this.vertices[15] = uv.bottom_;
        } else {
          Arrays.fill(this.vertices, 0);
        }
        this.quads.put(this.vertices);
        pos++;
        x1 = x2;
        x2 = Math.fround(x2 + this.cellW);
      }
      y1 = y2;
      y2 = Math.fround(y2 + this.cellH);
    }
  }
  draw(): void {
    super.draw();
    if (!this.updated.isEmpty()) {
      this.updateVertices();
      if (this.buffer == null) {
        this.buffer = new Vertexbuffer()._Vertexbuffer(this.quads);
      } else {
        if (this.fullUpdate) {
          this.buffer.updateVertices$FloatBuffer(this.quads);
          this.fullUpdate = false;
        } else {
          this.buffer.updateVertices$FloatBuffer$int$int(this.quads, Math.imul(this.topLeftUpdating, 16), Math.imul(this.bottomRightUpdating, 16));
        }
      }
      this.topLeftUpdating = -1;
      this.updating.setEmpty();
    }
    let script = this.script();
    this.texture_.bind();
    script.uModel.valueM4(this.matrix);
    script.lighting(this.rm, this.gm, this.bm, this.am, this.ra, this.ga, this.ba, this.aa);
    script.camera(this.camera_);
    script.drawQuadSet$Vertexbuffer$int$int(this.buffer, this.size_, 0);
  }
  script(): NoosaScript {
    return NoosaScriptNoLighting.get();
  }
  destroy(): void {
    super.destroy();
    if (this.buffer != null) {
      this.buffer.delete();
    }
  }
  needsRender(pos: number): boolean {
    return this.data[pos] >= 0;
  }
}

$J.define(Tilemap, 'com.watabou.noosa.Tilemap', { kind: 'class', sup: 'com.watabou.noosa.Visual', ctors: { 'java.lang.Object,com.watabou.noosa.TextureFilm': '_Tilemap' } });
$J.module(() => {
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  Quad = $J.load('com.watabou.glwrap.Quad');
  Vertexbuffer = $J.load('com.watabou.glwrap.Vertexbuffer');
  Image = $J.load('com.watabou.noosa.Image');
  NoosaScriptNoLighting = $J.load('com.watabou.noosa.NoosaScriptNoLighting');
  Rect = $J.load('com.watabou.utils.Rect');
});
