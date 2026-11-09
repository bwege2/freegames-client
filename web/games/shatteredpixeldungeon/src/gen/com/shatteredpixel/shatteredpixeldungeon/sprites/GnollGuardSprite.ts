// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/GnollGuardSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sprites, GnollGuard, EarthParticle, MovieClip$Animation, TextureFilm;

export class GnollGuardSprite extends MobSprite {
  earthArmor: Emitter = null;
  _GnollGuardSprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.GNOLL_GUARD);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 12, 16);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(2, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [0, 0, 0, 1, 0, 0, 1, 1]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(12, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [4, 5, 6, 7]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [2, 3, 0]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [8, 9, 10]);
    this.play$Animation(this.idle_);
    return this;
  }
  link(ch: Char): void {
    super.link(ch);
    if (ch instanceof GnollGuard && (ch).hasSapper()) {
      this.setupArmor();
    }
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
}

$J.define(GnollGuardSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.GnollGuardSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_GnollGuardSprite' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  GnollGuard = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollGuard');
  EarthParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.EarthParticle');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
