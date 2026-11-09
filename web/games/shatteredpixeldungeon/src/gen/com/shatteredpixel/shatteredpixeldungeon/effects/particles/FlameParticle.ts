// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/particles/FlameParticle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class FlameParticle extends PixelParticle$Shrinking {
  static FACTORY: Emitter$Factory = null;
  _FlameParticle(): this {
    this._PixelParticle$Shrinking();
    this.color$int(15628066);
    this.lifespan = Math.fround(0.6);
    this.acc.set$float$float(0, -80);
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.left_ = this.lifespan;
    this.size_ = 4;
    this.speed_.set$float(0);
  }
  update(): void {
    super.update();
    let p = Math.fround(this.left_ / this.lifespan);
    this.am = p > Math.fround(0.8) ? Math.fround((Math.fround(1 - p)) * 5) : 1;
  }
  static $clinit() {
    FlameParticle.FACTORY = new (FlameParticle$1())()._Emitter$Factory();
  }
}

let $FlameParticle$1: any = null;
/** An anonymous class (FlameParticle.java:30). */
function FlameParticle$1(): any {
  return $FlameParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(FlameParticle))).reset$float$float(x, y);
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlameParticle$1', []);
}

$J.define(FlameParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlameParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle$Shrinking', ctors: { '': '_FlameParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['FACTORY'] });
$J.module(() => {
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
});
