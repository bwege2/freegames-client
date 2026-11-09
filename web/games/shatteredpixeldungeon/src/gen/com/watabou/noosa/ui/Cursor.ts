// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/ui/Cursor.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Files_FileType, Gdx, JEnum, JObject, Pixmap, Pixmap_Filter } from '../../../../../jre/index.ts';

let ControllerHandler, Game, DeviceCompat, FileUtils, PointF;

export class Cursor extends JObject {
  static currentCursor: Cursor = null;
  static lastType: Cursor$Type = null;
  static lastZoom: number = 0;
  static cursorCaptured: boolean = false;
  _Cursor(): this {
    return this;
  }
  static setCustomCursor(type$: Cursor$Type, zoom: number): void {
    if (!DeviceCompat.isDesktop()) {
      return;
    }
    if (Cursor.currentCursor != null) {
      if (Cursor.lastType === type$ && Cursor.lastZoom === zoom) {
        return;
      }
      Cursor.currentCursor.dispose();
      Cursor.currentCursor = null;
    }
    let cursorImg = new Pixmap(FileUtils.getFileHandle$FileType$String(Files_FileType.Internal, type$.file));
    let scaledWidth = Math.imul(cursorImg.getWidth(), zoom);
    let width2 = 2;
    while (width2 < scaledWidth) {
      width2 <<= 1;
    }
    let scaledHeight = Math.imul(cursorImg.getHeight(), zoom);
    let height2 = 2;
    while (height2 < scaledHeight) {
      height2 <<= 1;
    }
    let scaledImg = new Pixmap(width2, height2, cursorImg.getFormat());
    scaledImg.setFilter(Pixmap_Filter.NearestNeighbour);
    scaledImg.drawPixmap(cursorImg, 0, 0, cursorImg.getWidth(), cursorImg.getHeight(), 0, 0, scaledWidth, scaledHeight);
    Cursor.currentCursor = Gdx.graphics.newCursor(scaledImg, 0, 0);
    Gdx.graphics.setCursor(Cursor.currentCursor);
    scaledImg.dispose();
    cursorImg.dispose();
    Cursor.lastType = type$;
    Cursor.lastZoom = zoom;
  }
  static captureCursor(captured: boolean): void {
    Cursor.cursorCaptured = captured;
    if (captured) {
      Gdx.input.setCursorCatched(true);
    } else {
      if (ControllerHandler.controllerPointerActive()) {
        ControllerHandler.setControllerPointer(true);
        ControllerHandler.updateControllerPointer(new PointF()._PointF$float$float(Math.fround(Game.width / 2), Math.fround(Game.height / 2)), false);
      } else {
        Gdx.input.setCursorCatched(false);
      }
    }
  }
  static getCursorDelta(): PointF {
    return new PointF()._PointF$float$float(Math.fround(Gdx.input.getDeltaX()), Math.fround(Gdx.input.getDeltaY()));
  }
  static isCursorCaptured(): boolean {
    return Cursor.cursorCaptured;
  }
  static $clinit() {
    Cursor.cursorCaptured = false;
  }
}

export class Cursor$Type extends JEnum {
  file: string = null;
  static DEFAULT: Cursor$Type = null;
  static CONTROLLER: Cursor$Type = null;
  static $VALUES: Cursor$Type[] = null;
  _Cursor$Type($name: string, $ordinal: number, file: string): this {
    this._JEnum($name, $ordinal);
    this.file = file;
    return this;
  }
  static values(): Cursor$Type[] { return Cursor$Type.$VALUES.slice(); }
  static valueOf(name: string): Cursor$Type { return $J.enumValueOf(Cursor$Type, name); }
  static $clinit() {
    Cursor$Type.DEFAULT = new Cursor$Type()._Cursor$Type('DEFAULT', 0, 'gdx/cursor_mouse.png');
    Cursor$Type.CONTROLLER = new Cursor$Type()._Cursor$Type('CONTROLLER', 1, 'gdx/cursor_controller.png');
    Cursor$Type.$VALUES = [Cursor$Type.DEFAULT, Cursor$Type.CONTROLLER];
  }
}

$J.define(Cursor, 'com.watabou.noosa.ui.Cursor', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Cursor' }, clinit: true, lazy: ['currentCursor', 'lastType', 'lastZoom', 'cursorCaptured'] });
$J.define(Cursor$Type, 'com.watabou.noosa.ui.Cursor$Type', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'java.lang.String': '_Cursor$Type' }, clinit: true, lazy: ['$VALUES', 'DEFAULT', 'CONTROLLER'] });
$J.module(() => {
  ControllerHandler = $J.load('com.watabou.input.ControllerHandler');
  Game = $J.load('com.watabou.noosa.Game');
  DeviceCompat = $J.load('com.watabou.utils.DeviceCompat');
  FileUtils = $J.load('com.watabou.utils.FileUtils');
  PointF = $J.load('com.watabou.utils.PointF');
});
