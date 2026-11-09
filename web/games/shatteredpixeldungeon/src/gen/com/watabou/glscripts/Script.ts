// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/glscripts/Script.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, HashMap, JString } from '../../../../jre/index.ts';
import { Program } from '../glwrap/Program.ts';

let Shader, Reflection;

export class Script extends Program {
  static all: HashMap<JClass<Script>, Script> = null;
  static curScript: Script = null;
  static curScriptClass: JClass<Script> = null;
  _Script(): this {
    this._Program();
    return this;
  }
  static use<T>(c: JClass<T>): T {
    if (c !== Script.curScriptClass) {
      let script = Script.all.get(c);
      if (script == null) {
        script = Reflection.newInstance(c);
        Script.all.put(c, script);
      }
      Script.curScript = script;
      Script.curScriptClass = c;
      Script.curScript.use();
    }
    return Script.curScript;
  }
  static unuse(): void {
    Script.curScript = null;
    Script.curScriptClass = null;
  }
  static reset(): void {
    for (const $it0 = Script.all.values().iterator(); $it0.hasNext(); ) {
      let script = $it0.next();
      script.delete();
    }
    Script.all.clear();
    Script.curScript = null;
    Script.curScriptClass = null;
  }
  compile(src: string): void {
    let srcShaders = JString.split(src, '//\n');
    this.attach(Shader.createCompiled(Shader.VERTEX, srcShaders[0]));
    this.attach(Shader.createCompiled(Shader.FRAGMENT, srcShaders[1]));
    this.link();
  }
  static $clinit() {
    Script.all = new HashMap();
    Script.curScript = null;
    Script.curScriptClass = null;
  }
}

$J.define(Script, 'com.watabou.glscripts.Script', { kind: 'class', sup: 'com.watabou.glwrap.Program', ctors: { '': '_Script' }, clinit: true, lazy: ['all', 'curScript', 'curScriptClass'] });
$J.module(() => {
  Shader = $J.load('com.watabou.glwrap.Shader');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
