// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/ShieldHalo.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class ShieldHalo extends Halo {
  target: CharSprite = null;
  phase: number = 0;
  _ShieldHalo(sprite: CharSprite): this {
    this._Halo$float$int$float(Math.fround(Math.sqrt($J.pow(Math.fround(sprite.width() / 2), 2) + $J.pow(Math.fround(sprite.height() / 2), 2))), 12298956, 1);
    this.am = Math.fround(-Math.fround(0.33));
    this.aa = +Math.fround(0.33);
    this.target = sprite;
    this.phase = 1;
    return this;
  }
  update(): void {
    super.update();
    if (this.phase < Math.fround(1)) {
      if ((this.phase = Math.fround(this.phase - Game.elapsed)) <= Math.fround(0)) {
        this.killAndErase();
      } else {
        this.scale_.set$float(Math.fround(Math.fround((Math.fround(2 - this.phase)) * this.radius_) / Halo.RADIUS));
        this.am = Math.fround(this.phase * (-1));
        this.aa = Math.fround(this.phase * (+1));
      }
    }
    if (this.visible_ = this.target.visible_) {
      let p = this.target.center$();
      this.point$float$float(p.x, p.y);
    }
  }
  draw(): void {
    Blending.setLightMode();
    super.draw();
    Blending.setNormalMode();
  }
  putOut(): void {
    this.phase = Math.fround(0.999);
  }
}

$J.define(ShieldHalo, 'com.shatteredpixel.shatteredpixeldungeon.effects.ShieldHalo', { kind: 'class', sup: 'com.watabou.noosa.Halo', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite': '_ShieldHalo' } });
$J.module(() => {
  Blending = $J.load('com.watabou.glwrap.Blending');
  Game = $J.load('com.watabou.noosa.Game');
});
