// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/utils/GameSettings.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Exception, Gdx, JObject, JString } from '../../../../jre/index.ts';

let Game, GameMath;

export class GameSettings extends JObject {
  static readonly DEFAULT_PREFS_FILE: string = 'settings.xml';
  static prefs: Preferences = null;
  _GameSettings(): this {
    return this;
  }
  static get(): Preferences {
    if (GameSettings.prefs == null) {
      GameSettings.prefs = Gdx.app.getPreferences(GameSettings.DEFAULT_PREFS_FILE);
    }
    return GameSettings.prefs;
  }
  static set(prefs: Preferences): void {
    GameSettings.prefs = prefs;
  }
  static contains(key: string): boolean {
    return GameSettings.get().contains(key);
  }
  static getInt$String$int(key: string, defValue: number): number {
    return GameSettings.getInt$String$int$int$int(key, defValue, -2147483648, 2147483647);
  }
  static getInt$String$int$int$int(key: string, defValue: number, min: number, max: number): number {
    try {
      let i = GameSettings.get().getInteger(key, defValue);
      if (i < min || i > max) {
        let val = $J.d2i(GameMath.gate(Math.fround(min), Math.fround(i), Math.fround(max)));
        GameSettings.put$String$int(key, val);
        return val;
      } else {
        return i;
      }
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        Game.reportException(e);
        GameSettings.put$String$int(key, defValue);
        return defValue;
      } else {
        throw $e0;
      }
    }
  }
  static getLong$String$long(key: string, defValue: bigint): bigint {
    return GameSettings.getLong$String$long$long$long(key, defValue, -9223372036854775808n, 9223372036854775807n);
  }
  static getLong$String$long$long$long(key: string, defValue: bigint, min: bigint, max: bigint): bigint {
    try {
      let i = GameSettings.get().getLong(key, defValue);
      if (i < min || i > max) {
        let val = $J.d2l(GameMath.gate($J.l2f(min), $J.l2f(i), $J.l2f(max)));
        GameSettings.put$String$long(key, val);
        return val;
      } else {
        return i;
      }
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        Game.reportException(e);
        GameSettings.put$String$long(key, defValue);
        return defValue;
      } else {
        throw $e1;
      }
    }
  }
  static getBoolean(key: string, defValue: boolean): boolean {
    try {
      return GameSettings.get().getBoolean(key, defValue);
    } catch ($e2) {
      if ($J.isa($e2, Exception)) {
        let e = $J.exc($e2);
        Game.reportException(e);
        return defValue;
      } else {
        throw $e2;
      }
    }
  }
  static getString$String$String(key: string, defValue: string): string {
    return GameSettings.getString$String$String$int(key, defValue, 2147483647);
  }
  static getString$String$String$int(key: string, defValue: string, maxLength: number): string {
    try {
      let s = GameSettings.get().getString(key, defValue);
      if (s != null && s.length > maxLength) {
        GameSettings.put$String$String(key, defValue);
        return defValue;
      } else {
        return s;
      }
    } catch ($e3) {
      if ($J.isa($e3, Exception)) {
        let e = $J.exc($e3);
        Game.reportException(e);
        GameSettings.put$String$String(key, defValue);
        return defValue;
      } else {
        throw $e3;
      }
    }
  }
  static put$String$int(key: string, value: number): void {
    GameSettings.get().putInteger(key, value);
    GameSettings.get().flush();
  }
  static put$String$long(key: string, value: bigint): void {
    GameSettings.get().putLong(key, value);
    GameSettings.get().flush();
  }
  static put$String$boolean(key: string, value: boolean): void {
    GameSettings.get().putBoolean(key, value);
    GameSettings.get().flush();
  }
  static put$String$String(key: string, value: string): void {
    GameSettings.get().putString(key, value);
    GameSettings.get().flush();
  }
}

$J.define(GameSettings, 'com.watabou.utils.GameSettings', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_GameSettings' }, meths: { 'put(java.lang.String,java.lang.String)': 'put$String$String', 'put(java.lang.String,boolean)': 'put$String$boolean', 'put(java.lang.String,long)': 'put$String$long', 'put(java.lang.String,int)': 'put$String$int', 'getString(java.lang.String,java.lang.String,int)': 'getString$String$String$int', 'getString(java.lang.String,java.lang.String)': 'getString$String$String', 'getLong(java.lang.String,long,long,long)': 'getLong$String$long$long$long', 'getLong(java.lang.String,long)': 'getLong$String$long', 'getInt(java.lang.String,int,int,int)': 'getInt$String$int$int$int', 'getInt(java.lang.String,int)': 'getInt$String$int' } });
$J.module(() => {
  Game = $J.load('com.watabou.noosa.Game');
  GameMath = $J.load('com.watabou.utils.GameMath');
});
