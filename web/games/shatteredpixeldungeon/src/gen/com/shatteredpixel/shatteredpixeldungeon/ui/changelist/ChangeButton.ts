// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/changelist/ChangeButton.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { Component } from '../../../../watabou/noosa/ui/Component.ts';

let Messages, ChangesScene, PixelScene, Image;

export class ChangeButton extends Component {
  icon_: Image = null;
  title_: string = null;
  messages: string[] = null;
  _ChangeButton$ChangeIcons$String$StringArr(icon: ChangeIcons, title: string, message: string[]): this {
    this._ChangeButton$Image$String$StringArr(icon.get(), title, message);
    return this;
  }
  _ChangeButton$Image$String$StringArr(icon: Image, title: string, messages: string[]): this {
    this._Component();
    this.icon_ = icon;
    this.add$Gizmo(this.icon_);
    this.title_ = Messages.titleCase(title);
    this.messages = messages;
    this.layout();
    return this;
  }
  onClick(): void {
    ChangesScene.showChangeInfo(new Image()._Image$Image(this.icon_), this.title_, this.messages);
  }
  layout(): void {
    super.layout();
    this.icon_.x = Math.fround(this.x + Math.fround((Math.fround(this.width_ - this.icon_.width())) / 2));
    this.icon_.y = Math.fround(this.y + Math.fround((Math.fround(this.height_ - this.icon_.height())) / 2));
    PixelScene.align$Visual(this.icon_);
  }
}

$J.define(ChangeButton, 'com.shatteredpixel.shatteredpixeldungeon.ui.changelist.ChangeButton', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'com.watabou.noosa.Image,java.lang.String,java.lang.String[]': '_ChangeButton$Image$String$StringArr', 'com.shatteredpixel.shatteredpixeldungeon.ui.changelist.ChangeIcons,java.lang.String,java.lang.String[]': '_ChangeButton$ChangeIcons$String$StringArr' } });
$J.module(() => {
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ChangesScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.ChangesScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  Image = $J.load('com.watabou.noosa.Image');
});
