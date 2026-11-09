// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/scenes/InterlevelScene.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Exception, FileNotFoundException, IOException, JEnum, JObject, JString, RuntimeException, Thread } from '../../../../../jre/index.ts';
import { PixelScene } from './PixelScene.ts';

let Assets$Splashes, Chrome$Type, Dungeon, GamesInProgress, Statistics, Actor, Buff, Mob, ShadowBox, LostBackpack, SkeletonKey$KeyReplacementTracker, Document, Notes, Notes$Landmark, Terrain, Chasm$Falling, SpecialRoom, Messages, GameScene, StartScene, GameLog, IconButton, Icons, StyledButton, TitleBackground, WndError, TextureCache, KeyEvent, Camera, Game, Image, Tweener, BArray, DeviceCompat, GameMath, PlatformSupport, Random;

export class InterlevelScene extends PixelScene {
  static readonly SLOW_FADE: number = 1;
  static readonly NORM_FADE: number = Math.fround(0.67);
  static readonly FAST_FADE: number = 0.5;
  static fadeTime: number = 0;
  static mode: InterlevelScene$Mode = null;
  static curTransition: LevelTransition = null;
  static returnDepth: number = 0;
  static returnBranch: number = 0;
  static returnPos: number = 0;
  static fallIntoPit: boolean = false;
  phase: InterlevelScene$Phase = null;
  timeLeft: number = 0;
  background: Image = null;
  loadingText: RenderedTextBlock = null;
  storyMessage: RenderedTextBlock = null;
  storyBG: ShadowBox = null;
  btnContinue: StyledButton = null;
  btnHideStory: IconButton = null;
  static thread: Thread = null;
  static error: Exception = null;
  waitingTime: number = 0;
  static lastRegion: number = 0;
  insets: RectF = null;
  dots: number = 0;
  textFadingIn: boolean = false;
  _InterlevelScene(): this {
    this._PixelScene();
    this.inGameScene = true;
    this.dots = 0;
    this.textFadingIn = true;
    return this;
  }
  create(): void {
    super.create();
    let loadingAsset: string;
    let loadingDepth: number;
    InterlevelScene.fadeTime = InterlevelScene.NORM_FADE;
    let seed = Dungeon.seed;
    switch (InterlevelScene.mode) {
      default:
        loadingDepth = Dungeon.depth;
        break;
      case InterlevelScene$Mode.CONTINUE:
        loadingDepth = GamesInProgress.check(GamesInProgress.curSlot).depth_;
        seed = GamesInProgress.check(GamesInProgress.curSlot).seed_;
        break;
      case InterlevelScene$Mode.DESCEND:
        if (Dungeon.hero == null) {
          loadingDepth = 1;
          InterlevelScene.fadeTime = InterlevelScene.SLOW_FADE;
        } else {
          if (InterlevelScene.curTransition != null) {
            loadingDepth = InterlevelScene.curTransition.destDepth;
          } else {
            loadingDepth = Dungeon.depth;
          }
          if (Statistics.deepestFloor >= loadingDepth) {
            InterlevelScene.fadeTime = InterlevelScene.FAST_FADE;
          } else if (loadingDepth === 6 || loadingDepth === 11 || loadingDepth === 16 || loadingDepth === 21 || loadingDepth === 26) {
            InterlevelScene.fadeTime = InterlevelScene.SLOW_FADE;
          }
        }
        break;
      case InterlevelScene$Mode.FALL:
        loadingDepth = Dungeon.depth;
        break;
      case InterlevelScene$Mode.ASCEND:
        InterlevelScene.fadeTime = InterlevelScene.FAST_FADE;
        if (InterlevelScene.curTransition != null) {
          loadingDepth = InterlevelScene.curTransition.destDepth;
        } else {
          loadingDepth = Dungeon.depth;
        }
        break;
      case InterlevelScene$Mode.RETURN:
        loadingDepth = InterlevelScene.returnDepth;
        break;
    }
    let region = $J.d2i(Math.ceil(Math.fround(loadingDepth / 5)));
    if (region !== InterlevelScene.lastRegion) {
      TextureCache.clear();
      TitleBackground.reset();
      InterlevelScene.lastRegion = region;
    }
    let loadingCenter = 400;
    Random.pushGenerator$long(BigInt.asIntN(64, seed + BigInt(InterlevelScene.lastRegion)));
    switch (InterlevelScene.lastRegion) {
      case 1:
        loadingAsset = Assets$Splashes.SEWERS;
        switch (Random.Int$int(2)) {
          case 0:
            loadingCenter = 180;
            break;
          case 1:
            loadingCenter = 485;
            break;
        }
        break;
      case 2:
        loadingAsset = Assets$Splashes.PRISON;
        switch (Random.Int$int(3)) {
          case 0:
            loadingCenter = 190;
            break;
          case 1:
            loadingCenter = 402;
            break;
        }
        break;
      case 3:
        loadingAsset = Assets$Splashes.CAVES;
        switch (Random.Int$int(3)) {
          case 0:
            loadingCenter = 340;
            break;
          case 1:
            loadingCenter = 625;
            break;
        }
        break;
      case 4:
        loadingAsset = Assets$Splashes.CITY;
        switch (Random.Int$int(3)) {
          case 0:
            loadingCenter = 275;
            break;
          case 1:
            loadingCenter = 485;
            break;
        }
        break;
      case 5:
      default:
        loadingAsset = Assets$Splashes.HALLS;
        switch (Random.Int$int(3)) {
          case 0:
            loadingCenter = 145;
            break;
          case 1:
            loadingCenter = 400;
            break;
        }
        break;
    }
    Random.popGenerator();
    if (DeviceCompat.isDebug()) {
      InterlevelScene.fadeTime = 0;
    }
    this.insets = Game.platform.getSafeInsets(PlatformSupport.INSET_BLK).scale(Math.fround(1 / PixelScene.defaultZoom));
    let w = $J.d2i((Math.fround(Math.fround(Camera.main.width_ - this.insets.left_) - this.insets.right_)));
    let h = $J.d2i((Math.fround(Math.fround(Camera.main.height_ - this.insets.top_) - this.insets.bottom_)));
    this.background = new Image()._Image$Object(loadingAsset);
    this.background.scale_.set$float(Math.fround(Camera.main.height_ / this.background.height_));
    if (Math.fround(Camera.main.width_) >= this.background.width()) {
      this.background.x = Math.fround((Math.fround(Camera.main.width_ - this.background.width())) / 2);
    } else {
      this.background.x = Math.fround(Math.fround(Camera.main.width_ / 2) - Math.fround(loadingCenter * this.background.scale_.x));
      this.background.x = GameMath.gate(Math.fround(Camera.main.width_ - this.background.width()), this.background.x, 0);
    }
    this.background.y = Math.fround((Math.fround(Camera.main.height_ - this.background.height())) / 2);
    PixelScene.align$Visual(this.background);
    this.add$Gizmo(this.background);
    let fadeLeft: Image;
    let fadeRight: Image;
    fadeLeft = new Image()._Image$Object(TextureCache.createGradient([-16777216, -16777216, 0]));
    fadeLeft.x = Math.fround(this.background.x - 2);
    fadeLeft.scale_.set$float$float(3, this.background.height());
    fadeLeft.visible_ = this.background.x > Math.fround(0);
    this.add$Gizmo(fadeLeft);
    fadeRight = new Image()._Image$Image(fadeLeft);
    fadeRight.x = Math.fround(Math.fround(this.background.x + this.background.width()) + 2);
    fadeRight.y = Math.fround(this.background.y + this.background.height());
    fadeRight.angle = 180;
    fadeRight.visible_ = fadeLeft.visible_;
    this.add$Gizmo(fadeRight);
    let im = new (InterlevelScene$1())().$o(this)._Image$Object(TextureCache.createGradient([0, 0, 0, 0, 0, -16777216]));
    im.angle = 90;
    im.x = Math.fround(this.insets.left_ + w);
    im.scale_.x = Math.fround(h / 5);
    im.scale_.y = Math.fround(w);
    this.add$Gizmo(im);
    let text = Messages.get$Class$String$ObjectArr($J.cls(InterlevelScene$Mode), InterlevelScene.mode.name(), []);
    this.loadingText = PixelScene.renderTextBlock$String$int(text, 9);
    this.loadingText.setPos(Math.fround(Math.fround(Math.fround(this.insets.left_ + w) - this.loadingText.width()) - 12), Math.fround(Math.fround(Math.fround(this.insets.top_ + h) - this.loadingText.height()) - 6));
    PixelScene.align$Component(this.loadingText);
    this.add$Gizmo(this.loadingText);
    if (InterlevelScene.mode === InterlevelScene$Mode.DESCEND && InterlevelScene.lastRegion <= 5 && !DeviceCompat.isDebug()) {
      if (Dungeon.hero == null || (loadingDepth > Statistics.deepestFloor && loadingDepth % 5 === 1)) {
        this.storyMessage = PixelScene.renderTextBlock$String$int(Document.INTROS.pageBody$int(region), 6);
        this.storyMessage.maxWidth$int(PixelScene.landscape() ? 180 : 125);
        this.storyMessage.setPos(Math.fround(this.insets.left_ + Math.fround((Math.fround(w - this.storyMessage.width())) / 2)), Math.fround(this.insets.top_ + Math.fround((Math.fround(h - this.storyMessage.height())) / 2)));
        this.storyBG = new ShadowBox()._ShadowBox();
        this.storyBG.boxRect(Math.fround(this.storyMessage.left() - 10), Math.fround(this.storyMessage.top() - 10), Math.fround(this.storyMessage.width() + 20), Math.fround(this.storyMessage.height() + 20));
        this.storyBG.alpha$float(Math.fround(0.8));
        this.add$Gizmo(this.storyBG);
        this.add$Gizmo(this.storyMessage);
        this.btnContinue = new (InterlevelScene$2())().$o(this).$c(region)._StyledButton$Type$String$int(Chrome$Type.TOAST_TR, Messages.get$Class$String$ObjectArr($J.cls(InterlevelScene), 'continue', []), 9);
        this.btnContinue.icon$Image(Icons.STAIRS.get());
        this.btnContinue.setSize(Math.fround(this.btnContinue.reqWidth() + 10), 22);
        this.btnContinue.visible_ = false;
        this.btnContinue.enable(false);
        KeyEvent.addKeyListener(new (InterlevelScene$3())().$o(this).$c(im, region));
        this.btnContinue.setPos(Math.fround(this.insets.left_ + Math.fround((Math.fround(w - this.btnContinue.width())) / 2)), Math.fround(this.storyMessage.bottom() + 10));
        this.add$Gizmo(this.btnContinue);
        this.btnHideStory = new (InterlevelScene$4())().$o(this).$c(im)._IconButton$Image(Icons.CHEVRON.get());
        this.btnHideStory.icon$().originToCenter();
        this.btnHideStory.icon$().angle = 180;
        this.btnHideStory.setRect(Math.fround(this.btnContinue.right() + 2), this.btnContinue.top(), 20, 21);
        PixelScene.align$Component(this.btnHideStory);
        this.btnHideStory.enable(false);
        this.add$Gizmo(this.btnHideStory);
        this.btnContinue.alpha$float(0);
        this.storyBG.alpha$float(0);
        this.storyMessage.alpha(0);
        this.btnHideStory.icon$().alpha$float(0);
      }
    }
    this.phase = InterlevelScene$Phase.FADE_IN;
    this.timeLeft = InterlevelScene.fadeTime;
    if (InterlevelScene.thread == null) {
      InterlevelScene.thread = new (InterlevelScene$5())().$o(this)._Thread();
      InterlevelScene.thread.run();
    }
    this.waitingTime = 0;
  }
  update(): void {
    super.update();
    if (this.btnContinue == null || !this.btnContinue.isActive()) {
      this.waitingTime = Math.fround(this.waitingTime + Game.elapsed);
    }
    if (InterlevelScene.mode !== InterlevelScene$Mode.FALL && this.dots !== Math.ceil(Math.fround(this.waitingTime / (Math.fround((Math.fround(2 * InterlevelScene.fadeTime)) / 3))))) {
      let text = Messages.get$Class$String$ObjectArr($J.cls(InterlevelScene$Mode), InterlevelScene.mode.name(), []);
      this.dots = $J.d2i(Math.ceil(Math.fround(this.waitingTime / (Math.fround((Math.fround(2 * InterlevelScene.fadeTime)) / 3))))) % 3;
      switch (this.dots) {
        case 1:
        default:
          this.loadingText.text$String(text + '.');
          break;
        case 2:
          this.loadingText.text$String(text + '..');
          break;
        case 0:
          this.loadingText.text$String(text + '...');
          break;
      }
    }
    let w = $J.d2i((Math.fround(Math.fround(Camera.main.width_ - this.insets.left_) - this.insets.right_)));
    let h = $J.d2i((Math.fround(Math.fround(Camera.main.height_ - this.insets.top_) - this.insets.bottom_)));
    switch (this.phase) {
      case InterlevelScene$Phase.FADE_IN:
        this.loadingText.alpha(Math.max(0, Math.fround(InterlevelScene.fadeTime - (Math.fround(this.timeLeft - Math.fround(0.333))))));
        if ((this.timeLeft = Math.fround(this.timeLeft - Game.elapsed)) <= Math.fround(0)) {
          {
            if (!InterlevelScene.thread.isAlive() && InterlevelScene.error == null) {
              this.afterLoading();
            } else {
              this.phase = InterlevelScene$Phase.STATIC;
            }
          }
        }
        break;
      case InterlevelScene$Phase.FADE_OUT:
        this.background.acc.set$float(0);
        this.background.speed_.set$float(0);
        this.loadingText.alpha(Math.min(1, Math.fround(this.timeLeft + Math.fround(0.333))));
        if (this.btnContinue != null) {
          this.btnContinue.alpha$float((Math.fround(this.timeLeft / InterlevelScene.fadeTime)));
          this.storyMessage.alpha(this.btnContinue.alpha$());
          this.storyBG.alpha$float(Math.fround(this.btnContinue.alpha$() * Math.fround(0.8)));
          this.btnHideStory.icon$().alpha$float(this.btnContinue.alpha$());
        }
        if ((this.timeLeft = Math.fround(this.timeLeft - Game.elapsed)) <= Math.fround(0)) {
          Game.switchScene$Class($J.cls(GameScene));
          KeyEvent.clearListeners();
          InterlevelScene.thread = null;
          InterlevelScene.error = null;
        }
        break;
      case InterlevelScene$Phase.STATIC:
        if (this.btnContinue != null && this.textFadingIn) {
          this.btnContinue.alpha$float(Math.min(1, Math.fround(this.btnContinue.alpha$() + Game.elapsed)));
          this.storyMessage.alpha(this.btnContinue.alpha$());
          this.storyBG.alpha$float(Math.fround(this.btnContinue.alpha$() * Math.fround(0.8)));
          this.btnHideStory.icon$().alpha$float(this.btnContinue.alpha$());
          if (this.btnContinue.alpha$() === Math.fround(1)) {
            this.textFadingIn = false;
            this.btnHideStory.enable(true);
          }
        }
        if (this.btnContinue != null && !this.textFadingIn && Game.width < Game.height) {
          if (this.background.speed_.isZero() && this.background.acc.isZero()) {
            this.background.acc.x = this.background.center$().x >= (Math.fround(w + this.insets.left_)) ? Math.fround(-1) : 1;
          } else {
            let margin = Math.fround(25 - this.insets.left_);
            this.background.speed_.x = GameMath.gate(-10, this.background.speed_.x, 10);
            if (this.background.acc.x > Math.fround(0) && this.background.x >= Math.fround(-margin)) {
              this.background.acc.x = Math.fround(-2.5);
            } else if (this.background.acc.x < Math.fround(0) && Math.fround(this.background.x + this.background.width()) <= Math.fround(w + margin)) {
              this.background.acc.x = 2.5;
            }
          }
        }
        if (InterlevelScene.error != null) {
          let errorMsg: string;
          if ($J.isa(InterlevelScene.error, FileNotFoundException)) {
            errorMsg = Messages.get$Object$String$ObjectArr(this, 'file_not_found', []);
          } else if ($J.isa(InterlevelScene.error, IOException)) {
            errorMsg = Messages.get$Object$String$ObjectArr(this, 'io_error', []);
          } else if (InterlevelScene.error.getMessage() != null && $J.equals(InterlevelScene.error.getMessage(), 'old save')) {
            errorMsg = Messages.get$Object$String$ObjectArr(this, 'io_error', []);
          } else {
            throw new RuntimeException('fatal error occurred while moving between floors. Seed:' + Dungeon.seed + ' depth:' + Dungeon.depth, InterlevelScene.error);
          }
          this.add$Gizmo(new (InterlevelScene$6())().$o(this)._WndError(errorMsg));
          InterlevelScene.thread = null;
          InterlevelScene.error = null;
        } else if (InterlevelScene.thread != null && $J.d2i(this.waitingTime) === 10) {
          this.waitingTime = 11;
          let s = '';
          for (let t of InterlevelScene.thread.getStackTrace()) {
            s += '\n';
            s += t.toString();
          }
          if (!s.includes('FileUtils.bundleToFile')) {
            Game.reportException(new RuntimeException('waited more than 10 seconds on levelgen. Seed:' + Dungeon.seed + ' depth:' + Dungeon.depth + ' trace:' + s));
          }
        }
        break;
    }
    if (InterlevelScene.mode === InterlevelScene$Mode.FALL) {
      this.loadingText.setPos(Math.fround((Math.fround(Math.fround(Math.fround(w + this.insets.left_) - this.loadingText.width()) - 4)) + Math.fround(4 * (Math.fround(Random.Float$boolean(false) - 0.5)))), Math.fround((Math.fround(Math.fround(Math.fround(h + this.insets.top_) - this.loadingText.height()) - 6)) + Math.fround(4 * (Math.fround(Random.Float$boolean(false) - 0.5)))));
      PixelScene.align$Component(this.loadingText);
    }
  }
  afterLoading(): void {
    if (this.btnContinue != null) {
      this.btnContinue.visible_ = true;
      let alpha = this.btnContinue.alpha$();
      this.btnContinue.enable(true);
      this.btnContinue.alpha$float(alpha);
      this.phase = InterlevelScene$Phase.STATIC;
    } else {
      this.phase = InterlevelScene$Phase.FADE_OUT;
      this.timeLeft = InterlevelScene.fadeTime;
    }
  }
  descend(): void {
    if (Dungeon.hero == null) {
      Mob.clearHeldAllies();
      Dungeon.init();
      GameLog.wipe();
      if (DeviceCompat.isDebug()) {
        let trueDepth = Dungeon.depth;
        let trueBranch = Dungeon.branch;
        for (let i = 1; i < ((trueDepth + (trueBranch === 0 ? 0 : 1)) | 0); i++) {
          if (!Dungeon.levelHasBeenGenerated(i, 0)) {
            Dungeon.depth = i;
            Dungeon.branch = 0;
            Dungeon.level = Dungeon.newLevel();
            Dungeon.saveLevel(GamesInProgress.curSlot);
          }
        }
        Dungeon.depth = trueDepth;
        Dungeon.branch = trueBranch;
      }
      let level = Dungeon.newLevel();
      Dungeon.switchLevel(level, -1);
    } else {
      if (InterlevelScene.curTransition.destBranch !== Dungeon.branch && Dungeon.depth >= 16 && Dungeon.depth <= 20) {
      } else {
        Mob.holdAllies$Level(Dungeon.level);
      }
      Dungeon.saveAll();
      let level: Level;
      Dungeon.depth = InterlevelScene.curTransition.destDepth;
      Dungeon.branch = InterlevelScene.curTransition.destBranch;
      if (Dungeon.levelHasBeenGenerated(Dungeon.depth, Dungeon.branch)) {
        level = Dungeon.loadLevel(GamesInProgress.curSlot);
      } else {
        level = Dungeon.newLevel();
      }
      let destTransition = level.getTransition$Type(InterlevelScene.curTransition.destType);
      InterlevelScene.curTransition = null;
      Dungeon.switchLevel(level, destTransition.cell());
    }
  }
  fall(): void {
    Mob.holdAllies$Level(Dungeon.level);
    Buff.affect$Char$Class(Dungeon.hero, $J.cls(Chasm$Falling));
    Dungeon.saveAll();
    let level: Level;
    Dungeon.depth++;
    if (Dungeon.levelHasBeenGenerated(Dungeon.depth, Dungeon.branch)) {
      level = Dungeon.loadLevel(GamesInProgress.curSlot);
    } else {
      level = Dungeon.newLevel();
    }
    Dungeon.switchLevel(level, level.fallCell(InterlevelScene.fallIntoPit));
  }
  ascend(): void {
    if (InterlevelScene.curTransition.destBranch !== Dungeon.branch && Dungeon.depth >= 16 && Dungeon.depth <= 20) {
    } else {
      Mob.holdAllies$Level(Dungeon.level);
    }
    Dungeon.saveAll();
    let level: Level;
    Dungeon.depth = InterlevelScene.curTransition.destDepth;
    Dungeon.branch = InterlevelScene.curTransition.destBranch;
    if (Dungeon.levelHasBeenGenerated(Dungeon.depth, Dungeon.branch)) {
      level = Dungeon.loadLevel(GamesInProgress.curSlot);
    } else {
      level = Dungeon.newLevel();
    }
    let destTransition = level.getTransition$Type(InterlevelScene.curTransition.destType);
    InterlevelScene.curTransition = null;
    Dungeon.switchLevel(level, destTransition.cell());
  }
  returnTo(): void {
    Mob.holdAllies$Level(Dungeon.level);
    Dungeon.saveAll();
    let level: Level;
    Dungeon.depth = InterlevelScene.returnDepth;
    Dungeon.branch = InterlevelScene.returnBranch;
    if (Dungeon.levelHasBeenGenerated(Dungeon.depth, Dungeon.branch)) {
      level = Dungeon.loadLevel(GamesInProgress.curSlot);
    } else {
      level = Dungeon.newLevel();
    }
    Dungeon.switchLevel(level, InterlevelScene.returnPos);
  }
  restore(): void {
    Mob.clearHeldAllies();
    GameLog.wipe();
    Dungeon.loadGame$int(GamesInProgress.curSlot);
    if (Dungeon.depth === -1) {
      Dungeon.depth = Statistics.deepestFloor;
      Dungeon.switchLevel(Dungeon.loadLevel(GamesInProgress.curSlot), -1);
    } else {
      let level = Dungeon.loadLevel(GamesInProgress.curSlot);
      Dungeon.switchLevel(level, Dungeon.hero.pos);
    }
  }
  resurrect(): void {
    Mob.holdAllies$Level(Dungeon.level);
    let level: Level;
    if (Dungeon.level.locked) {
      let preservedItems = Dungeon.level.getItemsToPreserveFromSealedResurrect();
      Dungeon.hero.resurrect();
      level = Dungeon.newLevel();
      Dungeon.hero.pos = level.randomRespawnCell(Dungeon.hero);
      if (Dungeon.hero.pos === -1) {
        Dungeon.hero.pos = level.entrance();
      }
      for (const $it1 = preservedItems.iterator(); $it1.hasNext(); ) {
        let i = $it1.next();
        let pos = level.randomRespawnCell(null);
        if (pos === -1) {
          pos = level.entrance();
        }
        level.drop(i, pos);
      }
      let pos = level.randomRespawnCell(null);
      if (pos === -1) {
        pos = level.entrance();
      }
      level.drop(new LostBackpack()._LostBackpack(), pos);
      if (Dungeon.hero.buff($J.cls(SkeletonKey$KeyReplacementTracker)) != null) {
        Dungeon.hero.buff($J.cls(SkeletonKey$KeyReplacementTracker)).clearDepth();
      }
    } else {
      level = Dungeon.level;
      BArray.setFalse(level.heroFOV);
      BArray.setFalse(level.visited);
      BArray.setFalse(level.mapped);
      let invPos = Dungeon.hero.pos;
      let tries = 0;
      do {
        Dungeon.hero.pos = level.randomRespawnCell(Dungeon.hero);
        tries++;
      } while (level.traps.get(Dungeon.hero.pos) != null || (level.plants.get(Dungeon.hero.pos) != null && tries < 500) || level.trueDistance(invPos, Dungeon.hero.pos) <= Math.fround((30 - ($J.idiv(tries, 10))) | 0));
      if (level.map_[Dungeon.hero.pos] === Terrain.HIGH_GRASS || level.map_[Dungeon.hero.pos] === Terrain.FURROWED_GRASS) {
        level.map_[Dungeon.hero.pos] = Terrain.GRASS;
      }
      Dungeon.hero.resurrect();
      level.drop(new LostBackpack()._LostBackpack(), invPos);
    }
    Notes.add$Landmark(Notes$Landmark.LOST_PACK);
    Dungeon.switchLevel(level, Dungeon.hero.pos);
  }
  reset(): void {
    Mob.holdAllies$Level(Dungeon.level);
    SpecialRoom.resetPitRoom((Dungeon.depth + 1) | 0);
    let level = Dungeon.newLevel();
    Dungeon.switchLevel(level, level.entrance());
  }
  onBackPressed(): void {
  }
  static $clinit() {
    InterlevelScene.curTransition = null;
    InterlevelScene.error = null;
    InterlevelScene.lastRegion = -1;
  }
}

export class InterlevelScene$Mode extends JEnum {
  static DESCEND: InterlevelScene$Mode = null;
  static ASCEND: InterlevelScene$Mode = null;
  static CONTINUE: InterlevelScene$Mode = null;
  static RESURRECT: InterlevelScene$Mode = null;
  static RETURN: InterlevelScene$Mode = null;
  static FALL: InterlevelScene$Mode = null;
  static RESET: InterlevelScene$Mode = null;
  static NONE: InterlevelScene$Mode = null;
  static $VALUES: InterlevelScene$Mode[] = null;
  _InterlevelScene$Mode($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): InterlevelScene$Mode[] { return InterlevelScene$Mode.$VALUES.slice(); }
  static valueOf(name: string): InterlevelScene$Mode { return $J.enumValueOf(InterlevelScene$Mode, name); }
  static $clinit() {
    InterlevelScene$Mode.DESCEND = new InterlevelScene$Mode()._InterlevelScene$Mode('DESCEND', 0);
    InterlevelScene$Mode.ASCEND = new InterlevelScene$Mode()._InterlevelScene$Mode('ASCEND', 1);
    InterlevelScene$Mode.CONTINUE = new InterlevelScene$Mode()._InterlevelScene$Mode('CONTINUE', 2);
    InterlevelScene$Mode.RESURRECT = new InterlevelScene$Mode()._InterlevelScene$Mode('RESURRECT', 3);
    InterlevelScene$Mode.RETURN = new InterlevelScene$Mode()._InterlevelScene$Mode('RETURN', 4);
    InterlevelScene$Mode.FALL = new InterlevelScene$Mode()._InterlevelScene$Mode('FALL', 5);
    InterlevelScene$Mode.RESET = new InterlevelScene$Mode()._InterlevelScene$Mode('RESET', 6);
    InterlevelScene$Mode.NONE = new InterlevelScene$Mode()._InterlevelScene$Mode('NONE', 7);
    InterlevelScene$Mode.$VALUES = [InterlevelScene$Mode.DESCEND, InterlevelScene$Mode.ASCEND, InterlevelScene$Mode.CONTINUE, InterlevelScene$Mode.RESURRECT, InterlevelScene$Mode.RETURN, InterlevelScene$Mode.FALL, InterlevelScene$Mode.RESET, InterlevelScene$Mode.NONE];
  }
}

export class InterlevelScene$Phase extends JEnum {
  static FADE_IN: InterlevelScene$Phase = null;
  static STATIC: InterlevelScene$Phase = null;
  static FADE_OUT: InterlevelScene$Phase = null;
  static $VALUES: InterlevelScene$Phase[] = null;
  _InterlevelScene$Phase($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): InterlevelScene$Phase[] { return InterlevelScene$Phase.$VALUES.slice(); }
  static valueOf(name: string): InterlevelScene$Phase { return $J.enumValueOf(InterlevelScene$Phase, name); }
  static $clinit() {
    InterlevelScene$Phase.FADE_IN = new InterlevelScene$Phase()._InterlevelScene$Phase('FADE_IN', 0);
    InterlevelScene$Phase.STATIC = new InterlevelScene$Phase()._InterlevelScene$Phase('STATIC', 1);
    InterlevelScene$Phase.FADE_OUT = new InterlevelScene$Phase()._InterlevelScene$Phase('FADE_OUT', 2);
    InterlevelScene$Phase.$VALUES = [InterlevelScene$Phase.FADE_IN, InterlevelScene$Phase.STATIC, InterlevelScene$Phase.FADE_OUT];
  }
}

let $InterlevelScene$1: any = null;
/** An anonymous class (InterlevelScene.java:253). */
function InterlevelScene$1(): any {
  return $InterlevelScene$1 ??= $J.local(class extends Image {
    update(): void {
      super.update();
      if (InterlevelScene.lastRegion === 6) {
        this.aa = 1;
      } else if (this.$outer.phase === InterlevelScene$Phase.FADE_IN) {
        this.aa = Math.max(0, Math.fround(2 * (Math.fround(this.$outer.timeLeft - (Math.fround(InterlevelScene.fadeTime - Math.fround(0.333)))))));
      } else if (this.$outer.phase === InterlevelScene$Phase.FADE_OUT) {
        this.aa = Math.max(0, Math.fround(2 * (Math.fround(Math.fround(0.333) - this.$outer.timeLeft))));
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$1', []);
}

let $InterlevelScene$2: any = null;
/** An anonymous class (InterlevelScene.java:291). */
function InterlevelScene$2(): any {
  return $InterlevelScene$2 ??= $J.local(class extends StyledButton {
    onClick(): void {
      this.$outer.phase = InterlevelScene$Phase.FADE_OUT;
      this.$outer.timeLeft = InterlevelScene.fadeTime;
      this.$outer.btnContinue.enable(false);
      Document.INTROS.readPage$int(this.$cv_region);
    }
    $c($region): this {
      this.$cv_region = $region;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$2', []);
}

let $InterlevelScene$3$1: any = null;
/** An anonymous class (InterlevelScene.java:314). */
function InterlevelScene$3$1(): any {
  return $InterlevelScene$3$1 ??= $J.local(class extends Tweener {
    updateValues(progress: number): void {
      let uiAlpha = progress;
      this.$outer.$outer.btnContinue.alpha$float(uiAlpha);
      this.$outer.$outer.storyBG.alpha$float(Math.fround(uiAlpha * Math.fround(0.8)));
      this.$outer.$outer.storyMessage.alpha(uiAlpha);
      this.$outer.$outer.btnHideStory.icon$().alpha$float(uiAlpha);
      this.$outer.$outer.loadingText.alpha(uiAlpha);
      this.$cv_im.am = uiAlpha;
    }
    $c($im): this {
      this.$cv_im = $im;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$3$1', []);
}

let $InterlevelScene$3: any = null;
/** An anonymous class (InterlevelScene.java:306). */
function InterlevelScene$3(): any {
  return $InterlevelScene$3 ??= $J.local(class extends JObject {
    onSignal(keyEvent: KeyEvent): boolean {
      if (!keyEvent.pressed && this.$outer.btnContinue.active) {
        if (this.$outer.btnHideStory.active && !this.$outer.btnHideStory.icon$().visible_) {
          this.$outer.btnHideStory.setRect(Math.fround(this.$outer.btnContinue.right() + 2), this.$outer.btnContinue.top(), 20, 21);
          PixelScene.align$Component(this.$outer.btnHideStory);
          this.$outer.btnHideStory.icon$().visible_ = true;
          this.$outer.btnHideStory.parent.add$Gizmo(new (InterlevelScene$3$1())().$o(this).$c(this.$cv_im)._Tweener(this.$outer.parent, 0.5));
        } else {
          this.$outer.phase = InterlevelScene$Phase.FADE_OUT;
          this.$outer.timeLeft = InterlevelScene.fadeTime;
          this.$outer.btnContinue.enable(false);
          Document.INTROS.readPage$int(this.$cv_region);
        }
        return true;
      }
      return false;
    }
    $c($im, $region): this {
      this.$cv_im = $im; this.$cv_region = $region;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$3', ['com.watabou.utils.Signal$Listener']);
}

let $InterlevelScene$4$1: any = null;
/** An anonymous class (InterlevelScene.java:350). */
function InterlevelScene$4$1(): any {
  return $InterlevelScene$4$1 ??= $J.local(class extends Tweener {
    updateValues(progress: number): void {
      let uiAlpha = Math.fround(1 - progress);
      this.$outer.$outer.btnContinue.alpha$float(uiAlpha);
      this.$outer.$outer.storyBG.alpha$float(Math.fround(uiAlpha * Math.fround(0.8)));
      this.$outer.$outer.storyMessage.alpha(uiAlpha);
      this.$outer.icon_.alpha$float(uiAlpha);
      this.$outer.$outer.loadingText.alpha(uiAlpha);
      this.$cv_im.am = uiAlpha;
    }
    onComplete(): void {
      super.onComplete();
      this.$outer.setRect(0, 0, Math.fround(Camera.main.width_), Math.fround(Camera.main.height_));
      this.$outer.enable(true);
      this.$outer.icon_.visible_ = false;
    }
    $c($im): this {
      this.$cv_im = $im;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$4$1', []);
}

let $InterlevelScene$4$2: any = null;
/** An anonymous class (InterlevelScene.java:374). */
function InterlevelScene$4$2(): any {
  return $InterlevelScene$4$2 ??= $J.local(class extends Tweener {
    updateValues(progress: number): void {
      let uiAlpha = progress;
      this.$outer.$outer.btnContinue.alpha$float(uiAlpha);
      this.$outer.$outer.storyBG.alpha$float(Math.fround(uiAlpha * Math.fround(0.8)));
      this.$outer.$outer.storyMessage.alpha(uiAlpha);
      this.$outer.icon_.alpha$float(uiAlpha);
      this.$outer.$outer.loadingText.alpha(uiAlpha);
      this.$cv_im.am = uiAlpha;
    }
    $c($im): this {
      this.$cv_im = $im;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$4$2', []);
}

let $InterlevelScene$4: any = null;
/** An anonymous class (InterlevelScene.java:341). */
function InterlevelScene$4(): any {
  return $InterlevelScene$4 ??= $J.local(class extends IconButton {
    onClick(): void {
      if (this.$outer.btnContinue.alpha$() !== Math.fround(0) && this.$outer.btnContinue.alpha$() !== Math.fround(1)) {
        return;
      }
      if (this.icon_.visible_) {
        this.enable(false);
        this.parent.add$Gizmo(new (InterlevelScene$4$1())().$o(this).$c(this.$cv_im)._Tweener(this.parent, 0.5));
      } else {
        this.setRect(Math.fround(this.$outer.btnContinue.right() + 2), this.$outer.btnContinue.top(), 20, 21);
        PixelScene.align$Component(this);
        this.icon_.visible_ = true;
        this.parent.add$Gizmo(new (InterlevelScene$4$2())().$o(this).$c(this.$cv_im)._Tweener(this.parent, 0.5));
      }
    }
    onPointerDown(): void {
      if (this.icon_.visible_) {
        super.onPointerDown();
      }
    }
    $c($im): this {
      this.$cv_im = $im;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$4', []);
}

let $InterlevelScene$5: any = null;
/** An anonymous class (InterlevelScene.java:414). */
function InterlevelScene$5(): any {
  return $InterlevelScene$5 ??= $J.local(class extends Thread {
    run(): void {
      try {
        Actor.fixTime();
        switch (InterlevelScene.mode) {
          case InterlevelScene$Mode.DESCEND:
            this.$outer.descend();
            break;
          case InterlevelScene$Mode.ASCEND:
            this.$outer.ascend();
            break;
          case InterlevelScene$Mode.CONTINUE:
            this.$outer.restore();
            break;
          case InterlevelScene$Mode.RESURRECT:
            this.$outer.resurrect();
            break;
          case InterlevelScene$Mode.RETURN:
            this.$outer.returnTo();
            break;
          case InterlevelScene$Mode.FALL:
            this.$outer.fall();
            break;
          case InterlevelScene$Mode.RESET:
            this.$outer.reset();
            break;
        }
      } catch ($e0) {
        if ($J.isa($e0, Exception)) {
          let e = $J.exc($e0);
          InterlevelScene.error = e;
        } else {
          throw $e0;
        }
      }
      {
        if (this.$outer.phase === InterlevelScene$Phase.STATIC && InterlevelScene.error == null) {
          this.$outer.afterLoading();
        }
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$5', []);
}

let $InterlevelScene$6: any = null;
/** An anonymous class (InterlevelScene.java:571). */
function InterlevelScene$6(): any {
  return $InterlevelScene$6 ??= $J.local(class extends WndError {
    onBackPressed(): void {
      super.onBackPressed();
      Game.switchScene$Class($J.cls(StartScene));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$6', []);
}

$J.define(InterlevelScene, 'com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene', ctors: { '': '_InterlevelScene' }, clinit: true, lazy: ['fadeTime', 'mode', 'curTransition', 'returnDepth', 'returnBranch', 'returnPos', 'fallIntoPit', 'thread', 'error', 'lastRegion'] });
$J.define(InterlevelScene$Mode, 'com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$Mode', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_InterlevelScene$Mode' }, clinit: true, lazy: ['$VALUES', 'DESCEND', 'ASCEND', 'CONTINUE', 'RESURRECT', 'RETURN', 'FALL', 'RESET', 'NONE'] });
$J.define(InterlevelScene$Phase, 'com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$Phase', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_InterlevelScene$Phase' }, clinit: true, lazy: ['$VALUES', 'FADE_IN', 'STATIC', 'FADE_OUT'] });
$J.module(() => {
  Assets$Splashes = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Splashes');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  GamesInProgress = $J.load('com.shatteredpixel.shatteredpixeldungeon.GamesInProgress');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Mob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob');
  ShadowBox = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.ShadowBox');
  LostBackpack = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.LostBackpack');
  SkeletonKey$KeyReplacementTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SkeletonKey$KeyReplacementTracker');
  Document = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Document');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Notes$Landmark = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Chasm$Falling = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.Chasm$Falling');
  SpecialRoom = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.rooms.special.SpecialRoom');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  StartScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.StartScene');
  GameLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.GameLog');
  IconButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.IconButton');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  StyledButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.StyledButton');
  TitleBackground = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TitleBackground');
  WndError = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndError');
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  KeyEvent = $J.load('com.watabou.input.KeyEvent');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  Tweener = $J.load('com.watabou.noosa.tweeners.Tweener');
  BArray = $J.load('com.watabou.utils.BArray');
  DeviceCompat = $J.load('com.watabou.utils.DeviceCompat');
  GameMath = $J.load('com.watabou.utils.GameMath');
  PlatformSupport = $J.load('com.watabou.utils.PlatformSupport');
  Random = $J.load('com.watabou.utils.Random');
});
