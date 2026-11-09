// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/particles/SacrificialParticle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Emitter$Factory;

export class SacrificialParticle extends PixelParticle$Shrinking {
  static FACTORY: Emitter$Factory = null;
  _SacrificialParticle(): this {
    this._PixelParticle$Shrinking();
    this.color$int(4491502);
    this.lifespan = Math.fround(0.6);
    this.acc.set$float$float(0, -100);
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = Math.fround(y - 4);
    this.left_ = this.lifespan;
    this.size_ = 4;
    this.speed_.set$float(0);
  }
  update(): void {
    super.update();
    let p = Math.fround(this.left_ / this.lifespan);
    this.am = p > 0.75 ? Math.fround((Math.fround(1 - p)) * 4) : 1;
  }
  static $clinit() {
    SacrificialParticle.FACTORY = new (SacrificialParticle$1())()._Emitter$Factory();
  }
}

let $SacrificialParticle$1: any = null;
/** An anonymous class (SacrificialParticle.java:30). */
function SacrificialParticle$1(): any {
  return $SacrificialParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(SacrificialParticle))).reset$float$float(x, y);
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.SacrificialParticle$1', []);
}

$J.define(SacrificialParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.SacrificialParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle$Shrinking', ctors: { '': '_SacrificialParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['FACTORY'] });
$J.module(() => {
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
});
