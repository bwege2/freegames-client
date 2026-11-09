// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/particles/SpectralWallParticle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { PixelParticle } from '../../../../watabou/noosa/particles/PixelParticle.ts';

let Dungeon, Emitter$Factory, ColorMath, GameMath, Random;

export class SpectralWallParticle extends PixelParticle {
  static FACTORY: Emitter$Factory = null;
  type_: number = 0;
  xScale: number = 0;
  yScale: number = 0;
  _SpectralWallParticle(): this {
    this._PixelParticle();
    this.type_ = 0;
    this.xScale = 0;
    this.yScale = 0;
    this.lifespan = 3;
    this.am = Math.fround(0.6);
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.type_ = (1 + $J.idiv(((Dungeon.depth - 1) | 0), 5)) | 0;
    this.type_ = $J.d2i(GameMath.gate(1, Math.fround(this.type_), 5));
    this.x = x;
    this.y = y;
    this.left_ = this.lifespan;
    {
      let colorScale: number;
      switch (this.type_) {
        case 1:
          this.x = Math.fround(Math.imul($J.roundf(Math.fround(x / 7)), 7));
          this.y = Math.fround((Math.imul($J.roundf(Math.fround(y / 4)), 4) - 6) | 0);
          this.x = Math.fround(this.x + Math.fround(Math.fround($J.roundf(Math.fround(this.y % 8)) / 4) - 1));
          this.color$int(ColorMath.random(13948116, 11250603));
          this.xScale = 6;
          this.yScale = 3;
          break;
        case 2:
          this.x = Math.fround(Math.imul($J.roundf(Math.fround(x / 7)), 7));
          this.y = Math.fround((Math.imul($J.roundf(Math.fround(y / 6)), 6) - 6) | 0);
          this.x = Math.fround(this.x + Math.fround(Math.fround($J.roundf(Math.fround(this.y % 8)) / 4) - 1));
          this.color$int(ColorMath.random(12893852, 10261117));
          this.xScale = 6;
          this.yScale = 5;
          break;
        case 3:
          this.y = Math.fround(this.y - 6);
          colorScale = Math.fround(Math.fround((Math.fround(this.x % 16)) / 16) + Math.fround((Math.fround(this.y % 16)) / 16));
          if (colorScale > 1) {
            colorScale = Math.fround(2 - colorScale);
          }
          this.color$int(ColorMath.interpolate$int$int$float(12038309, 6973026, colorScale));
          this.xScale = 5;
          this.yScale = 5;
          break;
        case 4:
          this.x = Math.fround(Math.imul($J.roundf(Math.fround(x / 5)), 5));
          this.y = Math.fround((Math.imul($J.roundf(Math.fround(y / 5)), 5) - 6) | 0);
          this.x = Math.fround(this.x + Math.fround(Math.fround($J.roundf(Math.fround(this.y % 16)) / 5) - 2));
          this.color$int(ColorMath.interpolate$float$intArr(13679779, [10718593]));
          this.xScale = 4;
          this.yScale = 4;
          break;
        case 5:
          this.x = Math.fround(Math.imul($J.roundf(Math.fround(x / 4)), 4));
          this.y = Math.fround((Math.imul($J.roundf(Math.fround((Math.fround(y + 8)) / 16)), 16) - 14) | 0);
          this.color$int(ColorMath.interpolate$float$intArr(10654845, [5851207]));
          this.xScale = 4;
          this.yScale = 20;
          break;
      }
    }
  }
  update(): void {
    super.update();
    this.scale_.set$float$float(Math.fround((Math.fround(this.left_ / this.lifespan)) * this.xScale), Math.fround((Math.fround(this.left_ / this.lifespan)) * this.yScale));
  }
  static $clinit() {
    SpectralWallParticle.FACTORY = new (SpectralWallParticle$1())()._Emitter$Factory();
  }
}

let $SpectralWallParticle$1: any = null;
/** An anonymous class (SpectralWallParticle.java:33). */
function SpectralWallParticle$1(): any {
  return $SpectralWallParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      let type$ = (1 + $J.idiv(((Dungeon.depth - 1) | 0), 5)) | 0;
      type$ = $J.d2i(GameMath.gate(1, Math.fround(type$), 5));
      switch (type$) {
        case 2:
          if (Random.Int$int(5) >= 3) {
            return;
          }
          break;
        case 5:
          if (Random.Int$int(5) >= 2) {
            return;
          }
          break;
      }
      (emitter.recycle($J.cls(SpectralWallParticle))).reset$float$float(x, y);
    }
    lightMode(): boolean {
      return false;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.SpectralWallParticle$1', []);
}

$J.define(SpectralWallParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.SpectralWallParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle', ctors: { '': '_SpectralWallParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['FACTORY'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  ColorMath = $J.load('com.watabou.utils.ColorMath');
  GameMath = $J.load('com.watabou.utils.GameMath');
  Random = $J.load('com.watabou.utils.Random');
});
