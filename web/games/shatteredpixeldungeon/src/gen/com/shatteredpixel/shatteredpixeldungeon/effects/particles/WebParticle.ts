// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/particles/WebParticle.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class WebParticle extends PixelParticle {
  static FACTORY: Emitter$Factory = null;
  _WebParticle(): this {
    this._PixelParticle();
    this.color$int(13421772);
    this.lifespan = 2;
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.left_ = this.lifespan;
    this.angle = Random.Float$float(360);
  }
  update(): void {
    super.update();
    let p = Math.fround(this.left_ / this.lifespan);
    this.am = p < 0.5 ? p : Math.fround(1 - p);
    this.scale_.y = Math.fround(12 + Math.fround(p * 6));
  }
  static $clinit() {
    WebParticle.FACTORY = new (WebParticle$1())()._Emitter$Factory();
  }
}

let $WebParticle$1: any = null;
/** An anonymous class (WebParticle.java:31). */
function WebParticle$1(): any {
  return $WebParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      for (let i = 0; i < 3; i++) {
        (emitter.recycle($J.cls(WebParticle))).reset$float$float(x, y);
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.WebParticle$1', []);
}

$J.define(WebParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.particles.WebParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle', ctors: { '': '_WebParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['FACTORY'] });
$J.module(() => {
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  Random = $J.load('com.watabou.utils.Random');
});
