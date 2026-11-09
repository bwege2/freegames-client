// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/Tag.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Button } from './Button.ts';

let Chrome, Chrome$Type, GameScene, Game;

export class Tag extends Button {
  r: number = 0;
  g: number = 0;
  b: number = 0;
  bg: NinePatch = null;
  lightness_: number = 0;
  static SIZE: number = 0;
  flipped: boolean = false;
  _Tag(color: number): this {
    this._Button();
    this.lightness_ = 0;
    this.flipped = false;
    this.r = Math.fround((color >> 16) / 255);
    this.g = Math.fround(((color >> 8) & 255) / 255);
    this.b = Math.fround((color & 255) / 255);
    return this;
  }
  createChildren(): void {
    super.createChildren();
    this.bg = Chrome.get(Chrome$Type.TAG);
    this.bg.hardlight$float$float$float(this.r, this.g, this.b);
    this.add$Gizmo(this.bg);
  }
  onClick(): void {
    GameScene.tagDisappeared = false;
  }
  layout(): void {
    super.layout();
    this.bg.x = this.x;
    this.bg.y = this.y;
    this.bg.size(this.width_, this.height_);
  }
  flash(): void {
    this.lightness_ = 1;
  }
  flip(value: boolean): void {
    this.flipped = value;
    this.bg.flipHorizontal(value);
    this.layout();
  }
  setColor(color: number): void {
    this.r = Math.fround((color >> 16) / 255);
    this.g = Math.fround(((color >> 8) & 255) / 255);
    this.b = Math.fround((color & 255) / 255);
    this.bg.hardlight$float$float$float(this.r, this.g, this.b);
  }
  update(): void {
    super.update();
    if (this.visible_ && this.lightness_ > 0.5) {
      if ((this.lightness_ = Math.fround(this.lightness_ - Game.elapsed)) > 0.5) {
        this.bg.ra = this.bg.ga = this.bg.ba = Math.fround(Math.fround(2 * this.lightness_) - 1);
        this.bg.rm = Math.fround(Math.fround(2 * this.r) * (Math.fround(1 - this.lightness_)));
        this.bg.gm = Math.fround(Math.fround(2 * this.g) * (Math.fround(1 - this.lightness_)));
        this.bg.bm = Math.fround(Math.fround(2 * this.b) * (Math.fround(1 - this.lightness_)));
      } else {
        this.bg.hardlight$float$float$float(this.r, this.g, this.b);
      }
    }
  }
  static $clinit() {
    Tag.SIZE = 24;
  }
}

$J.define(Tag, 'com.shatteredpixel.shatteredpixeldungeon.ui.Tag', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Button', ctors: { 'int': '_Tag' }, clinit: true, lazy: ['SIZE'] });
$J.module(() => {
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  Game = $J.load('com.watabou.noosa.Game');
});
