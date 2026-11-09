// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/particles/EnergyParticle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class EnergyParticle extends PixelParticle {
  static FACTORY: Emitter$Factory = null;
  _EnergyParticle(): this {
    this._PixelParticle();
    this.lifespan = 1;
    this.color$int(16777130);
    this.speed_.polar(Random.Float$float(PointF.PI2), Random.Float$float$float(24, 32));
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.left_ = this.lifespan;
    this.x = Math.fround(x - Math.fround(this.speed_.x * this.lifespan));
    this.y = Math.fround(y - Math.fround(this.speed_.y * this.lifespan));
  }
  update(): void {
    super.update();
    let p = Math.fround(this.left_ / this.lifespan);
    this.am = p < 0.5 ? Math.fround(Math.fround(p * p) * 4) : Math.fround((Math.fround(1 - p)) * 2);
    this.size$float(Random.Float$float(Math.fround(Math.fround(5 * this.left_) / this.lifespan)));
  }
  static $clinit() {
    EnergyParticle.FACTORY = new (EnergyParticle$1())()._Emitter$Factory();
  }
}

let $EnergyParticle$1: any = null;
/** An anonymous class (EnergyParticle.java:32). */
function EnergyParticle$1(): any {
  return $EnergyParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(EnergyParticle))).reset$float$float(x, y);
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.EnergyParticle$1', []);
}

$J.define(EnergyParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.EnergyParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle', ctors: { '': '_EnergyParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['FACTORY'] });
$J.module(() => {
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
