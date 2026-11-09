// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndStory.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Chrome, Chrome$Type, PixelScene, IconTitle, Game, PointerArea;

export class WndStory extends Window {
  static readonly WIDTH_P: number = 125;
  static readonly WIDTH_L: number = 180;
  static readonly MARGIN: number = 2;
  ttl: IconTitle = null;
  tf: RenderedTextBlock = null;
  appearDelay: number = 0;
  disappearDelay: number = 0;
  _WndStory$String(text: string): this {
    this._WndStory$Image$String$String(null, null, text);
    return this;
  }
  _WndStory$Image$String$String(icon: Image, title: string, text: string): this {
    this._Window$int$int$NinePatch(0, 0, Chrome.get(Chrome$Type.SCROLL));
    let width = PixelScene.landscape() ? (WndStory.WIDTH_L - Math.imul(WndStory.MARGIN, 2)) | 0 : (WndStory.WIDTH_P - Math.imul(WndStory.MARGIN, 2)) | 0;
    let y = Math.fround(WndStory.MARGIN);
    if (icon != null && title != null) {
      this.ttl = new IconTitle()._IconTitle$Image$String(icon, title);
      this.ttl.setRect(Math.fround(WndStory.MARGIN), y, Math.fround((width - Math.imul(2, WndStory.MARGIN)) | 0), 0);
      y = Math.fround(this.ttl.bottom() + WndStory.MARGIN);
      this.add$Gizmo(this.ttl);
      this.ttl.tfLabel.invert();
    }
    this.tf = PixelScene.renderTextBlock$String$int(text, 6);
    this.tf.maxWidth$int(width);
    this.tf.invert();
    this.tf.setPos(Math.fround(WndStory.MARGIN), y);
    this.add$Gizmo(this.tf);
    let blocker = new (WndStory$1())().$o(this)._PointerArea$float$float$float$float(0, 0, Math.fround(PixelScene.uiCamera.width_), Math.fround(PixelScene.uiCamera.height_));
    blocker.camera_ = PixelScene.uiCamera;
    this.add$Gizmo(blocker);
    this.resize((width + Math.imul(2, WndStory.MARGIN)) | 0, $J.d2i((Math.fround(this.tf.bottom() + WndStory.MARGIN))));
    return this;
  }
  setDelays(appearDelay: number, disappearDelay: number): WndStory {
    this.appearDelay = appearDelay;
    if (appearDelay > Math.fround(0)) {
      this.shadow.visible_ = this.chrome.visible_ = this.tf.visible_ = false;
      if (this.ttl != null) {
        this.ttl.visible_ = false;
      }
    }
    this.disappearDelay = disappearDelay;
    return this;
  }
  onBackPressed(): void {
    if (this.appearDelay <= Math.fround(0) && this.disappearDelay <= Math.fround(0)) {
      super.onBackPressed();
    }
  }
  update(): void {
    super.update();
    if (this.appearDelay > Math.fround(0)) {
      this.appearDelay = Math.fround(this.appearDelay - Game.elapsed);
      if (this.appearDelay <= Math.fround(0)) {
        this.shadow.visible_ = this.chrome.visible_ = this.tf.visible_ = true;
        if (this.ttl != null) {
          this.ttl.visible_ = true;
        }
      }
    } else if (this.disappearDelay > Math.fround(0)) {
      this.disappearDelay = Math.fround(this.disappearDelay - Game.elapsed);
    }
  }
}

let $WndStory$1: any = null;
/** An anonymous class (WndStory.java:69). */
function WndStory$1(): any {
  return $WndStory$1 ??= $J.local(class extends PointerArea {
    onClick(event: PointerEvent): void {
      this.$outer.onBackPressed();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndStory$1', []);
}

$J.define(WndStory, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndStory', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.watabou.noosa.Image,java.lang.String,java.lang.String': '_WndStory$Image$String$String', 'java.lang.String': '_WndStory$String' } });
$J.module(() => {
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  Game = $J.load('com.watabou.noosa.Game');
  PointerArea = $J.load('com.watabou.noosa.PointerArea');
});
