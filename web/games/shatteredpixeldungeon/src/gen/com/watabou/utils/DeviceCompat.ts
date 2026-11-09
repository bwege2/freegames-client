// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/utils/DeviceCompat.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Gdx, Input_Peripheral, JObject, JString, Os, SharedLibraryLoader } from '../../../../jre/index.ts';

let Game;

export class DeviceCompat extends JObject {
  _DeviceCompat(): this {
    return this;
  }
  static getPlatformVersion(): number {
    return Gdx.app.getVersion();
  }
  static isAndroid(): boolean {
    return SharedLibraryLoader.os === Os.Android;
  }
  static isiOS(): boolean {
    return SharedLibraryLoader.os === Os.IOS;
  }
  static isDesktop(): boolean {
    return SharedLibraryLoader.os === Os.Windows || SharedLibraryLoader.os === Os.MacOsX || SharedLibraryLoader.os === Os.Linux;
  }
  static hasHardKeyboard(): boolean {
    return Gdx.input.isPeripheralAvailable(Input_Peripheral.HardwareKeyboard);
  }
  static isDebug(): boolean {
    return Game.version.includes('INDEV');
  }
  static log(tag: string, message: string): void {
    Gdx.app.log(tag, message);
  }
  static getRealPixelScaleX(): number {
    return (Math.fround(Gdx.graphics.getBackBufferWidth() / Math.fround(Game.width)));
  }
  static getRealPixelScaleY(): number {
    return (Math.fround(Gdx.graphics.getBackBufferHeight() / Math.fround(Game.height)));
  }
}

$J.define(DeviceCompat, 'com.watabou.utils.DeviceCompat', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_DeviceCompat' } });
$J.module(() => {
  Game = $J.load('com.watabou.noosa.Game');
});
