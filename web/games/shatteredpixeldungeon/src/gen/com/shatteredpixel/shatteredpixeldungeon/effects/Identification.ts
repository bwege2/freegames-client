// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/Identification.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { Group } from '../../../watabou/noosa/Group.ts';
import { PixelParticle } from '../../../watabou/noosa/particles/PixelParticle.ts';

let Blending, PointF, Random;

export class Identification extends Group {
  static DOTS: number[] = null;
  _Identification(p: PointF): this {
    this._Group();
    for (let i = 0; i < Identification.DOTS.length; i = (i + 2) | 0) {
      this.add$Gizmo(new Identification$Speck()._Identification$Speck(p.x, p.y, Identification.DOTS[i], Identification.DOTS[(i + 1) | 0]));
      this.add$Gizmo(new Identification$Speck()._Identification$Speck(p.x, p.y, Identification.DOTS[i], Identification.DOTS[(i + 1) | 0]));
    }
    return this;
  }
  update(): void {
    super.update();
    if (this.countLiving() === 0) {
      this.killAndErase();
    }
  }
  draw(): void {
    Blending.setLightMode();
    super.draw();
    Blending.setNormalMode();
  }
  static $clinit() {
    Identification.DOTS = [-1, -3, 0, -3, +1, -3, -1, -2, +1, -2, +1, -1, 0, 0, +1, 0, 0, +1, 0, +3];
  }
}

export class Identification$Speck extends PixelParticle {
  static readonly COLOR: number = 4491468;
  static readonly SIZE: number = 3;
  _Identification$Speck(x0: number, y0: number, mx: number, my: number): this {
    this._PixelParticle();
    this.color$int(Identification$Speck.COLOR);
    let x1 = Math.fround(x0 + Math.imul(mx, Identification$Speck.SIZE));
    let y1 = Math.fround(y0 + Math.imul(my, Identification$Speck.SIZE));
    let p = new PointF()._PointF$().polar(Random.Float$float(Math.fround(2 * PointF.PI)), 8);
    x0 = Math.fround(x0 + p.x);
    y0 = Math.fround(y0 + p.y);
    let dx = Math.fround(x1 - x0);
    let dy = Math.fround(y1 - y0);
    this.x = x0;
    this.y = y0;
    this.speed_.set$float$float(dx, dy);
    this.acc.set$float$float(Math.fround(Math.fround(-dx) / 4), Math.fround(Math.fround(-dy) / 4));
    this.left_ = this.lifespan = 2;
    return this;
  }
  update(): void {
    super.update();
    this.am = Math.fround(1 - Math.fround(Math.fround(Math.abs(Math.fround(Math.fround(this.left_ / this.lifespan) - 0.5))) * 2));
    this.am = Math.fround(this.am * this.am);
    this.size$float(Math.fround(this.am * Identification$Speck.SIZE));
  }
}

$J.define(Identification, 'com.shatteredpixel.shatteredpixeldungeon.effects.Identification', { kind: 'class', sup: 'com.watabou.noosa.Group', ctors: { 'com.watabou.utils.PointF': '_Identification' }, clinit: true, lazy: ['DOTS'] });
$J.define(Identification$Speck, 'com.shatteredpixel.shatteredpixeldungeon.effects.Identification$Speck', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle', ctors: { 'float,float,int,int': '_Identification$Speck' } });
$J.module(() => {
  Blending = $J.load('com.watabou.glwrap.Blending');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
