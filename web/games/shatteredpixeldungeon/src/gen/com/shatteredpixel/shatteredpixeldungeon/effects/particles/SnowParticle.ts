// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/particles/SnowParticle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Emitter$Factory, Random;

export class SnowParticle extends PixelParticle {
  static FACTORY: Emitter$Factory = null;
  _SnowParticle(): this {
    this._PixelParticle();
    this.speed_.set$float$float(0, Random.Float$float$float(5, 8));
    this.lifespan = Math.fround(1.2);
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = Math.fround(y - Math.fround(this.speed_.y * this.lifespan));
    this.left_ = this.lifespan;
  }
  update(): void {
    super.update();
    let p = Math.fround(this.left_ / this.lifespan);
    this.am = Math.fround((p < 0.5 ? p : Math.fround(1 - p)) * 1.5);
  }
  static $clinit() {
    SnowParticle.FACTORY = new (SnowParticle$1())()._Emitter$Factory();
  }
}

let $SnowParticle$1: any = null;
/** An anonymous class (SnowParticle.java:31). */
function SnowParticle$1(): any {
  return $SnowParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(SnowParticle))).reset$float$float(x, y);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.SnowParticle$1', []);
}

$J.define(SnowParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.SnowParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle', ctors: { '': '_SnowParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['FACTORY'] });
$J.module(() => {
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  Random = $J.load('com.watabou.utils.Random');
});
