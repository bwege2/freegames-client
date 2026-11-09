// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/particles/ShadowParticle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { PixelParticle$Shrinking } from '../../../../watabou/noosa/particles/PixelParticle.ts';

let Emitter$Factory, ColorMath, PointF, Random;

export class ShadowParticle extends PixelParticle$Shrinking {
  static MISSILE: Emitter$Factory = null;
  static CURSE: Emitter$Factory = null;
  static UP: Emitter$Factory = null;
  _ShadowParticle(): this {
    this._PixelParticle$Shrinking();
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.speed_.set$float$float(Random.Float$float$float(-5, Math.fround(+5)), Random.Float$float$float(-5, Math.fround(+5)));
    this.size_ = 6;
    this.left_ = this.lifespan = 0.5;
  }
  resetCurse(x: number, y: number): void {
    this.revive();
    this.size_ = 8;
    this.left_ = this.lifespan = 0.5;
    this.speed_.polar(Random.Float$float(PointF.PI2), Random.Float$float$float(16, 32));
    this.x = Math.fround(x - Math.fround(this.speed_.x * this.lifespan));
    this.y = Math.fround(y - Math.fround(this.speed_.y * this.lifespan));
  }
  resetUp(x: number, y: number): void {
    this.revive();
    this.speed_.set$float$float(Random.Float$float$float(-8, Math.fround(+8)), Random.Float$float$float(-32, -48));
    this.x = x;
    this.y = y;
    this.size_ = 6;
    this.left_ = this.lifespan = 1;
  }
  update(): void {
    super.update();
    let p = Math.fround(this.left_ / this.lifespan);
    this.color$int(ColorMath.interpolate$int$int$float(0, 4456516, p));
    this.am = p < 0.5 ? Math.fround(Math.fround(p * p) * 4) : Math.fround((Math.fround(1 - p)) * 2);
  }
  static $clinit() {
    ShadowParticle.MISSILE = new (ShadowParticle$1())()._Emitter$Factory();
    ShadowParticle.CURSE = new (ShadowParticle$2())()._Emitter$Factory();
    ShadowParticle.UP = new (ShadowParticle$3())()._Emitter$Factory();
  }
}

let $ShadowParticle$1: any = null;
/** An anonymous class (ShadowParticle.java:33). */
function ShadowParticle$1(): any {
  return $ShadowParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(ShadowParticle))).reset$float$float(x, y);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle$1', []);
}

let $ShadowParticle$2: any = null;
/** An anonymous class (ShadowParticle.java:40). */
function ShadowParticle$2(): any {
  return $ShadowParticle$2 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(ShadowParticle))).resetCurse(x, y);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle$2', []);
}

let $ShadowParticle$3: any = null;
/** An anonymous class (ShadowParticle.java:47). */
function ShadowParticle$3(): any {
  return $ShadowParticle$3 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(ShadowParticle))).resetUp(x, y);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle$3', []);
}

$J.define(ShadowParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle$Shrinking', ctors: { '': '_ShadowParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['MISSILE', 'CURSE', 'UP'] });
$J.module(() => {
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  ColorMath = $J.load('com.watabou.utils.ColorMath');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
