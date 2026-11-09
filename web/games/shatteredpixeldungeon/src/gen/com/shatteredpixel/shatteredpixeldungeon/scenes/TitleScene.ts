// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/scenes/TitleScene.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JDate } from '../../../../../jre/index.ts';
import { PixelScene } from './PixelScene.ts';
import { StyledButton } from '../ui/StyledButton.ts';

let Assets$Music, Badges, Badges$Badge, Chrome$Type, Dungeon, GamesInProgress, SPDSettings, ShatteredPixelDungeon, BannerSprites, BannerSprites$Type, Fireball, Languages$Status, Messages, AboutScene, ChangesScene, HeroSelectScene, JournalScene, NewsScene, RankingsScene, StartScene, SupporterScene, News, Updates, CharSprite, ExitButton, IconButton, Icons, TitleBackground, Window, WndOptions, WndSettings, WndVictoryCongrats, Blending, PointerEvent$Type, BitmapText, Camera, Game, Image, PointerArea, Music, Tweener, ColorMath, DeviceCompat, GameMath;

export class TitleScene extends PixelScene {
  title_: Image = null;
  leftFB: Fireball = null;
  rightFB: Fireball = null;
  signs: Image = null;
  btnPlay: StyledButton = null;
  btnSupport: StyledButton = null;
  btnRankings: StyledButton = null;
  btnJournal: StyledButton = null;
  btnNews: StyledButton = null;
  btnChanges: StyledButton = null;
  btnSettings: StyledButton = null;
  btnAbout: StyledButton = null;
  version: BitmapText = null;
  btnFade: IconButton = null;
  btnExit: ExitButton = null;
  uiAlpha: number = 0;
  _TitleScene(): this {
    this._PixelScene();
    return this;
  }
  create(): void {
    super.create();
    Music.INSTANCE.playTracks([Assets$Music.THEME_1, Assets$Music.THEME_2], [1, 1], false);
    PixelScene.uiCamera.visible_ = false;
    let w = Camera.main.width_;
    let h = Camera.main.height_;
    let insets = this.getCommonInsets();
    let BG = new TitleBackground()._TitleBackground(w, h);
    this.add$Gizmo(BG);
    w = $J.d2i(Math.fround(w - Math.fround(insets.left_ + insets.right_)));
    h = $J.d2i(Math.fround(h - Math.fround(insets.top_ + insets.bottom_)));
    this.title_ = BannerSprites.get(PixelScene.landscape() ? BannerSprites$Type.TITLE_LAND : BannerSprites$Type.TITLE_PORT);
    this.add$Gizmo(this.title_);
    let topRegion = Math.max(Math.fround(this.title_.height_ - 6), Math.fround(h * Math.fround(0.45)));
    this.title_.x = Math.fround(insets.left_ + Math.fround((Math.fround(w - this.title_.width())) / 2));
    this.title_.y = Math.fround(Math.fround(insets.top_ + 2) + Math.fround((Math.fround(topRegion - this.title_.height())) / 2));
    PixelScene.align$Visual(this.title_);
    if (PixelScene.landscape()) {
      this.leftFB = this.placeTorch(Math.fround(this.title_.x + 30), Math.fround(this.title_.y + 35));
      this.rightFB = this.placeTorch(Math.fround(Math.fround(this.title_.x + this.title_.width_) - 30), Math.fround(this.title_.y + 35));
    } else {
      this.leftFB = this.placeTorch(Math.fround(this.title_.x + 16), Math.fround(this.title_.y + 70));
      this.rightFB = this.placeTorch(Math.fround(Math.fround(this.title_.x + this.title_.width_) - 16), Math.fround(this.title_.y + 70));
    }
    this.signs = new (TitleScene$1())().$o(this)._Image$Image(BannerSprites.get(PixelScene.landscape() ? BannerSprites$Type.TITLE_GLOW_LAND : BannerSprites$Type.TITLE_GLOW_PORT)).$init_anon();
    this.signs.x = Math.fround(this.title_.x + Math.fround((Math.fround(this.title_.width() - this.signs.width())) / 2));
    this.signs.y = this.title_.y;
    this.add$Gizmo(this.signs);
    let GREY_TR = Chrome$Type.GREY_BUTTON_TR;
    this.btnPlay = new (TitleScene$2())().$o(this)._StyledButton$Type$String(GREY_TR, Messages.get$Object$String$ObjectArr(this, 'enter', []));
    this.btnPlay.icon$Image(Icons.get$Icons(Icons.ENTER));
    this.add$Gizmo(this.btnPlay);
    this.btnSupport = new TitleScene$SupportButton()._TitleScene$SupportButton(GREY_TR, Messages.get$Object$String$ObjectArr(this, 'support', []));
    this.add$Gizmo(this.btnSupport);
    this.btnRankings = new (TitleScene$3())().$o(this)._StyledButton$Type$String(GREY_TR, Messages.get$Object$String$ObjectArr(this, 'rankings', []));
    this.btnRankings.icon$Image(Icons.get$Icons(Icons.RANKINGS));
    this.add$Gizmo(this.btnRankings);
    Dungeon.daily = Dungeon.dailyReplay = false;
    this.btnJournal = new (TitleScene$4())().$o(this)._StyledButton$Type$String(GREY_TR, Messages.get$Object$String$ObjectArr(this, 'journal', []));
    this.btnJournal.icon$Image(Icons.get$Icons(Icons.JOURNAL));
    this.add$Gizmo(this.btnJournal);
    this.btnNews = new TitleScene$NewsButton()._TitleScene$NewsButton(GREY_TR, Messages.get$Object$String$ObjectArr(this, 'news', []));
    this.btnNews.icon$Image(Icons.get$Icons(Icons.NEWS));
    this.add$Gizmo(this.btnNews);
    this.btnChanges = new TitleScene$ChangesButton()._TitleScene$ChangesButton(GREY_TR, Messages.get$Object$String$ObjectArr(this, 'changes', []));
    this.btnChanges.icon$Image(Icons.get$Icons(Icons.CHANGES));
    this.add$Gizmo(this.btnChanges);
    this.btnSettings = new TitleScene$SettingsButton()._TitleScene$SettingsButton(GREY_TR, Messages.get$Object$String$ObjectArr(this, 'settings', []));
    this.add$Gizmo(this.btnSettings);
    this.btnAbout = new (TitleScene$5())().$o(this)._StyledButton$Type$String(GREY_TR, Messages.get$Object$String$ObjectArr(this, 'about', []));
    this.btnAbout.icon$Image(Icons.get$Icons(Icons.SHPX));
    this.add$Gizmo(this.btnAbout);
    let BTN_HEIGHT = 20;
    let GAP = $J.idiv($J.d2i((Math.fround(Math.fround(h - topRegion) - Math.imul((PixelScene.landscape() ? 3 : 4), BTN_HEIGHT)))), 3);
    GAP = $J.idiv(GAP, PixelScene.landscape() ? 3 : 5);
    GAP = Math.max(GAP, 2);
    let buttonAreaWidth = PixelScene.landscape() ? Math.fround(PixelScene.MIN_WIDTH_L - 6) : Math.fround(PixelScene.MIN_WIDTH_P - 2);
    let btnAreaLeft = Math.fround(insets.left_ + Math.fround((Math.fround(w - buttonAreaWidth)) / 2));
    if (PixelScene.landscape()) {
      this.btnPlay.setRect(btnAreaLeft, Math.fround(Math.fround(insets.top_ + topRegion) + GAP), Math.fround((Math.fround(buttonAreaWidth / 2)) - 1), Math.fround(BTN_HEIGHT));
      PixelScene.align$Component(this.btnPlay);
      this.btnSupport.setRect(Math.fround(this.btnPlay.right() + 2), this.btnPlay.top(), this.btnPlay.width(), Math.fround(BTN_HEIGHT));
      this.btnRankings.setRect(this.btnPlay.left(), Math.fround(this.btnPlay.bottom() + GAP), Math.fround((Math.floor(Math.fround(buttonAreaWidth / 3)) - 1)), Math.fround(BTN_HEIGHT));
      this.btnJournal.setRect(Math.fround(this.btnRankings.right() + 2), this.btnRankings.top(), this.btnRankings.width(), Math.fround(BTN_HEIGHT));
      this.btnNews.setRect(Math.fround(this.btnJournal.right() + 2), this.btnJournal.top(), this.btnRankings.width(), Math.fround(BTN_HEIGHT));
      this.btnSettings.setRect(this.btnRankings.left(), Math.fround(this.btnRankings.bottom() + GAP), this.btnRankings.width(), Math.fround(BTN_HEIGHT));
      this.btnChanges.setRect(Math.fround(this.btnSettings.right() + 2), this.btnSettings.top(), this.btnRankings.width(), Math.fround(BTN_HEIGHT));
      this.btnAbout.setRect(Math.fround(this.btnChanges.right() + 2), this.btnSettings.top(), this.btnRankings.width(), Math.fround(BTN_HEIGHT));
    } else {
      this.btnPlay.setRect(btnAreaLeft, Math.fround(Math.fround(insets.top_ + topRegion) + GAP), buttonAreaWidth, Math.fround(BTN_HEIGHT));
      PixelScene.align$Component(this.btnPlay);
      this.btnSupport.setRect(this.btnPlay.left(), Math.fround(this.btnPlay.bottom() + GAP), this.btnPlay.width(), Math.fround(BTN_HEIGHT));
      this.btnRankings.setRect(this.btnPlay.left(), Math.fround(this.btnSupport.bottom() + GAP), Math.fround((Math.fround(this.btnPlay.width() / 2)) - 1), Math.fround(BTN_HEIGHT));
      this.btnJournal.setRect(Math.fround(this.btnRankings.right() + 2), this.btnRankings.top(), this.btnRankings.width(), Math.fround(BTN_HEIGHT));
      this.btnNews.setRect(this.btnRankings.left(), Math.fround(this.btnRankings.bottom() + GAP), this.btnRankings.width(), Math.fround(BTN_HEIGHT));
      this.btnChanges.setRect(Math.fround(this.btnNews.right() + 2), this.btnNews.top(), this.btnNews.width(), Math.fround(BTN_HEIGHT));
      this.btnSettings.setRect(this.btnNews.left(), Math.fround(this.btnNews.bottom() + GAP), this.btnRankings.width(), Math.fround(BTN_HEIGHT));
      this.btnAbout.setRect(Math.fround(this.btnSettings.right() + 2), this.btnSettings.top(), this.btnSettings.width(), Math.fround(BTN_HEIGHT));
    }
    this.version = new BitmapText()._BitmapText$String$Font('v' + Game.version, PixelScene.pixelFont);
    this.version.measure();
    this.version.hardlight$int(8947848);
    this.version.x = Math.fround(Math.fround(Math.fround(insets.left_ + w) - this.version.width()) - (DeviceCompat.isDesktop() ? 4 : 8));
    this.version.y = Math.fround(Math.fround(Math.fround(insets.top_ + h) - this.version.height()) - (DeviceCompat.isDesktop() ? 2 : 4));
    this.add$Gizmo(this.version);
    this.btnFade = new (TitleScene$6())().$o(this)._IconButton$Image(Icons.CHEVRON.get());
    this.btnFade.icon$().originToCenter();
    this.btnFade.icon$().angle = 180;
    this.btnFade.setRect(Math.fround(btnAreaLeft + Math.fround((Math.fround(buttonAreaWidth - 16)) / 2)), Math.fround(((Camera.main.height_ - 16) | 0) - insets.bottom_), 16, 16);
    this.add$Gizmo(this.btnFade);
    let fadeResetter = new (TitleScene$7())().$o(this)._PointerArea$float$float$float$float(0, 0, Math.fround(Camera.main.width_), Math.fround(Camera.main.height_));
    this.add$Gizmo(fadeResetter);
    if (DeviceCompat.isDesktop()) {
      this.btnExit = new ExitButton()._ExitButton();
      this.btnExit.setPos(Math.fround(w - this.btnExit.width()), 0);
      this.add$Gizmo(this.btnExit);
    }
    Badges.loadGlobal();
    if (Badges.isUnlocked(Badges$Badge.VICTORY) && !SPDSettings.victoryNagged$()) {
      SPDSettings.victoryNagged$boolean(true);
      this.add$Gizmo(new WndVictoryCongrats()._WndVictoryCongrats());
    }
    this.fadeIn$();
  }
  updateFade(): void {
    let alpha = GameMath.gate(0, this.uiAlpha, 1);
    this.title_.am = alpha;
    this.leftFB.am = alpha;
    this.rightFB.am = alpha;
    this.btnPlay.enable(alpha !== Math.fround(0));
    this.btnSupport.enable(alpha !== Math.fround(0));
    this.btnRankings.enable(alpha !== Math.fround(0));
    this.btnJournal.enable(alpha !== Math.fround(0));
    this.btnNews.enable(alpha !== Math.fround(0));
    this.btnChanges.enable(alpha !== Math.fround(0));
    this.btnSettings.enable(alpha !== Math.fround(0));
    this.btnAbout.enable(alpha !== Math.fround(0));
    this.btnPlay.alpha$float(alpha);
    this.btnSupport.alpha$float(alpha);
    this.btnRankings.alpha$float(alpha);
    this.btnJournal.alpha$float(alpha);
    this.btnNews.alpha$float(alpha);
    this.btnChanges.alpha$float(alpha);
    this.btnSettings.alpha$float(alpha);
    this.btnAbout.alpha$float(alpha);
    this.version.alpha$float(alpha);
    this.btnFade.icon$().alpha$float(alpha);
    if (this.btnExit != null) {
      this.btnExit.enable(alpha !== Math.fround(0));
      this.btnExit.icon$().alpha$float(alpha);
    }
  }
  placeTorch(x: number, y: number): Fireball {
    let fb = new Fireball()._Fireball$();
    fb.x = Math.fround(x - Math.fround(fb.width() / 2));
    fb.y = Math.fround(y - fb.height());
    PixelScene.align$Visual(fb);
    this.add$Gizmo(fb);
    return fb;
  }
}

export class TitleScene$NewsButton extends StyledButton {
  unreadCount: number = 0;
  _TitleScene$NewsButton(type$: Chrome$Type, label: string): this {
    this._StyledButton$Type$String(type$, label);
    this.unreadCount = -1;
    if (SPDSettings.news$()) {
      News.checkForNews();
    }
    return this;
  }
  update(): void {
    super.update();
    if (this.unreadCount === -1 && News.articlesAvailable()) {
      let lastRead = SPDSettings.newsLastRead$();
      if (lastRead === 0n) {
        if (News.articles().get(0) != null) {
          SPDSettings.newsLastRead$long(News.articles().get(0).date.getTime());
        }
      } else {
        this.unreadCount = News.unreadArticles(new JDate(SPDSettings.newsLastRead$()));
        if (this.unreadCount > 0) {
          this.unreadCount = Math.min(this.unreadCount, 9);
          this.text$String(this.text$() + '(' + this.unreadCount + ')');
        }
      }
    }
    if (this.unreadCount > 0) {
      this.textColor(ColorMath.interpolate$int$int$float(16777215, Window.SHPX_COLOR, Math.fround(0.5 + Math.fround(Math.fround(Math.sin(Math.fround(Game.timeTotal * 5))) / 2))));
    }
  }
  onClick(): void {
    super.onClick();
    ShatteredPixelDungeon.switchNoFade$Class($J.cls(NewsScene));
  }
}

export class TitleScene$ChangesButton extends StyledButton {
  updateShown: boolean = false;
  _TitleScene$ChangesButton(type$: Chrome$Type, label: string): this {
    this._StyledButton$Type$String(type$, label);
    this.updateShown = false;
    if (SPDSettings.updates$()) {
      Updates.checkForUpdate();
    }
    return this;
  }
  update(): void {
    super.update();
    if (!this.updateShown && Updates.updateAvailable()) {
      this.updateShown = true;
      this.text$String(Messages.get$Class$String$ObjectArr($J.cls(TitleScene), 'update', []));
    }
    if (this.updateShown) {
      this.textColor(ColorMath.interpolate$int$int$float(16777215, Window.SHPX_COLOR, Math.fround(0.5 + Math.fround(Math.fround(Math.sin(Math.fround(Game.timeTotal * 5))) / 2))));
    }
  }
  onClick(): void {
    if (Updates.updateAvailable()) {
      let update = Updates.updateData();
      Game.scene().addToFront(new (TitleScene$ChangesButton$1())().$o(this)._WndOptions$Image$String$String$StringArr(Icons.get$Icons(Icons.CHANGES), update.versionName == null ? Messages.get$Object$String$ObjectArr(this, 'title', []) : Messages.get$Object$String$ObjectArr(this, 'versioned_title', [update.versionName]), update.desc_ == null ? Messages.get$Object$String$ObjectArr(this, 'desc', []) : update.desc_, [Messages.get$Object$String$ObjectArr(this, 'update', []), Messages.get$Object$String$ObjectArr(this, 'changes', [])]));
    } else {
      ChangesScene.changesSelected = 0;
      ShatteredPixelDungeon.switchNoFade$Class($J.cls(ChangesScene));
    }
  }
}

export class TitleScene$SettingsButton extends StyledButton {
  _TitleScene$SettingsButton(type$: Chrome$Type, label: string): this {
    this._StyledButton$Type$String(type$, label);
    if (Messages.lang().status() === Languages$Status.X_UNFINISH) {
      this.icon$Image(Icons.get$Icons(Icons.LANGS));
      this.icon_.hardlight$float$float$float(1.5, 0, 0);
    } else {
      this.icon$Image(Icons.get$Icons(Icons.PREFS));
    }
    return this;
  }
  update(): void {
    super.update();
    if (Messages.lang().status() === Languages$Status.X_UNFINISH) {
      this.textColor(ColorMath.interpolate$int$int$float(16777215, CharSprite.NEGATIVE, Math.fround(0.5 + Math.fround(Math.fround(Math.sin(Math.fround(Game.timeTotal * 5))) / 2))));
    }
  }
  onClick(): void {
    if (Messages.lang().status() === Languages$Status.X_UNFINISH) {
      WndSettings.last_index = 5;
    }
    Game.scene().add$Gizmo(new WndSettings()._WndSettings());
  }
}

export class TitleScene$SupportButton extends StyledButton {
  _TitleScene$SupportButton(type$: Chrome$Type, label: string): this {
    this._StyledButton$Type$String(type$, label);
    this.icon$Image(Icons.get$Icons(Icons.GOLD));
    this.textColor(Window.TITLE_COLOR);
    return this;
  }
  onClick(): void {
    ShatteredPixelDungeon.switchNoFade$Class($J.cls(SupporterScene));
  }
}

let $TitleScene$1: any = null;
/** An anonymous class (TitleScene.java:125). */
function TitleScene$1(): any {
  return $TitleScene$1 ??= $J.local(class extends Image {
    time: number = 0;
    $init_anon() {
      this.time = 0;
      return this;
    }
    update(): void {
      super.update();
      this.am = Math.max(0, Math.fround(Math.sin(this.time = Math.fround(this.time + Game.elapsed))));
      this.am = Math.min(this.am, this.$outer.title_.am);
      if (this.time >= 1.5 * 3.141592653589793) {
        this.time = 0;
      }
    }
    draw(): void {
      Blending.setLightMode();
      super.draw();
      Blending.setNormalMode();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene$1', []);
}

let $TitleScene$2: any = null;
/** An anonymous class (TitleScene.java:147). */
function TitleScene$2(): any {
  return $TitleScene$2 ??= $J.local(class extends StyledButton {
    onClick(): void {
      if (GamesInProgress.checkAll().size() === 0) {
        GamesInProgress.selectedClass = null;
        GamesInProgress.curSlot = 1;
        Game.switchScene$Class($J.cls(HeroSelectScene));
      } else {
        ShatteredPixelDungeon.switchNoFade$Class($J.cls(StartScene));
      }
    }
    onLongClick(): boolean {
      if (DeviceCompat.isDebug()) {
        GamesInProgress.selectedClass = null;
        GamesInProgress.curSlot = 1;
        Game.switchScene$Class($J.cls(HeroSelectScene));
        return true;
      }
      return super.onLongClick();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene$2', []);
}

let $TitleScene$3: any = null;
/** An anonymous class (TitleScene.java:177). */
function TitleScene$3(): any {
  return $TitleScene$3 ??= $J.local(class extends StyledButton {
    onClick(): void {
      ShatteredPixelDungeon.switchNoFade$Class($J.cls(RankingsScene));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene$3', []);
}

let $TitleScene$4: any = null;
/** An anonymous class (TitleScene.java:187). */
function TitleScene$4(): any {
  return $TitleScene$4 ??= $J.local(class extends StyledButton {
    onClick(): void {
      ShatteredPixelDungeon.switchNoFade$Class($J.cls(JournalScene));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene$4', []);
}

let $TitleScene$5: any = null;
/** An anonymous class (TitleScene.java:207). */
function TitleScene$5(): any {
  return $TitleScene$5 ??= $J.local(class extends StyledButton {
    onClick(): void {
      Game.switchScene$Class($J.cls(AboutScene));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene$5', []);
}

let $TitleScene$6$1: any = null;
/** An anonymous class (TitleScene.java:256). */
function TitleScene$6$1(): any {
  return $TitleScene$6$1 ??= $J.local(class extends Tweener {
    updateValues(progress: number): void {
      if (!this.$outer.$outer.btnFade.active) {
        this.$outer.$outer.uiAlpha = Math.fround(1 - progress);
        this.$outer.$outer.updateFade();
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene$6$1', []);
}

let $TitleScene$6: any = null;
/** An anonymous class (TitleScene.java:252). */
function TitleScene$6(): any {
  return $TitleScene$6 ??= $J.local(class extends IconButton {
    onClick(): void {
      this.enable(false);
      this.parent.add$Gizmo(new (TitleScene$6$1())().$o(this)._Tweener(this.parent, 0.5));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene$6', []);
}

let $TitleScene$7$1: any = null;
/** An anonymous class (TitleScene.java:276). */
function TitleScene$7$1(): any {
  return $TitleScene$7$1 ??= $J.local(class extends Tweener {
    updateValues(progress: number): void {
      this.$outer.$outer.uiAlpha = progress;
      this.$outer.$outer.updateFade();
      if (progress >= Math.fround(1)) {
        this.$outer.$outer.btnFade.enable(true);
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene$7$1', []);
}

let $TitleScene$7: any = null;
/** An anonymous class (TitleScene.java:272). */
function TitleScene$7(): any {
  return $TitleScene$7 ??= $J.local(class extends PointerArea {
    onSignal(event: PointerEvent): boolean {
      if (event != null && event.type_ === PointerEvent$Type.UP && !this.$outer.btnPlay.active) {
        this.parent.add$Gizmo(new (TitleScene$7$1())().$o(this)._Tweener(this.parent, 0.5));
      }
      return false;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene$7', []);
}

let $TitleScene$ChangesButton$1: any = null;
/** An anonymous class (TitleScene.java:428). */
function TitleScene$ChangesButton$1(): any {
  return $TitleScene$ChangesButton$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        Updates.launchUpdate(Updates.updateData());
      } else if (index === 1) {
        ChangesScene.changesSelected = 0;
        ShatteredPixelDungeon.switchNoFade$Class($J.cls(ChangesScene));
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene$ChangesButton$1', []);
}

$J.define(TitleScene, 'com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene', ctors: { '': '_TitleScene' } });
$J.define(TitleScene$NewsButton, 'com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene$NewsButton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.StyledButton', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.Chrome$Type,java.lang.String': '_TitleScene$NewsButton' } });
$J.define(TitleScene$ChangesButton, 'com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene$ChangesButton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.StyledButton', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.Chrome$Type,java.lang.String': '_TitleScene$ChangesButton' } });
$J.define(TitleScene$SettingsButton, 'com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene$SettingsButton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.StyledButton', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.Chrome$Type,java.lang.String': '_TitleScene$SettingsButton' } });
$J.define(TitleScene$SupportButton, 'com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene$SupportButton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.StyledButton', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.Chrome$Type,java.lang.String': '_TitleScene$SupportButton' } });
$J.module(() => {
  Assets$Music = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Music');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Badges$Badge = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges$Badge');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  GamesInProgress = $J.load('com.shatteredpixel.shatteredpixeldungeon.GamesInProgress');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  ShatteredPixelDungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon');
  BannerSprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.BannerSprites');
  BannerSprites$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.BannerSprites$Type');
  Fireball = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Fireball');
  Languages$Status = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Languages$Status');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  AboutScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.AboutScene');
  ChangesScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.ChangesScene');
  HeroSelectScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene');
  JournalScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.JournalScene');
  NewsScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.NewsScene');
  RankingsScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.RankingsScene');
  StartScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.StartScene');
  SupporterScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.SupporterScene');
  News = $J.load('com.shatteredpixel.shatteredpixeldungeon.services.news.News');
  Updates = $J.load('com.shatteredpixel.shatteredpixeldungeon.services.updates.Updates');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ExitButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ExitButton');
  IconButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.IconButton');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  TitleBackground = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TitleBackground');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  WndSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndSettings');
  WndVictoryCongrats = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndVictoryCongrats');
  Blending = $J.load('com.watabou.glwrap.Blending');
  PointerEvent$Type = $J.load('com.watabou.input.PointerEvent$Type');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  PointerArea = $J.load('com.watabou.noosa.PointerArea');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Tweener = $J.load('com.watabou.noosa.tweeners.Tweener');
  ColorMath = $J.load('com.watabou.utils.ColorMath');
  DeviceCompat = $J.load('com.watabou.utils.DeviceCompat');
  GameMath = $J.load('com.watabou.utils.GameMath');
});
