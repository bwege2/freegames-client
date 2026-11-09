// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/IconTitle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Messages, PixelScene, ItemSprite, HealthBar, Window, Image;

export class IconTitle extends Component {
  static readonly FONT_SIZE: number = 9;
  static readonly GAP: number = 2;
  imIcon: Image = null;
  tfLabel: RenderedTextBlock = null;
  health_: HealthBar = null;
  healthLvl: number = 0;
  $init_IconTitle() {
    this.healthLvl = NaN;
  }
  _IconTitle$(): this {
    this._Component();
    this.$init_IconTitle();
    return this;
  }
  _IconTitle$Item(item: Item): this {
    this._Component();
    this.$init_IconTitle();
    let icon = new ItemSprite()._ItemSprite$();
    this.icon(icon);
    this.label$String(Messages.titleCase(item.title()));
    icon.view$Item(item);
    this.layout();
    return this;
  }
  _IconTitle$Heap(heap: Heap): this {
    this._Component();
    this.$init_IconTitle();
    let icon = new ItemSprite()._ItemSprite$();
    this.icon(icon);
    this.label$String(Messages.titleCase(heap.title()));
    icon.view$Heap(heap);
    this.layout();
    return this;
  }
  _IconTitle$Image$String(icon: Image, label: string): this {
    this._Component();
    this.$init_IconTitle();
    this.icon(icon);
    this.label$String(label);
    this.layout();
    return this;
  }
  createChildren(): void {
    this.imIcon = new Image()._Image$();
    this.add$Gizmo(this.imIcon);
    this.tfLabel = PixelScene.renderTextBlock$int($J.d2i(IconTitle.FONT_SIZE));
    this.tfLabel.hardlight(Window.TITLE_COLOR);
    this.tfLabel.setHightlighting$boolean(false);
    this.add$Gizmo(this.tfLabel);
    this.health_ = new HealthBar()._HealthBar();
    this.add$Gizmo(this.health_);
  }
  layout(): void {
    this.health_.visible_ = !$J.Float_isNaN(this.healthLvl);
    this.imIcon.x = Math.fround(this.x + (Math.max(0, Math.fround(8 - Math.fround(this.imIcon.width() / 2)))));
    this.imIcon.y = Math.fround(this.y + (Math.max(0, Math.fround(8 - Math.fround(this.imIcon.height() / 2)))));
    PixelScene.align$Visual(this.imIcon);
    let imWidth = $J.d2i(Math.max(this.imIcon.width(), 16));
    let imHeight = $J.d2i(Math.max(this.imIcon.height(), 16));
    this.tfLabel.maxWidth$int($J.d2i((Math.fround(this.width_ - (Math.fround(imWidth + IconTitle.GAP))))));
    this.tfLabel.setPos(Math.fround(Math.fround(this.x + imWidth) + IconTitle.GAP), Math.fround(imHeight) > this.tfLabel.height() ? Math.fround(this.y + Math.fround((Math.fround(imHeight - this.tfLabel.height())) / 2)) : this.y);
    PixelScene.align$Component(this.tfLabel);
    if (this.health_.visible_) {
      this.health_.setRect(this.tfLabel.left(), this.tfLabel.bottom(), Math.fround(this.tfLabel.maxWidth$()), 0);
      this.height_ = Math.max(Math.fround(imHeight), this.health_.bottom());
    } else {
      this.height_ = Math.max(Math.fround(imHeight), this.tfLabel.height());
    }
  }
  reqWidth(): number {
    return Math.fround(Math.fround(this.imIcon.width() + this.tfLabel.width()) + IconTitle.GAP);
  }
  icon(icon: Image): void {
    if (icon != null) {
      this.remove$Gizmo(this.imIcon);
      this.add$Gizmo(this.imIcon = icon);
    }
  }
  label$String(label: string): void {
    this.tfLabel.text$String(label);
  }
  label$String$int(label: string, color: number): void {
    this.tfLabel.text$String(label);
    this.tfLabel.hardlight(color);
  }
  color(color: number): void {
    this.tfLabel.hardlight(color);
  }
  alpha$(): number {
    return this.imIcon.alpha$();
  }
  alpha$float(value: number): void {
    this.tfLabel.alpha(value);
    this.imIcon.alpha$float(value);
  }
  health(value: number): void {
    this.health_.level$float(this.healthLvl = value);
    this.layout();
  }
}

$J.define(IconTitle, 'com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'com.watabou.noosa.Image,java.lang.String': '_IconTitle$Image$String', 'com.shatteredpixel.shatteredpixeldungeon.items.Heap': '_IconTitle$Heap', 'com.shatteredpixel.shatteredpixeldungeon.items.Item': '_IconTitle$Item', '': '_IconTitle$' }, meths: { 'alpha(float)': 'alpha$float', 'alpha()': 'alpha$', 'label(java.lang.String,int)': 'label$String$int', 'label(java.lang.String)': 'label$String' } });
$J.module(() => {
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  HealthBar = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HealthBar');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  Image = $J.load('com.watabou.noosa.Image');
});
