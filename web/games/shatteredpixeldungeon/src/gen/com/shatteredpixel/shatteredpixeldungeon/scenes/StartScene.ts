// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/scenes/StartScene.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JString } from '../../../../../jre/index.ts';
import { PixelScene } from './PixelScene.ts';
import { Button } from '../ui/Button.ts';

let Badges, Chrome, Chrome$Type, GamesInProgress, SPDSettings, ShatteredPixelDungeon, HeroSubClass, Journal, Messages, HeroSelectScene, TitleScene, ExitButton, Icons, StyledButton, TitleBackground, Window, IconTitle, WndGameInProgress, BitmapText, Camera, Game, Image;

export class StartScene extends PixelScene {
  static readonly SLOT_WIDTH: number = 120;
  static readonly SLOT_HEIGHT: number = 22;
  _StartScene(): this {
    this._PixelScene();
    return this;
  }
  create(): void {
    super.create();
    Badges.loadGlobal();
    Journal.loadGlobal();
    PixelScene.uiCamera.visible_ = false;
    let w = Camera.main.width_;
    let h = Camera.main.height_;
    let insets = this.getCommonInsets();
    let BG = new TitleBackground()._TitleBackground(w, h);
    this.add$Gizmo(BG);
    w = $J.d2i(Math.fround(w - Math.fround(insets.left_ + insets.right_)));
    h = $J.d2i(Math.fround(h - Math.fround(insets.top_ + insets.bottom_)));
    let btnExit = new ExitButton()._ExitButton();
    btnExit.setPos(Math.fround(Math.fround(insets.left_ + w) - btnExit.width()), insets.top_);
    this.add$Gizmo(btnExit);
    let title = new IconTitle()._IconTitle$Image$String(Icons.ENTER.get(), Messages.get$Object$String$ObjectArr(this, 'title', []));
    title.setSize(200, 0);
    title.setPos(Math.fround(insets.left_ + Math.fround((Math.fround(w - title.reqWidth())) / 2)), Math.fround(insets.top_ + Math.fround((Math.fround(20 - title.height())) / 2)));
    PixelScene.align$Component(title);
    this.add$Gizmo(title);
    let games = GamesInProgress.checkAll();
    let slotCount = Math.min(GamesInProgress.MAX_SLOTS, (games.size() + 1) | 0);
    let slotGap = (10 - slotCount) | 0;
    let slotsHeight = (Math.imul(slotCount, StartScene.SLOT_HEIGHT) + Math.imul(((slotCount - 1) | 0), slotGap)) | 0;
    slotsHeight = (slotsHeight + 14) | 0;
    while (slotGap >= 2 && Math.fround(slotsHeight) > (Math.fround(Math.fround(h - title.bottom()) - 2))) {
      slotGap--;
      slotsHeight = (slotsHeight - (slotCount - 1)) | 0;
    }
    let yPos = Math.fround(Math.fround(insets.top_ + Math.fround((Math.fround(Math.fround(((h - slotsHeight) | 0) + title.bottom()) + 2)) / 2)) - 4);
    yPos = Math.max(yPos, Math.fround(title.bottom() + 2));
    let slotLeft = Math.fround(insets.left_ + Math.fround(((w - StartScene.SLOT_WIDTH) | 0) / 2));
    for (const $it0 = games.iterator(); $it0.hasNext(); ) {
      let game = $it0.next();
      let existingGame = new StartScene$SaveSlotButton()._StartScene$SaveSlotButton();
      existingGame.set(game.slot_);
      existingGame.setRect(slotLeft, yPos, Math.fround(StartScene.SLOT_WIDTH), Math.fround(StartScene.SLOT_HEIGHT));
      yPos = Math.fround(yPos + ((StartScene.SLOT_HEIGHT + slotGap) | 0));
      PixelScene.align$Component(existingGame);
      this.add$Gizmo(existingGame);
    }
    if (games.size() < GamesInProgress.MAX_SLOTS) {
      let newGame = new StartScene$SaveSlotButton()._StartScene$SaveSlotButton();
      newGame.set(GamesInProgress.firstEmpty());
      newGame.setRect(slotLeft, yPos, Math.fround(StartScene.SLOT_WIDTH), Math.fround(StartScene.SLOT_HEIGHT));
      yPos = Math.fround(yPos + ((StartScene.SLOT_HEIGHT + slotGap) | 0));
      PixelScene.align$Component(newGame);
      this.add$Gizmo(newGame);
    }
    GamesInProgress.curSlot = 0;
    let sortText = '';
    switch (SPDSettings.gamesInProgressSort$()) {
      case 'level':
        sortText = Messages.get$Object$String$ObjectArr(this, 'sort_level', []);
        break;
      case 'last_played':
        sortText = Messages.get$Object$String$ObjectArr(this, 'sort_recent', []);
        break;
    }
    let btnSort = new (StartScene$1())().$o(this)._StyledButton$Type$String$int(Chrome$Type.TOAST_TR, sortText, 6);
    btnSort.textColor(13421772);
    if (Math.fround(yPos + 10) > Math.fround(Camera.main.height_)) {
      btnSort.setRect(Math.fround(Math.fround(slotLeft - btnSort.reqWidth()) - 6), Math.fround((Camera.main.height_ - 14) | 0), Math.fround(btnSort.reqWidth() + 4), 12);
    } else {
      btnSort.setRect(slotLeft, yPos, Math.fround(btnSort.reqWidth() + 4), 12);
    }
    if (games.size() >= 2) {
      this.add$Gizmo(btnSort);
    }
    this.fadeIn$();
  }
  onBackPressed(): void {
    ShatteredPixelDungeon.switchNoFade$Class($J.cls(TitleScene));
  }
}

export class StartScene$SaveSlotButton extends Button {
  bg: NinePatch = null;
  hero: Image = null;
  name_: RenderedTextBlock = null;
  lastPlayed: RenderedTextBlock = null;
  steps: Image = null;
  depth_: BitmapText = null;
  classIcon: Image = null;
  level_: BitmapText = null;
  slot_: number = 0;
  newGame: boolean = false;
  _StartScene$SaveSlotButton(): this {
    this._Button();
    return this;
  }
  createChildren(): void {
    super.createChildren();
    this.bg = Chrome.get(Chrome$Type.TOAST_TR);
    this.add$Gizmo(this.bg);
    this.name_ = PixelScene.renderTextBlock$int(9);
    this.add$Gizmo(this.name_);
    this.lastPlayed = PixelScene.renderTextBlock$int(6);
    this.add$Gizmo(this.lastPlayed);
  }
  set(slot: number): void {
    this.slot_ = slot;
    let info = GamesInProgress.check(slot);
    this.newGame = info == null;
    if (this.newGame) {
      this.name_.text$String(Messages.get$Class$String$ObjectArr($J.cls(StartScene), 'new', []));
      if (this.hero != null) {
        this.remove$Gizmo(this.hero);
        this.hero = null;
        this.remove$Gizmo(this.steps);
        this.steps = null;
        this.remove$Gizmo(this.depth_);
        this.depth_ = null;
        this.remove$Gizmo(this.classIcon);
        this.classIcon = null;
        this.remove$Gizmo(this.level_);
        this.level_ = null;
      }
    } else {
      if (info.subClass !== HeroSubClass.NONE) {
        this.name_.text$String(Messages.titleCase(info.subClass.title()));
      } else {
        this.name_.text$String(Messages.titleCase(info.heroClass.title()));
      }
      if (this.hero == null) {
        this.hero = new Image()._Image$Object$int$int$int$int(info.heroClass.spritesheet(), 0, Math.imul(15, info.armorTier), 12, 15);
        this.add$Gizmo(this.hero);
        this.steps = new Image()._Image$Image(Icons.get$Icons(Icons.STAIRS));
        this.add$Gizmo(this.steps);
        this.depth_ = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
        this.add$Gizmo(this.depth_);
        this.classIcon = new Image()._Image$Image(Icons.get$HeroClass(info.heroClass));
        this.add$Gizmo(this.classIcon);
        this.level_ = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
        this.add$Gizmo(this.level_);
      } else {
        this.hero.copy(new Image()._Image$Object$int$int$int$int(info.heroClass.spritesheet(), 0, Math.imul(15, info.armorTier), 12, 15));
        this.classIcon.copy(Icons.get$HeroClass(info.heroClass));
      }
      let diff = BigInt.asIntN(64, Game.realTime - info.lastPlayed);
      if (diff > BigInt.asIntN(64, BigInt.asIntN(64, BigInt.asIntN(64, BigInt.asIntN(64, 99n * 30n) * 24n) * 60n) * 60000n)) {
        this.lastPlayed.text$String(' ');
      } else if (diff < 60000n) {
        this.lastPlayed.text$String(Messages.get$Class$String$ObjectArr($J.cls(StartScene), 'one_minute_ago', []));
      } else if (diff < 7200000n) {
        this.lastPlayed.text$String(Messages.get$Class$String$ObjectArr($J.cls(StartScene), 'minutes_ago', [$J.ldiv(diff, 60000n)]));
      } else if (diff < 172800000n) {
        this.lastPlayed.text$String(Messages.get$Class$String$ObjectArr($J.cls(StartScene), 'hours_ago', [$J.ldiv(diff, 3600000n)]));
      } else if (diff < BigInt.asIntN(64, BigInt.asIntN(64, BigInt.asIntN(64, BigInt.asIntN(64, 2n * 30n) * 24n) * 60n) * 60000n)) {
        this.lastPlayed.text$String(Messages.get$Class$String$ObjectArr($J.cls(StartScene), 'days_ago', [$J.ldiv(diff, 86400000n)]));
      } else {
        this.lastPlayed.text$String(Messages.get$Class$String$ObjectArr($J.cls(StartScene), 'months_ago', [$J.ldiv(diff, (BigInt.asIntN(64, BigInt.asIntN(64, BigInt.asIntN(64, 30n * 24n) * 60n) * 60000n)))]));
      }
      this.depth_.text$String(String(info.depth_));
      this.depth_.measure();
      this.level_.text$String(String(info.level_));
      this.level_.measure();
      if (info.challenges > 0) {
        this.name_.hardlight(Window.TITLE_COLOR);
        this.lastPlayed.hardlight(Window.TITLE_COLOR);
        this.depth_.hardlight$int(Window.TITLE_COLOR);
        this.level_.hardlight$int(Window.TITLE_COLOR);
      } else {
        this.name_.resetColor();
        this.lastPlayed.resetColor();
        this.depth_.resetColor();
        this.level_.resetColor();
      }
      if (info.daily) {
        if (info.dailyReplay) {
          this.steps.hardlight$float$float$float(1, 0.5, 2);
        } else {
          this.steps.hardlight$float$float$float(0.5, 1, 2);
        }
      } else if (!(info.customSeed.length === 0)) {
        this.steps.hardlight$float$float$float(1, 1.5, Math.fround(0.67));
      }
    }
    this.layout();
  }
  layout(): void {
    super.layout();
    this.bg.x = this.x;
    this.bg.y = this.y;
    this.bg.size(this.width_, this.height_);
    if (this.hero != null) {
      this.hero.x = Math.fround(this.x + 8);
      this.hero.y = Math.fround(this.y + Math.fround((Math.fround(this.height_ - this.hero.height())) / 2));
      PixelScene.align$Visual(this.hero);
      this.name_.setPos(Math.fround(Math.fround(this.hero.x + this.hero.width()) + 6), Math.fround(this.y + Math.fround((Math.fround(Math.fround(Math.fround(this.height_ - this.name_.height()) - this.lastPlayed.height()) - 2)) / 2)));
      PixelScene.align$Component(this.name_);
      this.lastPlayed.setPos(Math.fround(Math.fround(this.hero.x + this.hero.width()) + 6), Math.fround(this.name_.bottom() + 2));
      this.classIcon.x = Math.fround(Math.fround(Math.fround(this.x + this.width_) - 24) + Math.fround((Math.fround(16 - this.classIcon.width())) / 2));
      this.classIcon.y = Math.fround(this.y + Math.fround((Math.fround(this.height_ - this.classIcon.height())) / 2));
      PixelScene.align$Visual(this.classIcon);
      this.level_.x = Math.fround(this.classIcon.x + Math.fround((Math.fround(this.classIcon.width() - this.level_.width())) / 2));
      this.level_.y = Math.fround(Math.fround(this.classIcon.y + Math.fround((Math.fround(this.classIcon.height() - this.level_.height())) / 2)) + 1);
      PixelScene.align$Visual(this.level_);
      this.steps.x = Math.fround(Math.fround(Math.fround(this.x + this.width_) - 40) + Math.fround((Math.fround(16 - this.steps.width())) / 2));
      this.steps.y = Math.fround(this.y + Math.fround((Math.fround(this.height_ - this.steps.height())) / 2));
      PixelScene.align$Visual(this.steps);
      this.depth_.x = Math.fround(this.steps.x + Math.fround((Math.fround(this.steps.width() - this.depth_.width())) / 2));
      this.depth_.y = Math.fround(Math.fround(this.steps.y + Math.fround((Math.fround(this.steps.height() - this.depth_.height())) / 2)) + 1);
      PixelScene.align$Visual(this.depth_);
    } else {
      this.name_.setPos(Math.fround(this.x + Math.fround((Math.fround(this.width_ - this.name_.width())) / 2)), Math.fround(this.y + Math.fround((Math.fround(this.height_ - this.name_.height())) / 2)));
      PixelScene.align$Component(this.name_);
    }
  }
  onClick(): void {
    if (this.newGame) {
      GamesInProgress.selectedClass = null;
      GamesInProgress.curSlot = this.slot_;
      Game.switchScene$Class($J.cls(HeroSelectScene));
    } else {
      Game.scene().add$Gizmo(new WndGameInProgress()._WndGameInProgress(this.slot_));
    }
  }
}

let $StartScene$1: any = null;
/** An anonymous class (StartScene.java:134). */
function StartScene$1(): any {
  return $StartScene$1 ??= $J.local(class extends StyledButton {
    onClick(): void {
      super.onClick();
      if ($J.equals(SPDSettings.gamesInProgressSort$(), 'level')) {
        SPDSettings.gamesInProgressSort$String('last_played');
      } else {
        SPDSettings.gamesInProgressSort$String('level');
      }
      ShatteredPixelDungeon.seamlessResetScene$();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.StartScene$1', []);
}

$J.define(StartScene, 'com.shatteredpixel.shatteredpixeldungeon.scenes.StartScene', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene', ctors: { '': '_StartScene' } });
$J.define(StartScene$SaveSlotButton, 'com.shatteredpixel.shatteredpixeldungeon.scenes.StartScene$SaveSlotButton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Button', ctors: { '': '_StartScene$SaveSlotButton' } });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  GamesInProgress = $J.load('com.shatteredpixel.shatteredpixeldungeon.GamesInProgress');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  ShatteredPixelDungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  Journal = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Journal');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  HeroSelectScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene');
  TitleScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene');
  ExitButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ExitButton');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  StyledButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.StyledButton');
  TitleBackground = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TitleBackground');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  WndGameInProgress = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndGameInProgress');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
});
