// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/Chrome.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JEnum, JObject } from '../../../../jre/index.ts';

let Assets$Interfaces, NinePatch;

export class Chrome extends JObject {
  _Chrome(): this {
    return this;
  }
  static get(type$: Chrome$Type): NinePatch {
    let Asset = Assets$Interfaces.CHROME;
    switch (type$) {
      case Chrome$Type.WINDOW:
        return new NinePatch()._NinePatch$Object$int$int$int$int$int(Asset, 0, 0, 20, 20, 6);
      case Chrome$Type.WINDOW_SILVER:
        return new NinePatch()._NinePatch$Object$int$int$int$int$int(Asset, 86, 0, 22, 22, 7);
      case Chrome$Type.TOAST:
        return new NinePatch()._NinePatch$Object$int$int$int$int$int(Asset, 20, 0, 9, 9, 4);
      case Chrome$Type.TOAST_TR:
      case Chrome$Type.GREY_BUTTON_TR:
        return new NinePatch()._NinePatch$Object$int$int$int$int$int(Asset, 20, 9, 9, 9, 4);
      case Chrome$Type.TOAST_TR_HEAVY:
        return new NinePatch()._NinePatch$Object$int$int$int$int$int(Asset, 29, 9, 9, 9, 4);
      case Chrome$Type.TOAST_WHITE:
        return new NinePatch()._NinePatch$Object$int$int$int$int$int(Asset, 29, 0, 9, 9, 4);
      case Chrome$Type.RED_BUTTON:
        return new NinePatch()._NinePatch$Object$int$int$int$int$int(Asset, 38, 0, 6, 6, 2);
      case Chrome$Type.GREY_BUTTON:
        return new NinePatch()._NinePatch$Object$int$int$int$int$int(Asset, 38, 6, 6, 6, 2);
      case Chrome$Type.TAG:
        return new NinePatch()._NinePatch$Object$int$int$int$int$int(Asset, 22, 18, 16, 14, 3);
      case Chrome$Type.GEM:
        return new NinePatch()._NinePatch$Object$int$int$int$int$int(Asset, 0, 32, 32, 32, 13);
      case Chrome$Type.SCROLL:
        return new NinePatch()._NinePatch$Object$int$int$int$int$int$int$int$int(Asset, 32, 32, 32, 32, 5, 11, 5, 11);
      case Chrome$Type.TAB_SET:
        return new NinePatch()._NinePatch$Object$int$int$int$int$int(Asset, 64, 0, 20, 20, 6);
      case Chrome$Type.TAB_SELECTED:
        return new NinePatch()._NinePatch$Object$int$int$int$int$int$int$int$int(Asset, 65, 22, 8, 13, 3, 7, 3, 5);
      case Chrome$Type.TAB_UNSELECTED:
        return new NinePatch()._NinePatch$Object$int$int$int$int$int$int$int$int(Asset, 75, 22, 8, 13, 3, 7, 3, 5);
      case Chrome$Type.BLANK:
        return new NinePatch()._NinePatch$Object$int$int$int$int$int$int$int$int(Asset, 45, 0, 1, 1, 0, 0, 0, 0);
      default:
        return null;
    }
  }
}

export class Chrome$Type extends JEnum {
  static TOAST: Chrome$Type = null;
  static TOAST_TR: Chrome$Type = null;
  static TOAST_TR_HEAVY: Chrome$Type = null;
  static TOAST_WHITE: Chrome$Type = null;
  static WINDOW: Chrome$Type = null;
  static WINDOW_SILVER: Chrome$Type = null;
  static RED_BUTTON: Chrome$Type = null;
  static GREY_BUTTON: Chrome$Type = null;
  static GREY_BUTTON_TR: Chrome$Type = null;
  static TAG: Chrome$Type = null;
  static GEM: Chrome$Type = null;
  static SCROLL: Chrome$Type = null;
  static TAB_SET: Chrome$Type = null;
  static TAB_SELECTED: Chrome$Type = null;
  static TAB_UNSELECTED: Chrome$Type = null;
  static BLANK: Chrome$Type = null;
  static $VALUES: Chrome$Type[] = null;
  _Chrome$Type($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Chrome$Type[] { return Chrome$Type.$VALUES.slice(); }
  static valueOf(name: string): Chrome$Type { return $J.enumValueOf(Chrome$Type, name); }
  static $clinit() {
    Chrome$Type.TOAST = new Chrome$Type()._Chrome$Type('TOAST', 0);
    Chrome$Type.TOAST_TR = new Chrome$Type()._Chrome$Type('TOAST_TR', 1);
    Chrome$Type.TOAST_TR_HEAVY = new Chrome$Type()._Chrome$Type('TOAST_TR_HEAVY', 2);
    Chrome$Type.TOAST_WHITE = new Chrome$Type()._Chrome$Type('TOAST_WHITE', 3);
    Chrome$Type.WINDOW = new Chrome$Type()._Chrome$Type('WINDOW', 4);
    Chrome$Type.WINDOW_SILVER = new Chrome$Type()._Chrome$Type('WINDOW_SILVER', 5);
    Chrome$Type.RED_BUTTON = new Chrome$Type()._Chrome$Type('RED_BUTTON', 6);
    Chrome$Type.GREY_BUTTON = new Chrome$Type()._Chrome$Type('GREY_BUTTON', 7);
    Chrome$Type.GREY_BUTTON_TR = new Chrome$Type()._Chrome$Type('GREY_BUTTON_TR', 8);
    Chrome$Type.TAG = new Chrome$Type()._Chrome$Type('TAG', 9);
    Chrome$Type.GEM = new Chrome$Type()._Chrome$Type('GEM', 10);
    Chrome$Type.SCROLL = new Chrome$Type()._Chrome$Type('SCROLL', 11);
    Chrome$Type.TAB_SET = new Chrome$Type()._Chrome$Type('TAB_SET', 12);
    Chrome$Type.TAB_SELECTED = new Chrome$Type()._Chrome$Type('TAB_SELECTED', 13);
    Chrome$Type.TAB_UNSELECTED = new Chrome$Type()._Chrome$Type('TAB_UNSELECTED', 14);
    Chrome$Type.BLANK = new Chrome$Type()._Chrome$Type('BLANK', 15);
    Chrome$Type.$VALUES = [Chrome$Type.TOAST, Chrome$Type.TOAST_TR, Chrome$Type.TOAST_TR_HEAVY, Chrome$Type.TOAST_WHITE, Chrome$Type.WINDOW, Chrome$Type.WINDOW_SILVER, Chrome$Type.RED_BUTTON, Chrome$Type.GREY_BUTTON, Chrome$Type.GREY_BUTTON_TR, Chrome$Type.TAG, Chrome$Type.GEM, Chrome$Type.SCROLL, Chrome$Type.TAB_SET, Chrome$Type.TAB_SELECTED, Chrome$Type.TAB_UNSELECTED, Chrome$Type.BLANK];
  }
}

$J.define(Chrome, 'com.shatteredpixel.shatteredpixeldungeon.Chrome', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Chrome' } });
$J.define(Chrome$Type, 'com.shatteredpixel.shatteredpixeldungeon.Chrome$Type', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Chrome$Type' }, clinit: true, lazy: ['$VALUES', 'TOAST', 'TOAST_TR', 'TOAST_TR_HEAVY', 'TOAST_WHITE', 'WINDOW', 'WINDOW_SILVER', 'RED_BUTTON', 'GREY_BUTTON', 'GREY_BUTTON_TR', 'TAG', 'GEM', 'SCROLL', 'TAB_SET', 'TAB_SELECTED', 'TAB_UNSELECTED', 'BLANK'] });
$J.module(() => {
  Assets$Interfaces = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Interfaces');
  NinePatch = $J.load('com.watabou.noosa.NinePatch');
});
