// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/scenes/RankingsScene.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Music, Badges, Badges$Badge, Dungeon, Rankings, SPDSettings, ShatteredPixelDungeon, HeroClass, Flare, Messages, TitleScene, ItemSprite, ItemSpriteSheet, ExitButton, IconButton, Icons, TitleBackground, Window, IconTitle, WndDailies, WndRanking, WndVictoryCongrats, BitmapText, Camera, Game, Image, Music, DeviceCompat, GameMath;

export class RankingsScene extends PixelScene {
  static readonly ROW_HEIGHT_MAX: number = 20;
  static readonly ROW_HEIGHT_MIN: number = 12;
  static readonly MAX_ROW_WIDTH: number = 160;
  static readonly GAP: number = 4;
  _RankingsScene(): this {
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
    Rankings.INSTANCE.load();
    let title = new IconTitle()._IconTitle$Image$String(Icons.RANKINGS.get(), Messages.get$Object$String$ObjectArr(this, 'title', []));
    title.setSize(200, 0);
    title.setPos(Math.fround(insets.left_ + Math.fround((Math.fround(w - title.reqWidth())) / 2)), Math.fround(insets.top_ + Math.fround((Math.fround(20 - title.height())) / 2)));
    PixelScene.align$Component(title);
    this.add$Gizmo(title);
    if (Rankings.INSTANCE.records.size() > 0) {
      let rowHeight = GameMath.gate(RankingsScene.ROW_HEIGHT_MIN, Math.fround($J.idiv(((h - 26) | 0), Rankings.INSTANCE.records.size())), RankingsScene.ROW_HEIGHT_MAX);
      let left = Math.fround(Math.fround((Math.fround(w - Math.min(RankingsScene.MAX_ROW_WIDTH, Math.fround(w)))) / 2) + RankingsScene.GAP);
      let top = Math.fround((Math.fround(h - Math.fround(rowHeight * Rankings.INSTANCE.records.size()))) / 2);
      let pos = 0;
      for (const $it0 = Rankings.INSTANCE.records.iterator(); $it0.hasNext(); ) {
        let rec = $it0.next();
        let row = new RankingsScene$Record()._RankingsScene$Record(pos, pos === Rankings.INSTANCE.lastRecord, rec);
        let offset = 0;
        if (rowHeight <= Math.fround(14)) {
          offset = Math.fround((pos % 2 === 1) ? 5 : -5);
        }
        row.setRect(Math.fround(Math.fround(insets.left_ + left) + offset), Math.fround(Math.fround(insets.top_ + top) + Math.fround(pos * rowHeight)), Math.fround(w - Math.fround(left * 2)), rowHeight);
        this.add$Gizmo(row);
        pos++;
      }
      if (Rankings.INSTANCE.totalNumber >= Rankings.TABLE_SIZE) {
        let label = PixelScene.renderTextBlock$int(8);
        label.hardlight(13421772);
        label.setHightlighting$boolean$int(true, Window.SHPX_COLOR);
        label.text$String(Messages.get$Object$String$ObjectArr(this, 'total', []) + ' _' + Rankings.INSTANCE.wonNumber + '_/' + Rankings.INSTANCE.totalNumber);
        this.add$Gizmo(label);
        label.setPos(Math.fround(insets.left_ + Math.fround((Math.fround(w - label.width())) / 2)), Math.fround(Math.fround(Math.fround(insets.top_ + h) - label.height()) - Math.fround(2 * RankingsScene.GAP)));
        PixelScene.align$Component(label);
      }
    } else {
      let noRec = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'no_games', []), 8);
      noRec.hardlight(13421772);
      noRec.setPos(Math.fround(insets.left_ + Math.fround((Math.fround(w - noRec.width())) / 2)), Math.fround(insets.top_ + Math.fround((Math.fround(h - noRec.height())) / 2)));
      PixelScene.align$Component(noRec);
      this.add$Gizmo(noRec);
    }
    let btnExit = new ExitButton()._ExitButton();
    btnExit.setPos(Math.fround(Math.fround(Camera.main.width_ - btnExit.width()) - insets.right_), insets.top_);
    this.add$Gizmo(btnExit);
    let left = Math.fround(insets.left_ + (PixelScene.landscape() && !DeviceCompat.isDesktop() ? 10 : 0));
    if (Rankings.INSTANCE.latestDaily != null) {
      let btnDailies = new (RankingsScene$1())().$o(this)._IconButton$Image(Icons.CALENDAR.get());
      btnDailies.icon$().hardlight$float$float$float(0.5, 1, 2);
      btnDailies.setRect(left, insets.top_, 16, 20);
      left = Math.fround(left + 16);
      this.add$Gizmo(btnDailies);
    }
    if (Dungeon.daily) {
      this.addToFront(new WndDailies()._WndDailies());
    } else if (Badges.isUnlocked(Badges$Badge.VICTORY) && !SPDSettings.victoryNagged$()) {
      SPDSettings.victoryNagged$boolean(true);
      this.add$Gizmo(new WndVictoryCongrats()._WndVictoryCongrats());
    }
    this.fadeIn$();
  }
  destroy(): void {
    super.destroy();
    Dungeon.daily = Dungeon.dailyReplay = false;
  }
  onBackPressed(): void {
    ShatteredPixelDungeon.switchNoFade$Class($J.cls(TitleScene));
  }
}

export class RankingsScene$Record extends Button {
  static readonly GAP: number = 4;
  static TEXT_WIN: number[] = null;
  static TEXT_LOSE: number[] = null;
  static readonly FLARE_WIN: number = 8947814;
  static readonly FLARE_LOSE: number = 6710886;
  rec: Rankings$Record = null;
  shield: Image = null;
  flare: Flare = null;
  position: BitmapText = null;
  desc_: RenderedTextBlock = null;
  steps: Image = null;
  depth_: BitmapText = null;
  classIcon: Image = null;
  level_: BitmapText = null;
  _RankingsScene$Record(pos: number, latest: boolean, rec: Rankings$Record): this {
    this._Button();
    this.rec = rec;
    if (latest) {
      this.flare = new Flare()._Flare(6, 24);
      this.flare.angularSpeed = 90;
      this.flare.color$int(rec.win ? RankingsScene$Record.FLARE_WIN : RankingsScene$Record.FLARE_LOSE);
      this.addToBack(this.flare);
    }
    if (pos !== ((Rankings.TABLE_SIZE - 1) | 0)) {
      this.position.text$String(String((pos + 1) | 0));
    } else {
      this.position.text$String(' ');
    }
    this.position.measure();
    this.desc_.text$String(Messages.titleCase(rec.desc()));
    let odd = pos % 2;
    if (rec.win) {
      this.shield.copy(new ItemSprite()._ItemSprite$int$Glowing(ItemSpriteSheet.AMULET, null));
      this.position.hardlight$int(RankingsScene$Record.TEXT_WIN[odd]);
      this.desc_.hardlight(RankingsScene$Record.TEXT_WIN[odd]);
      this.depth_.hardlight$int(RankingsScene$Record.TEXT_WIN[odd]);
      this.level_.hardlight$int(RankingsScene$Record.TEXT_WIN[odd]);
    } else {
      this.position.hardlight$int(RankingsScene$Record.TEXT_LOSE[odd]);
      this.desc_.hardlight(RankingsScene$Record.TEXT_LOSE[odd]);
      this.depth_.hardlight$int(RankingsScene$Record.TEXT_LOSE[odd]);
      this.level_.hardlight$int(RankingsScene$Record.TEXT_LOSE[odd]);
      if (rec.depth_ !== 0) {
        this.depth_.text$String(String(rec.depth_));
        this.depth_.measure();
        this.steps.copy(Icons.STAIRS.get());
        this.add$Gizmo(this.steps);
        this.add$Gizmo(this.depth_);
      }
      if (rec.ascending) {
        this.shield.copy(new ItemSprite()._ItemSprite$int$Glowing(ItemSpriteSheet.AMULET, null));
        this.shield.hardlight$float$float$float(Math.fround(0.4), Math.fround(0.4), Math.fround(0.7));
      }
    }
    if (rec.daily) {
      this.shield.copy(Icons.get$Icons(Icons.CALENDAR));
      this.shield.hardlight$float$float$float(0.5, 1, 2);
    } else if (!(rec.customSeed.length === 0)) {
      this.shield.copy(Icons.get$Icons(Icons.SEED));
      this.shield.hardlight$float$float$float(1, 1.5, Math.fround(0.67));
    }
    if (rec.herolevel !== 0) {
      this.level_.text$String(String(rec.herolevel));
      this.level_.measure();
      this.add$Gizmo(this.level_);
    }
    this.classIcon.copy(Icons.get$HeroClass(rec.heroClass));
    if (rec.heroClass === HeroClass.ROGUE) {
      this.classIcon.brightness(2);
    }
    return this;
  }
  createChildren(): void {
    super.createChildren();
    this.shield = new Image()._Image$Image(new ItemSprite()._ItemSprite$int$Glowing(ItemSpriteSheet.TOMB, null));
    this.add$Gizmo(this.shield);
    this.position = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    this.add$Gizmo(this.position);
    this.desc_ = PixelScene.renderTextBlock$int(7);
    this.add$Gizmo(this.desc_);
    this.depth_ = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    this.steps = new Image()._Image$();
    this.classIcon = new Image()._Image$();
    this.add$Gizmo(this.classIcon);
    this.level_ = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
  }
  layout(): void {
    super.layout();
    this.shield.x = Math.fround(this.x + Math.fround((Math.fround(16 - this.shield.width_)) / 2));
    this.shield.y = Math.fround(this.y + Math.fround((Math.fround(this.height_ - this.shield.height_)) / 2));
    PixelScene.align$Visual(this.shield);
    this.position.x = Math.fround(this.shield.x + Math.fround((Math.fround(this.shield.width_ - this.position.width())) / 2));
    this.position.y = Math.fround(Math.fround(this.shield.y + Math.fround((Math.fround(this.shield.height_ - this.position.height())) / 2)) + 1);
    PixelScene.align$Visual(this.position);
    if (this.flare != null) {
      this.flare.point$PointF(this.shield.center$());
    }
    this.classIcon.x = Math.fround(Math.fround(Math.fround(this.x + this.width_) - 16) + Math.fround((Math.fround(16 - this.classIcon.width())) / 2));
    this.classIcon.y = Math.fround(this.shield.y + Math.fround((Math.fround(16 - this.classIcon.height())) / 2));
    PixelScene.align$Visual(this.classIcon);
    this.level_.x = Math.fround(this.classIcon.x + Math.fround((Math.fround(this.classIcon.width_ - this.level_.width())) / 2));
    this.level_.y = Math.fround(Math.fround(this.classIcon.y + Math.fround((Math.fround(this.classIcon.height_ - this.level_.height())) / 2)) + 1);
    PixelScene.align$Visual(this.level_);
    this.steps.x = Math.fround(Math.fround(Math.fround(this.x + this.width_) - 32) + Math.fround((Math.fround(16 - this.steps.width())) / 2));
    this.steps.y = Math.fround(this.shield.y + Math.fround((Math.fround(16 - this.steps.height())) / 2));
    PixelScene.align$Visual(this.steps);
    this.depth_.x = Math.fround(this.steps.x + Math.fround((Math.fround(this.steps.width_ - this.depth_.width())) / 2));
    this.depth_.y = Math.fround(Math.fround(this.steps.y + Math.fround((Math.fround(this.steps.height_ - this.depth_.height())) / 2)) + 1);
    PixelScene.align$Visual(this.depth_);
    this.desc_.maxWidth$int($J.d2i((Math.fround(this.steps.x - (Math.fround(Math.fround(this.x + 16) + RankingsScene$Record.GAP))))));
    this.desc_.setPos(Math.fround(Math.fround(this.x + 16) + RankingsScene$Record.GAP), Math.fround(Math.fround(this.shield.y + Math.fround((Math.fround(this.shield.height_ - this.desc_.height())) / 2)) + 1));
    PixelScene.align$Component(this.desc_);
  }
  onClick(): void {
    this.parent.add$Gizmo(new WndRanking()._WndRanking(this.rec));
  }
  static $clinit() {
    RankingsScene$Record.TEXT_WIN = [16777096, 11711071];
    RankingsScene$Record.TEXT_LOSE = [14540253, 8947848];
  }
}

let $RankingsScene$1: any = null;
/** An anonymous class (RankingsScene.java:154). */
function RankingsScene$1(): any {
  return $RankingsScene$1 ??= $J.local(class extends IconButton {
    onClick(): void {
      Game.scene().addToFront(new WndDailies()._WndDailies());
    }
    onPointerUp(): void {
      this.icon_.hardlight$float$float$float(0.5, 1, 2);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.scenes.RankingsScene$1', []);
}

$J.define(RankingsScene, 'com.shatteredpixel.shatteredpixeldungeon.scenes.RankingsScene', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene', ctors: { '': '_RankingsScene' } });
$J.define(RankingsScene$Record, 'com.shatteredpixel.shatteredpixeldungeon.scenes.RankingsScene$Record', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Button', ctors: { 'int,boolean,com.shatteredpixel.shatteredpixeldungeon.Rankings$Record': '_RankingsScene$Record' }, clinit: true, lazy: ['TEXT_WIN', 'TEXT_LOSE'] });
$J.module(() => {
  Assets$Music = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Music');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Badges$Badge = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges$Badge');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Rankings = $J.load('com.shatteredpixel.shatteredpixeldungeon.Rankings');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  ShatteredPixelDungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Flare = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Flare');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  TitleScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.TitleScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  ExitButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ExitButton');
  IconButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.IconButton');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  TitleBackground = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TitleBackground');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  WndDailies = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndDailies');
  WndRanking = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndRanking');
  WndVictoryCongrats = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndVictoryCongrats');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  Music = $J.load('com.watabou.noosa.audio.Music');
  DeviceCompat = $J.load('com.watabou.utils.DeviceCompat');
  GameMath = $J.load('com.watabou.utils.GameMath');
});
