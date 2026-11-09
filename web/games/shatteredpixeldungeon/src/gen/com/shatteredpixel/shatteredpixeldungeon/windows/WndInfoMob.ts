// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndInfoMob.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { WndTitledMessage } from './WndTitledMessage.ts';
import { Component } from '../../../watabou/noosa/ui/Component.ts';

let Char, Char$Property, Messages, PixelScene, BuffIndicator, HealthBar, Window;

export class WndInfoMob extends WndTitledMessage {
  _WndInfoMob(mob: Mob): this {
    this._WndTitledMessage$Component$String(new WndInfoMob$MobTitle()._WndInfoMob$MobTitle(mob), mob.info());
    return this;
  }
}

export class WndInfoMob$MobTitle extends Component {
  static readonly GAP: number = 2;
  image_: CharSprite = null;
  name_: RenderedTextBlock = null;
  health_: HealthBar = null;
  buffs: BuffIndicator = null;
  _WndInfoMob$MobTitle(mob: Mob): this {
    this._Component();
    this.name_ = PixelScene.renderTextBlock$String$int(Messages.titleCase(mob.name()), 9);
    this.name_.hardlight(Window.TITLE_COLOR);
    this.add$Gizmo(this.name_);
    this.image_ = mob.sprite();
    this.add$Gizmo(this.image_);
    this.health_ = new HealthBar()._HealthBar();
    this.health_.level$Char(mob);
    if (!Char.hasProp(mob, Char$Property.OBJECT)) {
      this.add$Gizmo(this.health_);
    }
    this.buffs = new BuffIndicator()._BuffIndicator(mob, false);
    if (!Char.hasProp(mob, Char$Property.OBJECT)) {
      this.add$Gizmo(this.buffs);
    }
    return this;
  }
  layout(): void {
    this.image_.x = 0;
    this.image_.y = Math.max(0, Math.fround(Math.fround(this.name_.height() + this.health_.height()) - this.image_.height()));
    let w = Math.fround(Math.fround(this.width_ - this.image_.width()) - WndInfoMob$MobTitle.GAP);
    this.name_.setPos(Math.fround(Math.fround(this.x + this.image_.width()) + WndInfoMob$MobTitle.GAP), this.image_.height() > this.name_.height() ? Math.fround(this.y + Math.fround((Math.fround(this.image_.height() - this.name_.height())) / 2)) : this.y);
    this.health_.setRect(Math.fround(this.image_.width() + WndInfoMob$MobTitle.GAP), Math.fround(this.name_.bottom() + WndInfoMob$MobTitle.GAP), w, this.health_.height());
    this.buffs.maxBuffs = 50;
    this.buffs.setRect(this.name_.right(), Math.fround(Math.fround(this.name_.bottom() - BuffIndicator.SIZE_SMALL) - 2), Math.fround(w - this.name_.width()), 8);
    if (!this.buffs.allBuffsVisible()) {
      this.buffs.setRect(0, this.health_.bottom(), this.width_, 8);
      this.height_ = Math.max(Math.fround(this.image_.y + this.image_.height()), this.buffs.bottom());
    } else {
      this.height_ = Math.max(Math.fround(this.image_.y + this.image_.height()), this.health_.bottom());
    }
  }
}

$J.define(WndInfoMob, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoMob', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob': '_WndInfoMob' } });
$J.define(WndInfoMob$MobTitle, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoMob$MobTitle', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob': '_WndInfoMob$MobTitle' } });
$J.module(() => {
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  BuffIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.BuffIndicator');
  HealthBar = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HealthBar');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
});
