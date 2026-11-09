// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/glwrap/Vertexbuffer.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Gdx, JObject } from '../../../../jre/index.ts';

export class Vertexbuffer extends JObject {
  id_: number = 0;
  vertices: FloatBuffer = null;
  updateStart: number = 0;
  updateEnd: number = 0;
  static buffers: ArrayList<Vertexbuffer> = null;
  _Vertexbuffer(vertices: FloatBuffer): this {
    {
      this.id_ = Gdx.gl.glGenBuffer();
      this.vertices = vertices;
      Vertexbuffer.buffers.add(this);
      this.updateStart = 0;
      this.updateEnd = vertices.limit();
    }
    return this;
  }
  updateVertices$(): void {
    this.updateVertices$FloatBuffer(this.vertices);
  }
  updateVertices$FloatBuffer(vertices: FloatBuffer): void {
    this.updateVertices$FloatBuffer$int$int(vertices, 0, vertices.limit());
  }
  updateVertices$FloatBuffer$int$int(vertices: FloatBuffer, start: number, end: number): void {
    this.vertices = vertices;
    if (this.updateStart === -1) {
      this.updateStart = start;
    } else {
      this.updateStart = Math.min(start, this.updateStart);
    }
    if (this.updateEnd === -1) {
      this.updateEnd = end;
    } else {
      this.updateEnd = Math.max(end, this.updateEnd);
    }
  }
  updateGLData(): void {
    if (this.updateStart === -1) {
      return;
    }
    (this.vertices).position(this.updateStart);
    this.bind();
    if (this.updateStart === 0 && this.updateEnd === this.vertices.limit()) {
      Gdx.gl.glBufferData(34962, Math.imul(this.vertices.limit(), 4), this.vertices, 35048);
    } else {
      Gdx.gl.glBufferSubData(34962, Math.imul(this.updateStart, 4), Math.imul(((this.updateEnd - this.updateStart) | 0), 4), this.vertices);
    }
    this.release();
    this.updateStart = this.updateEnd = -1;
  }
  bind(): void {
    Gdx.gl.glBindBuffer(34962, this.id_);
  }
  release(): void {
    Gdx.gl.glBindBuffer(34962, 0);
  }
  delete(): void {
    {
      Gdx.gl.glDeleteBuffer(this.id_);
      Vertexbuffer.buffers.remove(this);
    }
  }
  static clear(): void {
    {
      for (let buf of $J.toArrayInto(Vertexbuffer.buffers.toArray(), $J.newArray(0, null))) {
        buf.delete();
      }
    }
  }
  static reload(): void {
    {
      for (const $it0 = Vertexbuffer.buffers.iterator(); $it0.hasNext(); ) {
        let buf = $it0.next();
        buf.updateVertices$();
        buf.updateGLData();
      }
    }
  }
  static $clinit() {
    Vertexbuffer.buffers = new ArrayList();
  }
}

$J.define(Vertexbuffer, 'com.watabou.glwrap.Vertexbuffer', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.nio.FloatBuffer': '_Vertexbuffer' }, meths: { 'updateVertices(java.nio.FloatBuffer,int,int)': 'updateVertices$FloatBuffer$int$int', 'updateVertices(java.nio.FloatBuffer)': 'updateVertices$FloatBuffer', 'updateVertices()': 'updateVertices$' }, clinit: true, lazy: ['buffers'] });
