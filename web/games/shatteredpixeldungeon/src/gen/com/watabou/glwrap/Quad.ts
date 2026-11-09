// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/glwrap/Quad.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ByteBuffer, ByteOrder, Gdx, JObject } from '../../../../jre/index.ts';

export class Quad extends JObject {
  static VALUES: number[] = null;
  static SIZE: number = 0;
  static indices: ShortBuffer = null;
  static indexSize: number = 0;
  static bufferIndex: number = 0;
  _Quad(): this {
    return this;
  }
  static create(): FloatBuffer {
    return ByteBuffer.allocateDirect($J.idiv(Math.imul(16, 32), 8)).order(ByteOrder.nativeOrder()).asFloatBuffer();
  }
  static createSet(size: number): FloatBuffer {
    return ByteBuffer.allocateDirect($J.idiv(Math.imul(Math.imul(size, 16), 32), 8)).order(ByteOrder.nativeOrder()).asFloatBuffer();
  }
  static setupIndices(): void {
    let indices = Quad.getIndices(32767);
    if (Quad.bufferIndex === -1) {
      Quad.bufferIndex = Gdx.gl.glGenBuffer();
    }
    Gdx.gl.glBindBuffer(34963, Quad.bufferIndex);
    Gdx.gl.glBufferData(34963, (Math.imul(indices.capacity(), 2)), indices, 35044);
    Gdx.gl.glBindBuffer(34963, 0);
  }
  static bindIndices(): void {
    Gdx.gl.glBindBuffer(34963, Quad.bufferIndex);
  }
  static releaseIndices(): void {
    Gdx.gl.glBindBuffer(34963, 0);
  }
  static getIndices(size: number): ShortBuffer {
    if (size > Quad.indexSize) {
      Quad.indexSize = size;
      Quad.indices = ByteBuffer.allocateDirect($J.idiv(Math.imul(Math.imul(size, Quad.SIZE), 16), 8)).order(ByteOrder.nativeOrder()).asShortBuffer();
      let values = $J.newArray(Math.imul(size, 6), 0);
      let pos = 0;
      let limit = Math.imul(size, 4);
      for (let ofs = 0; ofs < limit; ofs = (ofs + 4) | 0) {
        values[pos++] = ((((ofs + 0) | 0)) << 16) >> 16;
        values[pos++] = ((((ofs + 1) | 0)) << 16) >> 16;
        values[pos++] = ((((ofs + 2) | 0)) << 16) >> 16;
        values[pos++] = ((((ofs + 0) | 0)) << 16) >> 16;
        values[pos++] = ((((ofs + 2) | 0)) << 16) >> 16;
        values[pos++] = ((((ofs + 3) | 0)) << 16) >> 16;
      }
      Quad.indices.put(values);
      (Quad.indices).position(0);
    }
    return Quad.indices;
  }
  static fill(v: number[], x1: number, x2: number, y1: number, y2: number, u1: number, u2: number, v1: number, v2: number): void {
    v[0] = x1;
    v[1] = y1;
    v[2] = u1;
    v[3] = v1;
    v[4] = x2;
    v[5] = y1;
    v[6] = u2;
    v[7] = v1;
    v[8] = x2;
    v[9] = y2;
    v[10] = u2;
    v[11] = v2;
    v[12] = x1;
    v[13] = y2;
    v[14] = u1;
    v[15] = v2;
  }
  static fillXY(v: number[], x1: number, x2: number, y1: number, y2: number): void {
    v[0] = x1;
    v[1] = y1;
    v[4] = x2;
    v[5] = y1;
    v[8] = x2;
    v[9] = y2;
    v[12] = x1;
    v[13] = y2;
  }
  static fillUV(v: number[], u1: number, u2: number, v1: number, v2: number): void {
    v[2] = u1;
    v[3] = v1;
    v[6] = u2;
    v[7] = v1;
    v[10] = u2;
    v[11] = v2;
    v[14] = u1;
    v[15] = v2;
  }
  static $clinit() {
    Quad.VALUES = [0, 1, 2, 0, 2, 3];
    Quad.SIZE = Quad.VALUES.length;
    Quad.indexSize = 0;
    Quad.bufferIndex = -1;
  }
}

$J.define(Quad, 'com.watabou.glwrap.Quad', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Quad' }, clinit: true, lazy: ['VALUES', 'SIZE', 'indices', 'indexSize', 'bufferIndex'] });
