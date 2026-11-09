// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/glwrap/Framebuffer.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class Framebuffer extends JObject {
  static COLOR: number = 0;
  static DEPTH: number = 0;
  static STENCIL: number = 0;
  static system: Framebuffer = null;
  id_: number = 0;
  _Framebuffer$(): this {
    this.id_ = Gdx.gl.glGenBuffer();
    return this;
  }
  _Framebuffer$int(n: number): this {
    return this;
  }
  bind(): void {
    Gdx.gl.glBindFramebuffer(36160, this.id_);
  }
  delete(): void {
    Gdx.gl.glDeleteBuffer(this.id_);
  }
  attach$int$Texture(point: number, tex: Texture): void {
    this.bind();
    Gdx.gl.glFramebufferTexture2D(36160, point, 3553, tex.id_, 0);
  }
  attach$int$Renderbuffer(point: number, buffer: Renderbuffer): void {
    this.bind();
    Gdx.gl.glFramebufferRenderbuffer(36161, point, 3553, buffer.id());
  }
  status(): boolean {
    this.bind();
    return Gdx.gl.glCheckFramebufferStatus(36160) === 36053;
  }
  static $clinit() {
    Framebuffer.COLOR = 36064;
    Framebuffer.DEPTH = 36096;
    Framebuffer.STENCIL = 36128;
    Framebuffer.system = new Framebuffer()._Framebuffer$int(0);
  }
}

$J.define(Framebuffer, 'com.watabou.glwrap.Framebuffer', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int': '_Framebuffer$int', '': '_Framebuffer$' }, meths: { 'attach(int,com.watabou.glwrap.Renderbuffer)': 'attach$int$Renderbuffer', 'attach(int,com.watabou.glwrap.Texture)': 'attach$int$Texture' }, clinit: true, lazy: ['COLOR', 'DEPTH', 'STENCIL', 'system'] });
