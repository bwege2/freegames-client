// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/BossHealthBar.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../jre/index.ts';
import { Component } from '../../../watabou/noosa/ui/Component.ts';

let Assets$Interfaces, Dungeon, SPDSettings, BloodParticle, GameScene, PixelScene, BuffIndicator, Button, WndInfoMob, BitmapText, Game, Image, Emitter;

export class BossHealthBar extends Component {
  bar: Image = null;
  shieldHP: Image = null;
  hp: Image = null;
  Dot: Image = null;
  hpText: BitmapText = null;
  bossInfo: Button = null;
  buffs: BuffIndicator = null;
  static boss: Mob = null;
  skull: Image = null;
  blood_: Emitter = null;
  static asset: string = null;
  static instance: BossHealthBar = null;
  static bleeding: boolean = false;
  large: boolean = false;
  _BossHealthBar(): this {
    this._Component();
    this.visible_ = this.active = (BossHealthBar.boss != null);
    BossHealthBar.instance = this;
    return this;
  }
  destroy(): void {
    super.destroy();
    if (BossHealthBar.instance === this) {
      BossHealthBar.instance = null;
    }
    if (this.buffs != null) {
      BuffIndicator.setBossInstance(null);
    }
  }
  createChildren(): void {
    this.large = SPDSettings.interfaceSize$() !== 0;
    this.bar = this.large ? new Image()._Image$Object$int$int$int$int(BossHealthBar.asset, 0, 16, 128, 30) : new Image()._Image$Object$int$int$int$int(BossHealthBar.asset, 0, 0, 64, 16);
    this.add$Gizmo(this.bar);
    this.width_ = this.bar.width_;
    this.height_ = this.bar.height_;
    this.shieldHP = this.large ? new Image()._Image$Object$int$int$int$int(BossHealthBar.asset, 0, 55, 96, 9) : new Image()._Image$Object$int$int$int$int(BossHealthBar.asset, 71, 5, 47, 4);
    this.add$Gizmo(this.shieldHP);
    this.hp = this.large ? new Image()._Image$Object$int$int$int$int(BossHealthBar.asset, 0, 46, 96, 9) : new Image()._Image$Object$int$int$int$int(BossHealthBar.asset, 71, 0, 47, 4);
    this.add$Gizmo(this.hp);
    this.Dot = this.large ? new Image()._Image$Object$int$int$int$int(BossHealthBar.asset, 0, 46, 96, 9) : new Image()._Image$Object$int$int$int$int(BossHealthBar.asset, 71, 0, 47, 4);
    this.Dot.hardlight$float$float$float(0, 0, 0);
    this.Dot.alpha$float(0.25);
    this.add$Gizmo(this.Dot);
    this.hpText = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    this.hpText.alpha$float(Math.fround(0.6));
    this.add$Gizmo(this.hpText);
    this.bossInfo = new (BossHealthBar$1())().$o(this)._Button();
    this.add$Gizmo(this.bossInfo);
    if (BossHealthBar.boss != null) {
      this.buffs = new BuffIndicator()._BuffIndicator(BossHealthBar.boss, this.large);
      BuffIndicator.setBossInstance(this.buffs);
      this.add$Gizmo(this.buffs);
    }
    if (BossHealthBar.boss != null && this.large) {
      this.skull = BossHealthBar.boss.sprite();
    } else {
      this.skull = new Image()._Image$Object$int$int$int$int(BossHealthBar.asset, 64, 0, 6, 6);
    }
    this.add$Gizmo(this.skull);
    this.blood_ = new Emitter()._Emitter();
    this.blood_.pos$Visual(this.skull);
    this.blood_.pour(BloodParticle.FACTORY, Math.fround(0.3));
    this.blood_.autoKill = false;
    this.blood_.on = false;
    this.add$Gizmo(this.blood_);
  }
  layout(): void {
    this.bar.x = this.x;
    this.bar.y = this.y;
    this.hp.x = this.shieldHP.x = this.Dot.x = Math.fround(this.bar.x + (this.large ? 30 : 15));
    this.hp.y = this.shieldHP.y = this.Dot.y = Math.fround(this.bar.y + (this.large ? 2 : 3));
    if (!this.large) {
      this.hpText.scale_.set$float(PixelScene.align$float(0.5));
    }
    this.hpText.x = Math.fround(this.hp.x + (this.large ? Math.fround((Math.fround(96 - this.hpText.width())) / 2) : 1));
    this.hpText.y = Math.fround(this.hp.y + Math.fround((Math.fround(this.hp.height_ - (Math.fround(this.hpText.baseLine() + this.hpText.scale_.y)))) / 2));
    this.hpText.y = Math.fround(this.hpText.y - Math.fround(0.001));
    PixelScene.align$Visual(this.hpText);
    this.bossInfo.setRect(this.x, this.y, this.bar.width_, this.bar.height_);
    if (this.buffs != null) {
      this.buffs.maxBuffs = 12;
      if (this.large) {
        this.buffs.setRect(Math.fround(this.hp.x + 1), Math.fround(this.hp.y + 12), 102, 34);
      } else {
        this.buffs.setRect(this.hp.x, Math.fround(this.hp.y + 5), 47, 16);
      }
    }
    let paneSize = this.large ? 30 : 16;
    if (this.skull.height() > Math.fround(24) || this.skull.width() > Math.fround(24)) {
      this.skull.scale_.set$float(Math.fround(this.skull.scale_.x * PixelScene.align$float(Math.fround(24 / Math.max(this.skull.width(), this.skull.height())))));
    }
    this.skull.x = Math.fround(this.bar.x + Math.fround((Math.fround(paneSize - this.skull.width())) / 2));
    this.skull.y = Math.fround(this.bar.y + Math.fround((Math.fround(paneSize - this.skull.height())) / 2));
  }
  update(): void {
    super.update();
    if (BossHealthBar.boss != null) {
      if (!BossHealthBar.boss.isAlive() || !Dungeon.level.mobs.contains(BossHealthBar.boss)) {
        BossHealthBar.boss = null;
        this.visible_ = this.active = false;
        if (this.buffs != null) {
          BuffIndicator.setBossInstance(null);
          this.remove$Gizmo(this.buffs);
          this.buffs.destroy();
          this.buffs = null;
        }
      } else {
        let health = BossHealthBar.boss.HP;
        let shield = BossHealthBar.boss.shielding();
        let incomingDOT = BossHealthBar.boss.incomingDOT();
        let max = BossHealthBar.boss.HT;
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
        if (BossHealthBar.bleeding !== this.blood_.on) {
          if (BossHealthBar.bleeding) {
            this.skull.tint$int$float(13369344, this.large ? Math.fround(0.3) : Math.fround(0.6));
          } else {
            this.skull.resetColor();
          }
          this.bringToFront(this.blood_);
          this.blood_.pos$Visual(this.skull);
          this.blood_.on = BossHealthBar.bleeding;
        }
        if (shield <= 0) {
          this.hpText.text$String(health + '/' + max);
        } else {
          this.hpText.text$String(health + '+' + shield + '/' + max);
        }
        this.hpText.measure();
        this.hpText.x = Math.fround(this.hp.x + (this.large ? Math.fround((Math.fround(96 - this.hpText.width())) / 2) : 1));
      }
    }
  }
  static assignBoss$Mob(boss: Mob): void {
    BossHealthBar.assignBoss$Mob$boolean(boss, false);
  }
  static assignBoss$Mob$boolean(boss: Mob, forceSpriteRefresh: boolean): void {
    if (BossHealthBar.boss === boss && BossHealthBar.instance != null) {
      if (forceSpriteRefresh && BossHealthBar.instance.large) {
        Game.runOnRenderThread(new (BossHealthBar$2())().$c(boss));
      }
      return;
    }
    BossHealthBar.boss = boss;
    BossHealthBar.bleed(false);
    if (BossHealthBar.instance != null) {
      Game.runOnRenderThread(new (BossHealthBar$3())().$c(boss));
    }
  }
  static isAssigned(): boolean {
    return BossHealthBar.boss != null && BossHealthBar.boss.isAlive() && Dungeon.level.mobs.contains(BossHealthBar.boss);
  }
  static bleed(value: boolean): void {
    BossHealthBar.bleeding = value;
  }
  static isBleeding(): boolean {
    return BossHealthBar.isAssigned() && BossHealthBar.bleeding;
  }
  static $clinit() {
    BossHealthBar.asset = Assets$Interfaces.BOSSHP;
  }
}

let $BossHealthBar$1: any = null;
/** An anonymous class (BossHealthBar.java:101). */
function BossHealthBar$1(): any {
  return $BossHealthBar$1 ??= $J.local(class extends Button {
    onClick(): void {
      super.onClick();
      if (BossHealthBar.boss != null) {
        GameScene.show(new WndInfoMob()._WndInfoMob(BossHealthBar.boss));
      }
    }
    hoverText(): string {
      if (BossHealthBar.boss != null) {
        return BossHealthBar.boss.name();
      }
      return super.hoverText();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.BossHealthBar$1', []);
}

let $BossHealthBar$2: any = null;
/** An anonymous class (BossHealthBar.java:241). */
function BossHealthBar$2(): any {
  return $BossHealthBar$2 ??= $J.local(class extends JObject {
    call(): void {
      BossHealthBar.instance.remove$Gizmo(BossHealthBar.instance.skull);
      BossHealthBar.instance.skull.destroy();
      BossHealthBar.instance.skull = this.$cv_boss.sprite();
      BossHealthBar.instance.add$Gizmo(BossHealthBar.instance.skull);
      BossHealthBar.instance.layout();
    }
    $c($boss): this {
      this.$cv_boss = $boss;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.BossHealthBar$2', ['com.watabou.utils.Callback']);
}

let $BossHealthBar$3: any = null;
/** An anonymous class (BossHealthBar.java:257). */
function BossHealthBar$3(): any {
  return $BossHealthBar$3 ??= $J.local(class extends JObject {
    call(): void {
      BossHealthBar.instance.visible_ = BossHealthBar.instance.active = true;
      if (this.$cv_boss != null) {
        if (BossHealthBar.instance.large) {
          if (BossHealthBar.instance.skull != null) {
            BossHealthBar.instance.remove$Gizmo(BossHealthBar.instance.skull);
            BossHealthBar.instance.skull.destroy();
          }
          BossHealthBar.instance.skull = this.$cv_boss.sprite();
          BossHealthBar.instance.add$Gizmo(BossHealthBar.instance.skull);
        }
        if (BossHealthBar.instance.buffs != null) {
          BossHealthBar.instance.remove$Gizmo(BossHealthBar.instance.buffs);
          BossHealthBar.instance.buffs.destroy();
        }
        BossHealthBar.instance.buffs = new BuffIndicator()._BuffIndicator(this.$cv_boss, BossHealthBar.instance.large);
        BuffIndicator.setBossInstance(BossHealthBar.instance.buffs);
        BossHealthBar.instance.add$Gizmo(BossHealthBar.instance.buffs);
        BossHealthBar.instance.layout();
      }
    }
    $c($boss): this {
      this.$cv_boss = $boss;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.BossHealthBar$3', ['com.watabou.utils.Callback']);
}

$J.define(BossHealthBar, 'com.shatteredpixel.shatteredpixeldungeon.ui.BossHealthBar', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_BossHealthBar' }, meths: { 'assignBoss(com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob,boolean)': 'assignBoss$Mob$boolean', 'assignBoss(com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob)': 'assignBoss$Mob' }, clinit: true, lazy: ['boss', 'asset', 'instance', 'bleeding'] });
$J.module(() => {
  Assets$Interfaces = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Interfaces');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  BloodParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.BloodParticle');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  Button = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Button');
  WndInfoMob = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoMob');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  Emitter = $J.load('com.watabou.noosa.particles.Emitter');
});
