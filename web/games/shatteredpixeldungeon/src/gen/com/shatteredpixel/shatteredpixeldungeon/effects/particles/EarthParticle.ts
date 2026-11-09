// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/particles/EarthParticle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Emitter$Factory, ColorMath, Random;

export class EarthParticle extends PixelParticle {
  static FACTORY: Emitter$Factory = null;
  static SMALL: Emitter$Factory = null;
  static FALLING: Emitter$Factory = null;
  _EarthParticle(): this {
    this._PixelParticle();
    this.color$int(ColorMath.random(4473924, 7829350));
    this.angle = Random.Float$float$float(-30, 30);
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.left_ = this.lifespan = 0.5;
    this.size_ = 16;
    this.acc.y = 0;
    this.speed_.y = 0;
    this.angularSpeed = 0;
  }
  resetSmall(x: number, y: number): void {
    this.reset$float$float(x, y);
    this.left_ = this.lifespan = 1;
    this.size_ = 8;
  }
  resetFalling(x: number, y: number): void {
    this.reset$float$float(x, y);
    this.left_ = this.lifespan = 1;
    this.size_ = 8;
    this.acc.y = 30;
    this.speed_.y = -5;
    this.angularSpeed = Random.Float$float$float(-90, 90);
  }
  update(): void {
    super.update();
    let p = Math.fround(this.left_ / this.lifespan);
    this.size$float(Math.fround((p < 0.5 ? p : Math.fround(1 - p)) * this.size_));
  }
  static $clinit() {
    EarthParticle.FACTORY = new (EarthParticle$1())()._Emitter$Factory();
    EarthParticle.SMALL = new (EarthParticle$2())()._Emitter$Factory();
    EarthParticle.FALLING = new (EarthParticle$3())()._Emitter$Factory();
  }
}

let $EarthParticle$1: any = null;
/** An anonymous class (EarthParticle.java:32). */
function EarthParticle$1(): any {
  return $EarthParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(EarthParticle))).reset$float$float(x, y);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.EarthParticle$1', []);
}

let $EarthParticle$2: any = null;
/** An anonymous class (EarthParticle.java:39). */
function EarthParticle$2(): any {
  return $EarthParticle$2 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(EarthParticle))).resetSmall(x, y);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.EarthParticle$2', []);
}

let $EarthParticle$3: any = null;
/** An anonymous class (EarthParticle.java:46). */
function EarthParticle$3(): any {
  return $EarthParticle$3 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(EarthParticle))).resetFalling(x, y);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.EarthParticle$3', []);
}

$J.define(EarthParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.EarthParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle', ctors: { '': '_EarthParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['FACTORY', 'SMALL', 'FALLING'] });
$J.module(() => {
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  ColorMath = $J.load('com.watabou.utils.ColorMath');
  Random = $J.load('com.watabou.utils.Random');
});
