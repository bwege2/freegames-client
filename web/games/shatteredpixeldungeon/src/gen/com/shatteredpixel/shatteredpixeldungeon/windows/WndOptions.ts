// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndOptions.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { Window } from '../ui/Window.ts';

let PixelScene, IconButton, Icons, RedButton, IconTitle;

export class WndOptions extends Window {
  static readonly WIDTH_P: number = 120;
  static readonly WIDTH_L: number = 144;
  static readonly MARGIN: number = 2;
  static readonly BUTTON_HEIGHT: number = 18;
  _WndOptions$Image$String$String$StringArr(icon: Image, title: string, message: string, options: string[]): this {
    this._Window$();
    let width = PixelScene.landscape() ? WndOptions.WIDTH_L : WndOptions.WIDTH_P;
    let pos = 0;
    if (title != null) {
      let tfTitle = new IconTitle()._IconTitle$Image$String(icon, title);
      tfTitle.setRect(0, pos, Math.fround(width), 0);
      this.add$Gizmo(tfTitle);
      pos = Math.fround(tfTitle.bottom() + Math.imul(2, WndOptions.MARGIN));
    }
    this.layoutBody(pos, message, options);
    return this;
  }
  _WndOptions$String$String$StringArr(title: string, message: string, options: string[]): this {
    this._Window$();
    let width = PixelScene.landscape() ? WndOptions.WIDTH_L : WndOptions.WIDTH_P;
    let pos = Math.fround(WndOptions.MARGIN);
    if (title != null) {
      let tfTitle = PixelScene.renderTextBlock$String$int(title, 9);
      tfTitle.hardlight(Window.TITLE_COLOR);
      tfTitle.setPos(Math.fround(WndOptions.MARGIN), pos);
      tfTitle.maxWidth$int((width - Math.imul(WndOptions.MARGIN, 2)) | 0);
      this.add$Gizmo(tfTitle);
      pos = Math.fround(tfTitle.bottom() + Math.imul(2, WndOptions.MARGIN));
    }
    this.layoutBody(pos, message, options);
    return this;
  }
  layoutBody(pos: number, message: string, options: string[]): void {
    let width = PixelScene.landscape() ? WndOptions.WIDTH_L : WndOptions.WIDTH_P;
    let tfMesage = PixelScene.renderTextBlock$int(6);
    tfMesage.text$String$int(message, width);
    tfMesage.setPos(0, pos);
    this.add$Gizmo(tfMesage);
    pos = Math.fround(tfMesage.bottom() + Math.imul(2, WndOptions.MARGIN));
    for (let i = 0; i < options.length; i++) {
      let index = i;
      let btn = new (WndOptions$1())().$o(this).$c(index)._RedButton$String(options[i]);
      if (this.hasIcon(i)) {
        btn.icon$Image(this.getIcon(i));
      }
      btn.multiline = true;
      this.add$Gizmo(btn);
      if (!this.hasInfo(i)) {
        btn.setRect(0, pos, Math.fround(width), Math.fround(WndOptions.BUTTON_HEIGHT));
      } else {
        btn.setRect(0, pos, Math.fround((width - WndOptions.BUTTON_HEIGHT) | 0), Math.fround(WndOptions.BUTTON_HEIGHT));
        let info = new (WndOptions$2())().$o(this).$c(index)._IconButton$Image(Icons.get$Icons(Icons.INFO));
        info.setRect(Math.fround((width - WndOptions.BUTTON_HEIGHT) | 0), pos, Math.fround(WndOptions.BUTTON_HEIGHT), Math.fround(WndOptions.BUTTON_HEIGHT));
        this.add$Gizmo(info);
      }
      btn.enable(this.enabled(i));
      pos = Math.fround(pos + ((WndOptions.BUTTON_HEIGHT + WndOptions.MARGIN) | 0));
    }
    this.resize(width, $J.d2i((Math.fround(pos - WndOptions.MARGIN))));
  }
  enabled(index: number): boolean {
    return true;
  }
  onSelect(index: number): void {
  }
  hasInfo(index: number): boolean {
    return false;
  }
  onInfo(index: number): void {
  }
  hasIcon(index: number): boolean {
    return false;
  }
  getIcon(index: number): Image {
    return null;
  }
}

let $WndOptions$1: any = null;
/** An anonymous class (WndOptions.java:88). */
function WndOptions$1(): any {
  return $WndOptions$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
      this.$outer.onSelect(this.$cv_index);
    }
    $c($index): this {
      this.$cv_index = $index;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions$1', []);
}

let $WndOptions$2: any = null;
/** An anonymous class (WndOptions.java:103). */
function WndOptions$2(): any {
  return $WndOptions$2 ??= $J.local(class extends IconButton {
    onClick(): void {
      this.$outer.onInfo(this.$cv_index);
    }
    $c($index): this {
      this.$cv_index = $index;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions$2', []);
}

$J.define(WndOptions, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'java.lang.String,java.lang.String,java.lang.String[]': '_WndOptions$String$String$StringArr', 'com.watabou.noosa.Image,java.lang.String,java.lang.String,java.lang.String[]': '_WndOptions$Image$String$String$StringArr' } });
$J.module(() => {
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  IconButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.IconButton');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
});
