// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/glwrap/Shader.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, BufferUtils, Gdx, JError, JObject } from '../../../../jre/index.ts';

export class Shader extends JObject {
  static VERTEX: number = 0;
  static FRAGMENT: number = 0;
  handle_: number = 0;
  _Shader(type$: number): this {
    this.handle_ = Gdx.gl.glCreateShader(type$);
    return this;
  }
  handle(): number {
    return this.handle_;
  }
  source(src: string): void {
    Gdx.gl.glShaderSource(this.handle_, src);
  }
  compile(): void {
    Gdx.gl.glCompileShader(this.handle_);
    let status = BufferUtils.newIntBuffer(1);
    Gdx.gl.glGetShaderiv(this.handle_, 35713, status);
    if (status.get() === 0) {
      throw new JError(Gdx.gl.glGetShaderInfoLog(this.handle_));
    }
  }
  delete(): void {
    Gdx.gl.glDeleteShader(this.handle_);
  }
  static createCompiled(type$: number, src: string): Shader {
    let shader = new Shader()._Shader(type$);
    shader.source(src);
    shader.compile();
    return shader;
  }
  static $clinit() {
    Shader.VERTEX = 35633;
    Shader.FRAGMENT = 35632;
  }
}

$J.define(Shader, 'com.watabou.glwrap.Shader', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int': '_Shader' }, clinit: true, lazy: ['VERTEX', 'FRAGMENT'] });
