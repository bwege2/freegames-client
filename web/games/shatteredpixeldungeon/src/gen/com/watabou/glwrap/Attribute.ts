// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/glwrap/Attribute.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Gdx, JObject } from '../../../../jre/index.ts';

export class Attribute extends JObject {
  location_: number = 0;
  _Attribute(location: number): this {
    this.location_ = location;
    return this;
  }
  location(): number {
    return this.location_;
  }
  enable(): void {
    Gdx.gl.glEnableVertexAttribArray(this.location_);
  }
  disable(): void {
    Gdx.gl.glDisableVertexAttribArray(this.location_);
  }
  vertexPointer(size: number, stride: number, ptr: FloatBuffer): void {
    Gdx.gl.glVertexAttribPointer(this.location_, size, 5126, false, Math.imul(stride, 4), ptr);
  }
  vertexBuffer(size: number, stride: number, offset: number): void {
    Gdx.gl.glVertexAttribPointer(this.location_, size, 5126, false, Math.imul(stride, 4), Math.imul(offset, 4));
  }
}

$J.define(Attribute, 'com.watabou.glwrap.Attribute', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int': '_Attribute' } });
