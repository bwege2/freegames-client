// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndHardNotification.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let RedButton, IconTitle, Game;

export class WndHardNotification extends WndTitledMessage {
  btnOkay: RedButton = null;
  timeLeft: number = 0;
  btnMessage: string = null;
  incTime: number = 0;
  $init_WndHardNotification() {
    this.incTime = 0;
  }
  _WndHardNotification$Image$String$String$String$int(icon: Image, title: string, message: string, btnMessage: string, time: number): this {
    this._WndHardNotification$Component$String$String$int(new IconTitle()._IconTitle$Image$String(icon, title), message, btnMessage, time);
    return this;
  }
  _WndHardNotification$Component$String$String$int(titlebar: Component, message: string, btnMessage: string, time: number): this {
    this._WndTitledMessage$Component$String(titlebar, message);
    this.$init_WndHardNotification();
    this.timeLeft = time;
    this.btnMessage = btnMessage;
    this.btnOkay = new (WndHardNotification$1())().$o(this)._RedButton$String(btnMessage + ' (' + time + ')');
    this.btnOkay.setRect(0, Math.fround((this.height_ + WndTitledMessage.GAP) | 0), Math.fround(this.width_), 16);
    this.btnOkay.enable(false);
    this.add$Gizmo(this.btnOkay);
    this.resize(this.width_, $J.d2i(this.btnOkay.bottom()));
    return this;
  }
  update(): void {
    super.update();
    this.incTime = Math.fround(this.incTime + Game.elapsed);
    if (this.timeLeft <= 0 && !this.btnOkay.active) {
      this.btnOkay.enable(true);
      this.btnOkay.text$String(this.btnMessage);
    } else if (this.timeLeft > 0 && this.incTime >= Math.fround(1)) {
      this.timeLeft -= this.incTime;
      this.incTime = 0;
      this.btnOkay.text$String(this.btnMessage + ' (' + $J.d2i(Math.ceil(this.timeLeft)) + ')');
      this.btnOkay.enable(false);
    }
  }
  onBackPressed(): void {
    if (this.timeLeft <= 0) {
      super.onBackPressed();
    }
  }
}

let $WndHardNotification$1: any = null;
/** An anonymous class (WndHardNotification.java:48). */
function WndHardNotification$1(): any {
  return $WndHardNotification$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHardNotification$1', []);
}

$J.define(WndHardNotification, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndHardNotification', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage', ctors: { 'com.watabou.noosa.ui.Component,java.lang.String,java.lang.String,int': '_WndHardNotification$Component$String$String$int', 'com.watabou.noosa.Image,java.lang.String,java.lang.String,java.lang.String,int': '_WndHardNotification$Image$String$String$String$int' } });
$J.module(() => {
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  Game = $J.load('com.watabou.noosa.Game');
});
