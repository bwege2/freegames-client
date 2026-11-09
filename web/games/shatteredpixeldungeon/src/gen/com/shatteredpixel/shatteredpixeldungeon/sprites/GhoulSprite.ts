// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/GhoulSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sprites, CharSprite$State, MovieClip$Animation, TextureFilm;

export class GhoulSprite extends MobSprite {
  crumple_: MovieClip$Animation = null;
  _GhoulSprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.GHOUL);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 12, 14);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(2, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [0, 0, 0, 1]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(12, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [2, 3, 4, 5, 6, 7]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [0, 8, 9]);
    this.crumple_ = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.crumple_.frames$TextureFilm$ObjectArr(frames, [0, 10, 11, 12]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [0, 10, 11, 12, 13]);
    this.play$Animation(this.idle_);
    return this;
  }
  crumple(): void {
    this.hideEmo();
    this.processStateRemoval(CharSprite$State.PARALYSED);
    this.play$Animation(this.crumple_);
  }
  die(): void {
    if (this.curAnim === this.crumple_) {
      this.die_.frames[0] = this.die_.frames[1] = this.die_.frames[2] = this.die_.frames[3];
    }
    super.die();
  }
}

$J.define(GhoulSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.GhoulSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_GhoulSprite' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
