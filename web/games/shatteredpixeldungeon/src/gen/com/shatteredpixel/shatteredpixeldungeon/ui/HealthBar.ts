// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/HealthBar.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let ColorBlock;

export class HealthBar extends Component {
  static readonly COLOR_BG: number = -5636096;
  static readonly COLOR_HP: number = -16716288;
  static readonly COLOR_SHLD: number = -1;
  static readonly COLOR_DOT: number = 1711276032;
  static readonly HEIGHT: number = 2;
  Bg: ColorBlock = null;
  Shld: ColorBlock = null;
  Hp: ColorBlock = null;
  Dot: ColorBlock = null;
  health_: number = 0;
  shield: number = 0;
  incomingDOT_: number = 0;
  _HealthBar(): this {
    this._Component();
    return this;
  }
  createChildren(): void {
    this.Bg = new ColorBlock()._ColorBlock(1, 1, HealthBar.COLOR_BG);
    this.add$Gizmo(this.Bg);
    this.Shld = new ColorBlock()._ColorBlock(1, 1, HealthBar.COLOR_SHLD);
    this.add$Gizmo(this.Shld);
    this.Hp = new ColorBlock()._ColorBlock(1, 1, HealthBar.COLOR_HP);
    this.add$Gizmo(this.Hp);
    this.Dot = new ColorBlock()._ColorBlock(1, 1, HealthBar.COLOR_DOT);
    this.add$Gizmo(this.Dot);
    this.height_ = Math.fround(HealthBar.HEIGHT);
  }
  layout(): void {
    this.Bg.x = this.Shld.x = this.Hp.x = this.Dot.x = this.x;
    this.Bg.y = this.Shld.y = this.Hp.y = this.Dot.y = this.y;
    this.Bg.size(this.width_, this.height_);
    let pixelWidth = this.width_;
    if (this.camera() != null) {
      pixelWidth = Math.fround(pixelWidth * this.camera().zoom_);
    }
    this.Shld.size(Math.fround(Math.fround(this.width_ * Math.fround(Math.ceil(Math.fround(this.shield * pixelWidth)))) / pixelWidth), this.height_);
    this.Hp.size(Math.fround(Math.fround(this.width_ * Math.fround(Math.ceil(Math.fround(this.health_ * pixelWidth)))) / pixelWidth), this.height_);
    this.Dot.size(Math.fround(Math.fround(this.width_ * Math.fround(Math.ceil(Math.fround(this.incomingDOT_ * pixelWidth)))) / pixelWidth), this.height_);
    this.Dot.scale_.x = Math.min(this.Dot.scale_.x, this.Shld.scale_.x);
    this.Dot.x = Math.fround(this.Dot.x + Math.fround(this.Shld.width() - this.Dot.width()));
  }
  level$float(value: number): void {
    this.level$float$float$float(value, 0, 0);
  }
  level$float$float$float(health: number, shield: number, DOT: number): void {
    this.health_ = health;
    this.shield = shield;
    this.incomingDOT_ = DOT;
    this.layout();
  }
  level$Char(c: Char): void {
    if (c != null) {
      let health = Math.fround(c.HP);
      let shield = Math.fround(c.shielding());
      let incomingDot = Math.fround(c.incomingDOT());
      let max = Math.max(Math.fround(health + shield), Math.fround(c.HT));
      this.level$float$float$float(Math.fround(health / max), Math.fround((Math.fround(health + shield)) / max), Math.fround(incomingDot / max));
    }
  }
}

$J.define(HealthBar, 'com.shatteredpixel.shatteredpixeldungeon.ui.HealthBar', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_HealthBar' }, meths: { 'level(com.shatteredpixel.shatteredpixeldungeon.actors.Char)': 'level$Char', 'level(float,float,float)': 'level$float$float$float', 'level(float)': 'level$float' } });
$J.module(() => {
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
});
