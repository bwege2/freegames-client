// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/scenes/ChangesScene.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { PixelScene } from './PixelScene.ts';

let Assets$Music, Chrome, Chrome$Type, ShatteredPixelDungeon, Languages, Messages, TitleScene, CharSprite, ExitButton, Icons, ScrollPane, StyledButton, TitleBackground, ChangeInfo, Pixel_Dungeon_Changes, WndChanges, WndChangesTabbed, v0_1_X_Changes, v0_2_X_Changes, v0_3_X_Changes, v0_4_X_Changes, v0_5_X_Changes, v0_6_X_Changes, v0_7_X_Changes, v0_8_X_Changes, v0_9_X_Changes, v1_X_Changes, v2_X_Changes, v3_X_Changes, v4_X_Changes, IconTitle, Camera, Game, Music, Component;

export class ChangesScene extends PixelScene {
  static changesSelected: number = 0;
  rightPanel: NinePatch = null;
  rightScroll: ScrollPane = null;
  changeTitle: IconTitle = null;
  changeBody: RenderedTextBlock = null;
  _ChangesScene(): this {
    this._PixelScene();
    return this;
  }
  create(): void {
    super.create();
    Music.INSTANCE.playTracks([Assets$Music.THEME_1, Assets$Music.THEME_2], [1, 1], false);
    let w = Camera.main.width_;
    let h = Camera.main.height_;
    let insets = this.getCommonInsets();
    let BG = new TitleBackground()._TitleBackground(w, h);
    w = $J.d2i(Math.fround(w - Math.fround(insets.left_ + insets.right_)));
    h = $J.d2i(Math.fround(h - Math.fround(insets.top_ + insets.bottom_)));
    let title = new IconTitle()._IconTitle$Image$String(Icons.CHANGES.get(), Messages.get$Object$String$ObjectArr(this, 'title', []));
    title.setSize(200, 0);
    title.setPos(Math.fround(insets.left_ + Math.fround((Math.fround(w - title.reqWidth())) / 2)), Math.fround(insets.top_ + Math.fround((Math.fround(20 - title.height())) / 2)));
    PixelScene.align$Component(title);
    this.add$Gizmo(title);
    let btnExit = new ExitButton()._ExitButton();
    btnExit.setPos(Math.fround(Math.fround(insets.left_ + w) - btnExit.width()), insets.top_);
    this.add$Gizmo(btnExit);
    let panel = Chrome.get(Chrome$Type.TOAST);
    let pw = (135 + panel.marginLeft() + panel.marginRight() - 2) | 0;
    let ph = (h - 36) | 0;
    if (Math.fround(h) >= PixelScene.MIN_HEIGHT_FULL && w >= 300) {
      panel.size(Math.fround(pw), Math.fround(ph));
      panel.x = Math.fround(Math.fround(Math.fround(insets.left_ + Math.fround(((w - pw) | 0) / 2)) - $J.idiv(pw, 2)) - 1);
      panel.y = Math.fround(insets.top_ + 20);
      this.rightPanel = Chrome.get(Chrome$Type.TOAST);
      this.rightPanel.size(Math.fround(pw), Math.fround(ph));
      this.rightPanel.x = Math.fround(Math.fround(Math.fround(((w - pw) | 0) / 2) + $J.idiv(pw, 2)) + 1);
      this.rightPanel.y = 20;
      this.add$Gizmo(this.rightPanel);
      this.rightScroll = new ScrollPane()._ScrollPane(new Component()._Component());
      this.add$Gizmo(this.rightScroll);
      this.rightScroll.setRect(Math.fround(this.rightPanel.x + this.rightPanel.marginLeft()), Math.fround(Math.fround(this.rightPanel.y + this.rightPanel.marginTop()) - 1), Math.fround(this.rightPanel.innerWidth() + 2), Math.fround(this.rightPanel.innerHeight() + 2));
      this.rightScroll.scrollTo(0, 0);
      this.changeTitle = new IconTitle()._IconTitle$Image$String(Icons.get$Icons(Icons.CHANGES), Messages.get$Object$String$ObjectArr(this, 'right_title', []));
      this.changeTitle.setPos(0, 1);
      this.changeTitle.setSize(Math.fround(pw), 20);
      this.rightScroll.content().add$Gizmo(this.changeTitle);
      let body = Messages.get$Object$String$ObjectArr(this, 'right_body', []);
      this.changeBody = PixelScene.renderTextBlock$String$int(body, 6);
      this.changeBody.maxWidth$int((pw - panel.marginHor()) | 0);
      this.changeBody.setPos(0, Math.fround(this.changeTitle.bottom() + 2));
      this.rightScroll.content().add$Gizmo(this.changeBody);
    } else {
      panel.size(Math.fround(pw), Math.fround(ph));
      panel.x = Math.fround(insets.left_ + Math.fround(((w - pw) | 0) / 2));
      panel.y = Math.fround(insets.top_ + 20);
    }
    PixelScene.align$Visual(panel);
    this.add$Gizmo(panel);
    let changeInfos = new ArrayList();
    if (Messages.lang() !== Languages.ENGLISH) {
      let langWarn = new ChangeInfo()._ChangeInfo('', true, Messages.get$Object$String$ObjectArr(this, 'lang_warn', []));
      langWarn.hardlight(CharSprite.WARNING);
      changeInfos.add(langWarn);
    }
    switch (ChangesScene.changesSelected) {
      case 0:
      default:
        v4_X_Changes.addAllChanges(changeInfos);
        break;
      case 1:
        v3_X_Changes.addAllChanges(changeInfos);
        break;
      case 2:
        v2_X_Changes.addAllChanges(changeInfos);
        break;
      case 3:
        v1_X_Changes.addAllChanges(changeInfos);
        break;
      case 4:
        v0_9_X_Changes.addAllChanges(changeInfos);
        break;
      case 5:
        v0_8_X_Changes.addAllChanges(changeInfos);
        break;
      case 6:
        v0_7_X_Changes.addAllChanges(changeInfos);
        break;
      case 7:
        v0_6_X_Changes.addAllChanges(changeInfos);
        break;
      case 8:
        v0_5_X_Changes.addAllChanges(changeInfos);
        v0_4_X_Changes.addAllChanges(changeInfos);
        v0_3_X_Changes.addAllChanges(changeInfos);
        v0_2_X_Changes.addAllChanges(changeInfos);
        v0_1_X_Changes.addAllChanges(changeInfos);
        Pixel_Dungeon_Changes.addAllChanges(changeInfos);
        break;
    }
    let list = new (ChangesScene$1())().$o(this).$c(changeInfos)._ScrollPane(new Component()._Component());
    this.add$Gizmo(list);
    let content = list.content();
    content.clear();
    let posY = 0;
    let nextPosY = 0;
    let second = false;
    for (const $it1 = changeInfos.iterator(); $it1.hasNext(); ) {
      let info = $it1.next();
      if (info.major) {
        posY = nextPosY;
        second = false;
        info.setRect(0, posY, panel.innerWidth(), 0);
        content.add$Gizmo(info);
        posY = nextPosY = info.bottom();
      } else {
        if (!second) {
          second = true;
          info.setRect(0, posY, Math.fround(panel.innerWidth() / 2), 0);
          content.add$Gizmo(info);
          nextPosY = info.bottom();
        } else {
          second = false;
          info.setRect(Math.fround(panel.innerWidth() / 2), posY, Math.fround(panel.innerWidth() / 2), 0);
          content.add$Gizmo(info);
          nextPosY = Math.max(info.bottom(), nextPosY);
          posY = nextPosY;
        }
      }
    }
    content.setSize(panel.innerWidth(), Math.fround($J.d2i(Math.ceil(posY))));
    list.setRect(Math.fround(panel.x + panel.marginLeft()), Math.fround(Math.fround(panel.y + panel.marginTop()) - 1), Math.fround(panel.innerWidth() + 2), Math.fround(panel.innerHeight() + 2));
    list.scrollTo(0, 0);
    let left = Math.fround(list.left() - 4);
    if (ChangesScene.changesSelected <= 3) {
      left = this.setupChangesSelectionButton(0, 'v4.X', left, list.bottom(), 24);
      left = this.setupChangesSelectionButton(1, 'v3.X', left, list.bottom(), 24);
      left = this.setupChangesSelectionButton(2, 'v2.X', left, list.bottom(), 24);
      left = this.setupChangesSelectionButton(3, 'v1.X', left, list.bottom(), 24);
      left = this.setupChangesSelectionButton(4, 'PreRelease->', left, list.bottom(), 53);
    } else {
      left = this.setupChangesSelectionButton(3, '<-Release', left, list.bottom(), 40);
      left = this.setupChangesSelectionButton(4, 'v0.9', left, list.bottom(), 22);
      left = this.setupChangesSelectionButton(5, 'v0.8', left, list.bottom(), 22);
      left = this.setupChangesSelectionButton(6, 'v0.7', left, list.bottom(), 22);
      left = this.setupChangesSelectionButton(7, 'v0.6', left, list.bottom(), 22);
      left = this.setupChangesSelectionButton(8, 'v0.5-', left, list.bottom(), 23);
    }
    this.addToBack(BG);
    this.fadeIn$();
  }
  setupChangesSelectionButton(idx: number, text: string, left: number, top: number, width: number): number {
    let button = new (ChangesScene$2())().$o(this).$c(idx)._StyledButton$Type$String$int(Chrome$Type.GREY_BUTTON_TR, text, 8);
    if (ChangesScene.changesSelected !== idx) {
      button.textColor(12303291);
    }
    button.setRect(left, top, width, Math.fround(ChangesScene.changesSelected === idx ? 19 : 15));
    this.addToBack(button);
    return Math.fround(button.right() - 2);
  }
  updateChangesText(icon: Image, title: string, messages: string[]): void {
    if (this.changeTitle != null) {
      this.changeTitle.icon(icon);
      this.changeTitle.label$String(title);
      this.changeTitle.setPos(this.changeTitle.left(), this.changeTitle.top());
      let message = '';
      for (let i = 0; i < messages.length; i++) {
        message += messages[i];
        if (i !== ((messages.length - 1) | 0)) {
          message += '\n\n';
        }
      }
      this.changeBody.text$String(message);
      this.rightScroll.content().setSize(this.rightScroll.width(), Math.fround(this.changeBody.bottom() + 2));
      this.rightScroll.setSize(this.rightScroll.width(), this.rightScroll.height());
      this.rightScroll.scrollTo(0, 0);
    } else {
      if (messages.length === 1) {
        this.addToFront(new WndChanges()._WndChanges(icon, title, messages[0]));
      } else {
        this.addToFront(new WndChangesTabbed()._WndChangesTabbed(icon, title, messages));
      }
    }
  }
  static showChangeInfo(icon: Image, title: string, messages: string[]): void {
    let s = Game.scene();
    if (s instanceof ChangesScene) {
      (s).updateChangesText(icon, title, messages);
      return;
    }
    if (messages.length === 1) {
      s.addToFront(new WndChanges()._WndChanges(icon, title, messages[0]));
    } else {
      s.addToFront(new WndChangesTabbed()._WndChangesTabbed(icon, title, messages));
    }
  }
  onBackPressed(): void {
    ShatteredPixelDungeon.switchNoFade$Class($J.cls(TitleScene));
  }
  static $clinit() {
    ChangesScene.changesSelected = 0;
  }
}

let $ChangesScene$1: any = null;
/** An anonymous class (ChangesScene.java:194). */
function ChangesScene$1(): any {
  return $ChangesScene$1 ??= $J.local(class extends ScrollPane {
    onClick(x: number, y: number): void {
      for (const $it0 = this.$cv_changeInfos.iterator(); $it0.hasNext(); ) {
        let info = $it0.next();
        if (info.onClick(x, y)) {
          return;
        }
      }
    }
    $c($changeInfos): this {
      this.$cv_changeInfos = $changeInfos;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.ChangesScene$1', []);
}

let $ChangesScene$2: any = null;
/** An anonymous class (ChangesScene.java:273). */
function ChangesScene$2(): any {
  return $ChangesScene$2 ??= $J.local(class extends StyledButton {
    onClick(): void {
      super.onClick();
      if (ChangesScene.changesSelected !== this.$cv_idx) {
        ChangesScene.changesSelected = this.$cv_idx;
        ShatteredPixelDungeon.seamlessResetScene$();
      }
    }
    $c($idx): this {
      this.$cv_idx = $idx;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.ChangesScene$2', []);
}

$J.define(ChangesScene, 'com.shatteredpixel.shatteredpixeldungeon.scenes.ChangesScene', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene', ctors: { '': '_ChangesScene' }, clinit: true, lazy: ['changesSelected'] });
$J.module(() => {
  Assets$Music = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Music');
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  ShatteredPixelDungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon');
  Languages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Languages');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  TitleScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ExitButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ExitButton');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  ScrollPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ScrollPane');
  StyledButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.StyledButton');
  TitleBackground = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TitleBackground');
  ChangeInfo = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.ChangeInfo');
  Pixel_Dungeon_Changes = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.Pixel_Dungeon_Changes');
  WndChanges = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.WndChanges');
  WndChangesTabbed = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.WndChangesTabbed');
  v0_1_X_Changes = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.v0_1_X_Changes');
  v0_2_X_Changes = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.v0_2_X_Changes');
  v0_3_X_Changes = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.v0_3_X_Changes');
  v0_4_X_Changes = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.v0_4_X_Changes');
  v0_5_X_Changes = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.v0_5_X_Changes');
  v0_6_X_Changes = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.v0_6_X_Changes');
  v0_7_X_Changes = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.v0_7_X_Changes');
  v0_8_X_Changes = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.v0_8_X_Changes');
  v0_9_X_Changes = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.v0_9_X_Changes');
  v1_X_Changes = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.v1_X_Changes');
  v2_X_Changes = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.v2_X_Changes');
  v3_X_Changes = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.v3_X_Changes');
  v4_X_Changes = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.changelist.v4_X_Changes');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Component = $J.load('com.watabou.noosa.ui.Component');
});
