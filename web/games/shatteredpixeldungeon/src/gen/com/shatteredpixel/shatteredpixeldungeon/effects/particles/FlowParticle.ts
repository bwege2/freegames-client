// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/particles/FlowParticle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, DungeonTilemap, Emitter$Factory, Random;

export class FlowParticle extends PixelParticle {
  static FACTORY: Emitter$Factory = null;
  _FlowParticle(): this {
    this._PixelParticle();
    this.lifespan = Math.fround(0.6);
    this.acc.set$float$float(0, 32);
    this.angularSpeed = Random.Float$float$float(-360, Math.fround(+360));
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.left_ = this.lifespan;
    this.x = x;
    this.y = y;
    this.am = 0;
    this.size$float(0);
    this.speed_.set$float(0);
  }
  update(): void {
    super.update();
    let p = Math.fround(this.left_ / this.lifespan);
    this.am = Math.fround((p < 0.5 ? p : Math.fround(1 - p)) * Math.fround(0.6));
    this.size$float(Math.fround((Math.fround(1 - p)) * 4));
  }
  static $clinit() {
    FlowParticle.FACTORY = new (FlowParticle$1())()._Emitter$Factory();
  }
}

export class FlowParticle$Flow extends Emitter {
  pos: number = 0;
  _FlowParticle$Flow(pos: number): this {
    this._Emitter();
    this.pos = pos;
    let p = DungeonTilemap.tileToWorld(pos);
    this.pos$float$float$float$float(p.x, Math.fround(Math.fround(p.y + DungeonTilemap.SIZE) - 1), Math.fround(DungeonTilemap.SIZE), 0);
    this.pour(FlowParticle.FACTORY, Math.fround(0.05));
    return this;
  }
  update(): void {
    if (this.visible_ = (this.pos < Dungeon.level.heroFOV.length && Dungeon.level.heroFOV[this.pos])) {
      super.update();
    }
  }
}

let $FlowParticle$1: any = null;
/** An anonymous class (FlowParticle.java:34). */
function FlowParticle$1(): any {
  return $FlowParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(FlowParticle))).reset$float$float(x, y);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlowParticle$1', []);
}

$J.define(FlowParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlowParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle', ctors: { '': '_FlowParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['FACTORY'] });
$J.define(FlowParticle$Flow, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlowParticle$Flow', { kind: 'class', sup: 'com.watabou.noosa.particles.Emitter', ctors: { 'int': '_FlowParticle$Flow' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  Random = $J.load('com.watabou.utils.Random');
});
