// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/ImpSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sprites, Speck, MovieClip$Animation, TextureFilm;

export class ImpSprite extends MobSprite {
  _ImpSprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.IMP);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 12, 14);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(10, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [0, 1, 2, 3, 0, 1, 2, 3, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 3, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(20, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [0]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(10, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [0]);
    this.play$Animation(this.idle_);
    return this;
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    if (anim === this.die_) {
      this.emitter().burst(Speck.factory$int(Speck.WOOL), 15);
      this.killAndErase();
    } else {
      super.onComplete$Animation(anim);
    }
  }
}

$J.define(ImpSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.ImpSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_ImpSprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
