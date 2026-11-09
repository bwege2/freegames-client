// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/TorchHalo.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Halo } from '../../../watabou/noosa/Halo.ts';

let Blending, Game;

export class TorchHalo extends Halo {
  target: CharSprite = null;
  phase: number = 0;
  _TorchHalo(sprite: CharSprite): this {
    this._Halo$float$int$float(20, 16768460, Math.fround(0.2));
    this.phase = 0;
    this.target = sprite;
    this.am = 0;
    return this;
  }
  update(): void {
    super.update();
    if (this.phase < Math.fround(0)) {
      if ((this.phase = Math.fround(this.phase + Game.elapsed)) >= Math.fround(0)) {
        this.killAndErase();
      } else {
        this.scale_.set$float(Math.fround(Math.fround((Math.fround(2 + this.phase)) * this.radius_) / Halo.RADIUS));
        this.am = Math.fround(Math.fround(-this.phase) * this.brightness_);
      }
    } else if (this.phase < Math.fround(1)) {
      if ((this.phase = Math.fround(this.phase + Math.fround(2 * Game.elapsed))) >= Math.fround(1)) {
        this.phase = 1;
      }
      this.scale_.set$float(Math.fround(Math.fround(this.phase * this.radius_) / Halo.RADIUS));
      this.am = Math.fround(this.phase * this.brightness_);
    }
    this.point$float$float(Math.fround(this.target.x + Math.fround(this.target.width() / 2)), Math.fround(this.target.y + Math.fround(this.target.height() / 2)));
  }
  draw(): void {
    Blending.setLightMode();
    super.draw();
    Blending.setNormalMode();
  }
  putOut(): void {
    this.phase = -1;
  }
}

$J.define(TorchHalo, 'com.shatteredpixel.shatteredpixeldungeon.effects.TorchHalo', { kind: 'class', sup: 'com.watabou.noosa.Halo', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite': '_TorchHalo' } });
$J.module(() => {
  Blending = $J.load('com.watabou.glwrap.Blending');
  Game = $J.load('com.watabou.noosa.Game');
});
