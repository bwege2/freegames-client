// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/glwrap/Program.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, BufferUtils, Gdx, JObject, RuntimeException } from '../../../../jre/index.ts';

let Attribute, Uniform, Game;

export class Program extends JObject {
  handle_: number = 0;
  _Program(): this {
    this.handle_ = Gdx.gl.glCreateProgram();
    return this;
  }
  handle(): number {
    return this.handle_;
  }
  attach(shader: Shader): void {
    Gdx.gl.glAttachShader(this.handle_, shader.handle());
  }
  link(): void {
    Gdx.gl.glLinkProgram(this.handle_);
    let status = BufferUtils.newIntBuffer(1);
    Gdx.gl.glGetProgramiv(this.handle_, 35714, status);
    if (status.get() === 0) {
      Game.reportException(new RuntimeException(Gdx.gl.glGetProgramInfoLog(this.handle_)));
    }
  }
  attribute(name: string): Attribute {
    return new Attribute()._Attribute(Gdx.gl.glGetAttribLocation(this.handle_, name));
  }
  uniform(name: string): Uniform {
    return new Uniform()._Uniform(Gdx.gl.glGetUniformLocation(this.handle_, name));
  }
  use(): void {
    Gdx.gl.glUseProgram(this.handle_);
  }
  delete(): void {
    Gdx.gl.glDeleteProgram(this.handle_);
  }
  static create(shaders: Shader[]): Program {
    let program = new Program()._Program();
    for (let i = 0; i < shaders.length; i++) {
      program.attach(shaders[i]);
    }
    program.link();
    return program;
  }
}

$J.define(Program, 'com.watabou.glwrap.Program', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Program' } });
$J.module(() => {
  Attribute = $J.load('com.watabou.glwrap.Attribute');
  Uniform = $J.load('com.watabou.glwrap.Uniform');
  Game = $J.load('com.watabou.noosa.Game');
});
