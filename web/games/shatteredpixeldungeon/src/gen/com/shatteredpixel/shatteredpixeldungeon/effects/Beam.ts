// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/Beam.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Image } from '../../../watabou/noosa/Image.ts';

let Effects, Effects$Type, Blending, Game;

export class Beam extends Image {
  static readonly A: number = 57.29577951308232;
  duration: number = 0;
  timeLeft: number = 0;
  _Beam(s: PointF, e: PointF, asset: Effects$Type, duration: number): this {
    this._Image$Image(Effects.get(asset));
    this.origin.set$float$float(0, Math.fround(this.height_ / 2));
    this.x = Math.fround(s.x - this.origin.x);
    this.y = Math.fround(s.y - this.origin.y);
    let dx = Math.fround(e.x - s.x);
    let dy = Math.fround(e.y - s.y);
    this.angle = Math.fround((Math.atan2(dy, dx) * Beam.A));
    this.scale_.x = Math.fround(Math.fround(Math.sqrt(Math.fround(Math.fround(dx * dx) + Math.fround(dy * dy)))) / this.width_);
    this.timeLeft = this.duration = duration;
    return this;
  }
  update(): void {
    super.update();
    let p = Math.fround(this.timeLeft / this.duration);
    this.alpha$float(p);
    this.scale_.set$float$float(this.scale_.x, p);
    if ((this.timeLeft = Math.fround(this.timeLeft - Game.elapsed)) <= Math.fround(0)) {
      this.killAndErase();
    }
  }
  draw(): void {
    Blending.setLightMode();
    super.draw();
    Blending.setNormalMode();
  }
}

export class Beam$DeathRay extends Beam {
  _Beam$DeathRay(s: PointF, e: PointF): this {
    this._Beam(s, e, Effects$Type.DEATH_RAY, 0.5);
    return this;
  }
}

export class Beam$LightRay extends Beam {
  _Beam$LightRay(s: PointF, e: PointF): this {
    this._Beam(s, e, Effects$Type.LIGHT_RAY, 1);
    return this;
  }
}

export class Beam$SunRay extends Beam {
  _Beam$SunRay(s: PointF, e: PointF): this {
    this._Beam(s, e, Effects$Type.LIGHT_RAY, 1);
    this.tint$float$float$float$float(1, 1, 0.25, 1);
    return this;
  }
}

export class Beam$HealthRay extends Beam {
  _Beam$HealthRay(s: PointF, e: PointF): this {
    this._Beam(s, e, Effects$Type.HEALTH_RAY, 0.75);
    return this;
  }
}

$J.define(Beam, 'com.shatteredpixel.shatteredpixeldungeon.effects.Beam', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { 'com.watabou.utils.PointF,com.watabou.utils.PointF,com.shatteredpixel.shatteredpixeldungeon.effects.Effects$Type,float': '_Beam' } });
$J.define(Beam$DeathRay, 'com.shatteredpixel.shatteredpixeldungeon.effects.Beam$DeathRay', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.effects.Beam', ctors: { 'com.watabou.utils.PointF,com.watabou.utils.PointF': '_Beam$DeathRay' } });
$J.define(Beam$LightRay, 'com.shatteredpixel.shatteredpixeldungeon.effects.Beam$LightRay', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.effects.Beam', ctors: { 'com.watabou.utils.PointF,com.watabou.utils.PointF': '_Beam$LightRay' } });
$J.define(Beam$SunRay, 'com.shatteredpixel.shatteredpixeldungeon.effects.Beam$SunRay', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.effects.Beam', ctors: { 'com.watabou.utils.PointF,com.watabou.utils.PointF': '_Beam$SunRay' } });
$J.define(Beam$HealthRay, 'com.shatteredpixel.shatteredpixeldungeon.effects.Beam$HealthRay', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.effects.Beam', ctors: { 'com.watabou.utils.PointF,com.watabou.utils.PointF': '_Beam$HealthRay' } });
$J.module(() => {
  Effects = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Effects');
  Effects$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Effects$Type');
  Blending = $J.load('com.watabou.glwrap.Blending');
  Game = $J.load('com.watabou.noosa.Game');
});
