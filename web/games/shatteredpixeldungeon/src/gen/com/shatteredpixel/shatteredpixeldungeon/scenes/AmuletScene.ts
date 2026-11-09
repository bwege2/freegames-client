// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/scenes/AmuletScene.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Music, Assets$Sprites, Badges, Chrome$Type, Dungeon, GamesInProgress, BadgeBanner, Flare, Speck, Amulet, Messages, InterlevelScene, InterlevelScene$Mode, RankingsScene, ItemSprite, ItemSpriteSheet, Icons, StyledButton, Camera, Game, Image, Music, Delayer, Random;

export class AmuletScene extends PixelScene {
  static readonly WIDTH: number = 120;
  static readonly BTN_HEIGHT: number = 20;
  static readonly SMALL_GAP: number = 2;
  static readonly LARGE_GAP: number = 8;
  static noText: boolean = false;
  amulet: Image = null;
  btnExit: StyledButton = null;
  btnStay: StyledButton = null;
  timer: number = 0;
  _AmuletScene(): this {
    this._PixelScene();
    this.inGameScene = true;
    this.btnExit = null;
    this.btnStay = null;
    this.timer = 0;
    return this;
  }
  create(): void {
    super.create();
    let text = null;
    if (!AmuletScene.noText) {
      text = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'text', []), 8);
      text.maxWidth$int(PixelScene.landscape() ? (Math.imul(2, AmuletScene.WIDTH) - 4) | 0 : AmuletScene.WIDTH);
    }
    this.amulet = new Image()._Image$Object(Assets$Sprites.AMULET);
    this.add$Gizmo(this.amulet);
    this.btnExit = new (AmuletScene$1())().$o(this)._StyledButton$Type$String(Chrome$Type.GREY_BUTTON_TR, Messages.get$Object$String$ObjectArr(this, 'exit', []));
    this.btnExit.icon$Image(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.AMULET));
    this.btnExit.setSize(Math.fround(AmuletScene.WIDTH), Math.fround(AmuletScene.BTN_HEIGHT));
    this.add$Gizmo(this.btnExit);
    this.btnStay = new (AmuletScene$2())().$o(this)._StyledButton$Type$String(Chrome$Type.GREY_BUTTON_TR, Messages.get$Object$String$ObjectArr(this, 'stay', []));
    this.btnStay.icon$Image(Icons.CLOSE.get());
    this.btnStay.setSize(Math.fround(AmuletScene.WIDTH), Math.fround(AmuletScene.BTN_HEIGHT));
    this.add$Gizmo(this.btnStay);
    let insets = this.getCommonInsets();
    let w = $J.d2i((Math.fround(Math.fround(Camera.main.width_ - insets.left_) + insets.right_)));
    let h = $J.d2i((Math.fround(Math.fround(Camera.main.height_ - insets.top_) + insets.bottom_)));
    let height: number;
    if (AmuletScene.noText) {
      height = Math.fround(Math.fround(Math.fround(Math.fround(this.amulet.height_ + AmuletScene.LARGE_GAP) + this.btnExit.height()) + AmuletScene.SMALL_GAP) + this.btnStay.height());
      this.amulet.x = Math.fround(insets.left_ + Math.fround((Math.fround(w - this.amulet.width_)) / 2));
      this.amulet.y = Math.fround(insets.top_ + Math.fround((Math.fround(h - height)) / 2));
      PixelScene.align$Visual(this.amulet);
      this.btnExit.setPos(Math.fround(insets.left_ + Math.fround((Math.fround(w - this.btnExit.width())) / 2)), Math.fround(Math.fround(this.amulet.y + this.amulet.height_) + AmuletScene.LARGE_GAP));
      this.btnStay.setPos(this.btnExit.left(), Math.fround(this.btnExit.bottom() + AmuletScene.SMALL_GAP));
    } else {
      height = Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(this.amulet.height_ + AmuletScene.LARGE_GAP) + text.height()) + AmuletScene.LARGE_GAP) + this.btnExit.height()) + AmuletScene.SMALL_GAP) + this.btnStay.height());
      this.amulet.x = Math.fround(insets.left_ + Math.fround((Math.fround(w - this.amulet.width_)) / 2));
      this.amulet.y = Math.fround(insets.top_ + Math.fround((Math.fround(h - height)) / 2));
      PixelScene.align$Visual(this.amulet);
      text.setPos(Math.fround(insets.left_ + Math.fround((Math.fround(w - text.width())) / 2)), Math.fround(Math.fround(this.amulet.y + this.amulet.height_) + AmuletScene.LARGE_GAP));
      PixelScene.align$Component(text);
      this.add$Gizmo(text);
      this.btnExit.setPos(Math.fround(insets.left_ + Math.fround((Math.fround(w - this.btnExit.width())) / 2)), Math.fround(Math.fround(text.top() + text.height()) + AmuletScene.LARGE_GAP));
      this.btnStay.setPos(this.btnExit.left(), Math.fround(this.btnExit.bottom() + AmuletScene.SMALL_GAP));
    }
    new Flare()._Flare(8, 48).color$int$boolean(16768443, true).show$Visual$float(this.amulet, 0).angularSpeed = Math.fround(+30);
    this.fadeIn$();
  }
  onBackPressed(): void {
    if (this.btnExit.isActive()) {
      InterlevelScene.mode = InterlevelScene$Mode.CONTINUE;
      Game.switchScene$Class($J.cls(InterlevelScene));
    }
  }
  update(): void {
    super.update();
    if ((this.timer = Math.fround(this.timer - Game.elapsed)) < Math.fround(0)) {
      this.timer = Random.Float$float$float(0.5, 5);
      let star = this.recycle($J.cls(Speck));
      star.reset(0, Math.fround(this.amulet.x + 10.5), Math.fround(this.amulet.y + 5.5), Speck.DISCOVER);
      this.add$Gizmo(star);
    }
  }
  static $clinit() {
    AmuletScene.noText = false;
  }
}

let $AmuletScene$1$1$1: any = null;
/** An anonymous class (AmuletScene.java:91). */
function AmuletScene$1$1$1(): any {
  return $AmuletScene$1$1$1 ??= $J.local(class extends Delayer {
    onComplete(): void {
      Game.switchScene$Class($J.cls(RankingsScene));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AmuletScene$1$1$1', []);
}

let $AmuletScene$1$1: any = null;
/** An anonymous class (AmuletScene.java:87). */
function AmuletScene$1$1(): any {
  return $AmuletScene$1$1 ??= $J.local(class extends Delayer {
    onComplete(): void {
      if (BadgeBanner.isShowingBadges()) {
        this.$outer.$outer.add$Gizmo(new (AmuletScene$1$1$1())().$o(this)._Delayer$float(3));
      } else {
        Game.switchScene$Class($J.cls(RankingsScene));
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AmuletScene$1$1', []);
}

let $AmuletScene$1: any = null;
/** An anonymous class (AmuletScene.java:78). */
function AmuletScene$1(): any {
  return $AmuletScene$1 ??= $J.local(class extends StyledButton {
    onClick(): void {
      Dungeon.win($J.cls(Amulet));
      Dungeon.deleteGame(GamesInProgress.curSlot, true);
      Badges.saveGlobal$();
      this.$outer.btnExit.enable(false);
      this.$outer.btnStay.enable(false);
      this.$outer.add$Gizmo(new (AmuletScene$1$1())().$o(this)._Delayer$float(Math.fround(0.1)));
      Music.INSTANCE.playTracks([Assets$Music.THEME_2, Assets$Music.THEME_1], [1, 1], false);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AmuletScene$1', []);
}

let $AmuletScene$2: any = null;
/** An anonymous class (AmuletScene.java:112). */
function AmuletScene$2(): any {
  return $AmuletScene$2 ??= $J.local(class extends StyledButton {
    onClick(): void {
      this.$outer.onBackPressed();
      this.$outer.btnExit.enable(false);
      this.$outer.btnStay.enable(false);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AmuletScene$2', []);
}

$J.define(AmuletScene, 'com.shatteredpixel.shatteredpixeldungeon.scenes.AmuletScene', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene', ctors: { '': '_AmuletScene' }, clinit: true, lazy: ['noText'] });
$J.module(() => {
  Assets$Music = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Music');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  GamesInProgress = $J.load('com.shatteredpixel.shatteredpixeldungeon.GamesInProgress');
  BadgeBanner = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.BadgeBanner');
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Amulet = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Amulet');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  InterlevelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene');
  InterlevelScene$Mode = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.InterlevelScene$Mode');
  RankingsScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.RankingsScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  StyledButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.StyledButton');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Delayer = $J.load('com.watabou.noosa.tweeners.Delayer');
  Random = $J.load('com.watabou.utils.Random');
});
