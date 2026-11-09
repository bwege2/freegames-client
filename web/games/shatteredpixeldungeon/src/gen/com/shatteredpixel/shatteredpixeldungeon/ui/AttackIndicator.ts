// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/AttackIndicator.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../jre/index.ts';
import { Tag } from './Tag.ts';

let Dungeon, SPDAction, Messages, PixelScene, DangerIndicator, QuickSlotButton, WndKeyBindings, Game, Random, Reflection;

export class AttackIndicator extends Tag {
  static readonly ENABLED: number = 1;
  static readonly DISABLED: number = Math.fround(0.3);
  static delay: number = 0;
  static instance: AttackIndicator = null;
  sprite_: CharSprite = null;
  lastTarget: Mob = null;
  candidates: ArrayList<Mob> = null;
  enabled_: boolean = false;
  _AttackIndicator(): this {
    this._Tag(DangerIndicator.COLOR);
    this.sprite_ = null;
    this.candidates = new ArrayList();
    this.enabled_ = true;
    {
      AttackIndicator.instance = this;
      this.lastTarget = null;
      this.setSize(Math.fround(Tag.SIZE), Math.fround(Tag.SIZE));
      this.visible(false);
      this.enable(false);
    }
    return this;
  }
  keyAction(): GameAction {
    return SPDAction.TAG_ATTACK;
  }
  createChildren(): void {
    super.createChildren();
  }
  layout(): void {
    super.layout();
    if (this.sprite_ != null) {
      if (!this.flipped) {
        this.sprite_.x = Math.fround(Math.fround(this.x + Math.fround((Math.fround(Tag.SIZE - this.sprite_.width())) / 2)) + 1);
      } else {
        this.sprite_.x = Math.fround(Math.fround(Math.fround(this.x + this.width_) - Math.fround((Math.fround(Tag.SIZE + this.sprite_.width())) / 2)) - 1);
      }
      this.sprite_.y = Math.fround(this.y + Math.fround((Math.fround(this.height_ - this.sprite_.height())) / 2));
      PixelScene.align$Visual(this.sprite_);
    }
  }
  update(): void {
    super.update();
    if (!this.bg.visible_) {
      if (this.sprite_ != null) {
        this.sprite_.visible_ = false;
      }
      this.enable(false);
      if (AttackIndicator.delay > 0) {
        AttackIndicator.delay = Math.fround(AttackIndicator.delay - Game.elapsed);
      }
      if (AttackIndicator.delay <= 0) {
        this.active = false;
      }
    } else {
      AttackIndicator.delay = 0.75;
      this.active = true;
      if (this.bg.width_ > Math.fround(0) && this.sprite_ != null) {
        this.sprite_.visible_ = true;
      }
      if (Dungeon.hero.isAlive()) {
        this.enable(Dungeon.hero.ready_);
      } else {
        this.visible(false);
        this.enable(false);
      }
    }
  }
  checkEnemies(): void {
    this.candidates.clear();
    let v = Dungeon.hero.visibleEnemies();
    for (let i = 0; i < v; i++) {
      let mob = Dungeon.hero.visibleEnemy(i);
      if (Dungeon.hero.canAttack(mob)) {
        this.candidates.add(mob);
      }
    }
    if (this.lastTarget == null || !this.candidates.contains(this.lastTarget)) {
      if (this.candidates.isEmpty()) {
        this.lastTarget = null;
      } else {
        this.active = true;
        this.lastTarget = Random.element$Collection(this.candidates);
        this.updateImage();
        this.flash();
      }
    } else {
      this.active = true;
      if (!this.bg.visible_) {
        this.flash();
      }
    }
    this.visible(this.lastTarget != null);
    this.enable(this.bg.visible_);
  }
  updateImage(): void {
    if (this.sprite_ != null) {
      this.sprite_.killAndErase();
      this.sprite_ = null;
    }
    this.sprite_ = Reflection.newInstance(this.lastTarget.spriteClass);
    this.active = true;
    this.sprite_.linkVisuals(this.lastTarget);
    this.sprite_.idle();
    this.sprite_.paused_ = true;
    this.sprite_.visible_ = this.bg.visible_;
    if (this.sprite_.width() > Math.fround(20) || this.sprite_.height() > Math.fround(20)) {
      this.sprite_.scale_.set$float(Math.fround(this.sprite_.scale_.x * PixelScene.align$float(Math.fround(20 / Math.max(this.sprite_.width(), this.sprite_.height())))));
    }
    this.add$Gizmo(this.sprite_);
    this.layout();
  }
  enable(value: boolean): void {
    this.enabled_ = value;
    if (this.sprite_ != null) {
      this.sprite_.alpha$float(value ? AttackIndicator.ENABLED : AttackIndicator.DISABLED);
    }
  }
  visible(value: boolean): void {
    this.bg.visible_ = value;
  }
  onClick(): void {
    super.onClick();
    if (this.enabled_ && Dungeon.hero.ready_) {
      if (Dungeon.hero.handle(this.lastTarget.pos)) {
        Dungeon.hero.next();
      }
    }
  }
  hoverText(): string {
    return Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), 'tag_attack', []));
  }
  static target(target: Char): void {
    if (target == null) {
      return;
    }
    {
      AttackIndicator.instance.lastTarget = target;
      AttackIndicator.instance.updateImage();
      QuickSlotButton.target(target);
    }
  }
  static updateState(): void {
    AttackIndicator.instance.checkEnemies();
  }
}

$J.define(AttackIndicator, 'com.shatteredpixel.shatteredpixeldungeon.ui.AttackIndicator', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Tag', ctors: { '': '_AttackIndicator' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDAction = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDAction');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  DangerIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.DangerIndicator');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  WndKeyBindings = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings');
  Game = $J.load('com.watabou.noosa.Game');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
