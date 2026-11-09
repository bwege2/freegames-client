// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/scenes/HeroSelectScene.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Exception, JDate, JString, Locale, SimpleDateFormat, TimeZone } from '../../../../../jre/index.ts';
import { PixelScene } from './PixelScene.ts';
import { StyledButton } from '../ui/StyledButton.ts';
import { Component } from '../../../watabou/noosa/ui/Component.ts';
import { Window } from '../ui/Window.ts';

let Badges, Badges$Badge, Challenges, Chrome, Chrome$Type, Dungeon, GamesInProgress, Rankings, SPDSettings, HeroClass, Journal, Messages, InterlevelScene, InterlevelScene$Mode, TitleScene, ActionIndicator, CheckBox, ExitButton, IconButton, Icons, OptionSlider, RedButton, RenderedTextBlock, DungeonSeed, WndChallenges, WndHeroInfo, WndKeyBindings, WndMessage, WndOptions, WndTextInput, WndTitledMessage, WndVictoryCongrats, TextureCache, PointerEvent$Type, Camera, ColorBlock, Game, Image, PointerArea, SkinnedBlock, Tweener, DeviceCompat, GameMath, PlatformSupport, PointF, Random;

export class HeroSelectScene extends PixelScene {
  background: Image = null;
  fadeLeft: Image = null;
  fadeRight: Image = null;
  btnFade: IconButton = null;
  title_: RenderedTextBlock = null;
  heroBtns: ArrayList<StyledButton> = null;
  heroName: RenderedTextBlock = null;
  heroDesc: RenderedTextBlock = null;
  startBtn: StyledButton = null;
  infoButton: IconButton = null;
  btnOptions: IconButton = null;
  optionsPane: HeroSelectScene$GameOptions = null;
  btnExit: IconButton = null;
  insets: RectF = null;
  static heroWasRandomized: boolean = false;
  static chalWasRandomized: boolean = false;
  uiAlpha: number = 0;
  _HeroSelectScene(): this {
    this._PixelScene();
    this.heroBtns = new ArrayList();
    return this;
  }
  create(): void {
    super.create();
    Dungeon.hero = null;
    Badges.loadGlobal();
    Journal.loadGlobal();
    this.insets = Game.platform.getSafeInsets(PlatformSupport.INSET_BLK).scale(Math.fround(1 / PixelScene.defaultZoom));
    let w = (Math.fround(Math.fround(Camera.main.width_ - this.insets.left_) - this.insets.right_));
    let h = (Math.fround(Math.fround(Camera.main.height_ - this.insets.top_) - this.insets.bottom_));
    this.background = new (HeroSelectScene$1())().$o(this)._Image$Object$int$int$int$int(TextureCache.createSolid(-13816015), 0, 0, 800, 450);
    this.background.scale_.set$float(Math.fround(Camera.main.height_ / this.background.height_));
    this.background.x = Math.fround((Math.fround(Camera.main.width_ - this.background.width())) / 2);
    this.background.y = Math.fround((Math.fround(Camera.main.height_ - this.background.height())) / 2);
    PixelScene.align$Visual(this.background);
    this.add$Gizmo(this.background);
    this.fadeLeft = new Image()._Image$Object(TextureCache.createGradient([-16777216, -16777216, 0]));
    this.fadeLeft.x = Math.fround(this.background.x - 2);
    this.fadeLeft.scale_.set$float$float(3, this.background.height());
    this.add$Gizmo(this.fadeLeft);
    this.fadeRight = new Image()._Image$Image(this.fadeLeft);
    this.fadeRight.x = Math.fround(Math.fround(this.background.x + this.background.width()) + 2);
    this.fadeRight.y = Math.fround(this.background.y + this.background.height());
    this.fadeRight.angle = 180;
    this.add$Gizmo(this.fadeRight);
    this.title_ = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'title', []), 12);
    this.title_.hardlight(Window.TITLE_COLOR);
    PixelScene.align$Component(this.title_);
    this.add$Gizmo(this.title_);
    this.startBtn = new (HeroSelectScene$2())().$o(this)._StyledButton$Type$String(Chrome$Type.GREY_BUTTON_TR, '');
    this.startBtn.icon$Image(Icons.get$Icons(Icons.ENTER));
    this.startBtn.setSize(80, 21);
    this.startBtn.textColor(Window.TITLE_COLOR);
    this.add$Gizmo(this.startBtn);
    this.startBtn.visible_ = this.startBtn.active = false;
    this.infoButton = new (HeroSelectScene$3())().$o(this).$c(w)._IconButton$Image(Icons.get$Icons(Icons.INFO));
    this.infoButton.visible_ = this.infoButton.active = false;
    this.infoButton.setSize(20, 21);
    this.add$Gizmo(this.infoButton);
    for (let cl of HeroClass.values()) {
      let button = new HeroSelectScene$HeroBtn().$o(this)._HeroSelectScene$HeroBtn(cl);
      this.add$Gizmo(button);
      this.heroBtns.add(button);
    }
    this.optionsPane = new HeroSelectScene$GameOptions().$o(this)._HeroSelectScene$GameOptions();
    this.optionsPane.visible_ = this.optionsPane.active = false;
    this.optionsPane.layout();
    this.add$Gizmo(this.optionsPane);
    this.btnOptions = new (HeroSelectScene$4())().$o(this)._IconButton$Image(Icons.get$Icons(Icons.PREFS));
    this.updateOptionsColor();
    this.btnOptions.visible_ = false;
    if (!SPDSettings.intro$()) {
      this.add$Gizmo(this.btnOptions);
    }
    if (!Badges.isUnlocked(Badges$Badge.VICTORY) && !DeviceCompat.isDebug()) {
      Dungeon.challenges = 0;
      SPDSettings.challenges$int(0);
      SPDSettings.customSeed$String('');
    }
    if (PixelScene.landscape()) {
      let leftArea = Math.max(100, Math.fround(w / 3));
      let uiHeight = Math.min(Math.fround(h - 20), 300);
      let uiSpacing = Math.fround((Math.fround(uiHeight - 120)) / 2);
      if (uiHeight >= Math.fround(160)) {
        uiSpacing = Math.fround(uiSpacing - 5);
      }
      if (uiHeight >= Math.fround(180)) {
        uiSpacing = Math.fround(uiSpacing - 6);
      }
      this.background.x = Math.fround(this.background.x + Math.fround(this.insets.left_ + Math.fround(leftArea / 6)));
      let fadeLeftScale = Math.fround(Math.fround(47 * (Math.fround(leftArea - this.background.x))) / leftArea);
      this.fadeLeft.scale_ = new PointF()._PointF$float$float(Math.fround(3 + Math.max(0, fadeLeftScale)), this.background.height());
      this.title_.setPos(Math.fround(this.insets.left_ + Math.fround((Math.fround(leftArea - this.title_.width())) / 2)), Math.fround((Math.fround(h - uiHeight)) / 2));
      PixelScene.align$Component(this.title_);
      let btnWidth = (HeroSelectScene$HeroBtn.MIN_WIDTH + 15) | 0;
      let btnHeight = HeroSelectScene$HeroBtn.HEIGHT;
      if (uiHeight >= Math.fround(180)) {
        btnHeight = (btnHeight + 6) | 0;
      }
      let cols = $J.d2i(Math.ceil(Math.fround(this.heroBtns.size() / 2)));
      let curX = Math.fround(this.insets.left_ + Math.fround((Math.fround(Math.fround(leftArea - Math.imul(btnWidth, cols)) + ((cols - 1) | 0))) / 2));
      let curY = Math.fround(this.title_.bottom() + uiSpacing);
      let count = 0;
      for (const $it0 = this.heroBtns.iterator(); $it0.hasNext(); ) {
        let button = $it0.next();
        button.setRect(curX, curY, Math.fround(btnWidth), Math.fround(btnHeight));
        PixelScene.align$Component(button);
        curX = Math.fround(curX + ((btnWidth + 1) | 0));
        count++;
        if (count >= $J.idiv(((1 + this.heroBtns.size()) | 0), 2)) {
          curX = Math.fround(curX - ((Math.imul(btnWidth, count) + count) | 0));
          curY = Math.fround(curY + ((btnHeight + 1) | 0));
          if (this.heroBtns.size() % 2 !== 0) {
            curX = Math.fround(curX + Math.fround(btnWidth / 2));
          }
          count = 0;
        }
      }
      this.heroName = PixelScene.renderTextBlock$int(9);
      this.heroName.setPos(this.insets.left_, Math.fround(this.heroBtns.get((this.heroBtns.size() - 1) | 0).bottom() + 5));
      this.add$Gizmo(this.heroName);
      if (uiHeight >= Math.fround(160)) {
        this.heroDesc = PixelScene.renderTextBlock$int(6);
      } else {
        this.heroDesc = PixelScene.renderTextBlock$int(5);
      }
      this.heroDesc.align(RenderedTextBlock.CENTER_ALIGN);
      this.heroDesc.setPos(this.insets.left_, Math.fround(this.heroName.bottom() + 5));
      this.add$Gizmo(this.heroDesc);
      this.startBtn.text$String(Messages.titleCase(Messages.get$Object$String$ObjectArr(this, 'start', [])));
      this.startBtn.setSize(Math.fround(this.startBtn.reqWidth() + 8), 21);
      this.startBtn.setPos(Math.fround(this.insets.left_ + Math.fround((Math.fround(leftArea - this.startBtn.width())) / 2)), Math.fround(Math.fround(this.title_.top() + uiHeight) - this.startBtn.height()));
      PixelScene.align$Component(this.startBtn);
      this.btnFade = new (HeroSelectScene$5())().$o(this)._IconButton$Image(Icons.CHEVRON.get());
      this.btnFade.icon$().originToCenter();
      this.btnFade.icon$().angle = 270;
      this.btnFade.visible_ = this.btnFade.active = false;
      this.btnFade.setRect(Math.fround(this.startBtn.left() - 20), this.startBtn.top(), 20, 21);
      PixelScene.align$Component(this.btnFade);
      this.add$Gizmo(this.btnFade);
      this.btnOptions.setRect(this.startBtn.right(), this.startBtn.top(), 20, 21);
      this.optionsPane.setPos(this.btnOptions.right(), Math.fround(Math.fround(this.btnOptions.top() - this.optionsPane.height()) - 2));
      PixelScene.align$Component(this.optionsPane);
    } else {
      this.background.visible_ = false;
      let btnWidth = HeroSelectScene$HeroBtn.MIN_WIDTH;
      let curX = Math.fround(this.insets.left_ + Math.fround((Math.fround(w - Math.imul(btnWidth, this.heroBtns.size()))) / 2));
      if (curX > Math.fround(0)) {
        btnWidth = $J.d2i(Math.fround(btnWidth + Math.min(Math.fround(curX / (Math.fround(this.heroBtns.size() / 2))), 15)));
        curX = Math.fround(this.insets.left_ + Math.fround((Math.fround(w - Math.imul(btnWidth, this.heroBtns.size()))) / 2));
      }
      let curY = Math.fround(Math.fround(Math.fround(this.insets.top_ + h) - HeroSelectScene$HeroBtn.HEIGHT) + 3);
      for (const $it1 = this.heroBtns.iterator(); $it1.hasNext(); ) {
        let button = $it1.next();
        button.setRect(curX, curY, Math.fround(btnWidth), Math.fround(HeroSelectScene$HeroBtn.HEIGHT + this.insets.bottom_));
        curX = Math.fround(curX + btnWidth);
      }
      if (this.insets.bottom_ > Math.fround(0)) {
        let bar = new SkinnedBlock()._SkinnedBlock(Math.fround(Camera.main.width_), this.insets.bottom_, TextureCache.createSolid(-1442840576));
        bar.y = Math.fround(h + this.insets.top_);
        this.add$Gizmo(bar);
        let blocker = new PointerArea()._PointerArea$float$float$float$float(0, Math.fround(Camera.main.width_ - this.insets.bottom_), Math.fround(Camera.main.width_), this.insets.bottom_);
        this.add$Gizmo(blocker);
      }
      this.title_.setPos(Math.fround(this.insets.left_ + Math.fround((Math.fround(w - this.title_.width())) / 2)), Math.fround(this.insets.top_ + (Math.fround(Math.fround(Math.fround(h - HeroSelectScene$HeroBtn.HEIGHT) - this.title_.height()) - 4))));
      this.btnOptions.setRect(Math.fround(this.heroBtns.get(0).left() + 16), Math.fround((Camera.main.height_ - HeroSelectScene$HeroBtn.HEIGHT - 16) | 0), 20, 21);
      this.optionsPane.setPos(this.heroBtns.get(0).left(), 0);
    }
    this.btnExit = new ExitButton()._ExitButton();
    let ofs = PixelScene.landscape() ? 0 : 4;
    this.btnExit.setPos(Math.fround(Math.fround(Camera.main.width_ - this.btnExit.width()) - ofs), Math.fround(ofs));
    this.add$Gizmo(this.btnExit);
    this.btnExit.visible_ = this.btnExit.active = !SPDSettings.intro$();
    let fadeResetter = new (HeroSelectScene$6())().$o(this)._PointerArea$float$float$float$float(0, 0, Math.fround(Camera.main.width_), Math.fround(Camera.main.height_));
    this.add$Gizmo(fadeResetter);
    this.resetFade();
    if (GamesInProgress.selectedClass != null) {
      this.setSelectedHero(GamesInProgress.selectedClass);
    }
    if (Badges.isUnlocked(Badges$Badge.VICTORY) && !SPDSettings.victoryNagged$()) {
      SPDSettings.victoryNagged$boolean(true);
      this.add$Gizmo(new WndVictoryCongrats()._WndVictoryCongrats());
    }
    this.fadeIn$();
  }
  updateOptionsColor(): void {
    if (!(SPDSettings.customSeed$().length === 0)) {
      this.btnOptions.icon$().hardlight$float$float$float(1, 1.5, Math.fround(0.67));
    } else if (SPDSettings.challenges$() !== 0) {
      this.btnOptions.icon$().hardlight$float$float$float(2, Math.fround(1.33), 0.5);
    } else {
      this.btnOptions.icon$().resetColor();
    }
  }
  setSelectedHero(cl: HeroClass): void {
    GamesInProgress.selectedClass = cl;
    GamesInProgress.randomizedClass = false;
    try {
      this.background.texture(cl.splashArt());
    } catch ($e2) {
      if ($J.isa($e2, Exception)) {
        let e = $J.exc($e2);
        Game.reportException(e);
        this.background.texture(TextureCache.createSolid(-13816015));
        this.background.frame$int$int$int$int(0, 0, 800, 450);
      } else {
        throw $e2;
      }
    }
    this.background.visible_ = true;
    this.background.hardlight$float$float$float(1.5, 1.5, 1.5);
    let leftPortion = Math.max(100, Math.fround((Math.fround(Math.fround(Camera.main.width_ - this.insets.left_) - this.insets.right_)) / 3));
    if (PixelScene.landscape()) {
      this.heroName.text$String(Messages.titleCase(cl.title()));
      this.heroName.hardlight(Window.TITLE_COLOR);
      this.heroName.setPos(Math.fround(this.insets.left_ + Math.fround((Math.fround(Math.fround(leftPortion - this.heroName.width()) - 20)) / 2)), this.heroName.top());
      PixelScene.align$Component(this.heroName);
      this.heroDesc.text$String(cl.shortDesc());
      this.heroDesc.maxWidth$int(80);
      this.heroDesc.setPos(Math.fround(this.insets.left_ + Math.fround((Math.fround(leftPortion - this.heroDesc.width())) / 2)), Math.fround(this.heroName.bottom() + 5));
      PixelScene.align$Component(this.heroDesc);
      while (this.startBtn.top() < this.heroDesc.bottom()) {
        this.heroDesc.maxWidth$int((this.heroDesc.maxWidth$() + 10) | 0);
        this.heroDesc.setPos(Math.max(this.insets.left_, Math.fround((Math.fround(leftPortion - this.heroDesc.width())) / 2)), Math.fround(this.heroName.bottom() + 5));
        PixelScene.align$Component(this.heroDesc);
      }
      this.btnFade.visible_ = this.btnFade.active = true;
      this.startBtn.visible_ = this.startBtn.active = true;
      this.infoButton.visible_ = this.infoButton.active = true;
      this.infoButton.setPos(this.heroName.right(), Math.fround(this.heroName.top() + Math.fround((Math.fround(this.heroName.height() - this.infoButton.height())) / 2)));
      PixelScene.align$Component(this.infoButton);
      this.btnOptions.visible_ = this.btnOptions.active = !SPDSettings.intro$();
    } else {
      this.title_.visible_ = false;
      this.startBtn.visible_ = this.startBtn.active = true;
      this.startBtn.text$String(Messages.titleCase(cl.title()));
      this.startBtn.setSize(Math.fround(this.startBtn.reqWidth() + 8), 21);
      this.startBtn.setPos(Math.fround((Math.fround(Camera.main.width_ - this.startBtn.width())) / 2), (Math.fround(Math.fround(Math.fround(Math.fround(Camera.main.height_ - this.insets.bottom_) - HeroSelectScene$HeroBtn.HEIGHT) + 2) - this.startBtn.height())));
      PixelScene.align$Component(this.startBtn);
      this.infoButton.visible_ = this.infoButton.active = true;
      this.infoButton.setPos(this.startBtn.right(), this.startBtn.top());
      this.btnOptions.visible_ = this.btnOptions.active = !SPDSettings.intro$();
      this.btnOptions.setPos(Math.fround(this.startBtn.left() - this.btnOptions.width()), this.startBtn.top());
      this.optionsPane.setPos(this.heroBtns.get(0).left(), Math.fround(Math.fround(this.startBtn.top() - this.optionsPane.height()) - 2));
      PixelScene.align$Component(this.optionsPane);
    }
    this.updateOptionsColor();
  }
  update(): void {
    super.update();
    if (SPDSettings.intro$() && Rankings.INSTANCE.totalNumber > 0) {
      SPDSettings.intro$boolean(false);
    }
    this.btnExit.visible_ = this.btnExit.active = !SPDSettings.intro$();
    for (const $it3 = this.members.iterator(); $it3.hasNext(); ) {
      let v = $it3.next();
      if (v instanceof Window) {
        this.resetFade();
      }
    }
    if (!PixelScene.landscape() && GamesInProgress.selectedClass != null) {
      if (this.uiAlpha > 0) {
        this.uiAlpha = Math.fround(this.uiAlpha - Math.fround(Game.elapsed / 4));
      }
      this.updateFade();
    }
  }
  updateFade(): void {
    let alpha = GameMath.gate(0, this.uiAlpha, 1);
    this.title_.alpha(alpha);
    for (const $it4 = this.heroBtns.iterator(); $it4.hasNext(); ) {
      let b = $it4.next();
      b.enable(alpha !== Math.fround(0));
      b.alpha$float(alpha);
    }
    if (this.heroName != null) {
      this.heroName.alpha(alpha);
      this.heroDesc.alpha(alpha);
      this.btnFade.enable(alpha !== Math.fround(0));
      this.btnFade.icon$().alpha$float(alpha);
    }
    this.startBtn.enable(alpha !== Math.fround(0));
    this.startBtn.alpha$float(alpha);
    this.btnExit.enable(this.btnExit.visible_ && alpha !== Math.fround(0));
    this.btnExit.icon$().alpha$float(alpha);
    this.optionsPane.active = this.optionsPane.visible_ && alpha !== Math.fround(0);
    this.optionsPane.alpha(alpha);
    this.btnOptions.enable(alpha !== Math.fround(0));
    this.btnOptions.icon$().alpha$float(alpha);
    this.infoButton.enable(alpha !== Math.fround(0));
    this.infoButton.icon$().alpha$float(alpha);
    if (PixelScene.landscape()) {
      let w = $J.d2i((Math.fround(Math.fround(Camera.main.width_ - this.insets.left_) - this.insets.right_)));
      this.background.x = Math.fround(this.insets.left_ + Math.fround((Math.fround(w - this.background.width())) / 2));
      let leftPortion = Math.max(100, Math.fround(w / 3));
      this.background.x = Math.fround(this.background.x + Math.fround((Math.fround(leftPortion / 2)) * alpha));
      let fadeLeftScale = Math.fround(Math.fround(47 * (Math.fround(leftPortion - (Math.fround(this.background.x - this.insets.left_))))) / leftPortion);
      this.fadeLeft.scale_.x = Math.fround(3 + Math.fround(Math.max(fadeLeftScale, 0) * alpha));
      this.fadeLeft.x = Math.fround(this.background.x - 4);
      this.fadeRight.x = Math.fround(Math.fround(this.background.x + this.background.width()) + 4);
    }
    this.fadeLeft.x = Math.fround(this.background.x - 5);
    this.fadeRight.x = Math.fround(Math.fround(this.background.x + this.background.width()) + 5);
    this.fadeLeft.visible_ = this.background.x > Math.fround(0) || (alpha > Math.fround(0) && PixelScene.landscape());
    this.fadeRight.visible_ = Math.fround(this.background.x + this.background.width()) < Math.fround(Camera.main.width_);
  }
  resetFade(): void {
    this.uiAlpha = 2;
    this.updateFade();
  }
  onBackPressed(): void {
    if (this.btnExit.active) {
      Game.switchScene$Class($J.cls(TitleScene));
    } else {
      super.onBackPressed();
    }
  }
  static $clinit() {
    HeroSelectScene.heroWasRandomized = true;
    HeroSelectScene.chalWasRandomized = false;
  }
}

export class HeroSelectScene$HeroBtn extends StyledButton {
  cl: HeroClass = null;
  static readonly MIN_WIDTH: number = 20;
  static readonly HEIGHT: number = 24;
  _HeroSelectScene$HeroBtn(cl: HeroClass): this {
    this._StyledButton$Type$String(Chrome$Type.GREY_BUTTON_TR, '');
    this.cl = cl;
    this.icon$Image(new Image()._Image$Object$int$int$int$int(cl.spritesheet(), 0, 90, 12, 15));
    return this;
  }
  update(): void {
    super.update();
    if (this.cl !== GamesInProgress.selectedClass) {
      if (!this.cl.isUnlocked()) {
        this.icon_.brightness(Math.fround(0.1));
      } else {
        this.icon_.brightness(Math.fround(0.6));
      }
    } else {
      this.icon_.brightness(1);
    }
  }
  onClick(): void {
    super.onClick();
    if (!this.cl.isUnlocked()) {
      Game.scene().addToFront(new WndMessage()._WndMessage(this.cl.unlockMsg()));
    } else if (GamesInProgress.selectedClass === this.cl) {
      let w = new WndHeroInfo()._WndHeroInfo(this.cl);
      if (PixelScene.landscape()) {
        w.offset$int$int($J.idiv(Camera.main.width_, 6), 0);
      }
      Game.scene().addToFront(w);
    } else {
      this.$outer.setSelectedHero(this.cl);
    }
  }
  layout(): void {
    super.layout();
    if (this.height_ > Math.fround(30)) {
      this.icon_.y = Math.fround(this.y + Math.fround((Math.fround(HeroSelectScene$HeroBtn.HEIGHT - this.icon_.height())) / 2));
    }
  }
}

export class HeroSelectScene$GameOptions extends Component {
  bg: NinePatch = null;
  buttons: ArrayList<StyledButton> = null;
  spacers: ArrayList<ColorBlock> = null;
  challengeButton: StyledButton = null;
  _HeroSelectScene$GameOptions(): this {
    this._Component();
    return this;
  }
  createChildren(): void {
    this.bg = Chrome.get(Chrome$Type.GREY_BUTTON_TR);
    this.add$Gizmo(this.bg);
    this.buttons = new ArrayList();
    this.spacers = new ArrayList();
    let seedButton = new (HeroSelectScene$GameOptions$1())().$o(this)._StyledButton$Type$String$int(Chrome$Type.BLANK, Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'custom_seed', []), 6);
    seedButton.leftJustify = true;
    seedButton.icon$Image(Icons.get$Icons(Icons.SEED));
    if (!(SPDSettings.customSeed$().length === 0)) {
      seedButton.icon$().hardlight$float$float$float(1, 1.5, Math.fround(0.67));
    }
    this.buttons.add(seedButton);
    this.add$Gizmo(seedButton);
    let dailyButton = new (HeroSelectScene$GameOptions$2())().$o(this)._StyledButton$Type$String$int(Chrome$Type.BLANK, Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'daily', []), 6).$init_anon();
    dailyButton.leftJustify = true;
    dailyButton.icon$Image(Icons.get$Icons(Icons.CALENDAR));
    this.add$Gizmo(dailyButton);
    this.buttons.add(dailyButton);
    this.challengeButton = new (HeroSelectScene$GameOptions$3())().$o(this)._StyledButton$Type$String$int(Chrome$Type.BLANK, Messages.get$Class$String$ObjectArr($J.cls(WndChallenges), 'title', []), 6);
    this.challengeButton.leftJustify = true;
    this.challengeButton.icon$Image(Icons.get$Icons(SPDSettings.challenges$() > 0 ? Icons.CHALLENGE_COLOR : Icons.CHALLENGE_GREY));
    this.add$Gizmo(this.challengeButton);
    this.buttons.add(this.challengeButton);
    let unlockedCount = 0;
    for (let cls of HeroClass.values()) {
      if (cls.isUnlocked()) {
        unlockedCount++;
      }
    }
    if (unlockedCount >= 2) {
      let randomButton = new (HeroSelectScene$GameOptions$4())().$o(this)._StyledButton$Type$String$int(Chrome$Type.BLANK, Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'randomize', []), 6);
      randomButton.leftJustify = true;
      randomButton.icon$Image(Icons.SHUFFLE.get());
      this.buttons.add(randomButton);
      this.add$Gizmo(randomButton);
    }
    for (let i = 1; i < this.buttons.size(); i++) {
      let spc = new ColorBlock()._ColorBlock(1, 1, -16777216);
      this.add$Gizmo(spc);
      this.spacers.add(spc);
    }
  }
  layout(): void {
    super.layout();
    this.bg.x = this.x;
    this.bg.y = this.y;
    let width = 0;
    for (const $it7 = this.buttons.iterator(); $it7.hasNext(); ) {
      let btn = $it7.next();
      if (Math.fround(width) < btn.reqWidth()) {
        width = $J.d2i(btn.reqWidth());
      }
    }
    width = (width + this.bg.marginHor()) | 0;
    let top = ($J.d2i(this.y) + this.bg.marginTop() - 1) | 0;
    let i = 0;
    for (const $it8 = this.buttons.iterator(); $it8.hasNext(); ) {
      let btn = $it8.next();
      btn.setRect(Math.fround(this.x + this.bg.marginLeft()), Math.fround(top), Math.fround((width - this.bg.marginHor()) | 0), 16);
      top = $J.d2i(btn.bottom());
      if (i < this.spacers.size()) {
        this.spacers.get(i).size(btn.width(), 1);
        this.spacers.get(i).x = btn.left();
        this.spacers.get(i).y = PixelScene.align$float(Math.fround(btn.bottom() - 0.5));
        i++;
      }
    }
    this.width_ = Math.fround(width);
    this.height_ = Math.fround(Math.fround(((top + this.bg.marginBottom()) | 0) - this.y) - 1);
    this.bg.size(this.width_, this.height_);
  }
  alpha(value: number): void {
    this.bg.alpha$float(value);
    for (const $it9 = this.buttons.iterator(); $it9.hasNext(); ) {
      let btn = $it9.next();
      btn.alpha$float(value);
    }
    for (const $it10 = this.spacers.iterator(); $it10.hasNext(); ) {
      let spc = $it10.next();
      spc.alpha$float(value);
    }
  }
}

export class HeroSelectScene$GameOptions$WndRandomize extends Window {
  chkHero: CheckBox = null;
  chkChals: CheckBox = null;
  optChals: OptionSlider = null;
  _HeroSelectScene$GameOptions$WndRandomize(): this {
    this._Window$();
    this.chkHero = new (HeroSelectScene$GameOptions$WndRandomize$1())().$o(this)._CheckBox(Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'randomize_hero', []));
    this.chkHero.setRect(0, 0, 120, 16);
    this.chkHero.checked$boolean(HeroSelectScene.heroWasRandomized);
    this.add$Gizmo(this.chkHero);
    this.chkChals = new (HeroSelectScene$GameOptions$WndRandomize$2())().$o(this)._CheckBox(Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'randomize_chals', []));
    this.chkChals.setRect(0, 20, 120, 16);
    this.add$Gizmo(this.chkChals);
    let max = Challenges.MAX_CHALS;
    this.optChals = new (HeroSelectScene$GameOptions$WndRandomize$3())().$o(this)._OptionSlider(Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'randomize_chals_title', []), '0', String(max), 0, max);
    this.optChals.enable(false);
    this.optChals.setSelectedValue(Challenges.activeChallenges$int(SPDSettings.challenges$()));
    this.optChals.setRect(0, 38, 120, 22);
    this.add$Gizmo(this.optChals);
    this.chkChals.checked$boolean(HeroSelectScene.chalWasRandomized);
    let btnCancel = new (HeroSelectScene$GameOptions$WndRandomize$4())().$o(this)._RedButton$String(Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'randomize_cancel', []));
    btnCancel.setRect(61, 64, 60, 16);
    this.add$Gizmo(btnCancel);
    let btnConfirm = new (HeroSelectScene$GameOptions$WndRandomize$5())().$o(this)._RedButton$String(Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'randomize_confirm', []));
    btnConfirm.setRect(0, 64, 60, 16);
    this.add$Gizmo(btnConfirm);
    this.resize(120, $J.d2i(btnConfirm.bottom()));
    return this;
  }
}

let $HeroSelectScene$1: any = null;
/** An anonymous class (HeroSelectScene.java:114). */
function HeroSelectScene$1(): any {
  return $HeroSelectScene$1 ??= $J.local(class extends Image {
    update(): void {
      if (GamesInProgress.selectedClass != null) {
        if (this.rm > 1) {
          this.rm = Math.fround(this.rm - Game.elapsed);
          this.gm = this.bm = this.rm;
        } else {
          this.rm = this.gm = this.bm = 1;
        }
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$1', []);
}

let $HeroSelectScene$2: any = null;
/** An anonymous class (HeroSelectScene.java:150). */
function HeroSelectScene$2(): any {
  return $HeroSelectScene$2 ??= $J.local(class extends StyledButton {
    onClick(): void {
      super.onClick();
      if (GamesInProgress.selectedClass == null) {
        return;
      }
      Dungeon.hero = null;
      Dungeon.daily = Dungeon.dailyReplay = false;
      Dungeon.initSeed();
      ActionIndicator.clearAction$();
      InterlevelScene.mode = InterlevelScene$Mode.DESCEND;
      Game.switchScene$Class($J.cls(InterlevelScene));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$2', []);
}

let $HeroSelectScene$3: any = null;
/** An anonymous class (HeroSelectScene.java:172). */
function HeroSelectScene$3(): any {
  return $HeroSelectScene$3 ??= $J.local(class extends IconButton {
    onClick(): void {
      super.onClick();
      let cls = GamesInProgress.selectedClass;
      if (cls != null) {
        let info = new WndHeroInfo()._WndHeroInfo(GamesInProgress.selectedClass);
        if (PixelScene.landscape()) {
          info.offset$int$int($J.d2i((Math.fround(this.$cv_w / 6))), 0);
        }
        Game.scene().addToFront(info);
      }
    }
    hoverText(): string {
      return Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), 'hero_info', []));
    }
    $c($w): this {
      this.$cv_w = $w;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$3', []);
}

let $HeroSelectScene$4: any = null;
/** An anonymous class (HeroSelectScene.java:206). */
function HeroSelectScene$4(): any {
  return $HeroSelectScene$4 ??= $J.local(class extends IconButton {
    onClick(): void {
      super.onClick();
      this.$outer.optionsPane.visible_ = !this.$outer.optionsPane.visible_;
      this.$outer.optionsPane.active = !this.$outer.optionsPane.active;
    }
    onPointerDown(): void {
      super.onPointerDown();
    }
    onPointerUp(): void {
      this.$outer.updateOptionsColor();
    }
    hoverText(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'options', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$4', []);
}

let $HeroSelectScene$5$1: any = null;
/** An anonymous class (HeroSelectScene.java:306). */
function HeroSelectScene$5$1(): any {
  return $HeroSelectScene$5$1 ??= $J.local(class extends Tweener {
    updateValues(progress: number): void {
      this.$outer.$outer.uiAlpha = Math.fround(1 - progress);
      this.$outer.$outer.updateFade();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$5$1', []);
}

let $HeroSelectScene$5: any = null;
/** An anonymous class (HeroSelectScene.java:302). */
function HeroSelectScene$5(): any {
  return $HeroSelectScene$5 ??= $J.local(class extends IconButton {
    onClick(): void {
      this.enable(false);
      this.parent.add$Gizmo(new (HeroSelectScene$5$1())().$o(this)._Tweener(this.parent, 0.5));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$5', []);
}

let $HeroSelectScene$6$1: any = null;
/** An anonymous class (HeroSelectScene.java:369). */
function HeroSelectScene$6$1(): any {
  return $HeroSelectScene$6$1 ??= $J.local(class extends Tweener {
    updateValues(progress: number): void {
      this.$outer.$outer.uiAlpha = progress;
      this.$outer.$outer.updateFade();
    }
    onComplete(): void {
      this.$outer.$outer.resetFade();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$6$1', []);
}

let $HeroSelectScene$6: any = null;
/** An anonymous class (HeroSelectScene.java:364). */
function HeroSelectScene$6(): any {
  return $HeroSelectScene$6 ??= $J.local(class extends PointerArea {
    onSignal(event: PointerEvent): boolean {
      if (event != null && event.type_ === PointerEvent$Type.UP) {
        if (this.$outer.uiAlpha === Math.fround(0) && PixelScene.landscape()) {
          this.parent.add$Gizmo(new (HeroSelectScene$6$1())().$o(this)._Tweener(this.parent, 0.5));
        } else {
          this.$outer.resetFade();
        }
      }
      return false;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$6', []);
}

let $HeroSelectScene$GameOptions$1$1: any = null;
/** An anonymous class (HeroSelectScene.java:658). */
function HeroSelectScene$GameOptions$1$1(): any {
  return $HeroSelectScene$GameOptions$1$1 ??= $J.local(class extends WndTextInput {
    onSelect(positive: boolean, text: string): void {
      text = DungeonSeed.formatText(text);
      let seed = DungeonSeed.convertFromText(text);
      if (positive && seed !== -1n) {
        for (const $it5 = GamesInProgress.checkAll().iterator(); $it5.hasNext(); ) {
          let info = $it5.next();
          if ((info.customSeed.length === 0) && info.seed_ === seed) {
            SPDSettings.customSeed$String('');
            this.$outer.icon_.resetColor();
            Game.scene().addToFront(new WndMessage()._WndMessage(Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'custom_seed_duplicate', [])));
            return;
          }
        }
        SPDSettings.customSeed$String(text);
        this.$outer.icon_.hardlight$float$float$float(1, 1.5, Math.fround(0.67));
      } else {
        SPDSettings.customSeed$String('');
        this.$outer.icon_.resetColor();
      }
      this.$outer.$outer.$outer.updateOptionsColor();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$GameOptions$1$1', []);
}

let $HeroSelectScene$GameOptions$1: any = null;
/** An anonymous class (HeroSelectScene.java:639). */
function HeroSelectScene$GameOptions$1(): any {
  return $HeroSelectScene$GameOptions$1 ??= $J.local(class extends StyledButton {
    onClick(): void {
      if (!Badges.isUnlocked(Badges$Badge.VICTORY) && !DeviceCompat.isDebug()) {
        Game.scene().addToFront(new WndTitledMessage()._WndTitledMessage$Image$String$String(Icons.get$Icons(Icons.SEED), Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'custom_seed', []), Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'custom_seed_nowin', [])));
        return;
      }
      let existingSeedtext = SPDSettings.customSeed$();
      Game.scene().addToFront(new (HeroSelectScene$GameOptions$1$1())().$o(this)._WndTextInput(Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'custom_seed_title', []), Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'custom_seed_desc', []), existingSeedtext, 20, false, Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'custom_seed_set', []), Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'custom_seed_clear', [])));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$GameOptions$1', []);
}

let $HeroSelectScene$GameOptions$2$1: any = null;
/** An anonymous class (HeroSelectScene.java:735). */
function HeroSelectScene$GameOptions$2$1(): any {
  return $HeroSelectScene$GameOptions$2$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        if (this.$cv_diff <= 0n) {
          let time = BigInt.asIntN(64, Game.realTime - ($J.lrem(Game.realTime, HeroSelectScene$GameOptions$2().DAY)));
          time = $J.lmax(time, BigInt.asIntN(64, 20544n * HeroSelectScene$GameOptions$2().DAY));
          SPDSettings.lastDaily$long(time);
          Dungeon.dailyReplay = false;
        } else {
          Dungeon.dailyReplay = true;
        }
        Dungeon.hero = null;
        Dungeon.daily = true;
        Dungeon.initSeed();
        ActionIndicator.clearAction$();
        InterlevelScene.mode = InterlevelScene$Mode.DESCEND;
        Game.switchScene$Class($J.cls(InterlevelScene));
      }
    }
    $c($diff): this {
      this.$cv_diff = $diff;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$GameOptions$2$1', []);
}

let $HeroSelectScene$GameOptions$2: any = null;
/** An anonymous class (HeroSelectScene.java:692). */
function HeroSelectScene$GameOptions$2(): any {
  return $HeroSelectScene$GameOptions$2 ??= $J.local(class extends StyledButton {
    static readonly SECOND: bigint = 1000n;
    static readonly MINUTE: bigint = 60000n;
    static readonly HOUR: bigint = 3600000n;
    static readonly DAY: bigint = 86400000n;
    timeToUpdate: bigint = 0n;
    dateFormat: SimpleDateFormat = null;
    $init_anon() {
      this.timeToUpdate = 0n;
      this.dateFormat = new SimpleDateFormat('HH:mm:ss', Locale.ROOT);
      this.dateFormat.setTimeZone(TimeZone.getTimeZone('UTC'));
      return this;
    }
    onClick(): void {
      super.onClick();
      if (!Badges.isUnlocked(Badges$Badge.VICTORY) && !DeviceCompat.isDebug()) {
        Game.scene().addToFront(new WndTitledMessage()._WndTitledMessage$Image$String$String(Icons.get$Icons(Icons.CALENDAR), Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'daily', []), Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'daily_nowin', [])));
        return;
      }
      let diff = BigInt.asIntN(64, (BigInt.asIntN(64, SPDSettings.lastDaily$() + HeroSelectScene$GameOptions$2().DAY)) - Game.realTime);
      if (diff > BigInt.asIntN(64, 24n * HeroSelectScene$GameOptions$2().HOUR)) {
        Game.scene().addToFront(new WndMessage()._WndMessage(Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'daily_unavailable_long', [BigInt.asIntN(64, ($J.ldiv(diff, HeroSelectScene$GameOptions$2().DAY)) + 1n)])));
        return;
      }
      for (const $it6 = GamesInProgress.checkAll().iterator(); $it6.hasNext(); ) {
        let game = $it6.next();
        if (game.daily) {
          Game.scene().addToFront(new WndMessage()._WndMessage(Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'daily_existing', [])));
          return;
        }
      }
      let icon = Icons.get$Icons(Icons.CALENDAR);
      if (diff <= 0n) {
        icon.hardlight$float$float$float(0.5, 1, 2);
      } else {
        icon.hardlight$float$float$float(1, 0.5, 2);
      }
      Game.scene().addToFront(new (HeroSelectScene$GameOptions$2$1())().$o(this).$c(diff)._WndOptions$Image$String$String$StringArr(icon, Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'daily', []), diff > 0n ? Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'daily_repeat', []) : Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'daily_desc', []), [Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'daily_yes', []), Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'daily_no', [])]));
    }
    update(): void {
      super.update();
      if (Game.realTime > this.timeToUpdate && this.visible_) {
        let diff = BigInt.asIntN(64, (BigInt.asIntN(64, SPDSettings.lastDaily$() + HeroSelectScene$GameOptions$2().DAY)) - Game.realTime);
        if (diff > 0n) {
          if (diff > BigInt.asIntN(64, 30n * HeroSelectScene$GameOptions$2().HOUR)) {
            this.text$String('30:00:00+');
          } else {
            this.text$String(this.dateFormat.format(new JDate(diff)));
          }
          this.timeToUpdate = BigInt.asIntN(64, Game.realTime + HeroSelectScene$GameOptions$2().SECOND);
        } else {
          this.text$String(Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'daily', []));
          this.timeToUpdate = 9223372036854775807n;
        }
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$GameOptions$2', []);
}

let $HeroSelectScene$GameOptions$3$1: any = null;
/** An anonymous class (HeroSelectScene.java:810). */
function HeroSelectScene$GameOptions$3$1(): any {
  return $HeroSelectScene$GameOptions$3$1 ??= $J.local(class extends WndChallenges {
    onBackPressed(): void {
      super.onBackPressed();
      this.$outer.icon$Image(Icons.get$Icons(SPDSettings.challenges$() > 0 ? Icons.CHALLENGE_COLOR : Icons.CHALLENGE_GREY));
      this.$outer.$outer.$outer.updateOptionsColor();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$GameOptions$3$1', []);
}

let $HeroSelectScene$GameOptions$3: any = null;
/** An anonymous class (HeroSelectScene.java:798). */
function HeroSelectScene$GameOptions$3(): any {
  return $HeroSelectScene$GameOptions$3 ??= $J.local(class extends StyledButton {
    onClick(): void {
      if (!Badges.isUnlocked(Badges$Badge.VICTORY) && !DeviceCompat.isDebug()) {
        Game.scene().addToFront(new WndTitledMessage()._WndTitledMessage$Image$String$String(Icons.get$Icons(Icons.CHALLENGE_GREY), Messages.get$Class$String$ObjectArr($J.cls(WndChallenges), 'title', []), Messages.get$Class$String$ObjectArr($J.cls(HeroSelectScene), 'challenges_nowin', [])));
        return;
      }
      Game.scene().addToFront(new (HeroSelectScene$GameOptions$3$1())().$o(this)._WndChallenges(SPDSettings.challenges$(), true));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$GameOptions$3', []);
}

let $HeroSelectScene$GameOptions$4: any = null;
/** An anonymous class (HeroSelectScene.java:830). */
function HeroSelectScene$GameOptions$4(): any {
  return $HeroSelectScene$GameOptions$4 ??= $J.local(class extends StyledButton {
    onClick(): void {
      if (Badges.isUnlocked(Badges$Badge.VICTORY) || DeviceCompat.isDebug()) {
        Game.scene().addToFront(new HeroSelectScene$GameOptions$WndRandomize().$o(this.$outer)._HeroSelectScene$GameOptions$WndRandomize());
      } else {
        let randomCls: HeroClass;
        do {
          randomCls = Random.oneOf(HeroClass.values());
        } while (!randomCls.isUnlocked());
        this.$outer.$outer.setSelectedHero(randomCls);
        GamesInProgress.randomizedClass = true;
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$GameOptions$4', []);
}

let $HeroSelectScene$GameOptions$WndRandomize$1: any = null;
/** An anonymous class (HeroSelectScene.java:869). */
function HeroSelectScene$GameOptions$WndRandomize$1(): any {
  return $HeroSelectScene$GameOptions$WndRandomize$1 ??= $J.local(class extends CheckBox {
    checked$boolean(value: boolean): void {
      super.checked$boolean(value);
      HeroSelectScene.heroWasRandomized = value;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$GameOptions$WndRandomize$1', []);
}

let $HeroSelectScene$GameOptions$WndRandomize$2: any = null;
/** An anonymous class (HeroSelectScene.java:880). */
function HeroSelectScene$GameOptions$WndRandomize$2(): any {
  return $HeroSelectScene$GameOptions$WndRandomize$2 ??= $J.local(class extends CheckBox {
    checked$boolean(value: boolean): void {
      super.checked$boolean(value);
      this.$outer.optChals.enable(value);
      HeroSelectScene.chalWasRandomized = value;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$GameOptions$WndRandomize$2', []);
}

let $HeroSelectScene$GameOptions$WndRandomize$3: any = null;
/** An anonymous class (HeroSelectScene.java:892). */
function HeroSelectScene$GameOptions$WndRandomize$3(): any {
  return $HeroSelectScene$GameOptions$WndRandomize$3 ??= $J.local(class extends OptionSlider {
    onChange(): void {
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$GameOptions$WndRandomize$3', []);
}

let $HeroSelectScene$GameOptions$WndRandomize$4: any = null;
/** An anonymous class (HeroSelectScene.java:905). */
function HeroSelectScene$GameOptions$WndRandomize$4(): any {
  return $HeroSelectScene$GameOptions$WndRandomize$4 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      this.$outer.hide();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$GameOptions$WndRandomize$4', []);
}

let $HeroSelectScene$GameOptions$WndRandomize$5: any = null;
/** An anonymous class (HeroSelectScene.java:915). */
function HeroSelectScene$GameOptions$WndRandomize$5(): any {
  return $HeroSelectScene$GameOptions$WndRandomize$5 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      this.$outer.hide();
      if (this.$outer.chkChals.checked$()) {
        let chals = this.$outer.optChals.getSelectedValue();
        let chalMasks = new ArrayList();
        for (let i = 0; i < Challenges.MAX_CHALS; i++) {
          chalMasks.add($J.d2i($J.pow(2, i)));
        }
        Random.shuffle$List(chalMasks);
        let mask = 0;
        for (let i = 0; i < chals; i++) {
          mask = (mask + chalMasks.removeAt(0)) | 0;
        }
        SPDSettings.challenges$int(mask);
        this.$outer.$outer.challengeButton.icon$Image(Icons.get$Icons(SPDSettings.challenges$() > 0 ? Icons.CHALLENGE_COLOR : Icons.CHALLENGE_GREY));
        Game.scene().addToFront(new WndChallenges()._WndChallenges(mask, false));
      }
      if (this.$outer.chkHero.checked$()) {
        let randomCls: HeroClass;
        do {
          randomCls = Random.oneOf(HeroClass.values());
        } while (!randomCls.isUnlocked());
        this.$outer.$outer.$outer.setSelectedHero(randomCls);
        GamesInProgress.randomizedClass = true;
      } else {
        this.$outer.$outer.$outer.setSelectedHero(GamesInProgress.selectedClass);
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$GameOptions$WndRandomize$5', []);
}

$J.define(HeroSelectScene, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene', ctors: { '': '_HeroSelectScene' }, clinit: true, lazy: ['heroWasRandomized', 'chalWasRandomized'] });
$J.define(HeroSelectScene$HeroBtn, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$HeroBtn', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.StyledButton', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass': '_HeroSelectScene$HeroBtn' }, inner: true });
$J.define(HeroSelectScene$GameOptions, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$GameOptions', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_HeroSelectScene$GameOptions' }, inner: true });
$J.define(HeroSelectScene$GameOptions$WndRandomize, 'com.shatteredpixel.shatteredpixeldungeon.scenes.HeroSelectScene$GameOptions$WndRandomize', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { '': '_HeroSelectScene$GameOptions$WndRandomize' }, inner: true });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Badges$Badge = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges$Badge');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  GamesInProgress = $J.load('com.shatteredpixel.shatteredpixeldungeon.GamesInProgress');
  Rankings = $J.load('com.shatteredpixel.shatteredpixeldungeon.Rankings');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Journal = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Journal');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  InterlevelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene');
  InterlevelScene$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$Mode');
  TitleScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene');
  ActionIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ActionIndicator');
  CheckBox = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.CheckBox');
  ExitButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ExitButton');
  IconButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.IconButton');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  OptionSlider = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.OptionSlider');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  RenderedTextBlock = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RenderedTextBlock');
  DungeonSeed = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.DungeonSeed');
  WndChallenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndChallenges');
  WndHeroInfo = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndHeroInfo');
  WndKeyBindings = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings');
  WndMessage = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndMessage');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  WndTextInput = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTextInput');
  WndTitledMessage = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage');
  WndVictoryCongrats = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndVictoryCongrats');
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  PointerEvent$Type = $J.load('com.watabou.input.PointerEvent$Type');
  Camera = $J.load('com.watabou.noosa.Camera');
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  PointerArea = $J.load('com.watabou.noosa.PointerArea');
  SkinnedBlock = $J.load('com.watabou.noosa.SkinnedBlock');
  Tweener = $J.load('com.watabou.noosa.tweeners.Tweener');
  DeviceCompat = $J.load('com.watabou.utils.DeviceCompat');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PlatformSupport = $J.load('com.watabou.utils.PlatformSupport');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
