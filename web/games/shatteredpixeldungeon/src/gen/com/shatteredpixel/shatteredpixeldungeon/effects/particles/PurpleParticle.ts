// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/particles/PurpleParticle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Emitter$Factory, ColorMath, PointF, Random;

export class PurpleParticle extends PixelParticle {
  static MISSILE: Emitter$Factory = null;
  static BURST: Emitter$Factory = null;
  _PurpleParticle(): this {
    this._PixelParticle();
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
    this.color$int(ColorMath.interpolate$int$int$float(2228326, 16711748, this.am));
  }
  static $clinit() {
    PurpleParticle.MISSILE = new (PurpleParticle$1())()._Emitter$Factory();
    PurpleParticle.BURST = new (PurpleParticle$2())()._Emitter$Factory();
  }
}

let $PurpleParticle$1: any = null;
/** An anonymous class (PurpleParticle.java:33). */
function PurpleParticle$1(): any {
  return $PurpleParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(PurpleParticle))).reset$float$float(x, y);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.PurpleParticle$1', []);
}

let $PurpleParticle$2: any = null;
/** An anonymous class (PurpleParticle.java:40). */
function PurpleParticle$2(): any {
  return $PurpleParticle$2 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(PurpleParticle))).resetBurst(x, y);
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.PurpleParticle$2', []);
}

$J.define(PurpleParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.PurpleParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle', ctors: { '': '_PurpleParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['MISSILE', 'BURST'] });
$J.module(() => {
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  ColorMath = $J.load('com.watabou.utils.ColorMath');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
