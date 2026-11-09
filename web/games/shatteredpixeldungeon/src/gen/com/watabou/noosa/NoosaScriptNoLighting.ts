// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/NoosaScriptNoLighting.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../jre/index.ts';
import { NoosaScript } from './NoosaScript.ts';

let Script;

export class NoosaScriptNoLighting extends NoosaScript {
  static readonly SHADER: string = 'uniform mat4 uCamera;\nuniform mat4 uModel;\nattribute vec4 aXYZW;\nattribute vec2 aUV;\nvarying vec2 vUV;\nvoid main() {\n  gl_Position = uCamera * uModel * aXYZW;\n  vUV = aUV;\n}\n//\n#ifdef GL_ES\n  precision mediump float;\n#endif\nvarying vec2 vUV;\nuniform sampler2D uTex;\nvoid main() {\n  gl_FragColor = texture2D( uTex, vUV );\n}\n';
  _NoosaScriptNoLighting(): this {
    this._NoosaScript();
    return this;
  }
  lighting(rm: number, gm: number, bm: number, am: number, ra: number, ga: number, ba: number, aa: number): void {
  }
  static get(): NoosaScriptNoLighting {
    return Script.use($J.cls(NoosaScriptNoLighting));
  }
  shader(): string {
    return NoosaScriptNoLighting.SHADER;
  }
}

$J.define(NoosaScriptNoLighting, 'com.watabou.noosa.NoosaScriptNoLighting', { kind: 'class', sup: 'com.watabou.noosa.NoosaScript', ctors: { '': '_NoosaScriptNoLighting' } });
$J.module(() => {
  Script = $J.load('com.watabou.glscripts.Script');
});
