// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/particles/ChallengeParticle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class ChallengeParticle extends PixelParticle$Shrinking {
  static FACTORY: Emitter$Factory = null;
  _ChallengeParticle(): this {
    this._PixelParticle$Shrinking();
    this.lifespan = Math.fround(0.6);
    this.color$int(16711680);
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.left_ = this.lifespan;
    this.size_ = 8;
    this.speed_.set$float$float(Random.Float$float$float(-8, Math.fround(+8)), Random.Float$float$float(-16, -32));
  }
  update(): void {
    super.update();
    this.am = Math.fround(1 - Math.fround(this.left_ / this.lifespan));
  }
  static $clinit() {
    ChallengeParticle.FACTORY = new (ChallengeParticle$1())()._Emitter$Factory();
  }
}

let $ChallengeParticle$1: any = null;
/** An anonymous class (ChallengeParticle.java:30). */
function ChallengeParticle$1(): any {
  return $ChallengeParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(ChallengeParticle))).reset$float$float(x, y);
    }
    lightMode(): boolean {
      return false;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.ChallengeParticle$1', []);
}

$J.define(ChallengeParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.ChallengeParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle$Shrinking', ctors: { '': '_ChallengeParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['FACTORY'] });
$J.module(() => {
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  Random = $J.load('com.watabou.utils.Random');
});
