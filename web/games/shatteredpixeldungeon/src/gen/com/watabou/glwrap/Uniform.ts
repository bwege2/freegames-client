// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/glwrap/Uniform.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class Uniform extends JObject {
  location_: number = 0;
  _Uniform(location: number): this {
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
  value1f(value: number): void {
    Gdx.gl.glUniform1f(this.location_, value);
  }
  value2f(v1: number, v2: number): void {
    Gdx.gl.glUniform2f(this.location_, v1, v2);
  }
  value4f(v1: number, v2: number, v3: number, v4: number): void {
    Gdx.gl.glUniform4f(this.location_, v1, v2, v3, v4);
  }
  valueM3(value: number[]): void {
    Gdx.gl.glUniformMatrix3fv(this.location_, 1, false, value, 0);
  }
  valueM4(value: number[]): void {
    Gdx.gl.glUniformMatrix4fv(this.location_, 1, false, value, 0);
  }
}

$J.define(Uniform, 'com.watabou.glwrap.Uniform', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int': '_Uniform' } });
