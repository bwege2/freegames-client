// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/particles/LeafParticle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Emitter$Factory, ColorMath, Random;

export class LeafParticle extends PixelParticle$Shrinking {
  static color1: number = 0;
  static color2: number = 0;
  static GENERAL: Emitter$Factory = null;
  static LEVEL_SPECIFIC: Emitter$Factory = null;
  _LeafParticle(): this {
    this._PixelParticle$Shrinking();
    this.lifespan = Math.fround(1.2);
    this.acc.set$float$float(0, 25);
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.speed_.set$float$float(Random.Float$float$float(-8, Math.fround(+8)), -20);
    this.left_ = this.lifespan;
    this.size_ = Random.Float$float$float(2, 3);
  }
  static $clinit() {
    LeafParticle.GENERAL = new (LeafParticle$1())()._Emitter$Factory();
    LeafParticle.LEVEL_SPECIFIC = new (LeafParticle$2())()._Emitter$Factory();
  }
}

let $LeafParticle$1: any = null;
/** An anonymous class (LeafParticle.java:37). */
function LeafParticle$1(): any {
  return $LeafParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      let p = (emitter.recycle($J.cls(LeafParticle)));
      p.color$int(ColorMath.random(17408, 8965188));
      p.reset$float$float(x, y);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.LeafParticle$1', []);
}

let $LeafParticle$2: any = null;
/** An anonymous class (LeafParticle.java:46). */
function LeafParticle$2(): any {
  return $LeafParticle$2 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      let p = (emitter.recycle($J.cls(LeafParticle)));
      p.color$int(ColorMath.random(Dungeon.level.color1, Dungeon.level.color2));
      p.reset$float$float(x, y);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.LeafParticle$2', []);
}

$J.define(LeafParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.LeafParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle$Shrinking', ctors: { '': '_LeafParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['color1', 'color2', 'GENERAL', 'LEVEL_SPECIFIC'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  ColorMath = $J.load('com.watabou.utils.ColorMath');
  Random = $J.load('com.watabou.utils.Random');
});
