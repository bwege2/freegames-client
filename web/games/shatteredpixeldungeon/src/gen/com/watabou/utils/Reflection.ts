// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/utils/Reflection.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ClassReflection, Exception, JObject } from '../../../../jre/index.ts';

let Game;

export class Reflection extends JObject {
  _Reflection(): this {
    return this;
  }
  static isMemberClass(cls: JClass): boolean {
    return ClassReflection.isMemberClass(cls);
  }
  static isStatic(cls: JClass): boolean {
    return ClassReflection.isStaticClass(cls);
  }
  static newInstance<T>(cls: JClass<T>): T {
    try {
      return ClassReflection.newInstance(cls);
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        Game.reportException(e);
        return null;
      } else {
        throw $e0;
      }
    }
  }
  static newInstanceUnhandled<T>(cls: JClass<T>): T {
    return ClassReflection.newInstance(cls);
  }
  static forName(name: string): JClass {
    try {
      return ClassReflection.forName(name);
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        Game.reportException(e);
        return null;
      } else {
        throw $e1;
      }
    }
  }
  static forNameUnhandled(name: string): JClass {
    return ClassReflection.forName(name);
  }
}

$J.define(Reflection, 'com.watabou.utils.Reflection', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Reflection' } });
$J.module(() => {
  Game = $J.load('com.watabou.noosa.Game');
});
