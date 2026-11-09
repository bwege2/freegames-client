// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/NoosaScript.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Gdx } from '../../../../jre/index.ts';
import { Script } from '../glscripts/Script.ts';

let Quad, Camera, Game, DeviceCompat;

export class NoosaScript extends Script {
  uCamera: Uniform = null;
  uModel: Uniform = null;
  uTex: Uniform = null;
  uColorM: Uniform = null;
  uColorA: Uniform = null;
  aXY: Attribute = null;
  aUV: Attribute = null;
  lastCamera: Camera = null;
  static readonly SHADER: string = 'uniform mat4 uCamera;\nuniform mat4 uModel;\nattribute vec4 aXYZW;\nattribute vec2 aUV;\nvarying vec2 vUV;\nvoid main() {\n  gl_Position = uCamera * uModel * aXYZW;\n  vUV = aUV;\n}\n//\n#ifdef GL_ES\n  precision mediump float;\n#endif\nvarying vec2 vUV;\nuniform sampler2D uTex;\nuniform vec4 uColorM;\nuniform vec4 uColorA;\nvoid main() {\n  gl_FragColor = texture2D( uTex, vUV ) * uColorM + uColorA;\n}\n';
  _NoosaScript(): this {
    this._Script();
    this.compile(this.shader());
    this.uCamera = this.uniform('uCamera');
    this.uModel = this.uniform('uModel');
    this.uTex = this.uniform('uTex');
    this.uColorM = this.uniform('uColorM');
    this.uColorA = this.uniform('uColorA');
    this.aXY = this.attribute('aXYZW');
    this.aUV = this.attribute('aUV');
    Quad.setupIndices();
    Quad.bindIndices();
    return this;
  }
  use(): void {
    super.use();
    this.aXY.enable();
    this.aUV.enable();
  }
  drawElements(vertices: FloatBuffer, indices: ShortBuffer, size: number): void {
    (vertices).position(0);
    this.aXY.vertexPointer(2, 4, vertices);
    (vertices).position(2);
    this.aUV.vertexPointer(2, 4, vertices);
    Quad.releaseIndices();
    Gdx.gl20.glDrawElements(4, size, 5123, indices);
    Quad.bindIndices();
  }
  drawQuad$FloatBuffer(vertices: FloatBuffer): void {
    (vertices).position(0);
    this.aXY.vertexPointer(2, 4, vertices);
    (vertices).position(2);
    this.aUV.vertexPointer(2, 4, vertices);
    Gdx.gl20.glDrawElements(4, Quad.SIZE, 5123, 0);
  }
  drawQuad$Vertexbuffer(buffer: Vertexbuffer): void {
    buffer.updateGLData();
    buffer.bind();
    this.aXY.vertexBuffer(2, 4, 0);
    this.aUV.vertexBuffer(2, 4, 2);
    buffer.release();
    Gdx.gl20.glDrawElements(4, Quad.SIZE, 5123, 0);
  }
  drawQuadSet$FloatBuffer$int(vertices: FloatBuffer, size: number): void {
    if (size === 0) {
      return;
    }
    (vertices).position(0);
    this.aXY.vertexPointer(2, 4, vertices);
    (vertices).position(2);
    this.aUV.vertexPointer(2, 4, vertices);
    Gdx.gl20.glDrawElements(4, Math.imul(Quad.SIZE, size), 5123, 0);
  }
  drawQuadSet$Vertexbuffer$int$int(buffer: Vertexbuffer, length: number, offset: number): void {
    if (length === 0) {
      return;
    }
    buffer.updateGLData();
    buffer.bind();
    this.aXY.vertexBuffer(2, 4, 0);
    this.aUV.vertexBuffer(2, 4, 2);
    buffer.release();
    Gdx.gl20.glDrawElements(4, Math.imul(Quad.SIZE, length), 5123, Math.imul($J.idiv(Math.imul(Quad.SIZE, 16), 8), offset));
  }
  lighting(rm: number, gm: number, bm: number, am: number, ra: number, ga: number, ba: number, aa: number): void {
    this.uColorM.value4f(rm, gm, bm, am);
    this.uColorA.value4f(ra, ga, ba, aa);
  }
  resetCamera(): void {
    this.lastCamera = null;
  }
  camera(camera: Camera): void {
    if (camera == null) {
      camera = Camera.main;
    }
    if (camera !== this.lastCamera && camera.matrix != null) {
      this.lastCamera = camera;
      this.uCamera.valueM4(camera.matrix);
      if (!camera.fullScreen) {
        Gdx.gl20.glEnable(3089);
        let xScale = DeviceCompat.getRealPixelScaleX();
        let yScale = DeviceCompat.getRealPixelScaleY();
        Gdx.gl20.glScissor($J.roundf(Math.fround(camera.x * xScale)), $J.roundf(Math.fround(((Game.height - camera.screenHeight_ - camera.y) | 0) * yScale)), $J.roundf(Math.fround(camera.screenWidth_ * xScale)), $J.roundf(Math.fround(camera.screenHeight_ * yScale)));
      } else {
        Gdx.gl20.glDisable(3089);
      }
    }
  }
  static get(): NoosaScript {
    return Script.use($J.cls(NoosaScript));
  }
  shader(): string {
    return NoosaScript.SHADER;
  }
}

$J.define(NoosaScript, 'com.watabou.noosa.NoosaScript', { kind: 'class', sup: 'com.watabou.glscripts.Script', ctors: { '': '_NoosaScript' }, meths: { 'drawQuadSet(com.watabou.glwrap.Vertexbuffer,int,int)': 'drawQuadSet$Vertexbuffer$int$int', 'drawQuadSet(java.nio.FloatBuffer,int)': 'drawQuadSet$FloatBuffer$int', 'drawQuad(com.watabou.glwrap.Vertexbuffer)': 'drawQuad$Vertexbuffer', 'drawQuad(java.nio.FloatBuffer)': 'drawQuad$FloatBuffer' } });
$J.module(() => {
  Quad = $J.load('com.watabou.glwrap.Quad');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
  DeviceCompat = $J.load('com.watabou.utils.DeviceCompat');
});
