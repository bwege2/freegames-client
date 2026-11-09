// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/MagicMissile.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Emitter } from '../../../watabou/noosa/particles/Emitter.ts';
import { PixelParticle } from '../../../watabou/noosa/particles/PixelParticle.ts';
import { PixelParticle$Shrinking } from '../../../watabou/noosa/particles/PixelParticle.ts';

let Actor, Speck, BloodParticle, CorrosionParticle, ElmoParticle, FlameParticle, LeafParticle, PoisonParticle, PurpleParticle, RainbowParticle, ShadowParticle, SparkParticle, DungeonTilemap, Game, Emitter$Factory, ColorMath, PointF, Random;

export class MagicMissile extends Emitter {
  static readonly SPEED: number = 200;
  callback: Callback = null;
  to: PointF = null;
  sx: number = 0;
  sy: number = 0;
  time$MagicMissile: number = 0;
  static readonly MAGIC_MISSILE: number = 0;
  static readonly FROST: number = 1;
  static readonly FIRE: number = 2;
  static readonly CORROSION: number = 3;
  static readonly FOLIAGE: number = 4;
  static readonly FORCE: number = 5;
  static readonly BEACON: number = 6;
  static readonly SHADOW: number = 7;
  static readonly RAINBOW: number = 8;
  static readonly EARTH: number = 9;
  static readonly WARD: number = 10;
  static readonly SHAMAN_RED: number = 11;
  static readonly SHAMAN_BLUE: number = 12;
  static readonly SHAMAN_PURPLE: number = 13;
  static readonly SHAMAN_ELMO: number = 14;
  static readonly ELMO: number = 15;
  static readonly POISON: number = 16;
  static readonly LIGHT_MISSILE: number = 17;
  static readonly MAGIC_MISS_CONE: number = 100;
  static readonly FROST_CONE: number = 101;
  static readonly FIRE_CONE: number = 102;
  static readonly CORROSION_CONE: number = 103;
  static readonly FOLIAGE_CONE: number = 104;
  static readonly FORCE_CONE: number = 105;
  static readonly SHADOW_CONE: number = 107;
  static readonly RAINBOW_CONE: number = 108;
  static readonly EARTH_CONE: number = 109;
  static readonly WARD_CONE: number = 110;
  static readonly PURPLE_CONE: number = 111;
  static readonly SPARK_CONE: number = 112;
  static readonly BLOOD_CONE: number = 113;
  static readonly POISON_CONE: number = 114;
  static readonly SPECK: number = 1000;
  _MagicMissile(): this {
    this._Emitter();
    return this;
  }
  reset$int$int$int$Callback(type$: number, from: number, to: number, callback: Callback): void {
    this.reset$int$PointF$PointF$Callback(type$, DungeonTilemap.raisedTileCenterToWorld(from), DungeonTilemap.raisedTileCenterToWorld(to), callback);
  }
  reset$int$Visual$Visual$Callback(type$: number, from: Visual, to: Visual, callback: Callback): void {
    this.reset$int$PointF$PointF$Callback(type$, from.center$(), to.center$(), callback);
  }
  reset$int$Visual$int$Callback(type$: number, from: Visual, to: number, callback: Callback): void {
    this.reset$int$PointF$PointF$Callback(type$, from.center$(), DungeonTilemap.raisedTileCenterToWorld(to), callback);
  }
  reset$int$PointF$PointF$Callback(type$: number, from: PointF, to: PointF, callback: Callback): void {
    this.callback = callback;
    this.to = to;
    this.x = from.x;
    this.y = from.y;
    this.width_ = 0;
    this.height_ = 0;
    let d = PointF.diff(to, from);
    let speed = new PointF()._PointF$PointF(d).normalize().scale(MagicMissile.SPEED);
    this.sx = speed.x;
    this.sy = speed.y;
    this.time$MagicMissile = Math.fround(d.length() / MagicMissile.SPEED);
    if (type$ >= MagicMissile.SPECK) {
      this.size(10);
      this.pour(Speck.factory$int((type$ - MagicMissile.SPECK) | 0), Math.fround(0.02));
      this.revive();
      return;
    }
    switch (type$) {
      case MagicMissile.MAGIC_MISSILE:
      default:
        this.size(4);
        this.pour(MagicMissile$WhiteParticle.FACTORY, Math.fround(0.01));
        break;
      case MagicMissile.FROST:
        this.pour(MagicMissile$MagicParticle.FACTORY, Math.fround(0.01));
        break;
      case MagicMissile.FIRE:
        this.size(4);
        this.pour(FlameParticle.FACTORY, Math.fround(0.01));
        break;
      case MagicMissile.CORROSION:
        this.size(3);
        this.pour(CorrosionParticle.MISSILE, Math.fround(0.01));
        break;
      case MagicMissile.FOLIAGE:
        this.size(4);
        this.pour(LeafParticle.GENERAL, Math.fround(0.01));
        break;
      case MagicMissile.FORCE:
        this.pour(MagicMissile$SlowParticle.FACTORY, Math.fround(0.01));
        break;
      case MagicMissile.BEACON:
        this.pour(MagicMissile$ForceParticle.FACTORY, Math.fround(0.01));
        break;
      case MagicMissile.SHADOW:
        this.size(4);
        this.pour(ShadowParticle.MISSILE, Math.fround(0.01));
        break;
      case MagicMissile.RAINBOW:
        this.size(4);
        this.pour(RainbowParticle.BURST, Math.fround(0.01));
        break;
      case MagicMissile.EARTH:
        this.size(4);
        this.pour(MagicMissile$EarthParticle.FACTORY, Math.fround(0.01));
        break;
      case MagicMissile.WARD:
        this.size(4);
        this.pour(MagicMissile$WardParticle.FACTORY, Math.fround(0.01));
        break;
      case MagicMissile.SHAMAN_RED:
        this.size(2);
        this.pour(MagicMissile$ShamanParticle.RED, Math.fround(0.01));
        break;
      case MagicMissile.SHAMAN_BLUE:
        this.size(2);
        this.pour(MagicMissile$ShamanParticle.BLUE, Math.fround(0.01));
        break;
      case MagicMissile.SHAMAN_PURPLE:
        this.size(2);
        this.pour(MagicMissile$ShamanParticle.PURPLE, Math.fround(0.01));
        break;
      case MagicMissile.SHAMAN_ELMO:
        this.size(2);
        this.pour(MagicMissile$ShamanParticle.ELMO, Math.fround(0.01));
        break;
      case MagicMissile.ELMO:
        this.size(5);
        this.pour(ElmoParticle.FACTORY, Math.fround(0.01));
        break;
      case MagicMissile.POISON:
        this.size(3);
        this.pour(PoisonParticle.MISSILE, Math.fround(0.01));
        break;
      case MagicMissile.LIGHT_MISSILE:
        this.size(4);
        this.pour(MagicMissile$WhiteParticle.YELLOW, Math.fround(0.01));
        break;
      case MagicMissile.MAGIC_MISS_CONE:
        this.size(10);
        this.pour(MagicMissile$WhiteParticle.FACTORY, Math.fround(0.03));
        break;
      case MagicMissile.FROST_CONE:
        this.size(10);
        this.pour(MagicMissile$MagicParticle.FACTORY, Math.fround(0.03));
        break;
      case MagicMissile.FIRE_CONE:
        this.size(10);
        this.pour(FlameParticle.FACTORY, Math.fround(0.03));
        break;
      case MagicMissile.CORROSION_CONE:
        this.size(10);
        this.pour(CorrosionParticle.MISSILE, Math.fround(0.03));
        break;
      case MagicMissile.FOLIAGE_CONE:
        this.size(10);
        this.pour(LeafParticle.GENERAL, Math.fround(0.03));
        break;
      case MagicMissile.FORCE_CONE:
        this.size(10);
        this.pour(MagicMissile$SlowParticle.FACTORY, Math.fround(0.02));
        break;
      case MagicMissile.SHADOW_CONE:
        this.size(10);
        this.pour(ShadowParticle.MISSILE, Math.fround(0.03));
        break;
      case MagicMissile.RAINBOW_CONE:
        this.size(10);
        this.pour(RainbowParticle.BURST, Math.fround(0.03));
        break;
      case MagicMissile.EARTH_CONE:
        this.size(10);
        this.pour(MagicMissile$EarthParticle.FACTORY, Math.fround(0.03));
        break;
      case MagicMissile.WARD_CONE:
        this.size(10);
        this.pour(MagicMissile$WardParticle.FACTORY, Math.fround(0.03));
        break;
      case MagicMissile.PURPLE_CONE:
        this.size(10);
        this.pour(PurpleParticle.MISSILE, Math.fround(0.03));
        break;
      case MagicMissile.SPARK_CONE:
        this.size(10);
        this.pour(SparkParticle.FACTORY, Math.fround(0.03));
        break;
      case MagicMissile.BLOOD_CONE:
        this.size(10);
        this.pour(BloodParticle.FACTORY, Math.fround(0.03));
        break;
      case MagicMissile.POISON_CONE:
        this.size(10);
        this.pour(PoisonParticle.MISSILE, Math.fround(0.03));
        break;
    }
    this.revive();
  }
  size(size: number): void {
    this.x = Math.fround(this.x - Math.fround(size / 2));
    this.y = Math.fround(this.y - Math.fround(size / 2));
    this.width_ = this.height_ = size;
  }
  setSpeed(newSpeed: number): void {
    let d = PointF.diff(this.to, new PointF()._PointF$float$float(this.x, this.y));
    let speed = new PointF()._PointF$PointF(d).normalize().scale(newSpeed);
    this.sx = speed.x;
    this.sy = speed.y;
    this.time$MagicMissile = Math.fround(d.length() / newSpeed);
  }
  static boltFromChar(group: Group, type$: number, sprite: Visual, to: number, callback: Callback): MagicMissile {
    let missile = (group.recycle($J.cls(MagicMissile)));
    if (Actor.findChar(to) != null) {
      missile.reset$int$PointF$PointF$Callback(type$, sprite.center$(), Actor.findChar(to).sprite_.destinationCenter(), callback);
    } else {
      missile.reset$int$Visual$int$Callback(type$, sprite, to, callback);
    }
    return missile;
  }
  isFrozen(): boolean {
    return false;
  }
  update(): void {
    super.update();
    if (this.on) {
      let d = Game.elapsed;
      this.x = Math.fround(this.x + Math.fround(this.sx * d));
      this.y = Math.fround(this.y + Math.fround(this.sy * d));
      if ((this.time$MagicMissile = Math.fround(this.time$MagicMissile - d)) <= Math.fround(0)) {
        this.on = false;
        if (this.callback != null) {
          this.callback.call();
        }
      }
    }
  }
}

export class MagicMissile$MagicParticle extends PixelParticle {
  static FACTORY: Emitter$Factory = null;
  static ATTRACTING: Emitter$Factory = null;
  _MagicMissile$MagicParticle(): this {
    this._PixelParticle();
    this.color$int(8965375);
    this.lifespan = 0.5;
    this.speed_.set$float$float(Random.Float$float$float(-10, Math.fround(+10)), Random.Float$float$float(-10, Math.fround(+10)));
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.left_ = this.lifespan;
  }
  resetAttract(x: number, y: number): void {
    this.revive();
    this.left_ = this.lifespan;
    this.speed_.polar(Random.Float$float(PointF.PI2), Random.Float$float$float(16, 32));
    this.x = Math.fround(x - Math.fround(this.speed_.x * this.lifespan));
    this.y = Math.fround(y - Math.fround(this.speed_.y * this.lifespan));
  }
  update(): void {
    super.update();
    this.size$float(Math.fround(4 - Math.fround((this.am = Math.fround(this.left_ / this.lifespan)) * 3)));
  }
  static $clinit() {
    MagicMissile$MagicParticle.FACTORY = new (MagicMissile$MagicParticle$1())()._Emitter$Factory();
    MagicMissile$MagicParticle.ATTRACTING = new (MagicMissile$MagicParticle$2())()._Emitter$Factory();
  }
}

export class MagicMissile$EarthParticle extends PixelParticle$Shrinking {
  static FACTORY: Emitter$Factory = null;
  static BURST: Emitter$Factory = null;
  static ATTRACT: Emitter$Factory = null;
  _MagicMissile$EarthParticle(): this {
    this._PixelParticle$Shrinking();
    this.lifespan = 0.5;
    this.acc.set$float$float(0, Math.fround(+40));
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.left_ = this.lifespan;
    this.size_ = 4;
    if (Random.Int$int(10) === 0) {
      this.color$int(ColorMath.random(16773734, 8419098));
    } else {
      this.color$int(ColorMath.random(8410368, 3351808));
    }
    this.speed_.set$float$float(Random.Float$float$float(-10, Math.fround(+10)), Random.Float$float$float(-10, Math.fround(+10)));
  }
  resetBurst(x: number, y: number): void {
    this.reset$float$float(x, y);
    this.speed_.polar(Random.Float$float(PointF.PI2), Random.Float$float$float(40, 60));
  }
  resetAttract(x: number, y: number): void {
    this.reset$float$float(x, y);
    this.speed_.polar(Random.Float$float(PointF.PI2), Random.Float$float$float(24, 32));
    this.x = Math.fround(x - Math.fround(this.speed_.x * this.lifespan));
    this.y = Math.fround(y - Math.fround(this.speed_.y * this.lifespan));
    this.acc.set$float$float(0, 0);
  }
  static $clinit() {
    MagicMissile$EarthParticle.FACTORY = new (MagicMissile$EarthParticle$1())()._Emitter$Factory();
    MagicMissile$EarthParticle.BURST = new (MagicMissile$EarthParticle$2())()._Emitter$Factory();
    MagicMissile$EarthParticle.ATTRACT = new (MagicMissile$EarthParticle$3())()._Emitter$Factory();
  }
}

export class MagicMissile$ShamanParticle extends MagicMissile$EarthParticle {
  static RED: Emitter$Factory = null;
  static BLUE: Emitter$Factory = null;
  static PURPLE: Emitter$Factory = null;
  static ELMO: Emitter$Factory = null;
  startColor: number = 0;
  endColor: number = 0;
  _MagicMissile$ShamanParticle(): this {
    this._MagicMissile$EarthParticle();
    this.lifespan = Math.fround(0.6);
    this.acc.set$float$float(0, 0);
    return this;
  }
  reset$float$float$int(x: number, y: number, endColor: number): void {
    super.reset$float$float(x, y);
    this.size$float(1);
    this.endColor = endColor;
    this.startColor = ColorMath.random(8410368, 3351808);
    this.speed_.set$float$float(Random.Float$float$float(-10, Math.fround(+10)), Random.Float$float$float(-10, Math.fround(+10)));
  }
  update(): void {
    super.update();
    this.color$int(ColorMath.interpolate$int$int$float(this.endColor, this.startColor, (Math.fround(this.left_ / this.lifespan))));
  }
  static $clinit() {
    MagicMissile$ShamanParticle.RED = new (MagicMissile$ShamanParticle$1())()._Emitter$Factory();
    MagicMissile$ShamanParticle.BLUE = new (MagicMissile$ShamanParticle$2())()._Emitter$Factory();
    MagicMissile$ShamanParticle.PURPLE = new (MagicMissile$ShamanParticle$3())()._Emitter$Factory();
    MagicMissile$ShamanParticle.ELMO = new (MagicMissile$ShamanParticle$4())()._Emitter$Factory();
  }
}

export class MagicMissile$WhiteParticle extends PixelParticle {
  static FACTORY: Emitter$Factory = null;
  static YELLOW: Emitter$Factory = null;
  static WALL: Emitter$Factory = null;
  _MagicMissile$WhiteParticle(): this {
    this._PixelParticle();
    this.lifespan = Math.fround(0.4);
    this.am = 0.5;
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.left_ = this.lifespan;
    this.hardlight$float$float$float(1, 1, 1);
  }
  reset$float$float$float$float$float(x: number, y: number, r: number, g: number, b: number): void {
    this.reset$float$float(x, y);
    this.hardlight$float$float$float(r, g, b);
  }
  resetWall(x: number, y: number): void {
    this.reset$float$float(x, y);
    this.left_ = this.lifespan = 2;
    this.x = Math.fround(Math.imul($J.roundf(Math.fround(x / 4)), 4));
    this.y = Math.fround((Math.imul($J.roundf(Math.fround(y / 4)), 4) - 6) | 0);
    this.x = Math.fround(this.x + Math.fround(Math.fround($J.roundf(Math.fround(this.y % 16)) / 4) - 2));
  }
  update(): void {
    super.update();
    this.size$float(Math.fround((Math.fround(this.left_ / this.lifespan)) * 3));
  }
  static $clinit() {
    MagicMissile$WhiteParticle.FACTORY = new (MagicMissile$WhiteParticle$1())()._Emitter$Factory();
    MagicMissile$WhiteParticle.YELLOW = new (MagicMissile$WhiteParticle$2())()._Emitter$Factory();
    MagicMissile$WhiteParticle.WALL = new (MagicMissile$WhiteParticle$3())()._Emitter$Factory();
  }
}

export class MagicMissile$SlowParticle extends PixelParticle {
  emitter_: Emitter = null;
  static FACTORY: Emitter$Factory = null;
  _MagicMissile$SlowParticle(): this {
    this._PixelParticle();
    this.lifespan = Math.fround(0.6);
    this.color$int(6702114);
    this.size$float(2);
    return this;
  }
  reset$float$float$Emitter(x: number, y: number, emitter: Emitter): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.emitter_ = emitter;
    this.left_ = this.lifespan;
    this.acc.set$float(0);
    this.speed_.set$float$float(Random.Float$float$float(-20, Math.fround(+20)), Random.Float$float$float(-20, Math.fround(+20)));
  }
  update(): void {
    super.update();
    this.am = Math.fround(this.left_ / this.lifespan);
    this.acc.set$float$float(Math.fround((Math.fround(this.emitter_.x - this.x)) * 10), Math.fround((Math.fround(this.emitter_.y - this.y)) * 10));
  }
  static $clinit() {
    MagicMissile$SlowParticle.FACTORY = new (MagicMissile$SlowParticle$1())()._Emitter$Factory();
  }
}

export class MagicMissile$ForceParticle extends PixelParticle$Shrinking {
  static FACTORY: Emitter$Factory = null;
  _MagicMissile$ForceParticle(): this {
    this._PixelParticle$Shrinking();
    return this;
  }
  reset$int$float$float(index: number, x: number, y: number): void {
    super.reset$float$float$int$float$float(x, y, ColorMath.interpolate$int$int$float(16764057, 12272657, Random.Float$()), 8, 0.5);
    this.speed_.polar(Math.fround(Math.fround(PointF.PI2 / 8) * index), 12);
    this.x = Math.fround(this.x - Math.fround(this.speed_.x * this.lifespan));
    this.y = Math.fround(this.y - Math.fround(this.speed_.y * this.lifespan));
  }
  update(): void {
    super.update();
    this.am = Math.fround((Math.fround(1 - Math.fround(this.left_ / this.lifespan))) / 2);
  }
  static $clinit() {
    MagicMissile$ForceParticle.FACTORY = new (MagicMissile$ForceParticle$1())()._Emitter$Factory();
  }
}

export class MagicMissile$WardParticle extends PixelParticle$Shrinking {
  static FACTORY: Emitter$Factory = null;
  static UP: Emitter$Factory = null;
  _MagicMissile$WardParticle(): this {
    this._PixelParticle$Shrinking();
    this.lifespan = Math.fround(0.6);
    this.color$int(8921855);
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.left_ = this.lifespan;
    this.size_ = 8;
  }
  resetUp(x: number, y: number): void {
    this.reset$float$float(x, y);
    this.speed_.set$float$float(Random.Float$float$float(-8, Math.fround(+8)), Random.Float$float$float(-32, -48));
  }
  update(): void {
    super.update();
    this.am = Math.fround(1 - Math.fround(this.left_ / this.lifespan));
  }
  static $clinit() {
    MagicMissile$WardParticle.FACTORY = new (MagicMissile$WardParticle$1())()._Emitter$Factory();
    MagicMissile$WardParticle.UP = new (MagicMissile$WardParticle$2())()._Emitter$Factory();
  }
}

let $MagicMissile$MagicParticle$1: any = null;
/** An anonymous class (MagicMissile.java:319). */
function MagicMissile$MagicParticle$1(): any {
  return $MagicMissile$MagicParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(MagicMissile$MagicParticle))).reset$float$float(x, y);
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$MagicParticle$1', []);
}

let $MagicMissile$MagicParticle$2: any = null;
/** An anonymous class (MagicMissile.java:330). */
function MagicMissile$MagicParticle$2(): any {
  return $MagicMissile$MagicParticle$2 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(MagicMissile$MagicParticle))).resetAttract(x, y);
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$MagicParticle$2', []);
}

let $MagicMissile$EarthParticle$1: any = null;
/** An anonymous class (MagicMissile.java:380). */
function MagicMissile$EarthParticle$1(): any {
  return $MagicMissile$EarthParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(MagicMissile$EarthParticle))).reset$float$float(x, y);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$EarthParticle$1', []);
}

let $MagicMissile$EarthParticle$2: any = null;
/** An anonymous class (MagicMissile.java:387). */
function MagicMissile$EarthParticle$2(): any {
  return $MagicMissile$EarthParticle$2 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(MagicMissile$EarthParticle))).resetBurst(x, y);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$EarthParticle$2', []);
}

let $MagicMissile$EarthParticle$3: any = null;
/** An anonymous class (MagicMissile.java:394). */
function MagicMissile$EarthParticle$3(): any {
  return $MagicMissile$EarthParticle$3 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(MagicMissile$EarthParticle))).resetAttract(x, y);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$EarthParticle$3', []);
}

let $MagicMissile$ShamanParticle$1: any = null;
/** An anonymous class (MagicMissile.java:447). */
function MagicMissile$ShamanParticle$1(): any {
  return $MagicMissile$ShamanParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(MagicMissile$ShamanParticle))).reset$float$float$int(x, y, ColorMath.random(16731469, 8395290));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$ShamanParticle$1', []);
}

let $MagicMissile$ShamanParticle$2: any = null;
/** An anonymous class (MagicMissile.java:455). */
function MagicMissile$ShamanParticle$2(): any {
  return $MagicMissile$ShamanParticle$2 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(MagicMissile$ShamanParticle))).reset$float$float$int(x, y, ColorMath.random(6724095, 1719424));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$ShamanParticle$2', []);
}

let $MagicMissile$ShamanParticle$3: any = null;
/** An anonymous class (MagicMissile.java:463). */
function MagicMissile$ShamanParticle$3(): any {
  return $MagicMissile$ShamanParticle$3 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(MagicMissile$ShamanParticle))).reset$float$float$int(x, y, ColorMath.random(12268543, 6167168));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$ShamanParticle$3', []);
}

let $MagicMissile$ShamanParticle$4: any = null;
/** An anonymous class (MagicMissile.java:471). */
function MagicMissile$ShamanParticle$4(): any {
  return $MagicMissile$ShamanParticle$4 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(MagicMissile$ShamanParticle))).reset$float$float$int(x, y, ColorMath.random(6745753, 2289254));
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$ShamanParticle$4', []);
}

let $MagicMissile$WhiteParticle$1: any = null;
/** An anonymous class (MagicMissile.java:513). */
function MagicMissile$WhiteParticle$1(): any {
  return $MagicMissile$WhiteParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(MagicMissile$WhiteParticle))).reset$float$float(x, y);
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$WhiteParticle$1', []);
}

let $MagicMissile$WhiteParticle$2: any = null;
/** An anonymous class (MagicMissile.java:524). */
function MagicMissile$WhiteParticle$2(): any {
  return $MagicMissile$WhiteParticle$2 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(MagicMissile$WhiteParticle))).reset$float$float$float$float$float(x, y, 1, 1, 0.25);
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$WhiteParticle$2', []);
}

let $MagicMissile$WhiteParticle$3: any = null;
/** An anonymous class (MagicMissile.java:535). */
function MagicMissile$WhiteParticle$3(): any {
  return $MagicMissile$WhiteParticle$3 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(MagicMissile$WhiteParticle))).resetWall(x, y);
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$WhiteParticle$3', []);
}

let $MagicMissile$SlowParticle$1: any = null;
/** An anonymous class (MagicMissile.java:591). */
function MagicMissile$SlowParticle$1(): any {
  return $MagicMissile$SlowParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(MagicMissile$SlowParticle))).reset$float$float$Emitter(x, y, emitter);
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$SlowParticle$1', []);
}

let $MagicMissile$ForceParticle$1: any = null;
/** An anonymous class (MagicMissile.java:635). */
function MagicMissile$ForceParticle$1(): any {
  return $MagicMissile$ForceParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(MagicMissile$ForceParticle))).reset$int$float$float(index, x, y);
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$ForceParticle$1', []);
}

let $MagicMissile$WardParticle$1: any = null;
/** An anonymous class (MagicMissile.java:665). */
function MagicMissile$WardParticle$1(): any {
  return $MagicMissile$WardParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(MagicMissile$WardParticle))).reset$float$float(x, y);
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$WardParticle$1', []);
}

let $MagicMissile$WardParticle$2: any = null;
/** An anonymous class (MagicMissile.java:676). */
function MagicMissile$WardParticle$2(): any {
  return $MagicMissile$WardParticle$2 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(MagicMissile$WardParticle))).resetUp(x, y);
    }
    lightMode(): boolean {
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$WardParticle$2', []);
}

$J.define(MagicMissile, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile', { kind: 'class', sup: 'com.watabou.noosa.particles.Emitter', ctors: { '': '_MagicMissile' }, meths: { 'reset(int,com.watabou.utils.PointF,com.watabou.utils.PointF,com.watabou.utils.Callback)': 'reset$int$PointF$PointF$Callback', 'reset(int,com.watabou.noosa.Visual,int,com.watabou.utils.Callback)': 'reset$int$Visual$int$Callback', 'reset(int,com.watabou.noosa.Visual,com.watabou.noosa.Visual,com.watabou.utils.Callback)': 'reset$int$Visual$Visual$Callback', 'reset(int,int,int,com.watabou.utils.Callback)': 'reset$int$int$int$Callback' } });
$J.define(MagicMissile$MagicParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$MagicParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle', ctors: { '': '_MagicMissile$MagicParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['FACTORY', 'ATTRACTING'] });
$J.define(MagicMissile$EarthParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$EarthParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle$Shrinking', ctors: { '': '_MagicMissile$EarthParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['FACTORY', 'BURST', 'ATTRACT'] });
$J.define(MagicMissile$ShamanParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$ShamanParticle', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$EarthParticle', ctors: { '': '_MagicMissile$ShamanParticle' }, meths: { 'reset(float,float,int)': 'reset$float$float$int' }, clinit: true, lazy: ['RED', 'BLUE', 'PURPLE', 'ELMO'] });
$J.define(MagicMissile$WhiteParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$WhiteParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle', ctors: { '': '_MagicMissile$WhiteParticle' }, meths: { 'reset(float,float,float,float,float)': 'reset$float$float$float$float$float', 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['FACTORY', 'YELLOW', 'WALL'] });
$J.define(MagicMissile$SlowParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$SlowParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle', ctors: { '': '_MagicMissile$SlowParticle' }, meths: { 'reset(float,float,com.watabou.noosa.particles.Emitter)': 'reset$float$float$Emitter' }, clinit: true, lazy: ['FACTORY'] });
$J.define(MagicMissile$ForceParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$ForceParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle$Shrinking', ctors: { '': '_MagicMissile$ForceParticle' }, meths: { 'reset(int,float,float)': 'reset$int$float$float' }, clinit: true, lazy: ['FACTORY'] });
$J.define(MagicMissile$WardParticle, 'com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$WardParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle$Shrinking', ctors: { '': '_MagicMissile$WardParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['FACTORY', 'UP'] });
$J.module(() => {
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  BloodParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.BloodParticle');
  CorrosionParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.CorrosionParticle');
  ElmoParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ElmoParticle');
  FlameParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlameParticle');
  LeafParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.LeafParticle');
  PoisonParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.PoisonParticle');
  PurpleParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.PurpleParticle');
  RainbowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.RainbowParticle');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  SparkParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Game = $J.load('com.watabou.noosa.Game');
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  ColorMath = $J.load('com.watabou.utils.ColorMath');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
