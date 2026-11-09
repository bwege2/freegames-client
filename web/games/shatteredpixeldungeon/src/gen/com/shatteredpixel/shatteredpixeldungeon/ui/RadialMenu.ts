// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/RadialMenu.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Window } from './Window.ts';

let Assets$Interfaces, Chrome, Chrome$Type, SPDSettings, CircleArc, PixelScene, Button, RenderedTextBlock, ControllerHandler, ColorBlock, Game, Image, Cursor, PointF;

export class RadialMenu extends Window {
  slots: number = 0;
  targetAngle_: number = 0;
  center_: PointF = null;
  selectionArc: CircleArc = null;
  titleTxt: RenderedTextBlock = null;
  descTxt: RenderedTextBlock = null;
  texts: string[] = null;
  icons: Image[] = null;
  selectedIdx: number = 0;
  mousePos: PointF = null;
  first_: boolean = false;
  _RadialMenu(title: string, desc: string, optionTexts: string[], optionIcons: Image[]): this {
    this._Window$int$int$NinePatch(0, 0, Chrome.get(Chrome$Type.BLANK));
    this.selectedIdx = -1;
    this.mousePos = new PointF()._PointF$();
    this.first_ = true;
    this.remove$Gizmo(this.shadow);
    let size = SPDSettings.interfaceSize$() === 0 ? 140 : 200;
    this.resize(Game.width, Game.height);
    this.slots = optionTexts.length;
    this.center_ = new PointF()._PointF$float$float(Math.fround($J.idiv(this.width_, 2)), Math.fround($J.idiv(this.height_, 2)));
    let length = SPDSettings.interfaceSize$() === 0 ? 57 : 80;
    this.selectionArc = new CircleArc()._CircleArc($J.idiv(120, this.slots), Math.fround(($J.idiv(size, 2) - 1) | 0));
    this.selectionArc.color$int$boolean(16777215, false);
    this.selectionArc.alpha$float(Math.fround(0.6));
    this.selectionArc.setSweep(Math.fround(1 / this.slots));
    this.selectionArc.point$PointF(this.center_);
    this.selectionArc.visible_ = false;
    this.add$Gizmo(this.selectionArc);
    let outerBG = RadialMenu.getBGTexture(size, false);
    outerBG.x = Math.fround((Math.fround(this.width_ - outerBG.width_)) / 2);
    outerBG.y = Math.fround((Math.fround(this.height_ - outerBG.height_)) / 2);
    PixelScene.align$Visual(outerBG);
    this.add$Gizmo(outerBG);
    this.texts = optionTexts;
    this.icons = optionIcons;
    for (let i = 0; i < this.slots; i++) {
      let iconCenter = new PointF()._PointF$().polar(Math.fround((Math.fround(Math.fround(PointF.PI2 / this.slots) * i)) - Math.fround(PointF.PI / 2)), Math.fround(length));
      iconCenter.offset$PointF(this.center_);
      optionIcons[i].x = Math.fround(iconCenter.x - Math.fround(optionIcons[i].width() / 2));
      optionIcons[i].y = Math.fround(iconCenter.y - Math.fround(optionIcons[i].height() / 2));
      PixelScene.align$Visual(optionIcons[i]);
      optionIcons[i].alpha$float(Math.fround(0.4));
      this.add$Gizmo(optionIcons[i]);
      let sep = new ColorBlock()._ColorBlock(Math.fround(($J.idiv(size, 2) - 2) | 0), 1, -16777216);
      sep.x = this.center_.x;
      sep.y = this.center_.y;
      sep.angle = Math.fround(Math.fround((Math.fround(Math.fround(360 / this.slots) * i)) + Math.fround(this.selectionArc.getSweep() * 180)) - 90);
      this.addToFront(sep);
    }
    let innerBG = RadialMenu.getBGTexture(size, true);
    innerBG.x = Math.fround((Math.fround(this.width_ - innerBG.width_)) / 2);
    innerBG.y = Math.fround((Math.fround(this.height_ - innerBG.height_)) / 2);
    PixelScene.align$Visual(innerBG);
    this.add$Gizmo(innerBG);
    this.descTxt = PixelScene.renderTextBlock$String$int(desc, 6);
    this.descTxt.align(RenderedTextBlock.CENTER_ALIGN);
    this.descTxt.maxWidth$int(SPDSettings.interfaceSize$() === 0 ? 80 : 100);
    this.descTxt.setPos(Math.fround(this.center_.x - Math.fround(this.descTxt.width() / 2)), Math.fround(this.center_.y - Math.fround(this.descTxt.height() / 4)));
    this.add$Gizmo(this.descTxt);
    this.titleTxt = PixelScene.renderTextBlock$String$int(title, 9);
    this.titleTxt.setPos(Math.fround(this.center_.x - Math.fround(this.titleTxt.width() / 2)), Math.fround(Math.fround(this.descTxt.top() - this.titleTxt.height()) - 6));
    PixelScene.align$Component(this.titleTxt);
    this.titleTxt.hardlight(Window.TITLE_COLOR);
    this.add$Gizmo(this.titleTxt);
    Cursor.captureCursor(true);
    let selector = new (RadialMenu$1())().$o(this)._Button();
    selector.setRect(0, 0, Math.fround(this.width_), Math.fround(this.height_));
    this.add$Gizmo(selector);
    return this;
  }
  onSelect(idx: number, alt: boolean): void {
  }
  destroy(): void {
    super.destroy();
    Cursor.captureCursor(false);
  }
  update(): void {
    super.update();
    let movement = Cursor.getCursorDelta();
    if (Math.fround(Math.abs(ControllerHandler.rightStickPosition.x)) >= Math.fround(0.4) || Math.fround(Math.abs(ControllerHandler.rightStickPosition.y)) >= Math.fround(0.4)) {
      movement.x = ControllerHandler.rightStickPosition.x;
      movement.y = ControllerHandler.rightStickPosition.y;
      this.first_ = false;
    } else if (movement.length() !== Math.fround(0) && !this.first_) {
      this.mousePos.offset$PointF(movement);
      if (this.mousePos.length() > Math.fround(Math.imul(PixelScene.defaultZoom, 20))) {
        this.mousePos.invScale(Math.fround(this.mousePos.length() / (Math.imul(PixelScene.defaultZoom, 20))));
      }
      movement = this.mousePos;
    }
    if (movement.length() !== Math.fround(0)) {
      if (this.first_) {
        this.first_ = false;
        return;
      }
      this.targetAngle_ = Math.fround(Math.fround(PointF.angle$float$float(movement.x, movement.y) / PointF.G2R) + 90);
      if (this.targetAngle_ < Math.fround(0)) {
        this.targetAngle_ = Math.fround(this.targetAngle_ + 360);
      }
      this.selectionArc.visible_ = true;
      this.selectionArc.angle = Math.fround(this.targetAngle_ + Math.fround(this.selectionArc.getSweep() * 180));
      let newSelect = $J.roundf(Math.fround((this.targetAngle_) / (Math.fround(360 / this.slots))));
      if (newSelect >= this.slots) {
        newSelect = 0;
      }
      if (newSelect !== this.selectedIdx) {
        this.selectedIdx = newSelect;
        for (let i = 0; i < this.slots; i++) {
          if (i === this.selectedIdx) {
            this.icons[i].alpha$float(1);
            this.titleTxt.text$String(this.texts[i]);
            this.titleTxt.setPos(Math.fround(this.center_.x - Math.fround(this.titleTxt.width() / 2)), Math.fround(Math.fround(this.descTxt.top() - this.titleTxt.height()) - 6));
            PixelScene.align$Component(this.titleTxt);
          } else {
            this.icons[i].alpha$float(Math.fround(0.4));
          }
        }
      }
    }
  }
  static getBGTexture(size: number, inner: boolean): Image {
    if (size >= 200) {
      if (!inner) {
        return new Image()._Image$Object$int$int$int$int(Assets$Interfaces.RADIAL_MENU, 0, 0, 200, 200);
      } else {
        return new Image()._Image$Object$int$int$int$int(Assets$Interfaces.RADIAL_MENU, 340, 0, 120, 120);
      }
    } else {
      if (!inner) {
        return new Image()._Image$Object$int$int$int$int(Assets$Interfaces.RADIAL_MENU, 200, 0, 140, 140);
      } else {
        return new Image()._Image$Object$int$int$int$int(Assets$Interfaces.RADIAL_MENU, 340, 120, 90, 90);
      }
    }
  }
}

let $RadialMenu$1: any = null;
/** An anonymous class (RadialMenu.java:116). */
function RadialMenu$1(): any {
  return $RadialMenu$1 ??= $J.local(class extends Button {
    onClick(): void {
      super.onClick();
      if (this.$outer.selectedIdx !== -1) {
        this.$outer.hide();
        this.$outer.onSelect(this.$outer.selectedIdx, false);
      }
    }
    onLongClick(): boolean {
      if (this.$outer.selectedIdx !== -1) {
        this.$outer.hide();
        this.$outer.onSelect(this.$outer.selectedIdx, true);
      }
      return true;
    }
    onRightClick(): void {
      super.onRightClick();
      if (this.$outer.selectedIdx !== -1) {
        this.$outer.hide();
        this.$outer.onSelect(this.$outer.selectedIdx, true);
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.RadialMenu$1', []);
}

$J.define(RadialMenu, 'com.shatteredpixel.shatteredpixeldungeon.ui.RadialMenu', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'java.lang.String,java.lang.String,java.lang.String[],com.watabou.noosa.Image[]': '_RadialMenu' } });
$J.module(() => {
  Assets$Interfaces = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Interfaces');
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  CircleArc = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CircleArc');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  Button = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Button');
  RenderedTextBlock = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RenderedTextBlock');
  ControllerHandler = $J.load('com.watabou.input.ControllerHandler');
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  Cursor = $J.load('com.watabou.noosa.ui.Cursor');
  PointF = $J.load('com.watabou.utils.PointF');
});
