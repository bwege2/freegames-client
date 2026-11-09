// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/particles/WoolParticle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Emitter$Factory, ColorMath, Random;

export class WoolParticle extends PixelParticle$Shrinking {
  static FACTORY: Emitter$Factory = null;
  _WoolParticle(): this {
    this._PixelParticle$Shrinking();
    this.color$int(ColorMath.random(10066329, 15658720));
    this.acc.set$float$float(0, -40);
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.left_ = this.lifespan = Random.Float$float$float(Math.fround(0.6), 1);
    this.size_ = 5;
    this.speed_.set$float$float(Random.Float$float$float(-10, Math.fround(+10)), Random.Float$float$float(-10, Math.fround(+10)));
  }
  static $clinit() {
    WoolParticle.FACTORY = new (WoolParticle$1())()._Emitter$Factory();
  }
}

let $WoolParticle$1: any = null;
/** An anonymous class (WoolParticle.java:32). */
function WoolParticle$1(): any {
  return $WoolParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(WoolParticle))).reset$float$float(x, y);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.WoolParticle$1', []);
}

$J.define(WoolParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.WoolParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle$Shrinking', ctors: { '': '_WoolParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['FACTORY'] });
$J.module(() => {
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  ColorMath = $J.load('com.watabou.utils.ColorMath');
  Random = $J.load('com.watabou.utils.Random');
});
