// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/Flare.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let CharSprite, TextureCache, Blending, Game, NoosaScript;

export class Flare extends Visual {
  duration: number = 0;
  lifespan: number = 0;
  lightMode_: boolean = false;
  texture_: SmartTexture = null;
  vertices: FloatBuffer = null;
  indices: ShortBuffer = null;
  nRays: number = 0;
  _Flare(nRays: number, radius: number): this {
    this._Visual(0, 0, 0, 0);
    this.duration = 0;
    this.lightMode_ = true;
    let gradient = [-1, -1140850689, -1996488705, 65535, 16777215];
    this.texture_ = TextureCache.createGradient(gradient);
    this.nRays = nRays;
    this.angle = 45;
    this.angularSpeed = 180;
    this.vertices = ByteBuffer.allocateDirect(Math.imul(Math.imul(((Math.imul(nRays, 2) + 1) | 0), 4), ($J.idiv(32, 8)))).order(ByteOrder.nativeOrder()).asFloatBuffer();
    this.indices = ByteBuffer.allocateDirect($J.idiv(Math.imul(Math.imul(nRays, 3), 16), 8)).order(ByteOrder.nativeOrder()).asShortBuffer();
    let v = $J.newArray(4, 0);
    v[0] = 0;
    v[1] = 0;
    v[2] = 0.25;
    v[3] = 0;
    this.vertices.put(v);
    v[2] = 0.75;
    v[3] = 0;
    for (let i = 0; i < nRays; i++) {
      let a = Math.fround(Math.fround(Math.fround(i * Math.fround(3.1415925)) * 2) / nRays);
      v[0] = Math.fround(Math.fround(Math.cos(a)) * radius);
      v[1] = Math.fround(Math.fround(Math.sin(a)) * radius);
      this.vertices.put(v);
      a = Math.fround(a + Math.fround(Math.fround(Math.fround(Math.fround(3.1415925) * 2) / nRays) / 2));
      v[0] = Math.fround(Math.fround(Math.cos(a)) * radius);
      v[1] = Math.fround(Math.fround(Math.sin(a)) * radius);
      this.vertices.put(v);
      this.indices.put(((0) << 16) >> 16);
      this.indices.put(((((1 + Math.imul(i, 2)) | 0)) << 16) >> 16);
      this.indices.put(((((2 + Math.imul(i, 2)) | 0)) << 16) >> 16);
    }
    (this.indices).position(0);
    return this;
  }
  color$int$boolean(color: number, lightMode: boolean): Flare {
    this.lightMode_ = lightMode;
    this.hardlight$int(color);
    return this;
  }
  show$Visual$float(visual: Visual, duration: number): Flare {
    if (visual instanceof CharSprite) {
      this.point$PointF((visual).destinationCenter());
    } else {
      this.point$PointF(visual.center$());
    }
    visual.parent.addToBack(this);
    this.lifespan = this.duration = duration;
    if (this.lifespan > Math.fround(0)) {
      this.scale_.set$float(0);
    }
    return this;
  }
  show$Group$PointF$float(parent: Group, pos: PointF, duration: number): Flare {
    this.point$PointF(pos);
    parent.add$Gizmo(this);
    this.lifespan = this.duration = duration;
    if (this.lifespan > Math.fround(0)) {
      this.scale_.set$float(0);
    }
    return this;
  }
  update(): void {
    super.update();
    if (this.duration > Math.fround(0)) {
      if ((this.lifespan = Math.fround(this.lifespan - Game.elapsed)) > Math.fround(0)) {
        let p = Math.fround(1 - Math.fround(this.lifespan / this.duration));
        p = p < 0.25 ? Math.fround(p * 4) : Math.fround((Math.fround(1 - p)) * Math.fround(1.333));
        this.scale_.set$float(p);
        this.alpha$float(p);
      } else {
        this.killAndErase();
      }
    }
  }
  draw(): void {
    super.draw();
    if (this.lightMode_) {
      Blending.setLightMode();
      this.drawRays();
      Blending.setNormalMode();
    } else {
      this.drawRays();
    }
  }
  drawRays(): void {
    let script = NoosaScript.get();
    this.texture_.bind();
    script.uModel.valueM4(this.matrix);
    script.lighting(this.rm, this.gm, this.bm, this.am, this.ra, this.ga, this.ba, this.aa);
    script.camera(this.camera_);
    script.drawElements(this.vertices, this.indices, Math.imul(this.nRays, 3));
  }
}

$J.define(Flare, 'com.shatteredpixel.shatteredpixeldungeon.effects.Flare', { kind: 'class', sup: 'com.watabou.noosa.Visual', ctors: { 'int,float': '_Flare' }, meths: { 'show(com.watabou.noosa.Group,com.watabou.utils.PointF,float)': 'show$Group$PointF$float', 'show(com.watabou.noosa.Visual,float)': 'show$Visual$float', 'color(int,boolean)': 'color$int$boolean' } });
$J.module(() => {
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  Blending = $J.load('com.watabou.glwrap.Blending');
  Game = $J.load('com.watabou.noosa.Game');
  NoosaScript = $J.load('com.watabou.noosa.NoosaScript');
});
