// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndOptionsCondensed.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../jre/index.ts';
import { WndOptions } from './WndOptions.ts';

let PixelScene, RedButton;

export class WndOptionsCondensed extends WndOptions {
  _WndOptionsCondensed$Image$String$String$StringArr(icon: Image, title: string, message: string, options: string[]): this {
    this._WndOptions$Image$String$String$StringArr(icon, title, message, options);
    return this;
  }
  _WndOptionsCondensed$String$String$StringArr(title: string, message: string, options: string[]): this {
    this._WndOptions$String$String$StringArr(title, message, options);
    return this;
  }
  layoutBody(pos: number, message: string, options: string[]): void {
    let width = PixelScene.landscape() ? WndOptions.WIDTH_L : WndOptions.WIDTH_P;
    let tfMesage = PixelScene.renderTextBlock$int(6);
    tfMesage.text$String$int(message, width);
    tfMesage.setPos(0, pos);
    this.add$Gizmo(tfMesage);
    pos = Math.fround(tfMesage.bottom() + Math.imul(2, WndOptions.MARGIN));
    let buttons = new ArrayList();
    for (let i = 0; i < options.length; i++) {
      let index = i;
      let btn = new (WndOptionsCondensed$1())().$o(this).$c(index)._RedButton$String(options[i]);
      if (this.hasIcon(i)) {
        btn.icon$Image(this.getIcon(i));
      }
      btn.enable(this.enabled(i));
      btn.setSize(btn.reqWidth(), Math.fround(WndOptions.BUTTON_HEIGHT));
      this.add$Gizmo(btn);
      buttons.add(btn);
    }
    let curRow = new ArrayList();
    let widthLeftThisRow = Math.fround(width);
    while (!buttons.isEmpty()) {
      let btn = buttons.get(0);
      widthLeftThisRow = Math.fround(widthLeftThisRow - btn.width());
      if (curRow.isEmpty()) {
        curRow.add(btn);
        buttons.remove(btn);
      } else {
        widthLeftThisRow = Math.fround(widthLeftThisRow - WndOptions.MARGIN);
        if (widthLeftThisRow >= Math.fround(0)) {
          curRow.add(btn);
          buttons.remove(btn);
        }
      }
      if (buttons.isEmpty() || widthLeftThisRow <= Math.fround(0) || curRow.size() >= 5) {
        widthLeftThisRow = Math.fround((width - (curRow.size() - 1)) | 0);
        for (const $it0 = curRow.iterator(); $it0.hasNext(); ) {
          let b = $it0.next();
          widthLeftThisRow = Math.fround(widthLeftThisRow - b.width());
        }
        while (widthLeftThisRow > Math.fround(0)) {
          let shortest = new ArrayList();
          let secondShortest = null;
          for (const $it1 = curRow.iterator(); $it1.hasNext(); ) {
            let b = $it1.next();
            if (shortest.isEmpty()) {
              shortest.add(b);
            } else {
              if (b.width() < shortest.get(0).width()) {
                secondShortest = shortest.get(0);
                shortest.clear();
                shortest.add(b);
              } else if (b.width() === shortest.get(0).width()) {
                shortest.add(b);
              } else if (secondShortest == null || secondShortest.width() > b.width()) {
                secondShortest = b;
              }
            }
          }
          let widthToGrow: number;
          if (secondShortest == null) {
            widthToGrow = Math.fround(widthLeftThisRow / shortest.size());
            widthLeftThisRow = 0;
          } else {
            widthToGrow = Math.fround(secondShortest.width() - shortest.get(0).width());
            if ((Math.fround(widthToGrow * shortest.size())) >= widthLeftThisRow) {
              widthToGrow = Math.fround(widthLeftThisRow / shortest.size());
              widthLeftThisRow = 0;
            } else {
              widthLeftThisRow = Math.fround(widthLeftThisRow - Math.fround(widthToGrow * shortest.size()));
            }
          }
          for (const $it2 = shortest.iterator(); $it2.hasNext(); ) {
            let toGrow = $it2.next();
            toGrow.setRect(0, 0, Math.fround(toGrow.width() + widthToGrow), toGrow.height());
          }
        }
        let x = 0;
        for (const $it3 = curRow.iterator(); $it3.hasNext(); ) {
          let b = $it3.next();
          b.setRect(x, pos, b.width(), b.height());
          x = Math.fround(x + Math.fround(b.width() + 1));
        }
        pos = Math.fround(pos + ((WndOptions.BUTTON_HEIGHT + WndOptions.MARGIN) | 0));
        widthLeftThisRow = Math.fround(width);
        curRow.clear();
      }
    }
    this.resize(width, $J.d2i((Math.fround(pos - WndOptions.MARGIN))));
  }
  hasInfo(index: number): boolean {
    return false;
  }
}

let $WndOptionsCondensed$1: any = null;
/** An anonymous class (WndOptionsCondensed.java:57). */
function WndOptionsCondensed$1(): any {
  return $WndOptionsCondensed$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
      this.$outer.onSelect(this.$cv_index);
    }
    $c($index): this {
      this.$cv_index = $index;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndOptionsCondensed$1', []);
}

$J.define(WndOptionsCondensed, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndOptionsCondensed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions', ctors: { 'java.lang.String,java.lang.String,java.lang.String[]': '_WndOptionsCondensed$String$String$StringArr', 'com.watabou.noosa.Image,java.lang.String,java.lang.String,java.lang.String[]': '_WndOptionsCondensed$Image$String$String$StringArr' } });
$J.module(() => {
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
});
