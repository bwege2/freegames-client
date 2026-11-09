// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/particles/PoisonParticle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class PoisonParticle extends PixelParticle {
  static MISSILE: Emitter$Factory = null;
  static SPLASH: Emitter$Factory = null;
  _PoisonParticle(): this {
    this._PixelParticle();
    this.lifespan = Math.fround(0.6);
    this.acc.set$float$float(0, Math.fround(+30));
    return this;
  }
  resetMissile(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.left_ = this.lifespan;
    this.speed_.polar(Math.fround(-Random.Float$float(Math.fround(3.1415925))), Random.Float$float(6));
  }
  resetSplash(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.left_ = this.lifespan;
    this.speed_.polar(Random.Float$float(Math.fround(3.1415925)), Random.Float$float$float(10, 20));
  }
  update(): void {
    super.update();
    this.size$float(Math.fround(4 - Math.fround((this.am = Math.fround(this.left_ / this.lifespan)) * 3)));
    this.color$int(ColorMath.interpolate$int$int$float(65280, 8930559, this.am));
  }
  static $clinit() {
    PoisonParticle.MISSILE = new (PoisonParticle$1())()._Emitter$Factory();
    PoisonParticle.SPLASH = new (PoisonParticle$2())()._Emitter$Factory();
  }
}

let $PoisonParticle$1: any = null;
/** An anonymous class (PoisonParticle.java:32). */
function PoisonParticle$1(): any {
  return $PoisonParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(PoisonParticle))).resetMissile(x, y);
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.PoisonParticle$1', []);
}

let $PoisonParticle$2: any = null;
/** An anonymous class (PoisonParticle.java:43). */
function PoisonParticle$2(): any {
  return $PoisonParticle$2 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(PoisonParticle))).resetSplash(x, y);
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.PoisonParticle$2', []);
}

$J.define(PoisonParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.PoisonParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle', ctors: { '': '_PoisonParticle' }, clinit: true, lazy: ['MISSILE', 'SPLASH'] });
$J.module(() => {
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  ColorMath = $J.load('com.watabou.utils.ColorMath');
  Random = $J.load('com.watabou.utils.Random');
});
