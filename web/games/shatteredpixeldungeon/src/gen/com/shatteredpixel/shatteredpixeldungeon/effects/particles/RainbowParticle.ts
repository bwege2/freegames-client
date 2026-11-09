// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/particles/RainbowParticle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Emitter$Factory, PointF, Random;

export class RainbowParticle extends PixelParticle {
  static BURST: Emitter$Factory = null;
  _RainbowParticle(): this {
    this._PixelParticle();
    this.color$int(Random.Int$int(16777216));
    this.lifespan = 0.5;
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.speed_.set$float$float(Random.Float$float$float(-5, Math.fround(+5)), Random.Float$float$float(-5, Math.fround(+5)));
    this.left_ = this.lifespan;
  }
  resetBurst(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.speed_.polar(Random.Float$float(PointF.PI2), Random.Float$float$float(16, 32));
    this.left_ = this.lifespan;
  }
  update(): void {
    super.update();
    this.size$float(Math.fround(5 - Math.fround((this.am = Math.fround(this.left_ / this.lifespan)) * 4)));
  }
  static $clinit() {
    RainbowParticle.BURST = new (RainbowParticle$1())()._Emitter$Factory();
  }
}

let $RainbowParticle$1: any = null;
/** An anonymous class (RainbowParticle.java:31). */
function RainbowParticle$1(): any {
  return $RainbowParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(RainbowParticle))).resetBurst(x, y);
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.RainbowParticle$1', []);
}

$J.define(RainbowParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.RainbowParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle', ctors: { '': '_RainbowParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['BURST'] });
$J.module(() => {
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
