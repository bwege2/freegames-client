// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/particles/SparkParticle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let DungeonTilemap, Emitter$Factory, Random;

export class SparkParticle extends PixelParticle {
  static FACTORY: Emitter$Factory = null;
  static STATIC: Emitter$Factory = null;
  _SparkParticle(): this {
    this._PixelParticle();
    this.size$float(2);
    this.acc.set$float$float(0, Math.fround(+50));
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.size_ = 5;
    this.left_ = this.lifespan = Random.Float$float$float(0.5, 1);
    this.speed_.polar(Math.fround(-Random.Float$float(Math.fround(3.1415925))), Random.Float$float$float(20, 40));
  }
  resetStatic(x: number, y: number): void {
    this.reset$float$float(x, y);
    this.left_ = this.lifespan = Random.Float$float$float(0.25, 0.5);
    this.acc.set$float$float(0, 0);
    this.speed_.set$float$float(0, 0);
  }
  resetAttracting(x: number, y: number, attracting: Visual): void {
    this.reset$float$float(x, y);
    this.left_ = this.lifespan = Random.Float$float$float(Math.fround(0.2), Math.fround(0.35));
    this.acc.set$float(0);
    this.speed_.set$float$float(Math.fround((Math.fround(attracting.x + Math.fround(attracting.width_ / 2))) - x), Math.fround((Math.fround(attracting.y + Math.fround(attracting.height_ / 2))) - y));
    this.speed_.normalize().scale(Math.fround(DungeonTilemap.SIZE * 3));
    this.x = Math.fround(this.x - Math.fround(this.speed_.x / 8));
    this.y = Math.fround(this.y - Math.fround(this.speed_.y / 8));
  }
  setMaxSize(value: number): void {
    this.size_ = value;
  }
  update(): void {
    super.update();
    this.size$float(Random.Float$float(Math.fround(Math.fround(this.size_ * this.left_) / this.lifespan)));
  }
  static $clinit() {
    SparkParticle.FACTORY = new (SparkParticle$1())()._Emitter$Factory();
    SparkParticle.STATIC = new (SparkParticle$2())()._Emitter$Factory();
  }
}

let $SparkParticle$1: any = null;
/** An anonymous class (SparkParticle.java:33). */
function SparkParticle$1(): any {
  return $SparkParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(SparkParticle))).reset$float$float(x, y);
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle$1', []);
}

let $SparkParticle$2: any = null;
/** An anonymous class (SparkParticle.java:44). */
function SparkParticle$2(): any {
  return $SparkParticle$2 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(SparkParticle))).resetStatic(x, y);
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle$2', []);
}

$J.define(SparkParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle', ctors: { '': '_SparkParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['FACTORY', 'STATIC'] });
$J.module(() => {
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  Random = $J.load('com.watabou.utils.Random');
});
