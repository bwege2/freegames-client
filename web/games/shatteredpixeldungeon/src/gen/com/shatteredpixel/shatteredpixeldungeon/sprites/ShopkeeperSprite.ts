// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/ShopkeeperSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sprites, MovieClip$Animation, TextureFilm, PixelParticle;

export class ShopkeeperSprite extends MobSprite {
  coin: PixelParticle = null;
  _ShopkeeperSprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.KEEPER);
    let film = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 14, 14);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(10, true);
    this.idle_.frames$TextureFilm$ObjectArr(film, [1, 1, 1, 1, 1, 0, 0, 0, 0]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(20, false);
    this.die_.frames$TextureFilm$ObjectArr(film, [0]);
    this.run_ = this.idle_.clone();
    this.attack = this.idle_.clone();
    this.idle();
    return this;
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    super.onComplete$Animation(anim);
    if (this.visible_ && anim === this.idle_) {
      if (this.coin == null) {
        this.coin = new PixelParticle()._PixelParticle();
        this.parent.add$Gizmo(this.coin);
      }
      this.coin.reset$float$float$int$float$float(Math.fround(this.x + (this.flipHorizontal_ ? 0 : 13)), Math.fround(this.y + 7), 16776960, 1, 0.5);
      this.coin.speed_.y = -40;
      this.coin.acc.y = Math.fround(+160);
    }
  }
}

$J.define(ShopkeeperSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.ShopkeeperSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_ShopkeeperSprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  PixelParticle = $J.load('com.watabou.noosa.particles.PixelParticle');
});
