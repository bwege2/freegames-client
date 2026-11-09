// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/particles/ShaftParticle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class ShaftParticle extends PixelParticle {
  static FACTORY: Emitter$Factory = null;
  offs: number = 0;
  _ShaftParticle(): this {
    this._PixelParticle();
    this.lifespan = Math.fround(1.2);
    this.speed_.set$float$float(0, -6);
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.offs = Math.fround(-Random.Float$float(this.lifespan));
    this.left_ = Math.fround(this.lifespan - this.offs);
  }
  update(): void {
    super.update();
    let p = Math.fround(this.left_ / this.lifespan);
    this.am = p < 0.5 ? p : Math.fround(1 - p);
    this.scale_.x = Math.fround((Math.fround(1 - p)) * 4);
    this.scale_.y = Math.fround(16 + Math.fround((Math.fround(1 - p)) * 16));
  }
  static $clinit() {
    ShaftParticle.FACTORY = new (ShaftParticle$1())()._Emitter$Factory();
  }
}

let $ShaftParticle$1: any = null;
/** An anonymous class (ShaftParticle.java:31). */
function ShaftParticle$1(): any {
  return $ShaftParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(ShaftParticle))).reset$float$float(x, y);
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShaftParticle$1', []);
}

$J.define(ShaftParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShaftParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle', ctors: { '': '_ShaftParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['FACTORY'] });
$J.module(() => {
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  Random = $J.load('com.watabou.utils.Random');
});
