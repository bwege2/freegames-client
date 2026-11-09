// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/particles/SmokeParticle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class SmokeParticle extends PixelParticle {
  static FACTORY: Emitter$Factory = null;
  static SPEW: Emitter$Factory = null;
  _SmokeParticle(): this {
    this._PixelParticle();
    this.color$int(2236962);
    this.acc.set$float$float(0, -40);
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.left_ = this.lifespan = Random.Float$float$float(Math.fround(0.6), 1);
    this.speed_.set$float$float(Random.Float$float$float(-4, Math.fround(+4)), Random.Float$float$float(-8, Math.fround(+8)));
  }
  resetSpew(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.acc.set$float$float(-40, 40);
    this.left_ = this.lifespan = Random.Float$float$float(Math.fround(0.6), 1);
    this.speed_.polar(Random.Float$float$float(Math.fround(PointF.PI * Math.fround(1.7)), Math.fround(PointF.PI * Math.fround(1.8))), Random.Float$float$float(30, 60));
  }
  update(): void {
    super.update();
    let p = Math.fround(this.left_ / this.lifespan);
    this.am = p > Math.fround(0.8) ? Math.fround(2 - Math.fround(2 * p)) : Math.fround(p * 0.5);
    this.size$float(Math.fround(16 - Math.fround(p * 8)));
  }
  static $clinit() {
    SmokeParticle.FACTORY = new (SmokeParticle$1())()._Emitter$Factory();
    SmokeParticle.SPEW = new (SmokeParticle$2())()._Emitter$Factory();
  }
}

let $SmokeParticle$1: any = null;
/** An anonymous class (SmokeParticle.java:32). */
function SmokeParticle$1(): any {
  return $SmokeParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(SmokeParticle))).reset$float$float(x, y);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.SmokeParticle$1', []);
}

let $SmokeParticle$2: any = null;
/** An anonymous class (SmokeParticle.java:39). */
function SmokeParticle$2(): any {
  return $SmokeParticle$2 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(SmokeParticle))).resetSpew(x, y);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.SmokeParticle$2', []);
}

$J.define(SmokeParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.SmokeParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle', ctors: { '': '_SmokeParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['FACTORY', 'SPEW'] });
$J.module(() => {
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
