// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/FistSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../jre/index.ts';
import { MobSprite } from './MobSprite.ts';

let Assets$Sounds, Assets$Sprites, Beam$LightRay, MagicMissile, Speck, CorrosionParticle, FlameParticle, LeafParticle, ShadowParticle, SparkParticle, PixelScene, DungeonTilemap, MovieClip$Animation, TextureFilm, Sample;

export class FistSprite extends MobSprite {
  static readonly SLAM_TIME: number = Math.fround(0.33);
  boltType: number = 0;
  particles: Emitter = null;
  _FistSprite(): this {
    this._MobSprite();
    let c = this.texOffset();
    this.texture(Assets$Sprites.FISTS);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 24, 17);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(2, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [(c + 0) | 0, (c + 0) | 0, (c + 1) | 0]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(3, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [(c + 0) | 0, (c + 1) | 0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation($J.roundf(Math.fround(1 / FistSprite.SLAM_TIME)), false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [(c + 0) | 0]);
    this.zap_ = new MovieClip$Animation()._MovieClip$Animation(8, false);
    this.zap_.frames$TextureFilm$ObjectArr(frames, [(c + 0) | 0, (c + 5) | 0, (c + 6) | 0]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(10, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [(c + 0) | 0, (c + 2) | 0, (c + 3) | 0, (c + 4) | 0]);
    this.play$Animation(this.idle_);
    return this;
  }
  link(ch: Char): void {
    super.link(ch);
    if (this.particles == null) {
      this.particles = this.createEmitter();
    }
  }
  update(): void {
    super.update();
    if (this.particles != null) {
      this.particles.visible_ = this.visible_;
    }
  }
  die(): void {
    super.die();
    if (this.particles != null) {
      this.particles.on = false;
    }
  }
  kill(): void {
    super.kill();
    if (this.particles != null) {
      this.particles.killAndErase();
    }
  }
  attack$int(cell: number): void {
    super.attack$int(cell);
    this.jump$int$int$float$float$Callback(this.ch.pos, this.ch.pos, 9, FistSprite.SLAM_TIME, null);
  }
  zap$int(cell: number): void {
    super.zap$int(cell);
    MagicMissile.boltFromChar(this.parent, this.boltType, this, cell, new (FistSprite$1())().$o(this));
    Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    super.onComplete$Animation(anim);
    if (anim === this.attack) {
      PixelScene.shake(4, Math.fround(0.2));
    } else if (anim === this.zap_) {
      this.idle();
    }
  }
}

export class FistSprite$Burning extends FistSprite {
  _FistSprite$Burning(): this {
    this._FistSprite();
    this.boltType = MagicMissile.FIRE;
    return this;
  }
  texOffset(): number {
    return 0;
  }
  createEmitter(): Emitter {
    let emitter = this.emitter();
    emitter.pour(FlameParticle.FACTORY, Math.fround(0.06));
    return emitter;
  }
  blood(): number {
    return -8908;
  }
}

export class FistSprite$Soiled extends FistSprite {
  _FistSprite$Soiled(): this {
    this._FistSprite();
    this.boltType = MagicMissile.FOLIAGE;
    return this;
  }
  texOffset(): number {
    return 10;
  }
  createEmitter(): Emitter {
    let emitter = this.emitter();
    emitter.pour(LeafParticle.GENERAL, Math.fround(0.06));
    return emitter;
  }
  blood(): number {
    return -8432604;
  }
}

export class FistSprite$Rotting extends FistSprite {
  _FistSprite$Rotting(): this {
    this._FistSprite();
    this.boltType = (MagicMissile.SPECK + Speck.TOXIC) | 0;
    return this;
  }
  texOffset(): number {
    return 20;
  }
  createEmitter(): Emitter {
    let emitter = this.emitter();
    emitter.pour(Speck.factory$int(Speck.TOXIC), 0.25);
    return emitter;
  }
  blood(): number {
    return -4670559;
  }
}

export class FistSprite$Rusted extends FistSprite {
  _FistSprite$Rusted(): this {
    this._FistSprite();
    this.boltType = MagicMissile.CORROSION;
    return this;
  }
  texOffset(): number {
    return 30;
  }
  createEmitter(): Emitter {
    let emitter = this.emitter();
    emitter.pour(CorrosionParticle.MISSILE, Math.fround(0.06));
    return emitter;
  }
  blood(): number {
    return -8421505;
  }
}

export class FistSprite$Bright extends FistSprite {
  _FistSprite$Bright(): this {
    this._FistSprite();
    this.boltType = MagicMissile.RAINBOW;
    return this;
  }
  texOffset(): number {
    return 40;
  }
  createEmitter(): Emitter {
    let emitter = this.emitter();
    emitter.pour(SparkParticle.STATIC, Math.fround(0.06));
    return emitter;
  }
  zap$int(cell: number): void {
    super.zap$int$Callback(cell, null);
    (this.ch).onZapComplete();
    this.parent.add$Gizmo(new Beam$LightRay()._Beam$LightRay(this.center$(), DungeonTilemap.raisedTileCenterToWorld(cell)));
    Sample.INSTANCE.play$Object(Assets$Sounds.RAY);
  }
  blood(): number {
    return -1;
  }
}

export class FistSprite$Dark extends FistSprite {
  _FistSprite$Dark(): this {
    this._FistSprite();
    this.boltType = MagicMissile.SHADOW;
    return this;
  }
  texOffset(): number {
    return 50;
  }
  createEmitter(): Emitter {
    let emitter = this.emitter();
    emitter.pour(ShadowParticle.MISSILE, Math.fround(0.06));
    return emitter;
  }
  blood(): number {
    return -11915437;
  }
}

let $FistSprite$1: any = null;
/** An anonymous class (FistSprite.java:130). */
function FistSprite$1(): any {
  return $FistSprite$1 ??= $J.local(class extends JObject {
    call(): void {
      (this.$outer.ch).onZapComplete();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.sprites.FistSprite$1', ['com.watabou.utils.Callback']);
}

$J.define(FistSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.FistSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_FistSprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation', 'zap(int)': 'zap$int', 'attack(int)': 'attack$int' } });
$J.define(FistSprite$Burning, 'com.shatteredpixel.shatteredpixeldungeon.sprites.FistSprite$Burning', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.FistSprite', ctors: { '': '_FistSprite$Burning' } });
$J.define(FistSprite$Soiled, 'com.shatteredpixel.shatteredpixeldungeon.sprites.FistSprite$Soiled', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.FistSprite', ctors: { '': '_FistSprite$Soiled' } });
$J.define(FistSprite$Rotting, 'com.shatteredpixel.shatteredpixeldungeon.sprites.FistSprite$Rotting', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.FistSprite', ctors: { '': '_FistSprite$Rotting' } });
$J.define(FistSprite$Rusted, 'com.shatteredpixel.shatteredpixeldungeon.sprites.FistSprite$Rusted', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.FistSprite', ctors: { '': '_FistSprite$Rusted' } });
$J.define(FistSprite$Bright, 'com.shatteredpixel.shatteredpixeldungeon.sprites.FistSprite$Bright', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.FistSprite', ctors: { '': '_FistSprite$Bright' }, meths: { 'zap(int)': 'zap$int' } });
$J.define(FistSprite$Dark, 'com.shatteredpixel.shatteredpixeldungeon.sprites.FistSprite$Dark', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.FistSprite', ctors: { '': '_FistSprite$Dark' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Beam$LightRay = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Beam$LightRay');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  CorrosionParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.CorrosionParticle');
  FlameParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlameParticle');
  LeafParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.LeafParticle');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  SparkParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
