// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/Speck.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Effects, PixelScene, Game, TextureFilm, Emitter$Factory, ColorMath, PointF, Random, SparseArray;

export class Speck extends Image {
  static readonly HEALING: number = 0;
  static readonly STAR: number = 1;
  static readonly LIGHT: number = 2;
  static readonly QUESTION: number = 3;
  static readonly UP: number = 4;
  static readonly SCREAM: number = 5;
  static readonly BONE: number = 6;
  static readonly WOOL: number = 7;
  static readonly ROCK: number = 8;
  static readonly NOTE: number = 9;
  static readonly CHANGE: number = 10;
  static readonly HEART: number = 11;
  static readonly BUBBLE: number = 12;
  static readonly STEAM: number = 13;
  static readonly COIN: number = 14;
  static readonly DOWN: number = 15;
  static readonly DISCOVER: number = 101;
  static readonly EVOKE: number = 102;
  static readonly MASK: number = 103;
  static readonly CROWN: number = 104;
  static readonly RATTLE: number = 105;
  static readonly JET: number = 106;
  static readonly TOXIC: number = 107;
  static readonly CORROSION: number = 108;
  static readonly PARALYSIS: number = 109;
  static readonly DUST: number = 110;
  static readonly STENCH: number = 111;
  static readonly FORGE: number = 112;
  static readonly CONFUSION: number = 113;
  static readonly RED_LIGHT: number = 114;
  static readonly CALM: number = 115;
  static readonly SMOKE: number = 116;
  static readonly STORM: number = 117;
  static readonly INFERNO: number = 118;
  static readonly BLIZZARD: number = 119;
  static readonly YELLOW_LIGHT: number = 120;
  static readonly BLUE_LIGHT: number = 121;
  static readonly SIZE: number = 7;
  type_: number = 0;
  lifespan: number = 0;
  left_: number = 0;
  static film: TextureFilm = null;
  static factories: SparseArray<Emitter$Factory> = null;
  _Speck(): this {
    this._Image$();
    this.texture(Assets$Effects.SPECKS);
    if (Speck.film == null) {
      Speck.film = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, Speck.SIZE, Speck.SIZE);
    }
    this.origin.set$float(Math.fround(Speck.SIZE / 2));
    return this;
  }
  image(type$: number): Speck {
    this.reset(0, 0, 0, type$);
    this.left_ = this.lifespan = Infinity;
    this.type_ = -1;
    this.resetColor();
    this.scale_.set$float(1);
    this.speed_.set$float(0);
    this.acc.set$float(0);
    this.angle = 0;
    this.angularSpeed = 0;
    return this;
  }
  reset(index: number, x: number, y: number, type$: number): void {
    this.revive();
    this.type_ = type$;
    switch (type$) {
      case Speck.DISCOVER:
      case Speck.RED_LIGHT:
      case Speck.YELLOW_LIGHT:
      case Speck.BLUE_LIGHT:
        this.frame$RectF(Speck.film.get$Object(Speck.LIGHT));
        break;
      case Speck.EVOKE:
      case Speck.MASK:
      case Speck.CROWN:
      case Speck.FORGE:
        this.frame$RectF(Speck.film.get$Object(Speck.STAR));
        break;
      case Speck.RATTLE:
        this.frame$RectF(Speck.film.get$Object(Speck.BONE));
        break;
      case Speck.JET:
      case Speck.TOXIC:
      case Speck.CORROSION:
      case Speck.PARALYSIS:
      case Speck.STENCH:
      case Speck.CONFUSION:
      case Speck.STORM:
      case Speck.DUST:
      case Speck.SMOKE:
      case Speck.BLIZZARD:
      case Speck.INFERNO:
        this.frame$RectF(Speck.film.get$Object(Speck.STEAM));
        break;
      case Speck.CALM:
        this.frame$RectF(Speck.film.get$Object(Speck.SCREAM));
        break;
      default:
        this.frame$RectF(Speck.film.get$Object(type$));
    }
    this.x = Math.fround(x - this.origin.x);
    this.y = Math.fround(y - this.origin.y);
    this.resetColor();
    this.scale_.set$float(1);
    this.speed_.set$float(0);
    this.acc.set$float(0);
    this.angle = 0;
    this.angularSpeed = 0;
    switch (type$) {
      case Speck.HEALING:
        this.speed_.set$float$float(0, -20);
        this.lifespan = 1;
        break;
      case Speck.STAR:
        this.speed_.polar(Random.Float$float(Math.fround(2 * Math.fround(3.1415925))), Random.Float$float(128));
        this.acc.set$float$float(0, 128);
        this.angle = Random.Float$float(360);
        this.angularSpeed = Random.Float$float$float(-360, Math.fround(+360));
        this.lifespan = 1;
        break;
      case Speck.FORGE:
        this.speed_.polar(Random.Float$float(Math.fround(-Math.fround(3.1415925))), Random.Float$float(64));
        this.acc.set$float$float(0, 128);
        this.angle = Random.Float$float(360);
        this.angularSpeed = Random.Float$float$float(-360, Math.fround(+360));
        this.lifespan = Math.fround(0.51);
        break;
      case Speck.EVOKE:
        this.speed_.polar(Random.Float$float(Math.fround(-Math.fround(3.1415925))), 50);
        this.acc.set$float$float(0, 50);
        this.angle = Random.Float$float(360);
        this.angularSpeed = Random.Float$float$float(-180, Math.fround(+180));
        this.lifespan = 1;
        break;
      case Speck.MASK:
        this.speed_.polar(Math.fround(Math.fround(index * Math.fround(3.1415925)) / 5), 50);
        this.acc.set$float$float(Math.fround(-this.speed_.x), Math.fround(-this.speed_.y));
        this.angle = Math.fround(Math.imul(index, 36));
        this.angularSpeed = 360;
        this.lifespan = 1;
        break;
      case Speck.CROWN:
        this.acc.set$float$float(index % 2 === 0 ? Random.Float$float$float(-512, -256) : Random.Float$float$float(Math.fround(+256), Math.fround(+512)), 0);
        this.angularSpeed = Math.fround(this.acc.x < Math.fround(0) ? -180 : +180);
        this.lifespan = 0.5;
        break;
      case Speck.RED_LIGHT:
        this.tint$int(-3407872);
        this.angle = Random.Float$float(360);
        this.angularSpeed = 90;
        this.lifespan = 1;
        break;
      case Speck.LIGHT:
        this.angle = Random.Float$float(360);
        this.angularSpeed = 90;
        this.lifespan = 1;
        break;
      case Speck.YELLOW_LIGHT:
        this.tint$int(-2237184);
        this.angle = Random.Float$float(360);
        this.angularSpeed = 90;
        this.lifespan = 1;
        break;
      case Speck.BLUE_LIGHT:
        this.tint$int(-16724737);
        this.angle = Random.Float$float(360);
        this.angularSpeed = 90;
        this.lifespan = 1;
        break;
      case Speck.DISCOVER:
        this.angle = Random.Float$float(360);
        this.angularSpeed = 90;
        this.lifespan = 0.5;
        this.am = 0;
        break;
      case Speck.QUESTION:
        this.lifespan = Math.fround(0.8);
        break;
      case Speck.UP:
        this.speed_.set$float$float(0, -20);
        this.lifespan = 1;
        break;
      case Speck.DOWN:
        this.speed_.set$float$float(0, 20);
        this.lifespan = 1;
        break;
      case Speck.CALM:
        this.color$float$float$float(0, 1, 1);
      case Speck.SCREAM:
        this.lifespan = Math.fround(0.9);
        break;
      case Speck.BONE:
        this.lifespan = Math.fround(0.2);
        this.speed_.polar(Random.Float$float(Math.fround(2 * Math.fround(3.1415925))), Math.fround(24 / this.lifespan));
        this.acc.set$float$float(0, 128);
        this.angle = Random.Float$float(360);
        this.angularSpeed = 360;
        break;
      case Speck.RATTLE:
        this.lifespan = 0.5;
        this.speed_.set$float$float(0, -100);
        this.acc.set$float$float(0, Math.fround(Math.fround(-2 * this.speed_.y) / this.lifespan));
        this.angle = Random.Float$float(360);
        this.angularSpeed = 360;
        break;
      case Speck.WOOL:
        this.lifespan = 0.5;
        this.speed_.set$float$float(0, -50);
        this.angle = Random.Float$float(360);
        this.angularSpeed = Random.Float$float$float(-360, Math.fround(+360));
        break;
      case Speck.ROCK:
        this.angle = Random.Float$float(360);
        this.angularSpeed = Random.Float$float$float(-360, Math.fround(+360));
        this.scale_.set$float(Random.Float$float$float(1, 2));
        this.speed_.set$float$float(0, 64);
        this.lifespan = Math.fround(0.2);
        this.y = Math.fround(this.y - Math.fround(this.speed_.y * this.lifespan));
        break;
      case Speck.NOTE:
        this.angularSpeed = Random.Float$float$float(-30, Math.fround(+30));
        this.speed_.polar(Math.fround((Math.fround(this.angularSpeed - 90)) * PointF.G2R), 30);
        this.lifespan = 1;
        break;
      case Speck.CHANGE:
        this.angle = Random.Float$float(360);
        this.speed_.polar(Math.fround((Math.fround(this.angle - 90)) * PointF.G2R), Random.Float$float$float(4, 12));
        this.lifespan = 1.5;
        break;
      case Speck.HEART:
        this.speed_.set$float$float(Math.fround(Random.IntRange(-10, +10)), -40);
        this.angularSpeed = Random.Float$float$float(-45, Math.fround(+45));
        this.lifespan = 1;
        break;
      case Speck.BUBBLE:
        this.speed_.set$float$float(0, -15);
        this.scale_.set$float(PixelScene.align$float(Random.Float$float$float(Math.fround(0.8), 1)));
        this.lifespan = Random.Float$float$float(Math.fround(0.8), 1.5);
        break;
      case Speck.STEAM:
        this.speed_.y = Math.fround(-Random.Float$float$float(10, 15));
        this.angularSpeed = Random.Float$float(Math.fround(+180));
        this.angle = Random.Float$float(360);
        this.lifespan = 1;
        break;
      case Speck.JET:
        this.speed_.y = Math.fround(+32);
        this.acc.y = -64;
        this.angularSpeed = Random.Float$float$float(180, 360);
        this.angle = Random.Float$float(360);
        this.lifespan = 0.5;
        break;
      case Speck.TOXIC:
        this.hardlight$int(5308256);
        this.angularSpeed = 30;
        this.angle = Random.Float$float(360);
        this.lifespan = Random.Float$float$float(1, 3);
        break;
      case Speck.CORROSION:
        this.hardlight$int(11184810);
        this.angularSpeed = 30;
        this.angle = Random.Float$float(360);
        this.lifespan = Random.Float$float$float(1, 3);
        break;
      case Speck.PARALYSIS:
        this.hardlight$int(16777062);
        this.angularSpeed = -30;
        this.angle = Random.Float$float(360);
        this.lifespan = Random.Float$float$float(1, 3);
        break;
      case Speck.STENCH:
        this.hardlight$int(13056);
        this.angularSpeed = -30;
        this.angle = Random.Float$float(360);
        this.lifespan = Random.Float$float$float(1, 3);
        break;
      case Speck.CONFUSION:
        this.hardlight$int(Random.Int$int(16777216) | 128);
        this.angularSpeed = Random.Float$float$float(-20, Math.fround(+20));
        this.angle = Random.Float$float(360);
        this.lifespan = Random.Float$float$float(1, 3);
        break;
      case Speck.STORM:
        this.hardlight$int(9099480);
        this.angularSpeed = Random.Float$float$float(-20, Math.fround(+20));
        this.angle = Random.Float$float(360);
        this.lifespan = Random.Float$float$float(1, 3);
        break;
      case Speck.INFERNO:
        this.hardlight$int(15628066);
        this.angularSpeed = Math.fround(Random.Float$float$float(200, 300) * (Random.Int$int(2) === 0 ? -1 : 1));
        this.angle = Random.Float$float(360);
        this.lifespan = Random.Float$float$float(1, 3);
        break;
      case Speck.BLIZZARD:
        this.hardlight$int(16777215);
        this.angularSpeed = Math.fround(Random.Float$float$float(200, 300) * (Random.Int$int(2) === 0 ? -1 : 1));
        this.angle = Random.Float$float(360);
        this.lifespan = Random.Float$float$float(1, 3);
        break;
      case Speck.SMOKE:
        this.hardlight$int(0);
        this.angularSpeed = 30;
        this.angle = Random.Float$float(360);
        this.lifespan = Random.Float$float$float(1, 1.5);
        break;
      case Speck.DUST:
        this.hardlight$int(16777062);
        this.angle = Random.Float$float(360);
        this.speed_.polar(Random.Float$float(Math.fround(2 * Math.fround(3.1415925))), Random.Float$float$float(16, 48));
        this.lifespan = 0.5;
        break;
      case Speck.COIN:
        this.speed_.polar(Math.fround(Math.fround(-PointF.PI) * Random.Float$float$float(Math.fround(0.3), Math.fround(0.7))), Random.Float$float$float(48, 96));
        this.acc.y = 256;
        this.lifespan = Math.fround(Math.fround(Math.fround(-this.speed_.y) / this.acc.y) * 2);
        break;
    }
    this.left_ = this.lifespan;
  }
  update(): void {
    super.update();
    this.left_ = Math.fround(this.left_ - Game.elapsed);
    if (this.left_ <= Math.fround(0)) {
      this.kill();
    } else {
      let p = Math.fround(1 - Math.fround(this.left_ / this.lifespan));
      switch (this.type_) {
        case Speck.STAR:
        case Speck.FORGE:
          this.scale_.set$float(Math.fround(1 - p));
          this.am = p < Math.fround(0.2) ? Math.fround(p * 5) : Math.fround((Math.fround(1 - p)) * 1.25);
          break;
        case Speck.MASK:
        case Speck.CROWN:
          this.am = Math.fround(1 - Math.fround(p * p));
          break;
        case Speck.EVOKE:
        case Speck.HEALING:
          this.am = p < 0.5 ? 1 : Math.fround(2 - Math.fround(p * 2));
          break;
        case Speck.RED_LIGHT:
        case Speck.YELLOW_LIGHT:
        case Speck.BLUE_LIGHT:
        case Speck.LIGHT:
          this.am = this.scale_.set$float(p < Math.fround(0.2) ? Math.fround(p * 5) : Math.fround((Math.fround(1 - p)) * 1.25)).x;
          break;
        case Speck.DISCOVER:
          this.am = Math.fround(1 - p);
          this.scale_.set$float(Math.fround((p < 0.5 ? p : Math.fround(1 - p)) * 2));
          break;
        case Speck.QUESTION:
          this.scale_.set$float(Math.fround(((Math.sqrt(p < 0.5 ? p : Math.fround(1 - p))) * 3)));
          break;
        case Speck.UP:
        case Speck.DOWN:
          this.scale_.set$float(Math.fround(((Math.sqrt(p < 0.5 ? p : Math.fround(1 - p))) * 2)));
          break;
        case Speck.CALM:
        case Speck.SCREAM:
          this.am = Math.fround(Math.sqrt(Math.fround((p < 0.5 ? p : Math.fround(1 - p)) * 2)));
          this.scale_.set$float(Math.fround(p * 7));
          break;
        case Speck.BONE:
        case Speck.RATTLE:
          this.am = p < Math.fround(0.9) ? 1 : Math.fround((Math.fround(1 - p)) * 10);
          break;
        case Speck.ROCK:
          this.am = p < Math.fround(0.2) ? Math.fround(p * 5) : 1;
          break;
        case Speck.NOTE:
          this.am = Math.fround(1 - Math.fround(p * p));
          break;
        case Speck.WOOL:
          this.scale_.set$float(Math.fround(1 - p));
          break;
        case Speck.CHANGE:
          this.am = Math.fround(Math.sqrt(Math.fround((p < 0.5 ? p : Math.fround(1 - p)) * 2)));
          this.scale_.y = Math.fround((Math.fround(1 + p)) * 0.5);
          this.scale_.x = Math.fround(this.scale_.y * Math.fround(Math.cos(Math.fround(this.left_ * 15))));
          break;
        case Speck.HEART:
          this.scale_.set$float(Math.fround(1 - p));
          this.am = Math.fround(1 - Math.fround(p * p));
          break;
        case Speck.BUBBLE:
          this.am = p < Math.fround(0.2) ? Math.fround(p * 5) : 1;
          break;
        case Speck.STEAM:
        case Speck.TOXIC:
        case Speck.PARALYSIS:
        case Speck.CONFUSION:
        case Speck.STORM:
        case Speck.BLIZZARD:
        case Speck.INFERNO:
        case Speck.DUST:
          this.am = Math.fround(Math.sqrt(Math.fround((p < 0.5 ? p : Math.fround(1 - p)) * 0.5)));
          this.scale_.set$float(Math.fround(1 + p));
          break;
        case Speck.CORROSION:
          this.hardlight$int(ColorMath.interpolate$int$int$float(11184810, 16746496, p));
        case Speck.STENCH:
        case Speck.SMOKE:
          this.am = Math.fround(Math.sqrt((p < 0.5 ? p : Math.fround(1 - p))));
          this.scale_.set$float(Math.fround(1 + p));
          break;
        case Speck.JET:
          this.am = Math.fround((p < 0.5 ? p : Math.fround(1 - p)) * 2);
          this.scale_.set$float(Math.fround(p * 1.5));
          break;
        case Speck.COIN:
          this.scale_.x = Math.fround(Math.cos(Math.fround(this.left_ * 5)));
          this.rm = this.gm = this.bm = Math.fround((Math.fround(Math.fround(Math.abs(this.scale_.x)) + 1)) * 0.5);
          this.am = p < Math.fround(0.9) ? 1 : Math.fround((Math.fround(1 - p)) * 10);
          break;
      }
    }
  }
  static factory$int(type$: number): Emitter$Factory {
    return Speck.factory$int$boolean(type$, false);
  }
  static factory$int$boolean(type$: number, lightMode: boolean): Emitter$Factory {
    let factory = Speck.factories.get(type$);
    if (factory == null) {
      factory = new (Speck$1())().$c(type$, lightMode)._Emitter$Factory();
      Speck.factories.put(type$, factory);
    }
    return factory;
  }
  static $clinit() {
    Speck.factories = new SparseArray()._SparseArray();
  }
}

let $Speck$1: any = null;
/** An anonymous class (Speck.java:547). */
function Speck$1(): any {
  return $Speck$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      let p = emitter.recycle($J.cls(Speck));
      p.reset(index, x, y, this.$cv_type);
    }
    lightMode(): boolean {
      return this.$cv_lightMode;
    }
    $c($type, $lightMode): this {
      this.$cv_type = $type; this.$cv_lightMode = $lightMode;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.effects.Speck$1', []);
}

$J.define(Speck, 'com.shatteredpixel.shatteredpixeldungeon.effects.Speck', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { '': '_Speck' }, meths: { 'factory(int,boolean)': 'factory$int$boolean', 'factory(int)': 'factory$int' }, clinit: true, lazy: ['film', 'factories'] });
$J.module(() => {
  Assets$Effects = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Effects');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  Game = $J.load('com.watabou.noosa.Game');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  ColorMath = $J.load('com.watabou.utils.ColorMath');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
  SparseArray = $J.load('com.watabou.utils.SparseArray');
});
