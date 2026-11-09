// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/changelist/WndChangesTabbed.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { WndTabbed } from '../../windows/WndTabbed.ts';

let PixelScene, IconTitle, WndTabbed$LabeledTab, PointerArea;

export class WndChangesTabbed extends WndTabbed {
  static readonly WIDTH_MIN: number = 120;
  static readonly WIDTH_MAX: number = 220;
  static readonly GAP: number = 2;
  texts: ArrayList<RenderedTextBlock> = null;
  _WndChangesTabbed(icon: Image, title: string, messages: string[]): this {
    this._WndTabbed();
    this.texts = new ArrayList();
    let width = WndChangesTabbed.WIDTH_MIN;
    let blocker = new (WndChangesTabbed$1())().$o(this)._PointerArea$float$float$float$float(0, 0, Math.fround(PixelScene.uiCamera.width_), Math.fround(PixelScene.uiCamera.height_));
    blocker.camera_ = PixelScene.uiCamera;
    this.add$Gizmo(blocker);
    let titlebar = new IconTitle()._IconTitle$Image$String(icon, title);
    titlebar.setRect(0, 0, Math.fround(width), 0);
    this.add$Gizmo(titlebar);
    let largest = null;
    for (let i = 0; i < messages.length; i++) {
      let text = PixelScene.renderTextBlock$int(6);
      text.text$String$int(messages[i], width);
      text.setPos(titlebar.left(), Math.fround(titlebar.bottom() + Math.imul(2, WndChangesTabbed.GAP)));
      this.add$Gizmo(text);
      this.texts.add(text);
      if (largest == null || text.height() > largest.height()) {
        largest = text;
      }
      let finalI = i;
      this.add$Tab(new (WndChangesTabbed$2())().$o(this).$c(finalI)._WndTabbed$LabeledTab(this.numToNumeral((finalI + 1) | 0)));
    }
    while (PixelScene.landscape() && largest.bottom() > (Math.fround(PixelScene.MIN_HEIGHT_L - 20)) && width < WndChangesTabbed.WIDTH_MAX) {
      width = (width + 20) | 0;
      titlebar.setRect(0, 0, Math.fround(width), 0);
      largest = null;
      for (const $it0 = this.texts.iterator(); $it0.hasNext(); ) {
        let text = $it0.next();
        text.setPos(titlebar.left(), Math.fround(titlebar.bottom() + Math.imul(2, WndChangesTabbed.GAP)));
        text.maxWidth$int(width);
        if (largest == null || text.height() > largest.height()) {
          largest = text;
        }
      }
    }
    this.bringToFront(titlebar);
    this.resize(width, ($J.d2i(largest.bottom()) + 2) | 0);
    this.layoutTabs();
    this.select$int(0);
    return this;
  }
  numToNumeral(num: number): string {
    switch (num) {
      case 1:
        return 'I';
      case 2:
        return 'II';
      case 3:
        return 'III';
      case 4:
        return 'IV';
      case 5:
        return 'V';
      case 6:
        return 'VI';
      case 7:
        return 'VII';
      case 8:
        return 'VIII';
      case 9:
        return 'IX';
      case 10:
        return 'X';
      default:
        return String(num);
    }
  }
}

let $WndChangesTabbed$1: any = null;
/** An anonymous class (WndChangesTabbed.java:48). */
function WndChangesTabbed$1(): any {
  return $WndChangesTabbed$1 ??= $J.local(class extends PointerArea {
    onClick(event: PointerEvent): void {
      this.$outer.onBackPressed();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.changelist.WndChangesTabbed$1', []);
}

let $WndChangesTabbed$2: any = null;
/** An anonymous class (WndChangesTabbed.java:74). */
function WndChangesTabbed$2(): any {
  return $WndChangesTabbed$2 ??= $J.local(class extends WndTabbed$LabeledTab {
    select(value: boolean): void {
      super.select(value);
      this.$outer.texts.get(this.$cv_finalI).visible_ = value;
    }
    $c($finalI): this {
      this.$cv_finalI = $finalI;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.changelist.WndChangesTabbed$2', []);
}

$J.define(WndChangesTabbed, 'com.shatteredpixel.shatteredpixeldungeon.ui.changelist.WndChangesTabbed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed', ctors: { 'com.watabou.noosa.Image,java.lang.String,java.lang.String[]': '_WndChangesTabbed' } });
$J.module(() => {
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  WndTabbed$LabeledTab = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed$LabeledTab');
  PointerArea = $J.load('com.watabou.noosa.PointerArea');
});
