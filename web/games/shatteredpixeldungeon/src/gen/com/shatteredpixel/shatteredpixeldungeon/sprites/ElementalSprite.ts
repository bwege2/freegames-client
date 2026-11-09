// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/ElementalSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Assets$Sprites, Beam$LightRay, MagicMissile, MagicMissile$MagicParticle, ElmoParticle, FlameParticle, RainbowParticle, SparkParticle, DungeonTilemap, MovieClip$Animation, TextureFilm, Sample;

export class ElementalSprite extends MobSprite {
  boltType: number = 0;
  particles: Emitter = null;
  _ElementalSprite(): this {
    this._MobSprite();
    let c = this.texOffset();
    this.texture(Assets$Sprites.ELEMENTAL);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 12, 14);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(10, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [(c + 0) | 0, (c + 1) | 0, (c + 2) | 0]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(12, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [(c + 0) | 0, (c + 1) | 0, (c + 3) | 0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [(c + 4) | 0, (c + 5) | 0, (c + 6) | 0]);
    this.zap_ = this.attack.clone();
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [(c + 7) | 0, (c + 8) | 0, (c + 9) | 0, (c + 10) | 0, (c + 11) | 0, (c + 12) | 0, (c + 13) | 0, (c + 12) | 0]);
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
  zap$int(cell: number): void {
    super.zap$int(cell);
    MagicMissile.boltFromChar(this.parent, this.boltType, this, cell, new (ElementalSprite$1())().$o(this));
    Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    if (anim === this.zap_) {
      this.idle();
    }
    super.onComplete$Animation(anim);
  }
}

export class ElementalSprite$Fire extends ElementalSprite {
  _ElementalSprite$Fire(): this {
    this._ElementalSprite();
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
    return -17613;
  }
}

export class ElementalSprite$NewbornFire extends ElementalSprite {
  _ElementalSprite$NewbornFire(): this {
    this._ElementalSprite();
    this.boltType = MagicMissile.ELMO;
    return this;
  }
  texOffset(): number {
    return 14;
  }
  createEmitter(): Emitter {
    let emitter = this.emitter();
    emitter.pour(ElmoParticle.FACTORY, Math.fround(0.06));
    return emitter;
  }
  blood(): number {
    return -7995448;
  }
}

export class ElementalSprite$Frost extends ElementalSprite {
  _ElementalSprite$Frost(): this {
    this._ElementalSprite();
    this.boltType = MagicMissile.FROST;
    return this;
  }
  texOffset(): number {
    return 28;
  }
  createEmitter(): Emitter {
    let emitter = this.emitter();
    emitter.pour(MagicMissile$MagicParticle.FACTORY, Math.fround(0.06));
    return emitter;
  }
  blood(): number {
    return -7412737;
  }
}

export class ElementalSprite$Shock extends ElementalSprite {
  _ElementalSprite$Shock(): this {
    this._ElementalSprite();
    return this;
  }
  zap$int(cell: number): void {
    super.zap$int$Callback(cell, null);
    (this.ch).onZapComplete();
    this.parent.add$Gizmo(new Beam$LightRay()._Beam$LightRay(this.center$(), DungeonTilemap.raisedTileCenterToWorld(cell)));
    Sample.INSTANCE.play$Object(Assets$Sounds.RAY);
  }
  texOffset(): number {
    return 42;
  }
  createEmitter(): Emitter {
    let emitter = this.emitter();
    emitter.pour(SparkParticle.STATIC, Math.fround(0.06));
    return emitter;
  }
  blood(): number {
    return -123;
  }
}

export class ElementalSprite$Chaos extends ElementalSprite {
  _ElementalSprite$Chaos(): this {
    this._ElementalSprite();
    return this;
  }
  zap$int(cell: number): void {
    this.zap$int$Callback(cell, null);
    (this.ch).onZapComplete();
  }
  texOffset(): number {
    return 56;
  }
  createEmitter(): Emitter {
    let emitter = this.emitter();
    emitter.pour(RainbowParticle.BURST, Math.fround(0.025));
    return emitter;
  }
  blood(): number {
    return -1842205;
  }
}

let $ElementalSprite$1: any = null;
/** An anonymous class (ElementalSprite.java:115). */
function ElementalSprite$1(): any {
  return $ElementalSprite$1 ??= $J.local(class extends JObject {
    call(): void {
      (this.$outer.ch).onZapComplete();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.sprites.ElementalSprite$1', ['com.watabou.utils.Callback']);
}

$J.define(ElementalSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.ElementalSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_ElementalSprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation', 'zap(int)': 'zap$int' } });
$J.define(ElementalSprite$Fire, 'com.shatteredpixel.shatteredpixeldungeon.sprites.ElementalSprite$Fire', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.ElementalSprite', ctors: { '': '_ElementalSprite$Fire' } });
$J.define(ElementalSprite$NewbornFire, 'com.shatteredpixel.shatteredpixeldungeon.sprites.ElementalSprite$NewbornFire', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.ElementalSprite', ctors: { '': '_ElementalSprite$NewbornFire' } });
$J.define(ElementalSprite$Frost, 'com.shatteredpixel.shatteredpixeldungeon.sprites.ElementalSprite$Frost', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.ElementalSprite', ctors: { '': '_ElementalSprite$Frost' } });
$J.define(ElementalSprite$Shock, 'com.shatteredpixel.shatteredpixeldungeon.sprites.ElementalSprite$Shock', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.ElementalSprite', ctors: { '': '_ElementalSprite$Shock' }, meths: { 'zap(int)': 'zap$int' } });
$J.define(ElementalSprite$Chaos, 'com.shatteredpixel.shatteredpixeldungeon.sprites.ElementalSprite$Chaos', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.ElementalSprite', ctors: { '': '_ElementalSprite$Chaos' }, meths: { 'zap(int)': 'zap$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Beam$LightRay = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Beam$LightRay');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  MagicMissile$MagicParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$MagicParticle');
  ElmoParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ElmoParticle');
  FlameParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlameParticle');
  RainbowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.RainbowParticle');
  SparkParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
