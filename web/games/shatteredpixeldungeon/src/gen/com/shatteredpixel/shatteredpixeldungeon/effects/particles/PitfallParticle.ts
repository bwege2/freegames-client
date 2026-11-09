// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/particles/PitfallParticle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class PitfallParticle extends PixelParticle$Shrinking {
  static FACTORY4: Emitter$Factory = null;
  static FACTORY8: Emitter$Factory = null;
  _PitfallParticle(): this {
    this._PixelParticle$Shrinking();
    this.color$int(0);
    this.angle = Random.Float$float$float(-30, 30);
    return this;
  }
  reset$float$float$int(x: number, y: number, size: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.left_ = this.lifespan = 1;
    this.size_ = Math.fround(size);
  }
  static $clinit() {
    PitfallParticle.FACTORY4 = new (PitfallParticle$1())()._Emitter$Factory();
    PitfallParticle.FACTORY8 = new (PitfallParticle$2())()._Emitter$Factory();
  }
}

let $PitfallParticle$1: any = null;
/** An anonymous class (PitfallParticle.java:30). */
function PitfallParticle$1(): any {
  return $PitfallParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(PitfallParticle))).reset$float$float$int(x, y, 4);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.PitfallParticle$1', []);
}

let $PitfallParticle$2: any = null;
/** An anonymous class (PitfallParticle.java:37). */
function PitfallParticle$2(): any {
  return $PitfallParticle$2 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(PitfallParticle))).reset$float$float$int(x, y, 8);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.PitfallParticle$2', []);
}

$J.define(PitfallParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.PitfallParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle$Shrinking', ctors: { '': '_PitfallParticle' }, meths: { 'reset(float,float,int)': 'reset$float$float$int' }, clinit: true, lazy: ['FACTORY4', 'FACTORY8'] });
$J.module(() => {
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  Random = $J.load('com.watabou.utils.Random');
});
