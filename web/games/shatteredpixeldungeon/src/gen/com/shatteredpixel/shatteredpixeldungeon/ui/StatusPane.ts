// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/StatusPane.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Interfaces, Dungeon, SPDAction, Statistics, Actor, CircleArc, Speck, Messages, GameScene, PixelScene, HeroSprite, BuffIndicator, BusyIndicator, Button, Compass, WndHero, WndKeyBindings, BitmapText, Camera, Game, Image, NinePatch, Emitter, ColorMath, GameMath;

export class StatusPane extends Component {
  bg: NinePatch = null;
  avatar: Image = null;
  heroInfo: Button = null;
  static talentBlink: number = 0;
  warning: number = 0;
  static readonly FLASH_RATE: number = Math.fround(4.712389);
  lastTier: number = 0;
  shieldHP: Image = null;
  hp: Image = null;
  Dot: Image = null;
  hpText: BitmapText = null;
  heroInfoOnBar: Button = null;
  exp: Image = null;
  expText: BitmapText = null;
  lastLvl: number = 0;
  level_: BitmapText = null;
  buffs: BuffIndicator = null;
  compass: Compass = null;
  busy_: BusyIndicator = null;
  counter: CircleArc = null;
  large: boolean = false;
  static heroPaneExtraWidth: number = 0;
  heroPaneCutout: NinePatch = null;
  static hpBarMaxWidth: number = 0;
  hpCutout: Image = null;
  static buffBarRowMaxWidths: number[] = null;
  static buffBarRowAdjusts: number[] = null;
  static warningColors: number[] = null;
  oldHP: number = 0;
  oldShield: number = 0;
  oldMax: number = 0;
  _StatusPane(large: boolean): this {
    this._Component();
    this.lastTier = 0;
    this.lastLvl = -1;
    this.oldHP = 0;
    this.oldShield = 0;
    this.oldMax = 0;
    let asset = Assets$Interfaces.STATUS;
    this.large = large;
    if (large) {
      this.bg = new NinePatch()._NinePatch$Object$int$int$int$int$int$int$int$int(asset, 0, 64, 41, 39, 33, 0, 4, 0);
    } else {
      this.bg = new NinePatch()._NinePatch$Object$int$int$int$int$int$int$int$int(asset, 0, 0, 82, 38, 32, 0, 5, 0);
    }
    this.add$Gizmo(this.bg);
    this.heroPaneCutout = new NinePatch()._NinePatch$Object$int$int$int$int$int$int$int$int(asset, 0, 0, 5, 36, 4, 0, 0, 0);
    this.heroPaneCutout.visible_ = false;
    this.add$Gizmo(this.heroPaneCutout);
    this.hpCutout = new Image()._Image$Object$int$int$int$int(asset, 90, 0, 12, 9);
    this.hpCutout.visible_ = false;
    this.add$Gizmo(this.hpCutout);
    this.heroInfo = new (StatusPane$1())().$o(this)._Button();
    this.add$Gizmo(this.heroInfo);
    this.avatar = HeroSprite.avatar$Hero(Dungeon.hero);
    this.add$Gizmo(this.avatar);
    StatusPane.talentBlink = 0;
    this.compass = new Compass()._Compass(Statistics.amuletObtained ? Dungeon.level.entrance() : Dungeon.level.exit());
    this.add$Gizmo(this.compass);
    if (large) {
      this.shieldHP = new Image()._Image$Object$int$int$int$int(asset, 0, 112, 128, 9);
    } else {
      this.shieldHP = new Image()._Image$Object$int$int$int$int(asset, 0, 44, 50, 4);
    }
    this.add$Gizmo(this.shieldHP);
    if (large) {
      this.hp = new Image()._Image$Object$int$int$int$int(asset, 0, 103, 128, 9);
    } else {
      this.hp = new Image()._Image$Object$int$int$int$int(asset, 0, 40, 50, 4);
    }
    this.add$Gizmo(this.hp);
    if (large) {
      this.Dot = new Image()._Image$Object$int$int$int$int(asset, 0, 103, 128, 9);
    } else {
      this.Dot = new Image()._Image$Object$int$int$int$int(asset, 0, 40, 50, 4);
    }
    this.Dot.hardlight$float$float$float(0, 0, 0);
    this.Dot.alpha$float(0.25);
    this.add$Gizmo(this.Dot);
    this.hpText = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    this.hpText.alpha$float(Math.fround(0.6));
    this.add$Gizmo(this.hpText);
    this.heroInfoOnBar = new (StatusPane$2())().$o(this)._Button();
    this.add$Gizmo(this.heroInfoOnBar);
    if (large) {
      this.exp = new Image()._Image$Object$int$int$int$int(asset, 0, 121, 128, 7);
    } else {
      this.exp = new Image()._Image$Object$int$int$int$int(asset, 0, 48, 17, 4);
    }
    this.add$Gizmo(this.exp);
    this.expText = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    this.expText.hardlight$int(16777130);
    this.expText.alpha$float(Math.fround(0.6));
    this.add$Gizmo(this.expText);
    this.level_ = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    this.level_.hardlight$int(16777130);
    this.add$Gizmo(this.level_);
    this.buffs = new BuffIndicator()._BuffIndicator(Dungeon.hero, large);
    this.add$Gizmo(this.buffs);
    this.busy_ = new BusyIndicator()._BusyIndicator();
    this.add$Gizmo(this.busy_);
    this.counter = new CircleArc()._CircleArc(18, 4.25);
    this.counter.color$int$boolean(8421504, true);
    this.counter.show$Group$PointF$float(this, this.busy_.center$(), 0);
    return this;
  }
  layout(): void {
    this.height_ = Math.fround(this.large ? 39 : 38);
    let heroPaneWidth = Math.fround(30 + StatusPane.heroPaneExtraWidth);
    this.bg.x = Math.fround(this.x + StatusPane.heroPaneExtraWidth);
    this.bg.y = this.y;
    if (this.large) {
      this.bg.size(160, this.bg.height_);
    } else {
      this.bg.size(Math.fround((StatusPane.hpBarMaxWidth + 32) | 0), this.bg.height_);
    }
    this.avatar.x = Math.fround(Math.fround(this.bg.x - Math.fround(this.avatar.width_ / 2)) + 15);
    this.avatar.y = Math.fround(Math.fround(this.bg.y - Math.fround(this.avatar.height_ / 2)) + 16);
    PixelScene.align$Visual(this.avatar);
    this.heroInfo.setRect(this.x, this.y, heroPaneWidth, Math.fround(this.large ? 40 : 36));
    this.compass.x = Math.fround(Math.fround(this.avatar.x + Math.fround(this.avatar.width_ / 2)) - this.compass.origin.x);
    this.compass.y = Math.fround(Math.fround(this.avatar.y + Math.fround(this.avatar.height_ / 2)) - this.compass.origin.y);
    PixelScene.align$Visual(this.compass);
    if (this.large) {
      this.exp.x = Math.fround(this.x + 30);
      this.exp.y = Math.fround(this.y + 30);
      this.hp.x = this.shieldHP.x = this.Dot.x = Math.fround(this.x + 30);
      this.hp.y = this.shieldHP.y = this.Dot.y = Math.fround(this.y + 19);
      this.hpText.x = Math.fround(this.hp.x + Math.fround((Math.fround(128 - this.hpText.width())) / 2));
      this.hpText.y = Math.fround(this.hp.y + 1);
      PixelScene.align$Visual(this.hpText);
      this.expText.x = Math.fround(this.exp.x + Math.fround((Math.fround(128 - this.expText.width())) / 2));
      this.expText.y = this.exp.y;
      PixelScene.align$Visual(this.expText);
      this.heroInfoOnBar.setRect(this.heroInfo.right(), Math.fround(this.y + 19), 130, 20);
      this.buffs.setRect(Math.fround(this.x + 31), this.y, 142, 16);
      this.busy_.x = Math.fround(Math.fround(this.x + this.bg.width_) + 1);
      this.busy_.y = Math.fround(Math.fround(this.y + this.bg.height_) - 9);
    } else {
      this.exp.x = Math.fround(this.x + 2);
      this.exp.y = Math.fround(this.y + 30);
      if (StatusPane.heroPaneExtraWidth > Math.fround(0)) {
        this.heroPaneCutout.visible_ = true;
        this.heroPaneCutout.x = this.x;
        this.heroPaneCutout.y = this.y;
        this.heroPaneCutout.size(Math.fround(StatusPane.heroPaneExtraWidth + 4), this.heroPaneCutout.height_);
      }
      let hpleft = Math.fround(this.x + heroPaneWidth);
      if (StatusPane.hpBarMaxWidth < 82) {
        let hpWidth = StatusPane.hpBarMaxWidth;
        if (hpWidth <= 41) {
          hpleft = Math.fround(hpleft - 9);
          hpWidth = (hpWidth + 9) | 0;
          this.hpCutout.visible_ = true;
          this.hpCutout.x = Math.fround(hpleft - 2);
          this.hpCutout.y = this.y;
        }
        this.hp.frame$int$int$int$int((50 - hpWidth) | 0, 40, 50, 4);
        this.shieldHP.frame$int$int$int$int((50 - hpWidth) | 0, 44, 50, 4);
      }
      this.hp.x = this.shieldHP.x = this.Dot.x = hpleft;
      this.hp.y = this.shieldHP.y = this.Dot.y = Math.fround(this.y + 2);
      this.hpText.scale_.set$float(PixelScene.align$float(0.5));
      this.hpText.x = Math.fround(this.hp.x + 1);
      this.hpText.y = Math.fround(this.hp.y + Math.fround((Math.fround(this.hp.height_ - (Math.fround(this.hpText.baseLine() + this.hpText.scale_.y)))) / 2));
      this.hpText.y = Math.fround(this.hpText.y - Math.fround(0.001));
      PixelScene.align$Visual(this.hpText);
      this.expText.scale_.set$float(PixelScene.align$float(0.5));
      this.expText.x = Math.fround(this.exp.x + 1);
      this.expText.y = Math.fround(this.exp.y + Math.fround((Math.fround(this.exp.height_ - (Math.fround(this.expText.baseLine() + this.expText.scale_.y)))) / 2));
      this.expText.y = Math.fround(this.expText.y - Math.fround(0.001));
      PixelScene.align$Visual(this.expText);
      this.heroInfoOnBar.setRect(this.heroInfo.right(), this.y, 50, 9);
      if (StatusPane.buffBarRowMaxWidths != null) {
        this.buffs.rowWidthLimits = StatusPane.buffBarRowMaxWidths;
      }
      if (StatusPane.buffBarRowAdjusts != null) {
        this.buffs.rowHeightAdjusts = StatusPane.buffBarRowAdjusts;
      }
      this.buffs.setRect(Math.fround(Math.fround(this.x + heroPaneWidth) + 1), Math.fround(this.y + 8), 55, 16);
      this.busy_.x = Math.fround(this.x + 1);
      this.busy_.y = Math.fround(this.y + 37);
    }
    this.counter.point$PointF(this.busy_.center$());
  }
  update(): void {
    super.update();
    let health = Dungeon.hero.HP;
    let shield = Dungeon.hero.shielding();
    let incomingDOT = Dungeon.hero.incomingDOT();
    let max = Dungeon.hero.HT;
    if (!Dungeon.hero.isAlive()) {
      this.avatar.tint$int$float(0, 0.5);
    } else if ((Math.fround(health / Math.fround(max))) < Math.fround(0.334)) {
      this.warning = Math.fround(this.warning + Math.fround(Math.fround(Game.elapsed * 5) * (Math.fround(Math.fround(0.4) - (Math.fround(health / Math.fround(max)))))));
      this.warning = Math.fround(this.warning % 1);
      this.avatar.tint$int$float(ColorMath.interpolate$float$intArr(this.warning, StatusPane.warningColors), 0.5);
    } else if (StatusPane.talentBlink > Math.fround(0.33)) {
      StatusPane.talentBlink = Math.fround(StatusPane.talentBlink - Game.elapsed);
      this.avatar.tint$float$float$float$float(1, 1, 0, Math.fround(Math.fround(Math.abs(Math.cos(Math.fround(StatusPane.talentBlink * StatusPane.FLASH_RATE)))) / 2));
    } else {
      this.avatar.resetColor();
    }
    let healthPercent = Math.fround(health / Math.fround(max));
    let shieldPercent = Math.fround(shield / Math.fround(max));
    let DOTPercent = Math.fround(incomingDOT / Math.fround(max));
    if (Math.fround(healthPercent + shieldPercent) > 1) {
      let excess = Math.fround(healthPercent + shieldPercent);
      healthPercent = Math.fround(healthPercent / excess);
      shieldPercent = Math.fround(shieldPercent / excess);
      DOTPercent = Math.fround(DOTPercent / excess);
    }
    this.hp.scale_.x = healthPercent;
    this.shieldHP.scale_.x = Math.fround(healthPercent + shieldPercent);
    this.Dot.scale_.x = Math.min(DOTPercent, this.shieldHP.scale_.x);
    this.Dot.x = Math.fround(Math.fround(this.shieldHP.x + this.shieldHP.width()) - this.Dot.width());
    if (this.oldHP !== health || this.oldShield !== shield || this.oldMax !== max) {
      if (shield <= 0) {
        this.hpText.text$String(health + '/' + max);
      } else {
        this.hpText.text$String(health + '+' + shield + '/' + max);
      }
      this.oldHP = health;
      this.oldShield = shield;
      this.oldMax = max;
    }
    if (this.large) {
      this.exp.scale_.x = Math.fround(Math.fround((Math.fround(128 / this.exp.width_)) * Dungeon.hero.exp) / Dungeon.hero.maxExp());
      this.hpText.measure();
      this.hpText.x = Math.fround(this.hp.x + Math.fround((Math.fround(128 - this.hpText.width())) / 2));
      this.expText.text$String(Dungeon.hero.exp + '/' + Dungeon.hero.maxExp());
      this.expText.measure();
      this.expText.x = Math.fround(this.hp.x + Math.fround((Math.fround(128 - this.expText.width())) / 2));
    } else {
      this.exp.scale_.x = Math.fround(Math.fround((Math.fround((Math.fround(17 + StatusPane.heroPaneExtraWidth)) / this.exp.width_)) * Dungeon.hero.exp) / Dungeon.hero.maxExp());
      this.expText.text$String(Dungeon.hero.exp + '/' + Dungeon.hero.maxExp());
    }
    if (Dungeon.hero.lvl !== this.lastLvl) {
      if (this.lastLvl !== -1) {
        this.showStarParticles();
      }
      this.lastLvl = Dungeon.hero.lvl;
      if (this.large) {
        this.level_.text$String('lv. ' + this.lastLvl);
        this.level_.measure();
        this.level_.x = Math.fround(this.x + Math.fround((Math.fround(30 - this.level_.width())) / 2));
        this.level_.y = Math.fround(Math.fround(this.y + 33) - Math.fround(this.level_.baseLine() / 2));
      } else {
        this.level_.text$String(String(this.lastLvl));
        this.level_.measure();
        this.level_.x = Math.fround(Math.fround(Math.fround(this.x + StatusPane.heroPaneExtraWidth) + 25.5) - Math.fround(this.level_.width() / 2));
        this.level_.y = Math.fround(Math.fround(this.y + 31) - Math.fround(this.level_.baseLine() / 2));
      }
      PixelScene.align$Visual(this.level_);
    }
    let tier = Dungeon.hero.tier();
    if (tier !== this.lastTier) {
      this.lastTier = tier;
      this.avatar.copy(HeroSprite.avatar$Hero(Dungeon.hero));
    }
    this.counter.setSweep(Math.fround((Math.fround(1 - Math.fround(Actor.now() % 1))) % 1));
  }
  updateAvatar(): void {
    this.avatar.copy(HeroSprite.avatar$Hero(Dungeon.hero));
  }
  alpha(value: number): void {
    value = GameMath.gate(0, value, 1);
    this.bg.alpha$float(value);
    this.heroPaneCutout.alpha$float(value);
    this.hpCutout.alpha$float(value);
    this.avatar.alpha$float(value);
    this.shieldHP.alpha$float(value);
    this.hp.alpha$float(value);
    this.hpText.alpha$float(Math.fround(Math.fround(0.6) * value));
    this.exp.alpha$float(value);
    if (this.expText != null) {
      this.expText.alpha$float(Math.fround(Math.fround(0.6) * value));
    }
    this.level_.alpha$float(value);
    this.compass.alpha$float(value);
    this.busy_.alpha$float(value);
    this.counter.alpha$float(value);
  }
  showStarParticles(): void {
    let emitter = this.recycle($J.cls(Emitter));
    emitter.revive();
    emitter.pos$PointF(this.avatar.center$());
    emitter.burst(Speck.factory$int(Speck.STAR), 12);
  }
  static $clinit() {
    StatusPane.heroPaneExtraWidth = 0;
    StatusPane.hpBarMaxWidth = 50;
    StatusPane.warningColors = [6684672, 13369344, 6684672];
  }
}

let $StatusPane$1: any = null;
/** An anonymous class (StatusPane.java:110). */
function StatusPane$1(): any {
  return $StatusPane$1 ??= $J.local(class extends Button {
    onClick(): void {
      Camera.main.panTo(Dungeon.hero.sprite_.center$(), 5);
      GameScene.show(new WndHero()._WndHero());
    }
    keyAction(): GameAction {
      return SPDAction.HERO_INFO;
    }
    hoverText(): string {
      return Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), 'hero_info', []));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.StatusPane$1', []);
}

let $StatusPane$2: any = null;
/** An anonymous class (StatusPane.java:155). */
function StatusPane$2(): any {
  return $StatusPane$2 ??= $J.local(class extends Button {
    onClick(): void {
      Camera.main.panTo(Dungeon.hero.sprite_.center$(), 5);
      GameScene.show(new WndHero()._WndHero());
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.StatusPane$2', []);
}

$J.define(StatusPane, 'com.shatteredpixel.shatteredpixeldungeon.ui.StatusPane', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'boolean': '_StatusPane' }, clinit: true, lazy: ['talentBlink', 'heroPaneExtraWidth', 'hpBarMaxWidth', 'buffBarRowMaxWidths', 'buffBarRowAdjusts', 'warningColors'] });
$J.module(() => {
  Assets$Interfaces = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Interfaces');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDAction = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDAction');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  CircleArc = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CircleArc');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  HeroSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.HeroSprite');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  BusyIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BusyIndicator');
  Button = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Button');
  Compass = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Compass');
  WndHero = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndHero');
  WndKeyBindings = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  NinePatch = $J.load('com.watabou.noosa.NinePatch');
  Emitter = $J.load('com.watabou.noosa.particles.Emitter');
  ColorMath = $J.load('com.watabou.utils.ColorMath');
  GameMath = $J.load('com.watabou.utils.GameMath');
});
