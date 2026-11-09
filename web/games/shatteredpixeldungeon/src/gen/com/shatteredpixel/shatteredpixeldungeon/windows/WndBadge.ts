// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndBadge.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Badges, BadgeBanner, PixelScene, RenderedTextBlock, PointerArea;

export class WndBadge extends Window {
  static readonly MAX_WIDTH: number = 125;
  static readonly MARGIN: number = 4;
  _WndBadge(badge: Badges$Badge, unlocked: boolean): this {
    this._Window$();
    let icon = BadgeBanner.image(badge.image_);
    icon.scale_.set$float(2);
    if (!unlocked) {
      icon.brightness(Math.fround(0.4));
    }
    this.add$Gizmo(icon);
    let title = PixelScene.renderTextBlock$String$int(badge.title(), 9);
    title.maxWidth$int((WndBadge.MAX_WIDTH - Math.imul(WndBadge.MARGIN, 2)) | 0);
    title.align(RenderedTextBlock.CENTER_ALIGN);
    title.hardlight(Window.TITLE_COLOR);
    if (!unlocked) {
      title.hardlight(8947746);
    }
    this.add$Gizmo(title);
    let desc = badge.desc();
    let unlock = Badges.showCompletionProgress(badge);
    if (unlock != null) {
      desc += unlock;
    }
    let info = PixelScene.renderTextBlock$String$int(desc, 6);
    info.maxWidth$int((WndBadge.MAX_WIDTH - Math.imul(WndBadge.MARGIN, 2)) | 0);
    info.align(RenderedTextBlock.CENTER_ALIGN);
    if (!unlocked) {
      info.hardlight(8947848);
      info.setHightlighting$boolean$int(true, 8947746);
    }
    this.add$Gizmo(info);
    let w = Math.fround(Math.max(icon.width(), Math.max(title.width(), info.width())) + Math.imul(WndBadge.MARGIN, 2));
    icon.x = Math.fround((Math.fround(w - icon.width())) / 2);
    icon.y = Math.fround(WndBadge.MARGIN);
    PixelScene.align$Visual(icon);
    title.setPos(Math.fround((Math.fround(w - title.width())) / 2), Math.fround(Math.fround(icon.y + icon.height()) + WndBadge.MARGIN));
    PixelScene.align$Component(title);
    info.setPos(Math.fround((Math.fround(w - info.width())) / 2), Math.fround(title.bottom() + WndBadge.MARGIN));
    PixelScene.align$Component(info);
    this.resize($J.d2i(w), $J.d2i((Math.fround(info.bottom() + WndBadge.MARGIN))));
    if (unlocked) {
      BadgeBanner.highlight(icon, badge.image_);
    }
    let blocker = new (WndBadge$1())().$o(this)._PointerArea$float$float$float$float(0, 0, Math.fround(PixelScene.uiCamera.width_), Math.fround(PixelScene.uiCamera.height_));
    blocker.camera_ = PixelScene.uiCamera;
    this.add$Gizmo(blocker);
    return this;
  }
}

let $WndBadge$1: any = null;
/** An anonymous class (WndBadge.java:85). */
function WndBadge$1(): any {
  return $WndBadge$1 ??= $J.local(class extends PointerArea {
    onClick(event: PointerEvent): void {
      this.$outer.onBackPressed();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBadge$1', []);
}

$J.define(WndBadge, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBadge', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.Badges$Badge,boolean': '_WndBadge' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  BadgeBanner = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.BadgeBanner');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  RenderedTextBlock = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RenderedTextBlock');
  PointerArea = $J.load('com.watabou.noosa.PointerArea');
});
