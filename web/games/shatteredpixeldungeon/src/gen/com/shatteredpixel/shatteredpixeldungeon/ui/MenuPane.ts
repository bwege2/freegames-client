// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/MenuPane.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Component } from '../../../watabou/noosa/ui/Component.ts';
import { Button } from './Button.ts';

let Assets$Interfaces, Assets$Sounds, Challenges, Dungeon, SPDAction, SPDSettings, Document, Level$Feeling, Messages, GameScene, PixelScene, DangerIndicator, Icons, KeyDisplay, StatusPane, Toolbar$PickedUpItem, WndChallenges, WndGame, WndJournal, WndJournal$CatalogTab, WndKeyBindings, WndStory, WndTitledMessage, GameAction, BitmapText, Game, Image, NinePatch, Sample, DeviceCompat;

export class MenuPane extends Component {
  bg: Image = null;
  depthIcon: Image = null;
  depthText: BitmapText = null;
  depthButton: Button = null;
  challengeIcon: Image = null;
  challengeText: BitmapText = null;
  challengeButton: Button = null;
  btnJournal: MenuPane$JournalButton = null;
  btnMenu: MenuPane$MenuButton = null;
  pickedUp: Toolbar$PickedUpItem = null;
  version: BitmapText = null;
  versionOverflowBG: NinePatch = null;
  danger: DangerIndicator = null;
  static readonly WIDTH: number = 31;
  _MenuPane(): this {
    this._Component();
    return this;
  }
  createChildren(): void {
    super.createChildren();
    this.bg = new Image()._Image$Object$int$int$int$int(Assets$Interfaces.MENU, 1, 0, 31, 21);
    this.add$Gizmo(this.bg);
    this.versionOverflowBG = new NinePatch()._NinePatch$Object$int$int$int$int$int$int$int$int(this.bg.texture_, 1, 22, 6, 8, 3, 0, 2, 0);
    this.add$Gizmo(this.versionOverflowBG);
    this.version = new BitmapText()._BitmapText$String$Font('v' + Game.version, PixelScene.pixelFont);
    this.version.hardlight$int(13291458);
    this.add$Gizmo(this.version);
    this.depthIcon = Icons.get$Feeling(Dungeon.level.feeling);
    this.add$Gizmo(this.depthIcon);
    this.depthText = new BitmapText()._BitmapText$String$Font(String(Dungeon.depth), PixelScene.pixelFont);
    this.depthText.hardlight$int(13291458);
    this.depthText.measure();
    this.add$Gizmo(this.depthText);
    this.depthButton = new (MenuPane$1())().$o(this)._Button();
    this.add$Gizmo(this.depthButton);
    if (Challenges.activeChallenges$() > 0) {
      this.challengeIcon = Icons.get$Icons(Icons.CHAL_COUNT);
      this.add$Gizmo(this.challengeIcon);
      this.challengeText = new BitmapText()._BitmapText$String$Font(String(Challenges.activeChallenges$()), PixelScene.pixelFont);
      this.challengeText.hardlight$int(13291458);
      this.challengeText.measure();
      this.add$Gizmo(this.challengeText);
      this.challengeButton = new (MenuPane$2())().$o(this)._Button();
      this.add$Gizmo(this.challengeButton);
    }
    this.btnJournal = new MenuPane$JournalButton()._MenuPane$JournalButton();
    this.add$Gizmo(this.btnJournal);
    this.btnMenu = new MenuPane$MenuButton()._MenuPane$MenuButton();
    this.add$Gizmo(this.btnMenu);
    this.danger = new DangerIndicator()._DangerIndicator();
    this.add$Gizmo(this.danger);
    this.add$Gizmo(this.pickedUp = new Toolbar$PickedUpItem()._Toolbar$PickedUpItem());
  }
  layout(): void {
    super.layout();
    this.bg.x = this.x;
    this.bg.y = this.y;
    this.version.scale_.set$float(PixelScene.align$float(0.5));
    this.version.measure();
    let rightMargin = Math.fround(DeviceCompat.isDesktop() ? 1 : 8);
    if (DeviceCompat.isDebug()) {
      rightMargin = 1;
    }
    let overFlow = Math.fround(this.version.width() - (Math.fround(Math.fround(this.bg.width() - 4) - rightMargin)));
    if (overFlow >= Math.fround(1)) {
      this.version.x = Math.fround(Math.fround(this.x + 2) - overFlow);
      this.versionOverflowBG.size(Math.fround(overFlow + 3), 8);
      this.versionOverflowBG.x = Math.fround(this.version.x - 3);
      this.versionOverflowBG.y = this.y;
    } else {
      this.version.x = Math.fround(this.x + 3);
      this.versionOverflowBG.visible_ = false;
    }
    this.version.y = Math.fround(Math.fround(this.y + 3) - Math.fround((Math.fround(this.version.baseLine() * this.version.scale_.y)) / 2));
    this.version.y = Math.fround(this.version.y - Math.fround(0.001));
    PixelScene.align$Visual(this.version);
    this.btnMenu.setPos(Math.fround(Math.fround(this.x + MenuPane.WIDTH) - this.btnMenu.width()), this.y);
    this.btnJournal.setPos(Math.fround(Math.fround(this.btnMenu.left() - this.btnJournal.width()) + 2), this.y);
    this.depthIcon.x = Math.fround(Math.fround(Math.fround(this.btnJournal.left() - 7) + Math.fround((Math.fround(7 - this.depthIcon.width())) / 2)) - Math.fround(0.1));
    this.depthIcon.y = Math.fround(this.y + 8);
    PixelScene.align$Visual(this.depthIcon);
    this.depthText.scale_.set$float(PixelScene.align$float(Math.fround(0.67)));
    this.depthText.x = Math.fround(this.depthIcon.x + Math.fround((Math.fround(this.depthIcon.width() - this.depthText.width())) / 2));
    this.depthText.y = Math.fround(this.depthIcon.y + this.depthIcon.height());
    PixelScene.align$Visual(this.depthText);
    this.depthButton.setRect(this.depthIcon.x, this.depthIcon.y, this.depthIcon.width(), Math.fround(this.depthIcon.height() + this.depthText.height()));
    if (this.challengeIcon != null) {
      this.challengeIcon.x = Math.fround(Math.fround(Math.fround(this.btnJournal.left() - 14) + Math.fround((Math.fround(7 - this.challengeIcon.width())) / 2)) - Math.fround(0.1));
      this.challengeIcon.y = this.depthIcon.y;
      PixelScene.align$Visual(this.challengeIcon);
      this.challengeText.scale_.set$float(PixelScene.align$float(Math.fround(0.67)));
      this.challengeText.x = Math.fround(this.challengeIcon.x + Math.fround((Math.fround(this.challengeIcon.width() - this.challengeText.width())) / 2));
      this.challengeText.y = Math.fround(this.challengeIcon.y + this.challengeIcon.height());
      PixelScene.align$Visual(this.challengeText);
      this.challengeButton.setRect(this.challengeIcon.x, this.challengeIcon.y, this.challengeIcon.width(), Math.fround(this.challengeIcon.height() + this.challengeText.height()));
    }
    this.danger.setPos(Math.fround(Math.fround(this.x + MenuPane.WIDTH) - this.danger.width()), Math.fround(Math.fround(this.y + this.bg.height_) + 1));
    this.danger.setSize(Math.fround(this.camera_.width_ - this.danger.width()), this.danger.height());
  }
  pickup(item: Item, cell: number): void {
    this.pickedUp.reset(item, cell, this.btnJournal.centerX(), this.btnJournal.centerY());
  }
  flashForPage(doc: Document, page: string): void {
    this.btnJournal.flashingDoc = doc;
    this.btnJournal.flashingPage = page;
  }
  updateKeys(): void {
    this.btnJournal.updateKeyDisplay();
  }
}

export class MenuPane$JournalButton extends Button {
  bg: Image = null;
  journalIcon: Image = null;
  keyIcon: KeyDisplay = null;
  flashingDoc: Document = null;
  flashingPage: string = null;
  time: number = 0;
  _MenuPane$JournalButton(): this {
    this._Button();
    this.flashingDoc = null;
    this.flashingPage = null;
    this.width_ = Math.fround(this.bg.width_ + 4);
    this.height_ = Math.fround(this.bg.height_ + 10);
    return this;
  }
  keyAction(): GameAction {
    return SPDAction.JOURNAL;
  }
  createChildren(): void {
    super.createChildren();
    this.bg = new Image()._Image$Object$int$int$int$int(Assets$Interfaces.MENU_BTN, 2, 2, 13, 11);
    this.add$Gizmo(this.bg);
    this.journalIcon = new Image()._Image$Object$int$int$int$int(Assets$Interfaces.MENU_BTN, 31, 0, 11, 6);
    this.add$Gizmo(this.journalIcon);
    this.keyIcon = new KeyDisplay()._KeyDisplay();
    this.add$Gizmo(this.keyIcon);
    this.updateKeyDisplay();
  }
  layout(): void {
    super.layout();
    this.bg.x = Math.fround(this.x + 2);
    this.bg.y = Math.fround(this.y + 8);
    this.journalIcon.x = Math.fround(this.bg.x + Math.fround((Math.fround(this.bg.width() - this.journalIcon.width())) / 2));
    this.journalIcon.y = Math.fround(this.bg.y + Math.fround((Math.fround(this.bg.height() - this.journalIcon.height())) / 2));
    PixelScene.align$Visual(this.journalIcon);
    this.keyIcon.x = Math.fround(this.bg.x + 1);
    this.keyIcon.y = Math.fround(this.bg.y + 1);
    this.keyIcon.width_ = Math.fround(this.bg.width_ - 2);
    this.keyIcon.height_ = Math.fround(this.bg.height_ - 2);
    PixelScene.align$Visual(this.keyIcon);
  }
  update(): void {
    super.update();
    if (this.flashingPage != null) {
      this.journalIcon.am = Math.fround(Math.abs(Math.cos(Math.fround(StatusPane.FLASH_RATE * (this.time = Math.fround(this.time + Game.elapsed))))));
      this.keyIcon.am = this.journalIcon.am;
      this.bg.brightness(Math.fround(0.5 + this.journalIcon.am));
      if (this.time >= 3.141592653589793 / StatusPane.FLASH_RATE) {
        this.time = 0;
      }
    }
  }
  updateKeyDisplay(): void {
    this.keyIcon.updateKeys();
    this.keyIcon.visible_ = this.keyIcon.keyCount() > 0;
    this.journalIcon.visible_ = !this.keyIcon.visible_;
    if (this.keyIcon.keyCount() > 0) {
      this.bg.brightness(Math.fround(Math.fround(0.8) - (Math.fround(Math.min(6, this.keyIcon.keyCount()) / 20))));
    } else {
      this.bg.resetColor();
    }
  }
  onPointerDown(): void {
    this.bg.brightness(1.5);
    Sample.INSTANCE.play$Object(Assets$Sounds.CLICK);
  }
  onPointerUp(): void {
    if (this.keyIcon.keyCount() > 0) {
      this.bg.brightness(Math.fround(Math.fround(0.8) - (Math.fround(Math.min(6, this.keyIcon.keyCount()) / 20))));
    } else {
      this.bg.resetColor();
    }
  }
  onClick(): void {
    this.time = 0;
    this.keyIcon.am = this.journalIcon.am = 1;
    if (this.flashingPage != null) {
      if (this.flashingDoc === Document.ALCHEMY_GUIDE) {
        WndJournal.last_index = 2;
        GameScene.show(new WndJournal()._WndJournal());
      } else if (this.flashingDoc.pageNames().contains(this.flashingPage)) {
        if (this.flashingDoc === Document.ADVENTURERS_GUIDE) {
          WndJournal.last_index = 1;
        } else if (this.flashingDoc.isLoreDoc()) {
          WndJournal.last_index = 3;
          WndJournal$CatalogTab.currentItemIdx = 3;
        }
        GameScene.show(new (MenuPane$JournalButton$1())().$o(this)._WndStory$Image$String$String(this.flashingDoc.pageSprite$String(this.flashingPage), this.flashingDoc.pageTitle$String(this.flashingPage), this.flashingDoc.pageBody$String(this.flashingPage)));
        this.flashingDoc.readPage$String(this.flashingPage);
      } else {
        GameScene.show(new WndJournal()._WndJournal());
      }
      this.flashingPage = null;
    } else {
      GameScene.show(new WndJournal()._WndJournal());
    }
  }
  hoverText(): string {
    return Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), 'journal', []));
  }
}

export class MenuPane$MenuButton extends Button {
  image_: Image = null;
  _MenuPane$MenuButton(): this {
    this._Button();
    this.width_ = Math.fround(this.image_.width_ + 4);
    this.height_ = Math.fround(this.image_.height_ + 10);
    return this;
  }
  createChildren(): void {
    super.createChildren();
    this.image_ = new Image()._Image$Object$int$int$int$int(Assets$Interfaces.MENU_BTN, 17, 2, 12, 11);
    this.add$Gizmo(this.image_);
  }
  layout(): void {
    super.layout();
    this.image_.x = Math.fround(this.x + 2);
    this.image_.y = Math.fround(this.y + 8);
  }
  onPointerDown(): void {
    this.image_.brightness(1.5);
    Sample.INSTANCE.play$Object(Assets$Sounds.CLICK);
  }
  onPointerUp(): void {
    this.image_.resetColor();
  }
  onClick(): void {
    GameScene.show(new WndGame()._WndGame());
  }
  keyAction(): GameAction {
    return GameAction.BACK;
  }
  hoverText(): string {
    return Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), 'menu', []));
  }
}

let $MenuPane$1: any = null;
/** An anonymous class (MenuPane.java:96). */
function MenuPane$1(): any {
  return $MenuPane$1 ??= $J.local(class extends Button {
    hoverText(): string {
      if (Dungeon.level.feeling !== Level$Feeling.NONE) {
        return Dungeon.level.feeling.desc();
      } else {
        return null;
      }
    }
    onClick(): void {
      super.onClick();
      if (Dungeon.level.feeling === Level$Feeling.NONE) {
        GameScene.show(new WndJournal()._WndJournal());
      } else {
        GameScene.show(new WndTitledMessage()._WndTitledMessage$Image$String$String(Icons.getLarge(Dungeon.level.feeling), Messages.titleCase(Dungeon.level.feeling.title()), Dungeon.level.feeling.desc()));
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.MenuPane$1', []);
}

let $MenuPane$2: any = null;
/** An anonymous class (MenuPane.java:130). */
function MenuPane$2(): any {
  return $MenuPane$2 ??= $J.local(class extends Button {
    onClick(): void {
      GameScene.show(new WndChallenges()._WndChallenges(Dungeon.challenges, false));
    }
    hoverText(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(WndChallenges), 'title', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.MenuPane$2', []);
}

let $MenuPane$JournalButton$1: any = null;
/** An anonymous class (MenuPane.java:343). */
function MenuPane$JournalButton$1(): any {
  return $MenuPane$JournalButton$1 ??= $J.local(class extends WndStory {
    hide(): void {
      super.hide();
      if (SPDSettings.intro$()) {
        GameScene.endIntro();
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.MenuPane$JournalButton$1', []);
}

$J.define(MenuPane, 'com.shatteredpixel.shatteredpixeldungeon.ui.MenuPane', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_MenuPane' } });
$J.define(MenuPane$JournalButton, 'com.shatteredpixel.shatteredpixeldungeon.ui.MenuPane$JournalButton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Button', ctors: { '': '_MenuPane$JournalButton' } });
$J.define(MenuPane$MenuButton, 'com.shatteredpixel.shatteredpixeldungeon.ui.MenuPane$MenuButton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Button', ctors: { '': '_MenuPane$MenuButton' } });
$J.module(() => {
  Assets$Interfaces = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Interfaces');
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDAction = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDAction');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  Document = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Document');
  Level$Feeling = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level$Feeling');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  DangerIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.DangerIndicator');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  KeyDisplay = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.KeyDisplay');
  StatusPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.StatusPane');
  Toolbar$PickedUpItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar$PickedUpItem');
  WndChallenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndChallenges');
  WndGame = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndGame');
  WndJournal = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal');
  WndJournal$CatalogTab = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndJournal$CatalogTab');
  WndKeyBindings = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings');
  WndStory = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndStory');
  WndTitledMessage = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage');
  GameAction = $J.load('com.watabou.input.GameAction');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  NinePatch = $J.load('com.watabou.noosa.NinePatch');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  DeviceCompat = $J.load('com.watabou.utils.DeviceCompat');
});
