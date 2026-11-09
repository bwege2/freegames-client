// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/particles/BlastParticle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Emitter$Factory, Random;

export class BlastParticle extends PixelParticle$Shrinking {
  static FACTORY: Emitter$Factory = null;
  _BlastParticle(): this {
    this._PixelParticle$Shrinking();
    this.color$int(15628066);
    this.acc.set$float$float(0, Math.fround(+50));
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.left_ = this.lifespan = Random.Float$();
    this.size_ = 8;
    this.speed_.polar(Math.fround(-Random.Float$float(Math.fround(3.1415925))), Random.Float$float$float(32, 64));
  }
  update(): void {
    super.update();
    this.am = this.left_ > Math.fround(0.8) ? Math.fround((Math.fround(1 - this.left_)) * 5) : 1;
  }
  static $clinit() {
    BlastParticle.FACTORY = new (BlastParticle$1())()._Emitter$Factory();
  }
}

let $BlastParticle$1: any = null;
/** An anonymous class (BlastParticle.java:31). */
function BlastParticle$1(): any {
  return $BlastParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(BlastParticle))).reset$float$float(x, y);
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.BlastParticle$1', []);
}

$J.define(BlastParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.BlastParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle$Shrinking', ctors: { '': '_BlastParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['FACTORY'] });
$J.module(() => {
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  Random = $J.load('com.watabou.utils.Random');
});
