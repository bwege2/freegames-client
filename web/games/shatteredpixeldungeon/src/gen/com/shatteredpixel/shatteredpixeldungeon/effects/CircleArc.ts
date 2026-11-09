// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/CircleArc.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ByteBuffer, ByteOrder } from '../../../../../jre/index.ts';
import { Visual } from '../../../watabou/noosa/Visual.ts';

let TextureCache, Blending, Game, NoosaScript;

export class CircleArc extends Visual {
  duration: number = 0;
  lifespan: number = 0;
  sweep: number = 0;
  dirty: boolean = false;
  lightMode_: boolean = false;
  texture_: SmartTexture = null;
  vertices: number[] = null;
  verticesBuffer: FloatBuffer = null;
  indices: ShortBuffer = null;
  nTris: number = 0;
  rad: number = 0;
  _CircleArc(triangles: number, radius: number): this {
    this._Visual(0, 0, 0, 0);
    this.duration = 0;
    this.lightMode_ = true;
    this.texture_ = TextureCache.createSolid(-1);
    this.nTris = triangles;
    this.rad = radius;
    this.vertices = $J.newArray(4, 0);
    this.verticesBuffer = ByteBuffer.allocateDirect(Math.imul(Math.imul(((Math.imul(this.nTris, 2) + 1) | 0), 4), ($J.idiv(32, 8)))).order(ByteOrder.nativeOrder()).asFloatBuffer();
    this.indices = ByteBuffer.allocateDirect($J.idiv(Math.imul(Math.imul(this.nTris, 3), 16), 8)).order(ByteOrder.nativeOrder()).asShortBuffer();
    this.sweep = 1;
    this.updateTriangles();
    return this;
  }
  color$int$boolean(color: number, lightMode: boolean): CircleArc {
    this.lightMode_ = lightMode;
    this.hardlight$int(color);
    return this;
  }
  show$Visual$float(visual: Visual, duration: number): CircleArc {
    this.point$PointF(visual.center$());
    visual.parent.addToBack(this);
    this.lifespan = this.duration = duration;
    return this;
  }
  show$Group$PointF$float(parent: Group, pos: PointF, duration: number): CircleArc {
    this.point$PointF(pos);
    parent.add$Gizmo(this);
    this.lifespan = this.duration = duration;
    return this;
  }
  setSweep(sweep: number): void {
    if (sweep !== this.sweep) {
      this.sweep = sweep;
      this.dirty = true;
    }
  }
  getSweep(): number {
    return this.sweep;
  }
  updateTriangles(): void {
    this.dirty = false;
    (this.indices).position(0);
    (this.verticesBuffer).position(0);
    this.vertices[0] = 0;
    this.vertices[1] = 0;
    this.vertices[2] = 0.25;
    this.vertices[3] = 0;
    this.verticesBuffer.put(this.vertices);
    this.vertices[2] = 0.75;
    this.vertices[3] = 0;
    let start = 2 * (3.141592653589793 - 3.141592653589793 * this.sweep) - 3.141592653589793 / 2;
    for (let i = 0; i < this.nTris; i++) {
      let a = start + i * 3.141592653589793 * 2 / this.nTris * this.sweep;
      this.vertices[0] = Math.fround(Math.fround(Math.cos(a)) * this.rad);
      this.vertices[1] = Math.fround(Math.fround(Math.sin(a)) * this.rad);
      this.verticesBuffer.put(this.vertices);
      a += Math.fround(Math.fround(Math.fround(Math.fround(3.1415925) * 2) / this.nTris) * this.sweep);
      this.vertices[0] = Math.fround(Math.fround(Math.cos(a)) * this.rad);
      this.vertices[1] = Math.fround(Math.fround(Math.sin(a)) * this.rad);
      this.verticesBuffer.put(this.vertices);
      this.indices.put(((0) << 16) >> 16);
      this.indices.put(((((1 + Math.imul(i, 2)) | 0)) << 16) >> 16);
      this.indices.put(((((2 + Math.imul(i, 2)) | 0)) << 16) >> 16);
    }
    (this.indices).position(0);
  }
  update(): void {
    super.update();
    if (this.duration > Math.fround(0)) {
      if ((this.lifespan = Math.fround(this.lifespan - Game.elapsed)) > Math.fround(0)) {
        this.sweep = Math.fround(this.lifespan / this.duration);
        this.dirty = true;
      } else {
        this.killAndErase();
      }
    }
  }
  draw(): void {
    super.draw();
    if (this.dirty) {
      this.updateTriangles();
    }
    if (this.lightMode_) {
      Blending.setLightMode();
    }
    let script = NoosaScript.get();
    this.texture_.bind();
    script.uModel.valueM4(this.matrix);
    script.lighting(this.rm, this.gm, this.bm, this.am, this.ra, this.ga, this.ba, this.aa);
    script.camera(this.camera_);
    script.drawElements(this.verticesBuffer, this.indices, Math.imul(this.nTris, 3));
    if (this.lightMode_) {
      Blending.setNormalMode();
    }
  }
}

$J.define(CircleArc, 'com.shatteredpixel.shatteredpixeldungeon.effects.CircleArc', { kind: 'class', sup: 'com.watabou.noosa.Visual', ctors: { 'int,float': '_CircleArc' }, meths: { 'show(com.watabou.noosa.Group,com.watabou.utils.PointF,float)': 'show$Group$PointF$float', 'show(com.watabou.noosa.Visual,float)': 'show$Visual$float', 'color(int,boolean)': 'color$int$boolean' } });
$J.module(() => {
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  Blending = $J.load('com.watabou.glwrap.Blending');
  Game = $J.load('com.watabou.noosa.Game');
  NoosaScript = $J.load('com.watabou.noosa.NoosaScript');
});
