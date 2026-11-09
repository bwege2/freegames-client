// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/scenes/SupporterScene.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { PixelScene } from './PixelScene.ts';
import { Component } from '../../../watabou/noosa/ui/Component.ts';

let Chrome, Chrome$Type, ShatteredPixelDungeon, Languages, Messages, TitleScene, ExitButton, Icons, StyledButton, TitleBackground, Window, IconTitle, Camera, Game;

export class SupporterScene extends PixelScene {
  static readonly BTN_HEIGHT: number = 22;
  static readonly GAP: number = 2;
  _SupporterScene(): this {
    this._PixelScene();
    return this;
  }
  create(): void {
    super.create();
    PixelScene.uiCamera.visible_ = false;
    let w = Camera.main.width_;
    let h = Camera.main.height_;
    let insets = this.getCommonInsets();
    let elementWidth = PixelScene.landscape() ? 202 : 120;
    let BG = new TitleBackground()._TitleBackground(w, h);
    this.add$Gizmo(BG);
    w = $J.d2i(Math.fround(w - Math.fround(insets.right_ + insets.left_)));
    h = $J.d2i(Math.fround(h - Math.fround(insets.top_ + insets.bottom_)));
    let btnExit = new ExitButton()._ExitButton();
    btnExit.setPos(Math.fround(Math.fround(insets.left_ + w) - btnExit.width()), insets.top_);
    this.add$Gizmo(btnExit);
    let title = new IconTitle()._IconTitle$Image$String(Icons.GOLD.get(), Messages.get$Object$String$ObjectArr(this, 'title', []));
    title.setSize(200, 0);
    title.setPos(Math.fround(insets.left_ + Math.fround((Math.fround(w - title.reqWidth())) / 2)), Math.fround(insets.top_ + Math.fround((Math.fround(20 - title.height())) / 2)));
    PixelScene.align$Component(title);
    this.add$Gizmo(title);
    let msg = new SupporterScene$SupporterMessage()._SupporterScene$SupporterMessage();
    msg.setSize(Math.fround(elementWidth), 0);
    this.add$Gizmo(msg);
    let link = new (SupporterScene$1())().$o(this)._StyledButton$Type$String(Chrome$Type.GREY_BUTTON_TR, Messages.get$Object$String$ObjectArr(this, 'supporter_link', []));
    link.icon$Image(Icons.get$Icons(Icons.GOLD));
    link.textColor(Window.TITLE_COLOR);
    link.setSize(Math.fround(elementWidth), Math.fround(SupporterScene.BTN_HEIGHT));
    this.add$Gizmo(link);
    let elementHeight = Math.fround(Math.fround(msg.height() + SupporterScene.BTN_HEIGHT) + SupporterScene.GAP);
    let top = Math.fround(Math.fround(insets.top_ + 16) + Math.fround((Math.fround(((h - 16) | 0) - elementHeight)) / 2));
    let left = Math.fround(insets.left_ + Math.fround(((w - elementWidth) | 0) / 2));
    msg.setPos(left, top);
    PixelScene.align$Component(msg);
    link.setPos(left, Math.fround(msg.bottom() + SupporterScene.GAP));
    PixelScene.align$Component(link);
  }
  onBackPressed(): void {
    ShatteredPixelDungeon.switchNoFade$Class($J.cls(TitleScene));
  }
}

export class SupporterScene$SupporterMessage extends Component {
  bg: NinePatch = null;
  text_: RenderedTextBlock = null;
  icon_: Image = null;
  _SupporterScene$SupporterMessage(): this {
    this._Component();
    return this;
  }
  createChildren(): void {
    this.bg = Chrome.get(Chrome$Type.GREY_BUTTON_TR);
    this.add$Gizmo(this.bg);
    let message = Messages.get$Class$String$ObjectArr($J.cls(SupporterScene), 'intro', []);
    message += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(SupporterScene), 'patreon_msg', []);
    if (Messages.lang() !== Languages.ENGLISH) {
      message += '\n' + Messages.get$Class$String$ObjectArr($J.cls(SupporterScene), 'patreon_english', []);
    }
    message += '\n\n- Evan';
    this.text_ = PixelScene.renderTextBlock$String$int(message, 6);
    this.add$Gizmo(this.text_);
    this.icon_ = Icons.get$Icons(Icons.SHPX);
    this.add$Gizmo(this.icon_);
  }
  layout(): void {
    this.bg.x = this.x;
    this.bg.y = this.y;
    this.text_.maxWidth$int(($J.d2i(this.width_) - this.bg.marginHor()) | 0);
    this.text_.setPos(Math.fround(this.x + this.bg.marginLeft()), Math.fround(Math.fround(this.y + this.bg.marginTop()) + 1));
    this.icon_.y = Math.fround(Math.fround(this.text_.bottom() - this.icon_.height()) + 4);
    this.icon_.x = Math.fround(this.x + 25);
    this.height_ = Math.fround((Math.fround(this.text_.bottom() + 3)) - this.y);
    this.height_ = Math.fround(this.height_ + this.bg.marginBottom());
    this.bg.size(this.width_, this.height_);
  }
}

let $SupporterScene$1: any = null;
/** An anonymous class (SupporterScene.java:82). */
function SupporterScene$1(): any {
  return $SupporterScene$1 ??= $J.local(class extends StyledButton {
    onClick(): void {
      super.onClick();
      let link = 'https://www.patreon.com/ShatteredPixel';
      link += '?utm_source=shatteredpd';
      link += '&utm_medium=supporter_page';
      link += '&utm_campaign=ingame_link';
      Game.platform.openURI(link);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.SupporterScene$1', []);
}

$J.define(SupporterScene, 'com.shatteredpixel.shatteredpixeldungeon.scenes.SupporterScene', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene', ctors: { '': '_SupporterScene' } });
$J.define(SupporterScene$SupporterMessage, 'com.shatteredpixel.shatteredpixeldungeon.scenes.SupporterScene$SupporterMessage', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_SupporterScene$SupporterMessage' } });
$J.module(() => {
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  ShatteredPixelDungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon');
  Languages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Languages');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  TitleScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene');
  ExitButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ExitButton');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  StyledButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.StyledButton');
  TitleBackground = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TitleBackground');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
});
