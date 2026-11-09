// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/particles/WindParticle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Emitter } from '../../../../watabou/noosa/particles/Emitter.ts';

let Dungeon, DungeonTilemap, Emitter$Factory, PointF, Random;

export class WindParticle extends PixelParticle {
  static FACTORY: Emitter$Factory = null;
  static angle: number = 0;
  static speed: PointF = null;
  _WindParticle(): this {
    this._PixelParticle();
    this.lifespan = Random.Float$float$float(1, 2);
    this.scale_.set$float(this.size_ = Random.Float$float(3));
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.left_ = this.lifespan;
    this.speed_.set$PointF(WindParticle.speed);
    this.speed_.scale(this.size_);
    this.x = Math.fround(x - Math.fround(Math.fround(this.speed_.x * this.lifespan) / 2));
    this.y = Math.fround(y - Math.fround(Math.fround(this.speed_.y * this.lifespan) / 2));
    WindParticle.angle = Math.fround(WindParticle.angle + Random.Float$float$float(Math.fround(-Math.fround(0.1)), +Math.fround(0.1)));
    WindParticle.speed = new PointF()._PointF$().polar(WindParticle.angle, 5);
    this.am = 0;
  }
  update(): void {
    super.update();
    let p = Math.fround(this.left_ / this.lifespan);
    this.am = Math.fround(Math.fround((p < 0.5 ? p : Math.fround(1 - p)) * this.size_) * Math.fround(0.2));
  }
  static $clinit() {
    WindParticle.FACTORY = new (WindParticle$1())()._Emitter$Factory();
    WindParticle.angle = Random.Float$float(PointF.PI2);
    WindParticle.speed = new PointF()._PointF$().polar(WindParticle.angle, 5);
  }
}

export class WindParticle$Wind extends Emitter {
  pos: number = 0;
  _WindParticle$Wind(pos: number): this {
    this._Emitter();
    this.pos = pos;
    let p = DungeonTilemap.tileToWorld(pos);
    this.pos$float$float$float$float(p.x, p.y, Math.fround(DungeonTilemap.SIZE), Math.fround(DungeonTilemap.SIZE));
    this.pour(WindParticle.FACTORY, 2.5);
    return this;
  }
  update(): void {
    if (this.visible_ = (this.pos < Dungeon.level.heroFOV.length && Dungeon.level.heroFOV[this.pos])) {
      super.update();
    }
  }
}

let $WindParticle$1: any = null;
/** An anonymous class (WindParticle.java:34). */
function WindParticle$1(): any {
  return $WindParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(WindParticle))).reset$float$float(x, y);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.WindParticle$1', []);
}

$J.define(WindParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.WindParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle', ctors: { '': '_WindParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['FACTORY', 'angle', 'speed'] });
$J.define(WindParticle$Wind, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.WindParticle$Wind', { kind: 'class', sup: 'com.watabou.noosa.particles.Emitter', ctors: { 'int': '_WindParticle$Wind' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
