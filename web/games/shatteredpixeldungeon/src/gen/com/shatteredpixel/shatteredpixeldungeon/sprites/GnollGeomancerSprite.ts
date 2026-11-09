// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/GnollGeomancerSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { MobSprite } from './MobSprite.ts';

let Assets$Sprites, GnollGeomancer, GnollGeomancer$RockArmor, EarthParticle, MovieClip$Animation, TextureFilm;

export class GnollGeomancerSprite extends MobSprite {
  isStatue: boolean = false;
  earthArmor: Emitter = null;
  _GnollGeomancerSprite(): this {
    this._MobSprite();
    this.isStatue = false;
    this.texture(Assets$Sprites.GNOLL_GEOMANCER);
    this.updateAnims();
    this.scale_.set$float(1.25);
    return this;
  }
  link(ch: Char): void {
    super.link(ch);
    if (ch instanceof GnollGeomancer && (ch).hasSapper()) {
      this.setupArmor();
    }
    if (ch != null && (ch.buff($J.cls(GnollGeomancer$RockArmor)) != null !== this.isStatue)) {
      this.isStatue = !this.isStatue;
      this.updateAnims();
    }
  }
  updateAnims(): void {
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 12, 16);
    let ofs = this.isStatue ? 21 : 0;
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(this.isStatue ? 1 : 2, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [(ofs + 0) | 0, (ofs + 0) | 0, (ofs + 0) | 0, (ofs + 1) | 0, (ofs + 0) | 0, (ofs + 0) | 0, (ofs + 1) | 0, (ofs + 1) | 0]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(12, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [(ofs + 4) | 0, (ofs + 5) | 0, (ofs + 6) | 0, (ofs + 7) | 0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [(ofs + 2) | 0, (ofs + 3) | 0, (ofs + 0) | 0]);
    this.zap_ = this.attack.clone();
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [(ofs + 8) | 0, (ofs + 9) | 0, (ofs + 10) | 0]);
    this.play$Animation(this.idle_);
    this.play$Animation(this.idle_);
  }
  setupArmor(): void {
    if (this.earthArmor == null) {
      this.earthArmor = this.emitter();
      this.earthArmor.fillTarget = false;
      this.earthArmor.y = Math.fround(this.height() / 2);
      this.earthArmor.x = (Math.fround(2 * this.scale_.x));
      this.earthArmor.width_ = Math.fround(this.width() - (Math.fround(4 * this.scale_.x)));
      this.earthArmor.height_ = Math.fround(this.height() - (Math.fround(10 * this.scale_.y)));
      this.earthArmor.pour(EarthParticle.SMALL, Math.fround(0.15));
    }
  }
  loseArmor(): void {
    if (this.earthArmor != null) {
      this.earthArmor.on = false;
      this.earthArmor = null;
    }
  }
  update(): void {
    super.update();
    if (this.earthArmor != null) {
      this.earthArmor.visible_ = this.visible_;
    }
  }
  die(): void {
    super.die();
    if (this.earthArmor != null) {
      this.earthArmor.on = false;
      this.earthArmor = null;
    }
  }
  kill(): void {
    super.kill();
    if (this.earthArmor != null) {
      this.earthArmor.on = false;
      this.earthArmor = null;
    }
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    if (anim === this.zap_) {
      this.idle();
    }
    super.onComplete$Animation(anim);
  }
  idle(): void {
    super.idle();
    if (this.ch != null && this.ch.buff($J.cls(GnollGeomancer$RockArmor)) != null !== this.isStatue) {
      this.isStatue = !this.isStatue;
      this.updateAnims();
    }
  }
  blood(): number {
    return this.isStatue ? 5592405 : super.blood();
  }
}

$J.define(GnollGeomancerSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.GnollGeomancerSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_GnollGeomancerSprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  GnollGeomancer = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer');
  GnollGeomancer$RockArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGeomancer$RockArmor');
  EarthParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.EarthParticle');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
