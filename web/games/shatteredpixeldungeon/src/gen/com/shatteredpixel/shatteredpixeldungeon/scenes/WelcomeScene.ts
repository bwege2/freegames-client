// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/scenes/WelcomeScene.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Collections, Exception, RuntimeException } from '../../../../../jre/index.ts';
import { PixelScene } from './PixelScene.ts';

let Assets$Music, Badges, Chrome$Type, Dungeon, GamesInProgress, Rankings, SPDSettings, ShatteredPixelDungeon, BannerSprites, BannerSprites$Type, Fireball, Document, Journal, Messages, ChangesScene, HeroSelectScene, TitleScene, Icons, StyledButton, TitleBackground, WndError, WndHardNotification, Blending, ControllerHandler, Camera, ColorBlock, Game, Image, Music, FileUtils;

export class WelcomeScene extends PixelScene {
  static readonly LATEST_UPDATE: number = 911;
  static triedCleaningTemp: boolean = false;
  _WelcomeScene(): this {
    this._PixelScene();
    return this;
  }
  create(): void {
    super.create();
    let previousVersion = SPDSettings.version$();
    if (!WelcomeScene.triedCleaningTemp && FileUtils.cleanTempFiles$()) {
      this.add$Gizmo(new (WelcomeScene$1())().$o(this)._WndHardNotification$Image$String$String$String$int(Icons.get$Icons(Icons.WARNING), Messages.get$Class$String$ObjectArr($J.cls(WndError), 'title', []), Messages.get$Object$String$ObjectArr(this, 'save_warning', []), Messages.get$Object$String$ObjectArr(this, 'continue', []), 5));
      return;
    }
    if (Game.versionCode === previousVersion && !SPDSettings.intro$()) {
      ShatteredPixelDungeon.switchNoFade$Class($J.cls(TitleScene));
      return;
    }
    Music.INSTANCE.playTracks([Assets$Music.THEME_1, Assets$Music.THEME_2], [1, 1], false);
    PixelScene.uiCamera.visible_ = false;
    let w = Camera.main.width_;
    let h = Camera.main.height_;
    let insets = this.getCommonInsets();
    let BG = new TitleBackground()._TitleBackground(w, h);
    this.add$Gizmo(BG);
    this.add$Gizmo(new ColorBlock()._ColorBlock(Math.fround(w), Math.fround(h), 1140850688));
    w = $J.d2i(Math.fround(w - Math.fround(insets.left_ + insets.right_)));
    h = $J.d2i(Math.fround(h - Math.fround(insets.top_ + insets.bottom_)));
    let title = BannerSprites.get(PixelScene.landscape() ? BannerSprites$Type.TITLE_LAND : BannerSprites$Type.TITLE_PORT);
    this.add$Gizmo(title);
    let topRegion = Math.max(Math.fround(title.height_ - 6), Math.fround(h * Math.fround(0.45)));
    title.x = Math.fround(insets.left_ + Math.fround((Math.fround(w - title.width())) / 2));
    title.y = Math.fround(Math.fround(insets.top_ + 2) + Math.fround((Math.fround(topRegion - title.height())) / 2));
    PixelScene.align$Visual(title);
    if (PixelScene.landscape()) {
      this.placeTorch(Math.fround(title.x + 30), Math.fround(title.y + 35));
      this.placeTorch(Math.fround(Math.fround(title.x + title.width_) - 30), Math.fround(title.y + 35));
    } else {
      this.placeTorch(Math.fround(title.x + 16), Math.fround(title.y + 70));
      this.placeTorch(Math.fround(Math.fround(title.x + title.width_) - 16), Math.fround(title.y + 70));
    }
    let signs = new (WelcomeScene$2())().$o(this)._Image$Image(BannerSprites.get(PixelScene.landscape() ? BannerSprites$Type.TITLE_GLOW_LAND : BannerSprites$Type.TITLE_GLOW_PORT)).$init_anon();
    signs.x = Math.fround(title.x + Math.fround((Math.fround(title.width() - signs.width())) / 2));
    signs.y = title.y;
    this.add$Gizmo(signs);
    let okay = new (WelcomeScene$3())().$o(this).$c(previousVersion)._StyledButton$Type$String(Chrome$Type.GREY_BUTTON_TR, Messages.get$Object$String$ObjectArr(this, 'continue', []));
    let buttonY = Math.fround(insets.top_ + Math.min(Math.fround(topRegion + (PixelScene.landscape() ? 60 : 120)), Math.fround((h - 24) | 0)));
    let buttonAreaWidth = PixelScene.landscape() ? Math.fround(PixelScene.MIN_WIDTH_L - 6) : Math.fround(PixelScene.MIN_WIDTH_P - 2);
    let btnAreaLeft = Math.fround(insets.left_ + Math.fround((Math.fround(w - buttonAreaWidth)) / 2));
    if (previousVersion !== 0 && !SPDSettings.intro$()) {
      let changes = new (WelcomeScene$4())().$o(this).$c(previousVersion)._StyledButton$Type$String(Chrome$Type.GREY_BUTTON_TR, Messages.get$Class$String$ObjectArr($J.cls(TitleScene), 'changes', []));
      okay.setRect(btnAreaLeft, buttonY, Math.fround((Math.fround(buttonAreaWidth / 2)) - 1), 20);
      this.add$Gizmo(okay);
      changes.setRect(Math.fround(okay.right() + 1), buttonY, okay.width(), 20);
      changes.icon$Image(Icons.get$Icons(Icons.CHANGES));
      this.add$Gizmo(changes);
    } else {
      okay.text$String(Messages.get$Class$String$ObjectArr($J.cls(TitleScene), 'enter', []));
      okay.setRect(btnAreaLeft, buttonY, buttonAreaWidth, 20);
      okay.icon$Image(Icons.get$Icons(Icons.ENTER));
      this.add$Gizmo(okay);
    }
    let text = PixelScene.renderTextBlock$int(6);
    let message: string;
    if (previousVersion === 0 || SPDSettings.intro$()) {
      message = Document.INTROS.pageBody$int(0);
    } else if (previousVersion <= Game.versionCode) {
      if (previousVersion < WelcomeScene.LATEST_UPDATE) {
        message = Messages.get$Object$String$ObjectArr(this, 'update_intro', []);
        message += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'update_msg', []);
      } else {
        message = Messages.get$Object$String$ObjectArr(this, 'patch_intro', []);
        message += '\n';
        message += '\n' + Messages.get$Object$String$ObjectArr(this, 'patch_bugfixes', []);
        message += '\n' + Messages.get$Object$String$ObjectArr(this, 'patch_translations', []);
      }
    } else {
      message = Messages.get$Object$String$ObjectArr(this, 'what_msg', []);
    }
    text.text$String$int(message, Math.min((w - 20) | 0, 300));
    let titleBottom = Math.fround(title.y + title.height());
    let textSpace = Math.fround(Math.fround(okay.top() - titleBottom) - 4);
    text.setPos(Math.fround(insets.left_ + Math.fround((Math.fround(w - text.width())) / 2)), Math.fround((Math.fround(titleBottom + 2)) + Math.fround((Math.fround(textSpace - text.height())) / 2)));
    this.add$Gizmo(text);
    if (SPDSettings.intro$() && ControllerHandler.isControllerConnected()) {
      this.addToFront(new (WelcomeScene$5())().$o(this)._WndHardNotification$Image$String$String$String$int(Icons.CONTROLLER.get(), Messages.get$Class$String$ObjectArr($J.cls(WelcomeScene), 'controller_title', []), Messages.get$Class$String$ObjectArr($J.cls(WelcomeScene), 'controller_body', []), Messages.get$Class$String$ObjectArr($J.cls(WelcomeScene), 'controller_okay', []), 0));
    }
  }
  placeTorch(x: number, y: number): void {
    let fb = new Fireball()._Fireball$();
    fb.x = Math.fround(x - Math.fround(fb.width() / 2));
    fb.y = Math.fround(y - fb.height());
    PixelScene.align$Visual(fb);
    this.add$Gizmo(fb);
  }
  updateVersion(previousVersion: number): void {
    if (previousVersion < WelcomeScene.LATEST_UPDATE) {
      Badges.loadGlobal();
      Journal.loadGlobal();
      try {
        Rankings.INSTANCE.load();
        for (let rec of $J.toArrayInto(Rankings.INSTANCE.records.toArray(), $J.newArray(0, null))) {
          try {
            Rankings.INSTANCE.loadGameData(rec);
            Rankings.INSTANCE.saveGameData(rec);
          } catch ($e0) {
            if ($J.isa($e0, Exception)) {
              let e = $J.exc($e0);
              rec.gameData = null;
              Game.reportException(new RuntimeException('Rankings Updating Failed!', e));
            } else {
              throw $e0;
            }
          }
        }
        if (Rankings.INSTANCE.latestDaily != null) {
          try {
            Rankings.INSTANCE.loadGameData(Rankings.INSTANCE.latestDaily);
            Rankings.INSTANCE.saveGameData(Rankings.INSTANCE.latestDaily);
          } catch ($e1) {
            if ($J.isa($e1, Exception)) {
              let e = $J.exc($e1);
              Rankings.INSTANCE.latestDaily.gameData = null;
              Game.reportException(new RuntimeException('Rankings Updating Failed!', e));
            } else {
              throw $e1;
            }
          }
        }
        Collections.sort(Rankings.INSTANCE.records, Rankings.scoreComparator);
        Rankings.INSTANCE.save();
      } catch ($e2) {
        if ($J.isa($e2, Exception)) {
          let e = $J.exc($e2);
          FileUtils.deleteFile(Rankings.RANKINGS_FILE);
          Game.reportException(new RuntimeException('Rankings Updating Failed!', e));
        } else {
          throw $e2;
        }
      }
      Dungeon.daily = Dungeon.dailyReplay = false;
      Badges.saveGlobal$boolean(true);
      Journal.saveGlobal$boolean(true);
    }
    SPDSettings.version$int(Game.versionCode);
  }
  static $clinit() {
    WelcomeScene.triedCleaningTemp = false;
  }
}

let $WelcomeScene$1: any = null;
/** An anonymous class (WelcomeScene.java:73). */
function WelcomeScene$1(): any {
  return $WelcomeScene$1 ??= $J.local(class extends WndHardNotification {
    hide(): void {
      super.hide();
      WelcomeScene.triedCleaningTemp = true;
      Game.resetScene();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.WelcomeScene$1', []);
}

let $WelcomeScene$2: any = null;
/** An anonymous class (WelcomeScene.java:127). */
function WelcomeScene$2(): any {
  return $WelcomeScene$2 ??= $J.local(class extends Image {
    time: number = 0;
    $init_anon() {
      this.time = 0;
      return this;
    }
    update(): void {
      super.update();
      this.am = Math.max(0, Math.fround(Math.sin(this.time = Math.fround(this.time + Game.elapsed))));
      if (this.time >= 1.5 * 3.141592653589793) {
        this.time = 0;
      }
    }
    draw(): void {
      Blending.setLightMode();
      super.draw();
      Blending.setNormalMode();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.WelcomeScene$2', []);
}

let $WelcomeScene$3: any = null;
/** An anonymous class (WelcomeScene.java:146). */
function WelcomeScene$3(): any {
  return $WelcomeScene$3 ??= $J.local(class extends StyledButton {
    onClick(): void {
      super.onClick();
      if (this.$cv_previousVersion === 0 || SPDSettings.intro$()) {
        if (this.$cv_previousVersion > 0) {
          this.$outer.updateVersion(this.$cv_previousVersion);
        }
        SPDSettings.version$int(Game.versionCode);
        GamesInProgress.selectedClass = null;
        GamesInProgress.curSlot = GamesInProgress.firstEmpty();
        if (GamesInProgress.curSlot === -1 || Rankings.INSTANCE.totalNumber > 0) {
          SPDSettings.intro$boolean(false);
          Game.switchScene$Class($J.cls(TitleScene));
        } else {
          Game.switchScene$Class($J.cls(HeroSelectScene));
        }
      } else {
        this.$outer.updateVersion(this.$cv_previousVersion);
        Game.switchScene$Class($J.cls(TitleScene));
      }
    }
    $c($previousVersion): this {
      this.$cv_previousVersion = $previousVersion;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.WelcomeScene$3', []);
}

let $WelcomeScene$4: any = null;
/** An anonymous class (WelcomeScene.java:177). */
function WelcomeScene$4(): any {
  return $WelcomeScene$4 ??= $J.local(class extends StyledButton {
    onClick(): void {
      super.onClick();
      this.$outer.updateVersion(this.$cv_previousVersion);
      Game.switchScene$Class($J.cls(ChangesScene));
    }
    $c($previousVersion): this {
      this.$cv_previousVersion = $previousVersion;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.WelcomeScene$4', []);
}

let $WelcomeScene$5: any = null;
/** An anonymous class (WelcomeScene.java:230). */
function WelcomeScene$5(): any {
  return $WelcomeScene$5 ??= $J.local(class extends WndHardNotification {
    onBackPressed(): void {
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.WelcomeScene$5', []);
}

$J.define(WelcomeScene, 'com.shatteredpixel.shatteredpixeldungeon.scenes.WelcomeScene', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene', ctors: { '': '_WelcomeScene' }, clinit: true, lazy: ['triedCleaningTemp'] });
$J.module(() => {
  Assets$Music = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Music');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  GamesInProgress = $J.load('com.shatteredpixel.shatteredpixeldungeon.GamesInProgress');
  Rankings = $J.load('com.shatteredpixel.shatteredpixeldungeon.Rankings');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  ShatteredPixelDungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon');
  BannerSprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.BannerSprites');
  BannerSprites$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.BannerSprites$Type');
  Fireball = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Fireball');
  Document = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Document');
  Journal = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Journal');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ChangesScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.ChangesScene');
  HeroSelectScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene');
  TitleScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  StyledButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.StyledButton');
  TitleBackground = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TitleBackground');
  WndError = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndError');
  WndHardNotification = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndHardNotification');
  Blending = $J.load('com.watabou.glwrap.Blending');
  ControllerHandler = $J.load('com.watabou.input.ControllerHandler');
  Camera = $J.load('com.watabou.noosa.Camera');
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  Music = $J.load('com.watabou.noosa.audio.Music');
  FileUtils = $J.load('com.watabou.utils.FileUtils');
});
