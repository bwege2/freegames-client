// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/particles/PixelParticle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { PseudoPixel } from '../PseudoPixel.ts';

let Game;

export class PixelParticle extends PseudoPixel {
  size_: number = 0;
  lifespan: number = 0;
  left_: number = 0;
  _PixelParticle(): this {
    this._PseudoPixel$();
    this.origin.set$float(+0.5);
    return this;
  }
  reset$float$float$int$float$float(x: number, y: number, color: number, size: number, lifespan: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.color$int(color);
    this.size$float(this.size_ = size);
    this.left_ = this.lifespan = lifespan;
  }
  update(): void {
    super.update();
    if ((this.left_ = Math.fround(this.left_ - Game.elapsed)) <= Math.fround(0)) {
      this.kill();
    }
  }
}

export class PixelParticle$Shrinking extends PixelParticle {
  _PixelParticle$Shrinking(): this {
    this._PixelParticle();
    return this;
  }
  update(): void {
    super.update();
    this.size$float(Math.fround(Math.fround(this.size_ * this.left_) / this.lifespan));
  }
}

$J.define(PixelParticle, 'com.watabou.noosa.particles.PixelParticle', { kind: 'class', sup: 'com.watabou.noosa.PseudoPixel', ctors: { '': '_PixelParticle' }, meths: { 'reset(float,float,int,float,float)': 'reset$float$float$int$float$float' } });
$J.define(PixelParticle$Shrinking, 'com.watabou.noosa.particles.PixelParticle$Shrinking', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle', ctors: { '': '_PixelParticle$Shrinking' } });
$J.module(() => {
  Game = $J.load('com.watabou.noosa.Game');
});
