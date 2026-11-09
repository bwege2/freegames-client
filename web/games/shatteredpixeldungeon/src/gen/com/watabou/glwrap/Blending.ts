// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/glwrap/Blending.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class Blending extends JObject {
  _Blending(): this {
    return this;
  }
  static useDefault(): void {
    Blending.enable();
    Blending.setNormalMode();
  }
  static enable(): void {
    Gdx.gl.glEnable(3042);
  }
  static disable(): void {
    Gdx.gl.glDisable(3042);
  }
  static setNormalMode(): void {
    Gdx.gl.glBlendFunc(770, 771);
  }
  static setLightMode(): void {
    Gdx.gl.glBlendFunc(770, 1);
  }
}

$J.define(Blending, 'com.watabou.glwrap.Blending', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Blending' } });
