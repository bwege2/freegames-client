// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/Tooltip.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Chrome, Chrome$Type, PixelScene, Game, GameMath, RectF;

export class Tooltip extends Component {
  static tooltipAlpha: number = 0;
  static lastUsedTime: number = 0;
  parent$Tooltip: Component = null;
  parentDims: RectF = null;
  bg: NinePatch = null;
  text_: RenderedTextBlock = null;
  _Tooltip(parent: Component, msg: string, maxWidth: number): this {
    this._Component();
    this.text_.text$String$int(msg, maxWidth);
    this.layout();
    this.parent$Tooltip = parent;
    this.parentDims = new RectF()._RectF$float$float$float$float(parent.left(), parent.top(), parent.right(), parent.bottom());
    if (Tooltip.lastUsedTime === Math.fround(-1) || Tooltip.lastUsedTime > Game.timeTotal) {
      Tooltip.tooltipAlpha = Math.fround(-5);
    } else {
      let elapsed = Math.fround(Game.timeTotal - Tooltip.lastUsedTime);
      if (elapsed >= 0.25 || Tooltip.tooltipAlpha < 1) {
        Tooltip.tooltipAlpha = Math.fround(-5);
      }
    }
    Tooltip.lastUsedTime = Game.timeTotal;
    this.bg.alpha$float(GameMath.gate(0, Tooltip.tooltipAlpha, 1));
    this.text_.alpha(GameMath.gate(0, Tooltip.tooltipAlpha, 1));
    return this;
  }
  static resetLastUsedTime(): void {
    Tooltip.lastUsedTime = -1;
    Tooltip.tooltipAlpha = -5;
  }
  createChildren(): void {
    super.createChildren();
    this.bg = Chrome.get(Chrome$Type.TOAST_TR_HEAVY);
    this.add$Gizmo(this.bg);
    this.text_ = PixelScene.renderTextBlock$int(6);
    this.add$Gizmo(this.text_);
  }
  update(): void {
    if (!this.parent$Tooltip.exists || !this.parent$Tooltip.isActive() || !this.parent$Tooltip.isVisible() || this.parentDims.left_ !== this.parent$Tooltip.left() || this.parentDims.top_ !== this.parent$Tooltip.top() || this.parentDims.right_ !== this.parent$Tooltip.right() || this.parentDims.bottom_ !== this.parent$Tooltip.bottom()) {
      this.killAndErase();
      return;
    }
    super.update();
    Tooltip.tooltipAlpha = Math.min(1, Math.fround(Tooltip.tooltipAlpha + Math.fround(10 * Game.elapsed)));
    Tooltip.lastUsedTime = Game.timeTotal;
    this.bg.alpha$float(GameMath.gate(0, Tooltip.tooltipAlpha, 1));
    this.text_.alpha(GameMath.gate(0, Tooltip.tooltipAlpha, 1));
  }
  layout(): void {
    this.text_.setPos(Math.fround(this.x + this.bg.marginLeft()), Math.fround(this.y + this.bg.marginTop()));
    this.bg.x = this.x;
    this.bg.y = this.y;
    this.bg.size(Math.fround(this.text_.width() + this.bg.marginHor()), Math.fround(this.text_.height() + this.bg.marginVer()));
    this.width_ = this.bg.width_;
    this.height_ = this.bg.height_;
  }
  static $clinit() {
    Tooltip.tooltipAlpha = Math.fround(-5);
    Tooltip.lastUsedTime = -1;
  }
}

$J.define(Tooltip, 'com.shatteredpixel.shatteredpixeldungeon.ui.Tooltip', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'com.watabou.noosa.ui.Component,java.lang.String,int': '_Tooltip' }, clinit: true, lazy: ['tooltipAlpha', 'lastUsedTime'] });
$J.module(() => {
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  Game = $J.load('com.watabou.noosa.Game');
  GameMath = $J.load('com.watabou.utils.GameMath');
  RectF = $J.load('com.watabou.utils.RectF');
});
