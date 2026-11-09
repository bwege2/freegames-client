// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/changelist/WndChanges.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { WndTitledMessage } from '../../windows/WndTitledMessage.ts';

let PixelScene, PointerArea;

export class WndChanges extends WndTitledMessage {
  _WndChanges(icon: Image, title: string, message: string): this {
    this._WndTitledMessage$Image$String$String(icon, title, message);
    let blocker = new (WndChanges$1())().$o(this)._PointerArea$float$float$float$float(0, 0, Math.fround(PixelScene.uiCamera.width_), Math.fround(PixelScene.uiCamera.height_));
    blocker.camera_ = PixelScene.uiCamera;
    this.add$Gizmo(blocker);
    return this;
  }
}

let $WndChanges$1: any = null;
/** An anonymous class (WndChanges.java:35). */
function WndChanges$1(): any {
  return $WndChanges$1 ??= $J.local(class extends PointerArea {
    onClick(event: PointerEvent): void {
      this.$outer.onBackPressed();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.changelist.WndChanges$1', []);
}

$J.define(WndChanges, 'com.shatteredpixel.shatteredpixeldungeon.ui.changelist.WndChanges', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage', ctors: { 'com.watabou.noosa.Image,java.lang.String,java.lang.String': '_WndChanges' } });
$J.module(() => {
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  PointerArea = $J.load('com.watabou.noosa.PointerArea');
});
