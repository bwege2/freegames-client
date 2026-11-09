// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/Banner.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JEnum } from '../../../../../jre/index.ts';
import { Image } from '../../../watabou/noosa/Image.ts';

let Game;

export class Banner extends Image {
  state_: Banner$State = null;
  time: number = 0;
  color_: number = 0;
  fadeTime: number = 0;
  showTime: number = 0;
  _Banner$Image(sample: Image): this {
    this._Image$();
    this.copy(sample);
    this.alpha$float(0);
    return this;
  }
  _Banner$Object(tx: any): this {
    this._Image$Object(tx);
    this.alpha$float(0);
    return this;
  }
  show$int$float$float(color: number, fadeTime: number, showTime: number): void {
    this.color_ = color;
    this.fadeTime = fadeTime;
    this.showTime = showTime;
    this.state_ = Banner$State.FADE_IN;
    this.time = fadeTime;
  }
  show$int$float(color: number, fadeTime: number): void {
    this.show$int$float$float(color, fadeTime, Math.fround(3.4028235E38));
  }
  update(): void {
    super.update();
    this.time = Math.fround(this.time - Game.elapsed);
    if (this.time >= Math.fround(0)) {
      let p = Math.fround(this.time / this.fadeTime);
      switch (this.state_) {
        case Banner$State.FADE_IN:
          this.tint$int$float(this.color_, p);
          this.alpha$float(Math.fround(1 - p));
          break;
        case Banner$State.STATIC:
          this.resetColor();
          break;
        case Banner$State.FADE_OUT:
          this.resetColor();
          this.alpha$float(p);
          break;
      }
    } else {
      switch (this.state_) {
        case Banner$State.FADE_IN:
          this.time = this.showTime;
          this.state_ = Banner$State.STATIC;
          break;
        case Banner$State.STATIC:
          this.time = this.fadeTime;
          this.state_ = Banner$State.FADE_OUT;
          break;
        case Banner$State.FADE_OUT:
          this.killAndErase();
          break;
      }
    }
  }
}

export class Banner$State extends JEnum {
  static FADE_IN: Banner$State = null;
  static STATIC: Banner$State = null;
  static FADE_OUT: Banner$State = null;
  static $VALUES: Banner$State[] = null;
  _Banner$State($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Banner$State[] { return Banner$State.$VALUES.slice(); }
  static valueOf(name: string): Banner$State { return $J.enumValueOf(Banner$State, name); }
  static $clinit() {
    Banner$State.FADE_IN = new Banner$State()._Banner$State('FADE_IN', 0);
    Banner$State.STATIC = new Banner$State()._Banner$State('STATIC', 1);
    Banner$State.FADE_OUT = new Banner$State()._Banner$State('FADE_OUT', 2);
    Banner$State.$VALUES = [Banner$State.FADE_IN, Banner$State.STATIC, Banner$State.FADE_OUT];
  }
}

$J.define(Banner, 'com.shatteredpixel.shatteredpixeldungeon.ui.Banner', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { 'java.lang.Object': '_Banner$Object', 'com.watabou.noosa.Image': '_Banner$Image' }, meths: { 'show(int,float)': 'show$int$float', 'show(int,float,float)': 'show$int$float$float' } });
$J.define(Banner$State, 'com.shatteredpixel.shatteredpixeldungeon.ui.Banner$State', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Banner$State' }, clinit: true, lazy: ['$VALUES', 'FADE_IN', 'STATIC', 'FADE_OUT'] });
$J.module(() => {
  Game = $J.load('com.watabou.noosa.Game');
});
